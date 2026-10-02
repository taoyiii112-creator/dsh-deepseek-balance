import assert from 'node:assert/strict'
import test from 'node:test'
import { KEY_API_PATH, PET_IMAGE_PATH, PET_VIDEO_PATH, WALLPAPER_API_PATH, WALLPAPER_ASSET_PATH, WALLPAPER_LIBRARY_API_PATH, WALLPAPER_LIBRARY_PICK_API_PATH, WALLPAPER_RENDER_API_PATH, WALLPAPER_RENDER_SCRIPT_PATH } from '../src/http.js'
import { apply } from '../src/index.js'

function responseRecorder() {
  return {
    status: 0, headers: {}, body: '',
    writeHead(status, headers) { this.status = status; this.headers = headers },
    end(body = '') { this.body = body },
  }
}

function bodyRequest(text) {
  return {
    method: 'POST',
    headers: {
      host: '127.0.0.1:3000', origin: 'http://127.0.0.1:3000',
      'content-type': 'application/json', 'content-length': String(Buffer.byteLength(text)),
    },
    async *[Symbol.asyncIterator]() { yield Buffer.from(text) },
  }
}

test('wires the click-to-save setup route to the DSH credential provider', async () => {
  let hostCallback
  const routes = []
  const effects = []
  let described
  let saved
  const credentials = {
    async resolve(ref) { assert.equal(ref, 'DEEPSEEK_API_KEY'); return undefined },
    async describe(ref) { described = ref; return { configured: false, writable: true } },
    async set(ref, value) { assert.equal(ref, 'DEEPSEEK_API_KEY'); saved = value },
  }
  const webServer = {
    register(route) {
      routes.push(route)
      return () => {}
    },
  }
  apply({
    inject(services, callback) {
      assert.deepEqual(services, ['webServer', 'credentials'])
      hostCallback = callback
    },
  })
  hostCallback({
    get(name) { return name === 'webServer' ? webServer : name === 'credentials' ? credentials : undefined },
    effect(callback, label) {
      effects.push({ callback, label })
      callback()
    },
  })

  assert.equal(routes.length, 10)
  assert.equal(routes.find((route) => route.path === KEY_API_PATH)?.path, KEY_API_PATH)
  assert.equal(routes.find((route) => route.path === PET_VIDEO_PATH)?.path, PET_VIDEO_PATH)
  assert.equal(routes.find((route) => route.path === PET_IMAGE_PATH)?.path, PET_IMAGE_PATH)
  assert.equal(routes.find((route) => route.path === WALLPAPER_API_PATH)?.path, WALLPAPER_API_PATH)
  assert.equal(routes.find((route) => route.path === WALLPAPER_LIBRARY_API_PATH)?.path, WALLPAPER_LIBRARY_API_PATH)
  assert.equal(routes.find((route) => route.path === WALLPAPER_LIBRARY_PICK_API_PATH)?.path, WALLPAPER_LIBRARY_PICK_API_PATH)
  assert.equal(routes.find((route) => route.path === WALLPAPER_RENDER_API_PATH)?.kind, 'prefix')
  assert.equal(routes.find((route) => route.path === WALLPAPER_RENDER_SCRIPT_PATH)?.path, WALLPAPER_RENDER_SCRIPT_PATH)
  assert.equal(routes.find((route) => route.path === WALLPAPER_ASSET_PATH)?.path, WALLPAPER_ASSET_PATH)
  assert.equal(effects.length, 1)
  const status = responseRecorder()
  await routes.find((route) => route.path === KEY_API_PATH).handler({ method: 'GET', headers: { host: '127.0.0.1:3000', origin: 'http://127.0.0.1:3000' } }, status)
  assert.equal(status.status, 200)
  assert.equal(described, 'DEEPSEEK_API_KEY')

  const save = responseRecorder()
  await routes.find((route) => route.path === KEY_API_PATH).handler(bodyRequest(JSON.stringify({ apiKey: '  click-saved-key  ' })), save)
  assert.equal(save.status, 200)
  assert.deepEqual(JSON.parse(save.body), { ok: true })
  assert.equal(saved, 'click-saved-key')
  assert.equal(save.body.includes(saved), false)
})
