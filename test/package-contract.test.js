import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('package declares Harness host and shared Web client entries for Desktop', async () => {
  const manifest = JSON.parse(await readFile('package.json', 'utf8'))
  assert.equal(manifest.name, 'dsh-deepseek-balance')
  assert.equal(manifest.version, '1.0.1')
  assert.equal(manifest.main, 'lib/index.js')
  assert.equal(manifest.exports['./client'], './client/client.js')
  assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml')
  assert.equal(manifest.dsh.client.platform, 'web')
  assert.equal(manifest.files.includes('installer'), false)
  assert.match(manifest.scripts['pack:plugin'], /scripts\/pack-plugin\.mjs/)

  const patch = await readFile('cordis.patch.yml', 'utf8')
  assert.match(patch, /id: dsh-deepseek-balance/)
  assert.match(patch, /name: dsh-deepseek-balance/)

  const pluginManifest = JSON.parse(await readFile('dsh.plugin.json', 'utf8'))
  assert.equal(pluginManifest.version, manifest.version)
})
