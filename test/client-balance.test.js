import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import test from 'node:test'

async function loadComparisonHooks() {
  const source = await readFile('src/client.js', 'utf8')
  const instrumented = source.replace(
    "    var name = 'dsh-deepseek-balance'",
    "    window.__testHooks = { decimalDifference, compareBalanceData, createBalanceStore, compactLabel, detailText, displayState, rollingPlan, RollingAmount, compareDecimals, normalizeThreshold, hasBalanceBelowThreshold, readThreshold, writeThreshold };\n    var name = 'dsh-deepseek-balance'",
  )
  let definition
  const context = {
    window: { __ModuleLoader__: { load(value) { definition = value } } },
    Symbol, Object, Error, Date, AbortController, BigInt,
    setInterval, clearInterval, setTimeout, clearTimeout,
  }
  vm.runInNewContext(instrumented, context)
  definition.factory(() => ({
    createElement(type, props, ...children) {
      return { type, props: props || {}, children }
    },
  }))
  return { hooks: context.window.__testHooks, context }
}

function renderText(node) {
  if (node === null || node === undefined || node === false) return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(renderText).join('')
  return renderText(node.children)
}

function labels() {
  return {
    refreshFailed: '查询失败',
    previousBalance: '上次余额',
    lastSuccessfulBalance: '上次成功余额',
    noBalance: '没有余额',
    unrecognized: '未获取到余额',
    keyInvalid: 'Key 无效',
    failed: '余额查询失败',
    insufficient: '余额不足',
    unavailable: '当前不可用',
    available: '账户可用',
    queried: '查询时间',
    lastSuccessfulQuery: '上次成功查询时间',
    refreshHint: '点击刷新',
    title: 'DeepSeek API 余额',
    dataMayLag: '可能短暂不同步',
    topUpHint: '请充值',
    total: '总余额',
    topped: '充值余额',
    granted: '赠送余额',
    decreased: '本次较上次减少',
    UPSTREAM_TIMEOUT: '上游请求超时',
  }
}

function data(balances, isAvailable = true) {
  return { isAvailable, balances }
}

function balance(currency, totalBalance) {
  return { currency, totalBalance }
}

function local(value) {
  return JSON.parse(JSON.stringify(value))
}

test('computes exact decimal differences without floating point tails', async () => {
  const { hooks: { decimalDifference } } = await loadComparisonHooks()
  assert.equal(decimalDifference('9.1', '10.1'), '-1.0')
  assert.equal(decimalDifference('0.20', '0.30'), '-0.10')
  assert.equal(decimalDifference('100.00', '100.00'), '0.00')
  assert.equal(decimalDifference('11.00', '10.00'), '1.00')
  assert.equal(decimalDifference('1e3', '1.00'), null)
})

test('compares matching currencies and classifies increase, decrease, and no change', async () => {
  const { hooks: { compareBalanceData } } = await loadComparisonHooks()
  const first = compareBalanceData(null, data([
    balance('CNY', '10.1'), balance('USD', '2.00'),
  ]))
  assert.deepEqual(local(first.changeSet), {})

  const second = compareBalanceData(first.baselineByCurrency, data([
    balance('CNY', '9.1'), balance('USD', '2.00'),
  ]))
  assert.deepEqual(local(second.changeSet), {
    CNY: { from: '10.1', to: '9.1', delta: '-1.0', kind: 'decrease' },
    USD: { from: '2.00', to: '2.00', delta: '0.00', kind: 'same' },
  })
})

test('rebases when account availability or currency structure is not comparable', async () => {
  const { hooks: { compareBalanceData } } = await loadComparisonHooks()
  const first = compareBalanceData(null, data([balance('CNY', '10.00')]))

  const addedCurrency = compareBalanceData(first.baselineByCurrency, data([
    balance('CNY', '9.00'), balance('USD', '1.00'),
  ]))
  assert.deepEqual(local(addedCurrency.changeSet), {})
  assert.deepEqual(local(addedCurrency.baselineByCurrency), { CNY: '9.00', USD: '1.00' })

  const unavailable = compareBalanceData(addedCurrency.baselineByCurrency, data([], false))
  assert.equal(unavailable.baselineByCurrency, null)
  assert.deepEqual(local(unavailable.changeSet), {})

  const recovered = compareBalanceData(unavailable.baselineByCurrency, data([balance('CNY', '8.00')]))
  assert.deepEqual(local(recovered.changeSet), {})
})

test('keeps the last successful baseline through transient failures and resets on auth loss', async () => {
  const { hooks, context } = await loadComparisonHooks()
  const queue = []
  context.fetch = async () => queue.shift()
  context.document = {
    visibilityState: 'visible',
    addEventListener() {},
    removeEventListener() {},
  }

  function response(body, ok = true) {
    return { ok, json: async () => body }
  }

  function successful(totalBalance) {
    return response({ ok: true, isAvailable: true, balances: [balance('CNY', totalBalance)], fetchedAt: '2026-09-18T00:00:00.000Z' })
  }

  const store = hooks.createBalanceStore()
  const snapshots = []
  queue.push(successful('100.00'))
  const unsubscribe = store.subscribe((snapshot) => snapshots.push(snapshot))
  await new Promise((resolve) => setTimeout(resolve, 0))
  queue.push(successful('99.00'))
  store.refresh()
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.deepEqual(local(store.getSnapshot().comparison.changeSet), {
    CNY: { from: '100.00', to: '99.00', delta: '-1.00', kind: 'decrease' },
  })

  queue.push(response({ ok: false, code: 'UPSTREAM_TIMEOUT' }, false))
  store.refresh()
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.equal(store.getSnapshot().data.balances[0].totalBalance, '99.00')
  assert.deepEqual(local(store.getSnapshot().comparison.changeSet), {})

  queue.push(response({ ok: false, code: 'UPSTREAM_AUTH_FAILED' }, false))
  store.refresh()
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.equal(store.getSnapshot().data, null)
  assert.deepEqual(local(store.getSnapshot().comparison.changeSet), {})

  queue.push(successful('98.00'))
  store.refresh()
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.deepEqual(local(store.getSnapshot().comparison.changeSet), {})
  assert.ok(snapshots.length >= 8)
  unsubscribe()
})

test('labels stale data as a failed refresh and unavailable data as insufficient', async () => {
  const { hooks: { compactLabel, detailText } } = await loadComparisonHooks()
  const t = (key) => labels()[key] || key
  const stale = {
    data: { isAvailable: true, balances: [balance('CNY', '0.03')], fetchedAt: '2026-09-18T00:00:00.000Z' },
    error: 'UPSTREAM_TIMEOUT',
    comparison: { changeSet: {}, revision: 1 },
  }
  assert.equal(renderText(compactLabel(stale, t)), '余额查询失败')
  assert.match(detailText(stale, t), /上次成功查询时间/)
  assert.match(detailText(stale, t), /上次成功余额 · CNY ¥0\.03/)

  const insufficient = {
    data: { isAvailable: false, balances: [balance('CNY', '0.03')] },
    error: null,
    comparison: { changeSet: {}, revision: 2 },
  }
  assert.equal(renderText(compactLabel(insufficient, t)), '没有余额')
  assert.match(detailText(insufficient, t), /没有余额/)
  assert.match(detailText(insufficient, t), /请充值/)
})

test('uses one no-balance or unrecognized state for all non-amount outcomes', async () => {
  const { hooks: { compactLabel, detailText, displayState } } = await loadComparisonHooks()
  const t = (key) => labels()[key] || key
  const noBalance = { data: { isAvailable: true, balances: [] }, error: null, loading: false, comparison: { changeSet: {}, revision: 1 } }
  const zeroBalance = { data: { isAvailable: true, balances: [balance('CNY', '0.00')] }, error: null, loading: false, comparison: { changeSet: {}, revision: 2 } }
  const unavailable = { data: { isAvailable: false, balances: [balance('CNY', '3.00')], fetchedAt: '2026-09-18T00:00:00.000Z' }, error: null, loading: false, comparison: { changeSet: {}, revision: 3 } }
  const paymentRequired = { data: null, error: 'UPSTREAM_NO_BALANCE', loading: false, comparison: { changeSet: {}, revision: 4 } }
  const unrecognized = { data: null, error: 'UPSTREAM_INVALID_RESPONSE', loading: false, comparison: { changeSet: {}, revision: 5 } }
  for (const snapshot of [noBalance, zeroBalance, unavailable, paymentRequired]) {
    assert.equal(displayState(snapshot), 'no-balance')
    assert.equal(renderText(compactLabel(snapshot, t)), '没有余额')
  }
  assert.equal(displayState(unrecognized), 'unrecognized')
  assert.equal(renderText(compactLabel(unrecognized, t)), '未获取到余额')
  assert.match(detailText(unavailable, t), /当前不可用/)
})

test('builds complete old-to-new rolling plans in both directions', async () => {
  const { hooks: { rollingPlan } } = await loadComparisonHooks()
  assert.deepEqual(local(rollingPlan('¥100.00', '¥99.80', 'decrease')), {
    lines: ['¥100.00', '¥99.80'],
    fromTransform: 'translateY(0)',
    toTransform: 'translateY(-50%)',
  })
  assert.deepEqual(local(rollingPlan('¥99.80', '¥100.00', 'increase')), {
    lines: ['¥100.00', '¥99.80'],
    fromTransform: 'translateY(-50%)',
    toTransform: 'translateY(0)',
  })
})

test('invalidates an in-flight request when credentials change', async () => {
  const { hooks, context } = await loadComparisonHooks()
  const pending = []
  context.fetch = () => new Promise((resolve) => pending.push(resolve))
  context.document = {
    visibilityState: 'visible',
    addEventListener() {},
    removeEventListener() {},
  }

  function successful(totalBalance) {
    return {
      ok: true,
      json: async () => ({
        ok: true,
        isAvailable: true,
        balances: [balance('CNY', totalBalance)],
        fetchedAt: '2026-09-18T00:00:00.000Z',
      }),
    }
  }

  const store = hooks.createBalanceStore()
  const unsubscribe = store.subscribe(() => {})
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.equal(pending.length, 1)

  store.credentialChanged()
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.equal(pending.length, 2)

  pending[0](successful('100.00'))
  pending[1](successful('7.00'))
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.equal(store.getSnapshot().data.balances[0].totalBalance, '7.00')
  assert.deepEqual(local(store.getSnapshot().comparison.changeSet), {})
  unsubscribe()
})

test('compares threshold amounts exactly and only flags successful low balances', async () => {
  const { hooks: { compareDecimals, normalizeThreshold, hasBalanceBelowThreshold } } = await loadComparisonHooks()
  assert.equal(normalizeThreshold(' 10.00 '), '10.00')
  assert.equal(normalizeThreshold(''), null)
  assert.equal(normalizeThreshold('1e3'), null)
  assert.equal(compareDecimals('9.999', '10.00'), -1)
  assert.equal(compareDecimals('10.00', '10'), 0)
  assert.equal(compareDecimals('10.01', '10.00'), 1)
  assert.equal(hasBalanceBelowThreshold(data([balance('CNY', '9.99')]), '10.00'), true)
  assert.equal(hasBalanceBelowThreshold(data([balance('CNY', '10.00')]), '10.00'), false)
  assert.equal(hasBalanceBelowThreshold(data([balance('CNY', '9.99')], false), '10.00'), false)
  assert.equal(hasBalanceBelowThreshold(data([balance('CNY', '9.99')]), null), false)
})

test('persists only a validated local threshold and supports clearing it', async () => {
  const { hooks: { readThreshold, writeThreshold }, context } = await loadComparisonHooks()
  const values = new Map()
  context.window.localStorage = {
    getItem(key) { return values.get(key) ?? null },
    setItem(key, value) { values.set(key, String(value)) },
    removeItem(key) { values.delete(key) },
  }
  assert.equal(readThreshold(), null)
  writeThreshold(' 10.00 ')
  assert.equal(readThreshold(), '10.00')
  writeThreshold('1e3')
  assert.equal(readThreshold(), null)
  writeThreshold(null)
  assert.equal(readThreshold(), null)
})
