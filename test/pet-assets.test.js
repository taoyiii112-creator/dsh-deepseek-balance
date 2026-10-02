import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import test from 'node:test'
import { PET_IMAGE_PATH, PET_VIDEO_PATH, mountPetAssetRoutes } from '../src/http.js'

function responseRecorder() {
  return {
    status: 0, headers: {}, body: null,
    writeHead(status, headers) { this.status = status; this.headers = headers },
    end(body = '') { this.body = body },
  }
}

test('serves the offline pet assets with range and HEAD support', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'dsh-pet-assets-'))
  const video = Buffer.from('pet-video-fixture')
  const image = Buffer.from('pet-image-fixture')
  await writeFile(join(directory, 'idle.webm'), video)
  await writeFile(join(directory, 'idle.png'), image)

  try {
    const routes = new Map()
    const dispose = mountPetAssetRoutes({
      register(route) { routes.set(route.path, route); return () => {} },
    }, pathToFileURL(`${directory}${directory.endsWith('\\') ? '' : '\\'}`))
    assert.equal(typeof dispose, 'function')

    const full = responseRecorder()
    await routes.get(PET_VIDEO_PATH).handler({ method: 'GET', headers: {} }, full)
    assert.equal(full.status, 200)
    assert.equal(full.headers['content-type'], 'video/webm')
    assert.equal(full.headers['accept-ranges'], 'bytes')
    assert.deepEqual(full.body, video)

    const range = responseRecorder()
    await routes.get(PET_VIDEO_PATH).handler({ method: 'GET', headers: { range: 'bytes=1-4' } }, range)
    assert.equal(range.status, 206)
    assert.equal(range.headers['content-range'], `bytes 1-4/${video.length}`)
    assert.deepEqual(range.body, video.subarray(1, 5))

    const head = responseRecorder()
    await routes.get(PET_IMAGE_PATH).handler({ method: 'HEAD', headers: {} }, head)
    assert.equal(head.status, 200)
    assert.equal(head.headers['content-type'], 'image/png')
    assert.equal(head.headers['content-length'], image.length)
    assert.equal(head.body, '')

    const invalid = responseRecorder()
    await routes.get(PET_VIDEO_PATH).handler({ method: 'GET', headers: { range: 'bytes=99-100' } }, invalid)
    assert.equal(invalid.status, 416)
    assert.equal(invalid.headers['content-range'], `bytes */${video.length}`)

    const storedVideo = await readFile(join(directory, 'idle.webm'))
    assert.deepEqual(storedVideo, video)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
