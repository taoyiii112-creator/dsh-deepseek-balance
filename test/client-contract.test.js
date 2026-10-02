import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import test from 'node:test'

test('client bundle exposes an always-visible Harness header balance without server secrets', async () => {
  const source = await readFile('src/client.js', 'utf8')
  for (const forbidden of ['DEEPSEEK_API_KEY', 'api.deepseek.com', 'Bearer ']) {
    assert.equal(source.includes(forbidden), false)
  }

  let definition
  vm.runInNewContext(source, {
    window: { __ModuleLoader__: { load(value) { definition = value } } },
    Symbol, Object, Error, Date, AbortController, setInterval, clearInterval,
  })
  assert.equal(definition.id, 'dsh-deepseek-balance')

  const plugin = definition.factory((name) => {
    assert.equal(name, 'react')
    return { createElement() {} }
  })
  assert.equal(plugin.name, 'dsh-deepseek-balance')
  assert.deepEqual(Array.from(plugin.inject), ['slots', 'locale', 'theme'])

  let entry
  let component
  const ctx = {
    effect(callback) { callback() },
    locale: { register() {}, bind() { return (key) => key } },
    slots: {
      inject(name, callback) { assert.equal(name, 'conversation.session.header.utilities'); callback() },
      register(meta, value) { entry = meta; component = value; return () => {} },
    },
  }
  plugin.apply(ctx)
  assert.equal(entry.id, 'deepseek-balance')
  assert.equal(entry.name, 'conversation.session.header.utilities')
  assert.equal(entry.order, -20)
  assert.equal(typeof component, 'function')
  assert.equal(source.includes('settings.section'), false)
  assert.match(source, /KEY_API_PATH = '\/dsh-deepseek-balance\/api\/key'/)
  assert.match(source, /setupShort: '设置余额'/)
  assert.match(source, /method: 'POST'/)
  assert.match(source, /type: 'password'/)
  assert.match(source, /BigInt\(/)
  assert.match(source, /prefers-reduced-motion: reduce/)
  assert.match(source, /PET_VIDEO_PATH = '\/dsh-deepseek-balance\/assets\/pet\/idle\.webm'/)
  assert.match(source, /PET_IMAGE_PATH = '\/dsh-deepseek-balance\/assets\/pet\/idle\.png'/)
  assert.match(source, /PET_STATIC_DURATION = 15000/)
  assert.match(source, /TOP_UP_URL = 'https:\/\/platform\.deepseek\.com\/usage'/)
  assert.match(source, /THRESHOLD_STORAGE_KEY = 'dsh-deepseek-balance\.balance-threshold'/)
  assert.match(source, /function hasBalanceBelowThreshold\(data, threshold\)/)
  assert.match(source, /thresholdTitle: '设置余额阈值'/)
  assert.match(source, /target: '_blank'/)
  assert.match(source, /function readPetPosition\(\)/)
  assert.match(source, /function readPetHidden\(\)/)
  const petUi = await readFile('src/pet-ui.js', 'utf8')
  assert.match(petUi, /onPointerMove: pointerMove/)
  assert.match(source, /petHide: '隐藏桌宠'/)
  assert.match(source, /petShow: '显示桌宠'/)
  assert.match(source, /h\(PetRuntime, \{ hidden: hidden/)
  assert.match(source, /h\(SettingsPanel, \{/)
  assert.match(source, /normalizeRefreshSeconds/)
  assert.doesNotMatch(source, /h\(IdlePet/)
  assert.match(petUi, /setTimeout\(function \(\)/)
  assert.match(source, /ROLL_DURATION = 650/)
  assert.match(source, /PLUGIN_VERSION = '__DshBalancePluginVersion__'/)
  assert.match(source, /ROLL_TRANSITION = 'transform ' \+ ROLL_DURATION/)
  assert.match(source, /track\.animate\(\[/)
  assert.match(source, /fromTransform: 'translateY\(-50%\)'/)
  assert.match(source, /toTransform: 'translateY\(-50%\)'/)
  assert.match(source, /React\.useLayoutEffect\(function \(\)/)
  assert.equal(source.includes("phase: 'end'"), false)
  assert.equal(source.includes("topLine = showingOld"), false)
  assert.match(source, /['"]aria-live['"]: 'polite'/)
  assert.match(source, /resetComparison: function \(\)/)
  assert.match(source, /credentialChanged: credentialChanged/)
  assert.match(source, /refreshFailed: /)
  assert.match(source, /insufficient: /)
  assert.match(source, /UPSTREAM_NO_BALANCE: /)
  assert.match(source, /displayState\(snapshot\)/)
  assert.match(source, /#d94b4b/)
  assert.match(source, /width: 'min\(380px, max\(340px, 28vw\), calc\(100vw - 16px\)\)'/)
  assert.match(source, /aria-modal': 'false'/)
  assert.match(source, /aria-controls': 'dsh-balance-settings-drawer'/)
  assert.doesNotMatch(source, /当前浏览器|this browser/)
  const appearance = await readFile('src/appearance-ui.js', 'utf8')
  assert.match(appearance, /wallpaperBackgroundUrl\(id, backgroundId\)/)
  assert.match(appearance, /backgroundCandidateId/)
  assert.match(appearance, /props\.suspended \|\| !visible/)
  assert.match(appearance, /wallpaperCandidateHint/)
  assert.match(appearance, /wallpaperTypeScene/)
  assert.match(appearance, /wallpaperTypeWeb/)
  assert.match(appearance, /wallpaperTypeApplication/)
  assert.match(appearance, /applicationConsentNeeded/)
  assert.match(appearance, /WALLPAPER_RENDER_SESSION_EXPIRED/)
  assert.doesNotMatch(appearance, /当前浏览器|this browser/)
  const capturePage = await readFile('src/wallpaper-capture.js', 'utf8')
  assert.match(capturePage, /getDisplayMedia/)
  assert.match(capturePage, /\/heartbeat/)
  for (const type of ['image', 'video', 'scene', 'web', 'application']) {
    assert.match(source, new RegExp(`wallpaperType${type[0].toUpperCase()}${type.slice(1)}:`))
  }
})
