import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { basename, join } from 'node:path'
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { gunzipSync } from 'node:zlib'

const manifest = JSON.parse(await readFile('package.json', 'utf8'))
await mkdir('dist', { recursive: true })
const packCommand = 'npm pack --pack-destination dist --ignore-scripts --cache .npm-cache'
const command = process.platform === 'win32' ? (process.env.ComSpec || 'cmd.exe') : 'npm'
const args = process.platform === 'win32'
  ? ['/d', '/s', '/c', packCommand]
  : ['pack', '--pack-destination', 'dist', '--ignore-scripts', '--cache', '.npm-cache']
let cacheExisted = false
try { await stat('.npm-cache'); cacheExisted = true } catch {}
let result
try {
  result = spawnSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] })
} finally {
  if (!cacheExisted) await rm('.npm-cache', { recursive: true, force: true })
}
if (result.error) throw result.error
if (result.stdout) process.stdout.write(result.stdout)
if (result.status !== 0) process.exit(result.status ?? 1)

const packagePath = join('dist', `${manifest.name}-${manifest.version}.tgz`)
const bytes = await readFile(packagePath)
const digest = createHash('sha256').update(bytes).digest('hex').toUpperCase()
const hashPath = `${packagePath}.sha256`
await writeFile(hashPath, `${digest}  ${basename(packagePath)}\n`, 'utf8')

function readTarEntries(buffer) {
  const entries = new Map()
  let offset = 0
  while (offset + 512 <= buffer.length) {
    const header = buffer.subarray(offset, offset + 512)
    if (header.every((value) => value === 0)) break
    const name = header.subarray(0, 100).toString('utf8').replace(/\0.*$/, '')
    const size = Number.parseInt(header.subarray(124, 136).toString('ascii').replace(/\0.*$/, '').trim() || '0', 8)
    if (!Number.isSafeInteger(size) || size < 0) throw new Error('npm pack produced an invalid tar archive.')
    const start = offset + 512
    const end = start + size
    if (end > buffer.length) throw new Error('npm pack produced a truncated tar archive.')
    if (header[156] === 0 || header[156] === 48) entries.set(name, buffer.subarray(start, end))
    offset = start + Math.ceil(size / 512) * 512
  }
  return entries
}

const entries = readTarEntries(gunzipSync(bytes))
const packageText = entries.get('package/package.json')?.toString('utf8')
const pluginText = entries.get('package/dsh.plugin.json')?.toString('utf8')
const clientBytes = entries.get('package/client/client.js')
const petVideoBytes = entries.get('package/client/assets/pet/idle.webm')
const petImageBytes = entries.get('package/client/assets/pet/idle.png')
const wallpaperCaptureBytes = entries.get('package/client/assets/wallpaper-capture.js')
if (!packageText || !pluginText || !clientBytes || !petVideoBytes || !petImageBytes || !wallpaperCaptureBytes) {
  throw new Error('The packed plugin is missing a required manifest, client bundle, pet asset, or wallpaper capture page.')
}
if (petVideoBytes.length === 0 || petImageBytes.length === 0 || wallpaperCaptureBytes.length === 0) {
  throw new Error('The packed plugin contains an empty required asset.')
}
const packedManifest = JSON.parse(packageText)
const packedPluginManifest = JSON.parse(pluginText)
if (packedManifest.version !== manifest.version || packedPluginManifest.version !== manifest.version) {
  throw new Error('The packed plugin version does not match package.json.')
}
if (packedManifest.dsh?.client?.platform !== 'web' || packedPluginManifest.client?.platform !== 'web') {
  throw new Error('The packed plugin must target the shared Harness Web client platform.')
}
const clientDigest = createHash('sha256').update(clientBytes).digest('hex').toUpperCase()
console.log(`Wrote ${packagePath} and ${hashPath}. Client SHA256: ${clientDigest}`)
