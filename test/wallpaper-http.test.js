import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import {
  WALLPAPER_API_PATH,
  WALLPAPER_ASSET_PATH,
  WALLPAPER_LIBRARY_API_PATH,
  WALLPAPER_RENDER_API_PATH,
  WALLPAPER_RENDER_OPEN_API_PATH,
  WALLPAPER_RENDER_SCRIPT_PATH,
  mountWallpaperRoutes,
  resetWallpaperCacheForTests,
} from '../src/http.js'

function jpeg(width, height) {
  const bytes = Buffer.alloc(32)
  bytes.set([0xff, 0xd8, 0xff, 0xc0, 0x00, 0x11, 0x08], 0)
  bytes.writeUInt16BE(height, 7)
  bytes.writeUInt16BE(width, 9)
  return bytes
}

function responseRecorder() {
  return {
    status: 0,
    headers: {},
    body: '',
    writeHead(status, headers) { this.status = status; this.headers = headers },
    end(body = '') { this.body = body },
  }
}

function bodyRequest(text) {
  return {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'content-length': String(Buffer.byteLength(text)),
    },
    async *[Symbol.asyncIterator]() { yield Buffer.from(text) },
  }
}

async function createProject(root, id, manifest, files) {
  const projectRoot = path.join(root, id)
  await mkdir(projectRoot, { recursive: true })
  await writeFile(path.join(projectRoot, 'project.json'), JSON.stringify(manifest), 'utf8')
  for (const [relativePath, contents] of Object.entries(files)) {
    const target = path.join(projectRoot, relativePath)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, contents)
  }
}

test('Wallpaper metadata separates thumbnails, original media, and browser-captured render types', async (t) => {
  resetWallpaperCacheForTests()
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'dsh-wallpaper-contract-'))
  const libraryPath = path.join(temporaryRoot, 'SteamLibrary')
  const workshopRoot = path.join(libraryPath, 'steamapps', 'workshop', 'content', '431960')
  await mkdir(workshopRoot, { recursive: true })
  await createProject(workshopRoot, '100000000001', {
    title: 'Web candidates',
    type: 'web',
    preview: 'preview.jpg',
    file: 'index.html',
  }, {
    'preview.jpg': jpeg(192, 192),
    'index.html': '<main style="background-image:url(\'imgs/1.jpg\')"></main>',
    'imgs/1.jpg': jpeg(2880, 1800),
    'imgs/8.jpg': jpeg(7680, 4320),
  })
  await createProject(workshopRoot, '100000000002', {
    title: 'Original video',
    type: 'video',
    preview: 'preview.jpg',
    file: 'wallpaper.mp4',
  }, {
    'preview.jpg': jpeg(192, 192),
    'wallpaper.mp4': Buffer.from('ftyp-original-video'),
  })
  await createProject(workshopRoot, '100000000003', {
    title: 'Scene package',
    type: 'scene',
    preview: 'preview.jpg',
    file: 'scene.json',
  }, {
    'preview.jpg': jpeg(800, 800),
    'scene.json': '{}',
    'scene.pkg': Buffer.from('opaque package fixture'),
  })
  const packageOnlyScenePath = path.join(workshopRoot, '100000000006')
  await mkdir(packageOnlyScenePath, { recursive: true })
  await writeFile(path.join(packageOnlyScenePath, 'preview.jpg'), jpeg(640, 360))
  await writeFile(path.join(packageOnlyScenePath, 'scene.pkg'), Buffer.from('opaque package without project manifest'))
  await createProject(workshopRoot, '100000000007', {
    title: 'Incomplete scene manifest',
    preview: 'preview.jpg',
  }, {
    'preview.jpg': jpeg(640, 360),
    'scene.pkg': Buffer.from('opaque package with incomplete manifest'),
  })
  await createProject(workshopRoot, '100000000008', {
    title: 'Scene manifest with missing entry',
    type: 'scene',
    preview: 'preview.jpg',
    file: 'missing-scene.json',
  }, {
    'preview.jpg': jpeg(640, 360),
    'scene.pkg': Buffer.from('opaque package with missing scene entry'),
  })
  const ambiguousScenePath = path.join(workshopRoot, '100000000009')
  await mkdir(ambiguousScenePath, { recursive: true })
  await writeFile(path.join(ambiguousScenePath, 'preview.jpg'), jpeg(640, 360))
  await writeFile(path.join(ambiguousScenePath, 'scene-a.pkg'), Buffer.from('first scene package'))
  await writeFile(path.join(ambiguousScenePath, 'scene-b.pkg'), Buffer.from('second scene package'))
  await createProject(workshopRoot, '100000000004', {
    title: 'Direct image',
    preview: 'preview.jpg',
    file: 'background.jpg',
  }, {
    'preview.jpg': jpeg(192, 192),
    'background.jpg': jpeg(1920, 1080),
  })
  await createProject(workshopRoot, '100000000005', {
    title: 'Application wallpaper',
    preview: 'preview.jpg',
    file: 'wallpaper.exe',
  }, {
    'preview.jpg': jpeg(640, 360),
    'wallpaper.exe': Buffer.from('safe application fixture'),
  })

  const routes = new Map()
  const dispose = mountWallpaperRoutes({
    register(route) {
      routes.set(route.path, route)
      return () => {}
    },
  })
  t.after(async () => {
    dispose()
    resetWallpaperCacheForTests()
    await rm(temporaryRoot, { recursive: true, force: true })
  })

  const registerResponse = responseRecorder()
  await routes.get(WALLPAPER_LIBRARY_API_PATH).handler(bodyRequest(JSON.stringify({ libraryPath })), registerResponse)
  assert.equal(registerResponse.status, 200)

  const listResponse = responseRecorder()
  await routes.get(WALLPAPER_API_PATH).handler({ method: 'GET', headers: {} }, listResponse)
  assert.equal(listResponse.status, 200)
  const body = JSON.parse(listResponse.body)
  assert.equal(body.ok, true)

  const web = body.items.find((item) => item.id === '100000000001')
  assert.ok(web)
  assert.match(web.libraryId, /^[a-f0-9]{16}$/)
  assert.equal(web.previewUrl.endsWith('/preview'), true)
  assert.equal(web.backgroundSource, 'referenced-image')
  assert.equal(web.backgroundWidth, 2880)
  assert.equal(web.backgroundHeight, 1800)
  assert.equal(web.backgroundCandidates.length, 2)
  assert.ok(web.backgroundCandidates.some((candidate) => candidate.width === 7680 && candidate.height === 4320))
  assert.equal('projectPath' in web, false)
  assert.equal(web.backgroundCandidates.some((candidate) => path.isAbsolute(candidate.relativePath)), false)
  assert.equal(web.render.protocol, 'dsh-wallpaper-browser-render-v1')
  assert.equal(web.render.status, 'requires-local-window-capture')
  assert.equal(web.render.available, true)
  assert.equal(web.type, 'web')

  const highResolutionCandidate = web.backgroundCandidates.find((candidate) => candidate.width === 7680)
  const assetResponse = responseRecorder()
  await routes.get(WALLPAPER_ASSET_PATH).handler({
    method: 'HEAD',
    url: `${WALLPAPER_ASSET_PATH}/100000000001/background?candidate=${highResolutionCandidate.id}`,
    headers: {},
  }, assetResponse)
  assert.equal(assetResponse.status, 200)
  assert.equal(assetResponse.headers['content-type'], 'image/jpeg')
  assert.equal(assetResponse.headers['content-length'], 32)
  assert.equal(assetResponse.body, '')

  const invalidCandidateResponse = responseRecorder()
  await routes.get(WALLPAPER_ASSET_PATH).handler({
    method: 'GET',
    url: `${WALLPAPER_ASSET_PATH}/100000000001/background?candidate=invalid`,
    headers: {},
  }, invalidCandidateResponse)
  assert.equal(invalidCandidateResponse.status, 400)

  const video = body.items.find((item) => item.id === '100000000002')
  assert.ok(video)
  assert.equal(video.playable, true)
  assert.equal(video.type, 'video')
  assert.match(video.mediaUrl, /\/media$/)
  assert.equal(video.backgroundSource, 'preview')

  const scene = body.items.find((item) => item.id === '100000000003')
  assert.ok(scene)
  assert.equal(scene.backgroundSource, 'preview')
  assert.equal(scene.backgroundCandidates.length, 0)
  assert.equal(scene.type, 'scene')
  assert.equal(scene.render.protocol, 'dsh-wallpaper-browser-render-v1')
  assert.equal(scene.render.available, true)

  const packageOnlyScene = body.items.find((item) => item.id === '100000000006')
  assert.ok(packageOnlyScene)
  assert.equal(packageOnlyScene.type, 'scene')
  assert.equal(packageOnlyScene.backgroundSource, 'preview')
  assert.equal(packageOnlyScene.render.status, 'requires-local-window-capture')
  assert.equal(packageOnlyScene.render.available, true)
  assert.equal('projectPath' in packageOnlyScene, false)

  const incompleteSceneIds = ['100000000007', '100000000008']
  for (const id of incompleteSceneIds) {
    const item = body.items.find((value) => value.id === id)
    assert.ok(item)
    assert.equal(item.type, 'scene')
    assert.equal(item.render.available, true)
    assert.equal(item.render.status, 'requires-local-window-capture')
  }
  assert.equal(body.items.some((item) => item.id === '100000000009'), false)

  const direct = body.items.find((item) => item.id === '100000000004')
  assert.ok(direct)
  assert.equal(direct.type, 'image')
  assert.equal(direct.backgroundSource, 'project-image')
  assert.equal(direct.backgroundWidth, 1920)
  assert.equal(direct.backgroundHeight, 1080)

  const application = body.items.find((item) => item.id === '100000000005')
  assert.ok(application)
  assert.equal(application.type, 'application')
  assert.equal(application.render.available, true)

  const renderRoute = routes.get(WALLPAPER_RENDER_API_PATH)
  assert.equal(renderRoute.kind, 'prefix')
  const confirmationResponse = responseRecorder()
  const confirmationBody = JSON.stringify({
    wallpaperId: application.id, libraryId: application.libraryId, type: 'application',
    width: 1280, height: 720, confirmedApplication: false,
  })
  await renderRoute.handler({
    ...bodyRequest(confirmationBody),
    url: WALLPAPER_RENDER_OPEN_API_PATH,
    headers: {
      ...bodyRequest(confirmationBody).headers,
      origin: 'http://127.0.0.1:3000',
      host: '127.0.0.1:3000',
    },
  }, confirmationResponse)
  assert.equal(confirmationResponse.status, 400)
  assert.equal(JSON.parse(confirmationResponse.body).code, 'WALLPAPER_APPLICATION_CONFIRMATION_REQUIRED')

  const captureScriptResponse = responseRecorder()
  await routes.get(WALLPAPER_RENDER_SCRIPT_PATH).handler({
    method: 'GET',
    headers: { origin: 'http://127.0.0.1:3000', host: '127.0.0.1:3000' },
  }, captureScriptResponse)
  assert.equal(captureScriptResponse.status, 200)
  assert.match(captureScriptResponse.body, /getDisplayMedia/)
  assert.match(captureScriptResponse.body, /\/heartbeat/)
})
