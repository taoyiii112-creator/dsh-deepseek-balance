import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import test from 'node:test'

async function clientHarness(indexedDB) {
  let source = await readFile('src/client.js', 'utf8')
  source = source.replace('/*__DshPetStudio__*/', await readFile('src/pet-studio.js', 'utf8'))
    .replace('/*__DshPetUi__*/', await readFile('src/pet-ui.js', 'utf8'))
    .replace("    var name = 'dsh-deepseek-balance'", "    window.__testHooks = { petStudio, normalizeRefreshSeconds, createBalanceStore };\n    var name = 'dsh-deepseek-balance'")
  const values = new Map()
  const storage = { getItem(key) { return values.get(key) ?? null }, setItem(key, value) { values.set(key, value) }, removeItem(key) { values.delete(key) } }
  const intervals = new Map()
  let intervalId = 0
  let fetches = 0
  const document = { visibilityState: 'visible', addEventListener() {}, removeEventListener() {} }
  const window = { localStorage: storage, __ModuleLoader__: { load(value) { definition = value } } }
  let definition
  vm.runInNewContext(source, {
    window, document, Symbol, Object, Error, Date, AbortController, BigInt, Set, Map, Blob,
    TextDecoder, Uint8Array, Number, Math, String, Promise, indexedDB,
    setInterval(callback, delay) { const id = ++intervalId; intervals.set(id, { callback, delay }); return id },
    clearInterval(id) { intervals.delete(id) },
    setTimeout, clearTimeout,
    fetch() { fetches++; return new Promise(() => {}) },
  })
  definition.factory((name) => {
    assert.equal(name, 'react')
    return { createElement() {} }
  })
  return { ...window.__testHooks, intervals, values, document, fetches: () => fetches }
}

test('v0.4.7 refresh setting is integer 30–300 seconds and reschedules one poller', async () => {
  const harness = await clientHarness()
  assert.equal(harness.normalizeRefreshSeconds(29), null)
  assert.equal(harness.normalizeRefreshSeconds(30), 30)
  assert.equal(harness.normalizeRefreshSeconds(45), 45)
  assert.equal(harness.normalizeRefreshSeconds(90), 90)
  assert.equal(harness.normalizeRefreshSeconds(150), 150)
  assert.equal(harness.normalizeRefreshSeconds(300), 300)
  assert.equal(harness.normalizeRefreshSeconds(301), null)
  assert.equal(harness.normalizeRefreshSeconds('30.5'), null)
  assert.equal(harness.normalizeRefreshSeconds(''), null)
  const store = harness.createBalanceStore()
  const unsubscribe = store.subscribe(() => {})
  assert.equal(harness.fetches(), 1)
  assert.equal(harness.intervals.size, 1)
  assert.equal([...harness.intervals.values()][0].delay, 60000)
  assert.equal(store.setRefreshSeconds(300), true)
  assert.equal(harness.values.get('dsh-deepseek-balance.refresh-seconds'), '300')
  assert.equal(harness.intervals.size, 1)
  assert.equal([...harness.intervals.values()][0].delay, 300000)
  assert.equal(harness.fetches(), 1, 'saving a new interval must not issue a query')
  assert.equal(store.setRefreshSeconds(301), false)
  assert.equal(store.getRefreshSeconds(), 300)
  unsubscribe()
  assert.equal(harness.intervals.size, 0)
})

test('v0.4.7 custom rules validate observable event fields and exact decimal conditions', async () => {
  const { petStudio } = await clientHarness()
  const media = new Blob(['opaque test data'])
  const slot = {
    id: 'happy', name: '开心一下', media, poster: media,
    rules: [
      { event: 'balance-increase', conditions: [{ field: 'currency', value: 'CNY' }, { field: 'amount-min', value: '10.00' }], play: 'once', base: 'replace', cooldown: 0, priority: 5, duration: 3 },
      { event: 'pet-click', conditions: [], play: 'once', base: 'replace', cooldown: 0, priority: 0, duration: 3 },
    ],
  }
  const scheme = { id: 'one', name: '方案', cover: media, slots: { idle: { media, poster: media } }, custom: [slot] }
  assert.doesNotThrow(() => petStudio.validateScheme(scheme))
  assert.equal(petStudio.matchingRules(scheme, { type: 'balance-increase', currency: 'CNY', delta: '9.999999999999999999' }, 0).length, 0)
  assert.equal(petStudio.matchingRules(scheme, { type: 'balance-increase', currency: 'CNY', delta: '10.000000000000000000' }, 0).length, 1)
  assert.equal(petStudio.matchingRules(scheme, { type: 'balance-increase', currency: 'USD', delta: '100' }, 0).length, 0)
  assert.equal(petStudio.matchingRules(scheme, { type: 'pet-click' }, 0).length, 1)
  slot.rules[0].event = 'balance-decrease'
  assert.equal(petStudio.matchingRules(scheme, { type: 'balance-decrease', currency: 'CNY', delta: '-10.000000000000000000' }, 0).length, 1)
  slot.rules[0].event = 'balance-increase'
  slot.rules.push({ event: 'local-time', conditions: [{ field: 'hour-from', value: '22' }], play: 'until-end', base: 'replace', cooldown: 0, priority: 2, duration: 3 })
  assert.doesNotThrow(() => petStudio.validateScheme(scheme))
  slot.rules.push({ event: 'idle-duration', conditions: [{ field: 'idle-seconds-min', value: '120' }], play: 'once', base: 'replace', cooldown: 0, priority: 1, duration: 3 })
  assert.equal(petStudio.matchingRules(scheme, { type: 'idle-duration', idleSeconds: 119, idle: true }, 0).length, 0)
  assert.equal(petStudio.matchingRules(scheme, { type: 'idle-duration', idleSeconds: 120, idle: true }, 0).length, 1)
  slot.rules[0].conditions.push({ field: 'error-code', value: 'ANY' })
  assert.throws(() => petStudio.validateScheme(scheme), /规则无效/)
  slot.rules[0].conditions.pop()
  slot.rules[0].event = 'harness-chat-message'
  assert.throws(() => petStudio.validateScheme(scheme), /规则无效/)
})

test('v0.4.7 limits schemes to five base plus five custom slots and rejects duplicate names', async () => {
  const { petStudio } = await clientHarness()
  const media = new Blob(['fixture'])
  const custom = Array.from({ length: 5 }, (_, index) => ({ id: String(index), name: '场景' + index, media, poster: media, rules: [] }))
  const scheme = { id: 'one', name: '我的桌宠', cover: media, slots: { idle: { media, poster: media } }, custom }
  assert.doesNotThrow(() => petStudio.validateScheme(scheme))
  custom.push({ id: 'extra', name: '更多', media, poster: media, rules: [] })
  assert.throws(() => petStudio.validateScheme(scheme), /最多 10 个槽位/)
  custom.pop()
  custom[4].name = custom[0].name
  assert.throws(() => petStudio.validateScheme(scheme), /名称、素材或规则无效/)
})

test('v0.4.7 rejects unsupported local media before decoding', async () => {
  const { petStudio } = await clientHarness()
  const file = new Blob(['xxxxxxxxxxxxxxxxxxxxx'])
  file.name = 'scene.mp4'
  await assert.rejects(petStudio.importMedia(file), /仅支持透明/)
})

function memoryIndexedDb() {
  const records = new Map()
  const database = {
    objectStoreNames: { contains() { return true } },
    transaction() {
      let pending = 0
      let aborted = false
      const transaction = {
        oncomplete: null, onerror: null, onabort: null,
        abort() { aborted = true; queueMicrotask(() => transaction.onabort?.()) },
        objectStore() {
          function request(kind, key, value) {
            pending++
            const operation = { result: undefined, onsuccess: null, onerror: null }
            queueMicrotask(() => {
              if (kind === 'get') operation.result = records.get(key)
              if (kind === 'getAll') operation.result = [...records.values()]
              if (kind === 'count') operation.result = records.size
              if (kind === 'put') records.set(value.id, value)
              if (kind === 'delete') records.delete(key)
              operation.onsuccess?.()
              pending--
              if (pending === 0 && !aborted) queueMicrotask(() => { if (!aborted && pending === 0) transaction.oncomplete?.() })
            })
            return operation
          }
          return {
            get(key) { return request('get', key) }, getAll() { return request('getAll') }, count() { return request('count') },
            put(value) { return request('put', null, value) }, delete(key) { return request('delete', key) },
          }
        },
      }
      return transaction
    },
  }
  return {
    open() {
      const request = { result: database, onsuccess: null, onerror: null, onupgradeneeded: null }
      queueMicrotask(() => request.onsuccess?.())
      return request
    },
  }
}

test('v0.4.7 stores three schemes transactionally and falls back to builtin after deletion', async () => {
  const { petStudio, values } = await clientHarness(memoryIndexedDb())
  await petStudio.reload()
  const media = new Blob(['fixture'])
  const scheme = (id) => ({ id, name: '方案' + id, cover: media, slots: { idle: { media, poster: media } }, custom: [] })
  await petStudio.saveScheme(scheme('one'))
  await petStudio.saveScheme(scheme('two'))
  await petStudio.saveScheme(scheme('three'))
  assert.equal(petStudio.snapshot().schemes.length, 3)
  assert.equal(petStudio.snapshot().selectedId, 'three')
  await assert.rejects(petStudio.saveScheme(scheme('four')), /最多保存 3 个/)
  assert.equal(petStudio.snapshot().schemes.length, 3)
  await petStudio.removeScheme('three')
  assert.equal(petStudio.snapshot().selectedId, 'builtin')
  assert.equal(values.get('dsh-deepseek-balance.pet-scheme'), 'builtin')
  await petStudio.saveScheme(scheme('four'))
  assert.equal(petStudio.snapshot().schemes.length, 3)
})

test('v0.4.7 renders the pet without an attached close or restore button', async () => {
  let source = await readFile('src/client.js', 'utf8')
  source = source.replace('/*__DshPetStudio__*/', await readFile('src/pet-studio.js', 'utf8'))
    .replace('/*__DshPetUi__*/', await readFile('src/pet-ui.js', 'utf8'))
    .replace("    var name = 'dsh-deepseek-balance'", "    window.__testPetRuntime = PetRuntime;\n    var name = 'dsh-deepseek-balance'")
  let definition
  const window = {
    innerWidth: 1000, innerHeight: 800,
    localStorage: { getItem() { return null } },
    matchMedia() { return { matches: false } },
    __ModuleLoader__: { load(value) { definition = value } },
  }
  const document = { visibilityState: 'visible' }
  vm.runInNewContext(source, { window, document, Symbol, Object, Error, Date, AbortController, BigInt, Set, Map, Blob, Number, Math, String, Promise, setTimeout, clearTimeout })
  const react = {
    createElement(type, props, ...children) { return { type, props: props || {}, children } },
    useState(initial) { return [typeof initial === 'function' ? initial() : initial, () => {}] },
    useRef(initial) { return { current: initial } },
    useEffect() {},
    useSyncExternalStore(_subscribe, getSnapshot) { return getSnapshot() },
  }
  definition.factory(() => react)
  const pet = window.__testPetRuntime({ hidden: false, resetRevision: 0 })
  assert.equal(pet.type, 'div')
  assert.equal(pet.children[0].type, 'video')
  assert.equal(pet.children[1].type, 'div', 'the pointer target is an invisible hit area')
  assert.equal(pet.children.some((child) => child?.type === 'button'), false)
  assert.equal(window.__testPetRuntime({ hidden: true, resetRevision: 0 }), null)
})
