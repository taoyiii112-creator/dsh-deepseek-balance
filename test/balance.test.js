import assert from 'node:assert/strict'
import test from 'node:test'
import {
  BalancePluginError,
  DEEPSEEK_BALANCE_URL,
  createBalanceReader,
  parseBalancePayload,
} from '../src/balance.js'

const payload = {
  is_available: true,
  balance_infos: [{
    currency: 'CNY', total_balance: '110.00', granted_balance: '10.00', topped_up_balance: '100.00',
  }],
}

test('parses the official payload without losing decimal precision', () => {
  const result = parseBalancePayload(payload, () => new Date('2026-09-15T12:00:00.000Z'))
  assert.deepEqual(result, {
    isAvailable: true,
    balances: [{ currency: 'CNY', totalBalance: '110.00', grantedBalance: '10.00', toppedUpBalance: '100.00' }],
    fetchedAt: '2026-09-15T12:00:00.000Z',
  })
})

test('accepts an unavailable account and an empty balance list', () => {
  const result = parseBalancePayload({ is_available: false, balance_infos: [] })
  assert.equal(result.isAvailable, false)
  assert.deepEqual(result.balances, [])
})

for (const invalid of [
  null,
  {},
  { is_available: 'yes', balance_infos: [] },
  { is_available: true, balance_infos: [{ ...payload.balance_infos[0], currency: '<XSS>' }] },
  { is_available: true, balance_infos: [{ ...payload.balance_infos[0], total_balance: '-1' }] },
  { is_available: true, balance_infos: [{ ...payload.balance_infos[0], total_balance: '1e3' }] },
]) {
  test(`rejects malformed payload ${JSON.stringify(invalid)}`, () => {
    assert.throws(() => parseBalancePayload(invalid), (error) => error.code === 'UPSTREAM_INVALID_RESPONSE')
  })
}

test('does not call upstream when the key is missing', async () => {
  let calls = 0
  const read = createBalanceReader({ env: {}, fetchImpl: async () => { calls += 1 } })
  await assert.rejects(read(), (error) => error.code === 'CONFIG_MISSING' && error.status === 503)
  assert.equal(calls, 0)
})

test('resolves a key through the live credential provider when supplied', async () => {
  let calls = 0
  const read = createBalanceReader({
    env: {},
    resolveApiKey: async () => 'stored-key',
    fetchImpl: async (url, options) => {
      calls += 1
      assert.equal(url, DEEPSEEK_BALANCE_URL)
      assert.equal(options.headers.authorization, 'Bearer stored-key')
      return new Response(JSON.stringify(payload), { headers: { 'content-type': 'application/json' } })
    },
  })
  await read()
  assert.equal(calls, 1)
})

test('uses a fixed endpoint, protected headers, and no redirects', async () => {
  const secret = 'unit-test-secret'
  let seen
  const read = createBalanceReader({
    env: { DEEPSEEK_API_KEY: secret },
    now: () => new Date('2026-09-15T12:00:00.000Z'),
    fetchImpl: async (url, options) => {
      seen = { url, options }
      return new Response(JSON.stringify(payload), { status: 200, headers: { 'content-type': 'application/json' } })
    },
  })
  const result = await read()
  assert.equal(result.balances[0].totalBalance, '110.00')
  assert.equal(seen.url, DEEPSEEK_BALANCE_URL)
  assert.equal(seen.options.method, 'GET')
  assert.equal(seen.options.redirect, 'error')
  assert.equal(seen.options.cache, 'no-store')
  assert.equal(seen.options.headers.authorization, `Bearer ${secret}`)
  assert.equal(JSON.stringify(result).includes(secret), false)
})

test('coalesces concurrent balance reads', async () => {
  let calls = 0
  let release
  const gate = new Promise((resolve) => { release = resolve })
  const read = createBalanceReader({
    env: { DEEPSEEK_API_KEY: 'test' },
    fetchImpl: async () => {
      calls += 1
      await gate
      return new Response(JSON.stringify(payload), { headers: { 'content-type': 'application/json' } })
    },
  })
  const first = read()
  const second = read()
  release()
  await Promise.all([first, second])
  assert.equal(calls, 1)
})

for (const [status, code, localStatus] of [
  [401, 'UPSTREAM_AUTH_FAILED', 502], [403, 'UPSTREAM_AUTH_FAILED', 502],
  [402, 'UPSTREAM_NO_BALANCE', 402],
  [429, 'UPSTREAM_RATE_LIMIT', 429], [500, 'UPSTREAM_UNAVAILABLE', 502],
]) {
  test(`maps upstream HTTP ${status} to a safe error`, async () => {
    const read = createBalanceReader({
      env: { DEEPSEEK_API_KEY: 'secret-that-must-not-leak' },
      fetchImpl: async () => new Response('secret-that-must-not-leak', { status }),
    })
    await assert.rejects(read(), (error) => {
      assert.ok(error instanceof BalancePluginError)
      assert.equal(error.code, code)
      assert.equal(error.status, localStatus)
      assert.equal(error.message.includes('secret-that-must-not-leak'), false)
      return true
    })
  })
}

test('rejects non-JSON and oversized successful responses', async () => {
  const html = createBalanceReader({
    env: { DEEPSEEK_API_KEY: 'test' },
    fetchImpl: async () => new Response('<html></html>', { headers: { 'content-type': 'text/html' } }),
  })
  await assert.rejects(html(), (error) => error.code === 'UPSTREAM_INVALID_RESPONSE')

  const huge = createBalanceReader({
    env: { DEEPSEEK_API_KEY: 'test' },
    fetchImpl: async () => new Response('x', { headers: { 'content-type': 'application/json', 'content-length': '70000' } }),
  })
  await assert.rejects(huge(), (error) => error.code === 'UPSTREAM_INVALID_RESPONSE')
})
