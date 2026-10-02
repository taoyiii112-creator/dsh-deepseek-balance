import assert from 'node:assert/strict'
import test from 'node:test'
import { BalancePluginError } from '../src/balance.js'
import { BALANCE_API_PATH, KEY_API_PATH, mountBalanceRoute } from '../src/http.js'

function responseRecorder() {
  return {
    status: 0, headers: {}, body: '',
    writeHead(status, headers) { this.status = status; this.headers = headers },
    end(body = '') { this.body = body },
  }
}

function mount(reader) {
  const routes = []
  const dispose = () => {}
  const returned = mountBalanceRoute({ register(value) { routes.push(value); return dispose } }, reader)
  assert.equal(typeof returned, 'function')
  const route = routes.find((value) => value.path === BALANCE_API_PATH)
  assert.equal(route.path, BALANCE_API_PATH)
  return route.handler
}

function mountAll(reader, options) {
  const routes = new Map()
  const dispose = () => {}
  const returned = mountBalanceRoute({ register(value) {
    routes.set(value.path, value)
    return dispose
  } }, reader, options)
  assert.equal(typeof returned, 'function')
  return { routes, dispose }
}

function requestBody(text) {
  return {
    headers: { 'content-type': 'application/json', 'content-length': String(Buffer.byteLength(text)) },
    async *[Symbol.asyncIterator]() { yield Buffer.from(text) },
  }
}

test('serves a no-store balance response', async () => {
  const handler = mount(async () => ({ isAvailable: true, balances: [], fetchedAt: '2026-09-15T12:00:00.000Z' }))
  const response = responseRecorder()
  await handler({ method: 'GET', headers: { host: '127.0.0.1:3000', origin: 'http://127.0.0.1:3000' } }, response)
  assert.equal(response.status, 200)
  assert.match(response.headers['cache-control'], /no-store/)
  assert.equal(response.headers['x-content-type-options'], 'nosniff')
  assert.equal(JSON.parse(response.body).ok, true)
})

test('returns non-sensitive runtime version and client hash metadata', async () => {
  const { routes } = mountAll(async () => ({ isAvailable: true, balances: [], fetchedAt: '2026-09-15T12:00:00.000Z' }), {
    runtimeInfo: async () => ({ pluginVersion: '0.4.5', clientSha256: 'A'.repeat(64) }),
  })
  const response = responseRecorder()
  await routes.get(BALANCE_API_PATH).handler({ method: 'GET', headers: {} }, response)
  assert.deepEqual(JSON.parse(response.body), {
    ok: true,
    isAvailable: true,
    balances: [],
    fetchedAt: '2026-09-15T12:00:00.000Z',
    pluginVersion: '0.4.5',
    clientSha256: 'A'.repeat(64),
  })
})

test('rejects other methods and cross-origin reads', async () => {
  const handler = mount(async () => ({ isAvailable: true, balances: [], fetchedAt: '' }))
  const method = responseRecorder()
  await handler({ method: 'POST', headers: {} }, method)
  assert.equal(method.status, 405)
  assert.equal(method.headers.allow, 'GET')

  const origin = responseRecorder()
  await handler({ method: 'GET', headers: { host: 'localhost:3000', origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' } }, origin)
  assert.equal(origin.status, 403)
})

test('returns only a stable error code', async () => {
  const secret = 'do-not-leak'
  const handler = mount(async () => { throw new BalancePluginError('UPSTREAM_AUTH_FAILED', 502, secret) })
  const response = responseRecorder()
  await handler({ method: 'GET', headers: {} }, response)
  assert.equal(response.status, 502)
  assert.deepEqual(JSON.parse(response.body), { ok: false, code: 'UPSTREAM_AUTH_FAILED' })
  assert.equal(response.body.includes(secret), false)
})

test('saves an API key through the same-origin setup route without echoing it', async () => {
  let saved
  const { routes } = mountAll(async () => ({ isAvailable: true, balances: [], fetchedAt: '' }), {
    describeApiKey: async () => ({ configured: false, writable: true }),
    saveApiKey: async (value) => { saved = value },
  })
  const handler = routes.get(KEY_API_PATH).handler
  const response = responseRecorder()
  await handler({
    ...requestBody(JSON.stringify({ apiKey: '  secret-that-must-not-echo  ' })),
    method: 'POST',
    headers: { ...requestBody('{}').headers, origin: 'http://127.0.0.1:3000', host: '127.0.0.1:3000' },
  }, response)
  assert.equal(response.status, 200)
  assert.deepEqual(JSON.parse(response.body), { ok: true })
  assert.equal(saved, 'secret-that-must-not-echo')
  assert.equal(response.body.includes(saved), false)
})

test('validates the setup route body and origin', async () => {
  const { routes } = mountAll(async () => ({ isAvailable: true, balances: [], fetchedAt: '' }), {
    saveApiKey: async () => {},
  })
  const handler = routes.get(KEY_API_PATH).handler

  const origin = responseRecorder()
  await handler({ ...requestBody('{}'), method: 'POST', headers: { origin: 'https://evil.example', host: 'localhost:3000', 'sec-fetch-site': 'cross-site', 'content-type': 'application/json' } }, origin)
  assert.equal(origin.status, 403)

  const invalid = responseRecorder()
  await handler({ method: 'POST', headers: { origin: 'http://localhost:3000', host: 'localhost:3000', 'content-type': 'text/plain' }, async *[Symbol.asyncIterator]() { yield Buffer.from('x') } }, invalid)
  assert.equal(invalid.status, 415)

  const body = responseRecorder()
  await handler({ method: 'POST', headers: { origin: 'http://localhost:3000', host: 'localhost:3000', ...requestBody('{}').headers }, async *[Symbol.asyncIterator]() { yield Buffer.from(JSON.stringify({ apiKey: '' })) } }, body)
  assert.equal(body.status, 400)
  assert.deepEqual(JSON.parse(body.body), { ok: false, code: 'CONFIG_KEY_INVALID' })
})
