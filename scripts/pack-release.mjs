import { createHash } from 'node:crypto'
import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'

const packageManifest = JSON.parse(await readFile('package.json', 'utf8'))
const compatibilityName = `docs/v${packageManifest.version}-Desktop兼容说明.md`
if (!await exists(compatibilityName)) {
  throw new Error(`Missing version-matched Desktop compatibility note: ${compatibilityName}`)
}
const packageName = `${packageManifest.name}-${packageManifest.version}.tgz`
const packagePath = join('dist', packageName)
const packageBytes = await readFile(packagePath)
const packageSha256 = createHash('sha256').update(packageBytes).digest('hex').toUpperCase()
const clientBytes = await readFile('client/client.js')
const clientSha256 = createHash('sha256').update(clientBytes).digest('hex').toUpperCase()
const releaseSuffix = process.env.DSH_BALANCE_RELEASE_SUFFIX || ''
if (!/^(-[A-Za-z0-9]+)?$/.test(releaseSuffix)) throw new Error('Invalid release candidate suffix.')
const stagingTag = process.env.DSH_BALANCE_RELEASE_STAGE_TAG || ''
if (stagingTag && !/^[A-Za-z0-9-]{1,32}$/.test(stagingTag)) throw new Error('Invalid release staging tag.')
const releaseDir = join('release', `${packageManifest.name}-${packageManifest.version}${releaseSuffix}`)
const legacyReleaseDir = `${releaseDir}-安装包`
const zipPath = `${releaseDir}-安装包.zip`
const zipSidecarPath = `${zipPath}.sha256`
const files = [
  packageName,
  `${packageName}.sha256`,
  'INSTALL.md',
  'README.md',
  compatibilityName,
]
const replaceExisting = process.env.DSH_BALANCE_RELEASE_REPLACE === '1'
const releaseDirExists = await exists(releaseDir)
const legacyReleaseDirExists = await exists(legacyReleaseDir)
const zipExists = await exists(zipPath)
const zipSidecarExists = await exists(zipSidecarPath)
let stagingDir = releaseDir
if (replaceExisting) {
  if ((releaseDirExists && legacyReleaseDirExists) || !zipExists || zipSidecarExists) {
    throw new Error('Safe replacement requires the existing version ZIP, no outer ZIP checksum sidecar, and at most one staging folder.')
  }
  stagingDir = stagingTag
    ? `${releaseDir}-stage-${stagingTag}`
    : legacyReleaseDirExists ? legacyReleaseDir : releaseDir
  if (stagingTag && await exists(stagingDir)) {
    throw new Error(`Refusing to replace existing tagged staging directory ${stagingDir}.`)
  }
  if (!stagingTag && (releaseDirExists || legacyReleaseDirExists)) {
    const expectedStageFiles = new Set([...files.map((file) => basename(file)), 'MANIFEST.json'])
    const existingStageEntries = await readdir(stagingDir, { withFileTypes: true })
    if (existingStageEntries.some((entry) => !entry.isFile() || !expectedStageFiles.has(entry.name))
      || existingStageEntries.length !== expectedStageFiles.size) {
      throw new Error(`Refusing to replace unexpected staging contents in ${stagingDir}.`)
    }
  }
} else if (releaseDirExists || legacyReleaseDirExists || zipExists || zipSidecarExists) {
  throw new Error(`Release output already exists; refusing to overwrite ${releaseDir} or ${zipPath}.`)
}

await mkdir(stagingDir, { recursive: true })

for (const file of files) {
  const source = file === packageName || file === `${packageName}.sha256`
    ? join('dist', file)
    : file
  await copyFile(source, join(stagingDir, basename(file)))
}

const entries = []
for (const file of await readdir(stagingDir)) {
  if (file === 'MANIFEST.json') continue
  const bytes = await readFile(join(stagingDir, file))
  entries.push({ name: file, size: bytes.byteLength, sha256: createHash('sha256').update(bytes).digest('hex').toUpperCase() })
}
entries.sort((left, right) => left.name.localeCompare(right.name))
const manifest = {
  name: packageManifest.name,
  version: packageManifest.version,
  buildId: `${packageManifest.version}-${packageSha256.slice(0, 12)}`,
  packageSha256,
  clientSha256,
  entries,
}
await writeFile(join(stagingDir, 'MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

const zipEntries = []
for (const file of await readdir(stagingDir)) {
  const bytes = await readFile(join(stagingDir, file))
  zipEntries.push({ name: file, bytes })
}
const zipBytes = createZip(zipEntries)
await writeFile(zipPath, zipBytes)
const zipSha256 = createHash('sha256').update(zipBytes).digest('hex').toUpperCase()
await rm(stagingDir, { recursive: true, force: true })
console.log(`Removed temporary release staging directory ${stagingDir}`)
console.log(`Wrote ${zipPath} (${zipBytes.byteLength} bytes)`)
console.log(`ZIP SHA256: ${zipSha256}`)

async function exists(path) {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

function crc32(bytes) {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return (crc ^ 0xffffffff) >>> 0
}

function dosDateTime(date = new Date()) {
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    date: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  }
}

function createZip(entries) {
  const localParts = []
  const centralParts = []
  let offset = 0
  const timestamp = dosDateTime()
  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8')
    const bytes = Buffer.from(entry.bytes)
    const crc = crc32(bytes)
    const local = Buffer.alloc(30 + name.length)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0x800, 6)
    local.writeUInt16LE(0, 8)
    local.writeUInt16LE(timestamp.time, 10)
    local.writeUInt16LE(timestamp.date, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(bytes.length, 18)
    local.writeUInt32LE(bytes.length, 22)
    local.writeUInt16LE(name.length, 26)
    name.copy(local, 30)
    localParts.push(local, bytes)

    const central = Buffer.alloc(46 + name.length)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(0x800, 8)
    central.writeUInt16LE(0, 10)
    central.writeUInt16LE(timestamp.time, 12)
    central.writeUInt16LE(timestamp.date, 14)
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(bytes.length, 20)
    central.writeUInt32LE(bytes.length, 24)
    central.writeUInt16LE(name.length, 28)
    central.writeUInt16LE(0, 30)
    central.writeUInt16LE(0, 32)
    central.writeUInt16LE(0, 34)
    central.writeUInt32LE(0, 38)
    central.writeUInt32LE(offset, 42)
    name.copy(central, 46)
    centralParts.push(central)
    offset += local.length + bytes.length
  }
  const centralDirectory = Buffer.concat(centralParts)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(0, 4)
  end.writeUInt16LE(0, 6)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(centralDirectory.length, 12)
  end.writeUInt32LE(offset, 16)
  end.writeUInt16LE(0, 20)
  return Buffer.concat([...localParts, centralDirectory, end])
}
