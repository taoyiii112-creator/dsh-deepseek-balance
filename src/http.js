import { BalancePluginError } from './balance.js'
import { execFile } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { lstat, open, readFile, readdir, realpath, stat } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export const BALANCE_API_PATH = '/dsh-deepseek-balance/api/balance'
export const KEY_API_PATH = '/dsh-deepseek-balance/api/key'
export const PET_VIDEO_PATH = '/dsh-deepseek-balance/assets/pet/idle.webm'
export const PET_IMAGE_PATH = '/dsh-deepseek-balance/assets/pet/idle.png'
export const WALLPAPER_API_PATH = '/dsh-deepseek-balance/api/wallpapers'
export const WALLPAPER_LIBRARY_API_PATH = `${WALLPAPER_API_PATH}/library`
export const WALLPAPER_LIBRARY_PICK_API_PATH = `${WALLPAPER_LIBRARY_API_PATH}/pick`
export const WALLPAPER_RENDER_API_PATH = `${WALLPAPER_API_PATH}/render`
export const WALLPAPER_RENDER_OPEN_API_PATH = `${WALLPAPER_RENDER_API_PATH}/open`
export const WALLPAPER_RENDER_CLOSE_API_PATH = `${WALLPAPER_RENDER_API_PATH}/close`
export const WALLPAPER_RENDER_CAPTURE_API_PATH = `${WALLPAPER_RENDER_API_PATH}/capture`
export const WALLPAPER_RENDER_SESSION_API_PATH = `${WALLPAPER_RENDER_API_PATH}/session`
export const WALLPAPER_RENDER_SCRIPT_PATH = '/dsh-deepseek-balance/assets/wallpaper-capture.js'
export const WALLPAPER_ASSET_PATH = '/dsh-deepseek-balance/wallpapers'

const MAX_KEY_BODY_BYTES = 4 * 1024
const MAX_API_KEY_LENGTH = 512
const MAX_WALLPAPER_BODY_BYTES = 4 * 1024
const WALLPAPER_COLLECTION_ID = '431960'
const MAX_WALLPAPER_PROJECTS = 2000
const WALLPAPER_CACHE_MS = 15_000
const MAX_WALLPAPER_RENDER_BODY_BYTES = 128 * 1024
const WALLPAPER_RENDER_SESSION_TTL_MS = 10 * 60 * 1000
const WALLPAPER_RENDER_MAX_SESSIONS = 2
const DSH_DESKTOP_APP_ORIGIN = 'dsh-app://app'
const DSH_DESKTOP_LEGACY_APP_ORIGIN = 'app://dsh'
const DSH_DESKTOP_WALLPAPER_ORIGINS = new Set([DSH_DESKTOP_APP_ORIGIN, DSH_DESKTOP_LEGACY_APP_ORIGIN])
const DSH_WALLPAPER_RENDERER_ORIGIN_HEADER = 'x-dsh-wallpaper-renderer-origin'
const MAX_WALLPAPER_SOURCE_SCAN_FILES = 256
const MAX_WALLPAPER_SOURCE_SCAN_DEPTH = 4
const MAX_WALLPAPER_TEXT_SCAN_FILES = 24
const MAX_WALLPAPER_TEXT_BYTES = 512 * 1024
const MAX_WALLPAPER_CANDIDATES = 24
const WALLPAPER_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const WALLPAPER_PREVIEW_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp'])
const WALLPAPER_SCENE_PACKAGE_EXTENSIONS = new Set(['.pkg'])
const WALLPAPER_TEXT_EXTENSIONS = new Set(['.css', '.htm', '.html', '.js', '.mjs'])
const WALLPAPER_EXCLUDED_IMAGE_TOKEN_PATTERN = /(?:^|[-_.])(preview|thumbnail|thumb|poster|cover|icon|logo)(?:[-_.]|$)/i
const extraSteamLibraries = new Set()
let wallpaperCache = { expiresAt: 0, items: [], byId: new Map() }
const wallpaperRenderSessions = new Map()
let wallpaperRenderQueue = Promise.resolve()
let wallpaperRenderReaper = null

const wallpaperCapturePage = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Wallpaper Engine 捕获配对</title>
<style>body{font:16px/1.55 system-ui,sans-serif;background:#101b2b;color:#f1f5fb;margin:0;padding:28px;max-width:760px}main{background:#1b2a3e;border:1px solid #344861;border-radius:14px;padding:24px}h1{font-size:22px;margin:0 0 8px}p{color:#cbd6e4}button{background:#4b91d1;color:white;border:0;border-radius:8px;padding:11px 16px;font-size:15px;cursor:pointer}button:disabled{opacity:.5;cursor:wait}video{display:block;width:100%;max-height:54vh;background:#080d14;margin-top:18px;object-fit:contain}#status{min-height:2em;color:#a9d6ff}.name{font-weight:700;color:#fff}</style></head>
<body><main><h1>连接 Wallpaper Engine 壁纸</h1><p>此页面只在你点击下方按钮后请求屏幕捕获。请选择名为 <span class="name" id="window-name"></span> 的 Wallpaper Engine 窗口；不要选择整个屏幕或其他窗口。</p><p>捕获只通过本机 WebRTC 传回 DeepSeek Harness 插件，不上传、录制或保存。</p><button id="share" type="button">开始共享所选壁纸窗口</button><p id="status" role="status" aria-live="polite">等待插件配对…</p><video id="preview" autoplay muted playsinline></video></main><script type="module" src="${WALLPAPER_RENDER_SCRIPT_PATH}"></script></body></html>`

function sendJson(response, status, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload)
  response.writeHead(status, {
    'cache-control': 'no-store, max-age=0',
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'x-content-type-options': 'nosniff',
    ...extraHeaders,
  })
  response.end(body)
}

function sendText(response, status, body, contentType, extraHeaders = {}) {
  response.writeHead(status, {
    'cache-control': 'no-store, max-age=0',
    'content-type': contentType,
    'content-length': Buffer.byteLength(body),
    'x-content-type-options': 'nosniff',
    ...extraHeaders,
  })
  response.end(body)
}

function sendAsset(response, status, body, contentType, extraHeaders = {}, requestMethod = 'GET') {
  response.writeHead(status, {
    'cache-control': 'public, max-age=31536000, immutable',
    'content-type': contentType,
    'content-length': body?.byteLength ?? 0,
    'x-content-type-options': 'nosniff',
    ...extraHeaders,
  })
  if (requestMethod === 'HEAD') {
    response.end()
    return
  }
  response.end(body)
}

function parseByteRange(value, size) {
  if (typeof value !== 'string' || value.trim() === '') return null
  if (size === 0) return { invalid: true }
  const match = /^bytes=(\d*)-(\d*)$/.exec(value.trim())
  if (!match) return { invalid: true }

  const startText = match[1]
  const endText = match[2]
  if (startText === '' && endText === '') return { invalid: true }

  let start
  let end
  if (startText === '') {
    const suffixLength = Number(endText)
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return { invalid: true }
    start = Math.max(size - suffixLength, 0)
    end = size - 1
  } else {
    start = Number(startText)
    end = endText === '' ? size - 1 : Number(endText)
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end < start || start >= size) {
      return { invalid: true }
    }
    end = Math.min(end, size - 1)
  }
  return { start, end }
}

async function serveAsset(request, response, fileUrl, contentType) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    sendAsset(response, 405, Buffer.alloc(0), 'text/plain; charset=utf-8', { allow: 'GET, HEAD' }, request.method)
    return
  }

  let body
  try {
    body = await readFile(fileUrl)
  } catch {
    sendAsset(response, 404, Buffer.alloc(0), 'text/plain; charset=utf-8', {}, request.method)
    return
  }

  const range = parseByteRange(request.headers?.range, body.byteLength)
  if (range?.invalid) {
    sendAsset(response, 416, Buffer.alloc(0), contentType, {
      'content-range': `bytes */${body.byteLength}`,
    }, request.method)
    return
  }

  if (!range) {
    sendAsset(response, 200, body, contentType, { 'accept-ranges': 'bytes' }, request.method)
    return
  }

  const chunk = body.subarray(range.start, range.end + 1)
  sendAsset(response, 206, chunk, contentType, {
    'accept-ranges': 'bytes',
    'content-range': `bytes ${range.start}-${range.end}/${body.byteLength}`,
  }, request.method)
}

export function mountPetAssetRoutes(webServer, assetRoot) {
  if (!webServer || typeof webServer.register !== 'function' || !(assetRoot instanceof URL)) {
    throw new BalancePluginError('CONFIG_INVALID', 500)
  }

  const routes = [
    {
      kind: 'exact',
      path: PET_VIDEO_PATH,
      handler: (request, response) => serveAsset(request, response, new URL('idle.webm', assetRoot), 'video/webm'),
    },
    {
      kind: 'exact',
      path: PET_IMAGE_PATH,
      handler: (request, response) => serveAsset(request, response, new URL('idle.png', assetRoot), 'image/png'),
    },
  ]
  const disposers = routes.map((route) => webServer.register(route))
  return () => {
    for (const dispose of disposers.reverse()) dispose?.()
  }
}

function isPathInside(parent, candidate) {
  const relative = path.relative(parent, candidate)
  return relative === '' || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith('..' + path.sep))
}

function decodeVdfPath(value) {
  return value.replace(/\\\\/g, '\\').replace(/\\"/g, '"')
}

function steamInstallCandidates() {
  const candidates = [
    process.env['ProgramFiles(x86)'] && path.join(process.env['ProgramFiles(x86)'], 'Steam'),
    process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Steam'),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Programs', 'Steam'),
    process.env.USERPROFILE && path.join(process.env.USERPROFILE, 'Steam'),
    process.env.STEAM_PATH,
    process.env.STEAM_DIR,
    'C:\\Program Files (x86)\\Steam',
    'C:\\Program Files\\Steam',
  ]
  return [...new Set(candidates.filter((value) => typeof value === 'string' && value !== '').map((value) => path.resolve(value)))]
}

async function contentRootForLibrary(libraryPath) {
  if (typeof libraryPath !== 'string' || !path.isAbsolute(libraryPath)) return null
  const absolute = path.resolve(libraryPath)
  const direct = path.basename(absolute).toLowerCase() === WALLPAPER_COLLECTION_ID
    ? absolute
    : path.join(absolute, 'steamapps', 'workshop', 'content', WALLPAPER_COLLECTION_ID)
  try {
    const canonical = await realpath(direct)
    const info = await stat(canonical)
    if (!info.isDirectory()) return null
    const suffix = canonical.split(path.sep).slice(-4).map((part) => part.toLowerCase())
    if (suffix.join('/') !== 'steamapps/workshop/content/' + WALLPAPER_COLLECTION_ID) return null
    return canonical
  } catch {
    return null
  }
}

async function discoverSteamLibraries() {
  const libraries = new Set(extraSteamLibraries)
  for (const installPath of steamInstallCandidates()) {
    libraries.add(installPath)
    try {
      const text = await readFile(path.join(installPath, 'steamapps', 'libraryfolders.vdf'), 'utf8')
      for (const match of text.matchAll(/"path"\s*"((?:\\.|[^"\\])*)"/g)) {
        const value = decodeVdfPath(match[1])
        if (path.isAbsolute(value)) libraries.add(value)
      }
    } catch {}
  }
  return [...libraries]
}

async function discoverWallpaperRoots() {
  const roots = new Set()
  for (const library of await discoverSteamLibraries()) {
    const root = await contentRootForLibrary(library)
    if (root) roots.add(root)
  }
  return [...roots]
}

function wallpaperLibraryId(root) {
  const normalized = path.resolve(root).replace(/[\\/]+$/, '').replaceAll('/', '\\').toLowerCase()
  return createHash('sha256').update(normalized).digest('hex').slice(0, 16)
}

async function hasNoSymlinkSegments(root, candidate) {
  const relative = path.relative(root, candidate)
  if (path.isAbsolute(relative) || relative === '..' || relative.startsWith('..' + path.sep)) return false
  let current = path.resolve(root)
  try {
    if ((await lstat(current)).isSymbolicLink()) return false
    for (const segment of relative.split(path.sep).filter(Boolean)) {
      current = path.join(current, segment)
      if ((await lstat(current)).isSymbolicLink()) return false
    }
    return true
  } catch {
    return false
  }
}

async function safeWallpaperFileAtPath(projectPath, candidatePath, extensions) {
  const extension = path.extname(candidatePath).toLowerCase()
  if (!extensions.has(extension)) return null
  try {
    const canonicalProject = await realpath(projectPath)
    const rawCandidate = path.resolve(candidatePath)
    if (!isPathInside(canonicalProject, rawCandidate) || !(await hasNoSymlinkSegments(canonicalProject, rawCandidate))) return null
    const candidate = await realpath(rawCandidate)
    if (!isPathInside(canonicalProject, candidate)) return null
    const info = await stat(candidate)
    if (!info.isFile()) return null
    return { path: candidate, size: info.size, extension }
  } catch {
    return null
  }
}

async function safeWallpaperFile(projectPath, relativeName, extensions) {
  if (typeof relativeName !== 'string' || relativeName.length === 0 || relativeName.length > 512) return null
  const segments = relativeName.replace(/\\/g, '/').split('/')
  if (segments.some((segment) => segment === '' || segment === '.' || segment === '..' || /[<>:"|?*\u0000-\u001f]/.test(segment))) return null
  return safeWallpaperFileAtPath(projectPath, path.resolve(projectPath, ...segments), extensions)
}

async function safeWallpaperReferenceFile(projectPath, reference, extensions) {
  if (typeof reference !== 'string' || reference.length === 0 || reference.length > 1024) return null
  let value
  try {
    value = decodeURIComponent(reference.split(/[?#]/, 1)[0]).replace(/\\/g, '/')
  } catch {
    return null
  }
  if (value === '' || value.startsWith('/') || value.startsWith('//') || /^[a-z]:/i.test(value) || /^[a-z][a-z\d+.-]*:/i.test(value)) return null
  const segments = value.split('/')
  if (segments.some((segment) => segment === '' || segment === '\u0000' || /[<>:"|?*\u0000-\u001f]/.test(segment))) return null
  return safeWallpaperFileAtPath(projectPath, path.resolve(projectPath, ...segments), extensions)
}

async function readWallpaperImageDimensions(file) {
  if (!file || !WALLPAPER_IMAGE_EXTENSIONS.has(file.extension) && file.extension !== '.gif') return null
  let handle
  try {
    handle = await open(file.path, 'r')
    const header = Buffer.alloc(256 * 1024)
    const { bytesRead } = await handle.read(header, 0, header.length, 0)
    const bytes = header.subarray(0, bytesRead)
    if (file.extension === '.png' && bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
      return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
    }
    if (file.extension === '.gif' && bytes.length >= 10 && /^GIF8[79]a$/.test(bytes.toString('ascii', 0, 6))) {
      return { width: bytes.readUInt16LE(6), height: bytes.readUInt16LE(8) }
    }
    if ((file.extension === '.jpg' || file.extension === '.jpeg') && bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
      const frameMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf])
      let offset = 2
      while (offset + 4 <= bytes.length) {
        if (bytes[offset] !== 0xff) { offset += 1; continue }
        while (bytes[offset] === 0xff) offset += 1
        const marker = bytes[offset++]
        if (marker === 0xd8 || marker === 0xd9 || marker === 0x01 || marker >= 0xd0 && marker <= 0xd7) continue
        if (offset + 2 > bytes.length) break
        const segmentLength = bytes.readUInt16BE(offset)
        if (segmentLength < 2 || offset + segmentLength > bytes.length) break
        if (frameMarkers.has(marker) && segmentLength >= 7) {
          return { width: bytes.readUInt16BE(offset + 5), height: bytes.readUInt16BE(offset + 3) }
        }
        offset += segmentLength
      }
    }
    if (file.extension === '.webp' && bytes.length >= 30 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') {
      let offset = 12
      while (offset + 8 <= bytes.length) {
        const chunk = bytes.toString('ascii', offset, offset + 4)
        const length = bytes.readUInt32LE(offset + 4)
        const data = offset + 8
        if (chunk === 'VP8X' && length >= 10 && data + 10 <= bytes.length) {
          return {
            width: 1 + bytes.readUIntLE(data + 4, 3),
            height: 1 + bytes.readUIntLE(data + 7, 3),
          }
        }
        if (chunk === 'VP8 ' && length >= 10 && data + 10 <= bytes.length && bytes[data + 3] === 0x9d && bytes[data + 4] === 0x01 && bytes[data + 5] === 0x2a) {
          return { width: bytes.readUInt16LE(data + 6) & 0x3fff, height: bytes.readUInt16LE(data + 8) & 0x3fff }
        }
        if (chunk === 'VP8L' && length >= 5 && data + 5 <= bytes.length && bytes[data] === 0x2f) {
          const width = 1 + bytes[data + 1] + ((bytes[data + 2] & 0x3f) << 8)
          const height = 1 + ((bytes[data + 2] >> 6) & 0x03) + (bytes[data + 3] << 2) + ((bytes[data + 4] & 0x0f) << 10)
          return { width, height }
        }
        if (length > bytes.length || data + length > bytes.length) break
        offset = data + length + (length & 1)
      }
    }
  } catch {}
  finally { await handle?.close().catch(() => {}) }
  return null
}

function toWallpaperRelativePath(projectPath, filePath) {
  return path.relative(projectPath, filePath).split(path.sep).join('/')
}

function isExcludedWallpaperImage(relativePath) {
  return relativePath.split('/').some((segment) => WALLPAPER_EXCLUDED_IMAGE_TOKEN_PATTERN.test(segment))
}

function wallpaperCandidateId(relativePath) {
  return createHash('sha256').update(relativePath).digest('hex').slice(0, 16)
}

function wallpaperCandidateScore(candidate) {
  const width = candidate.dimensions?.width ?? 0
  const height = candidate.dimensions?.height ?? 0
  const ratio = width > 0 && height > 0 ? width / height : 0
  const commonRatio = [16 / 9, 16 / 10, 4 / 3, 1].reduce((best, target) => Math.max(best, 1 - Math.min(1, Math.abs(ratio - target) / target)), 0)
  const sourceWeight = candidate.source === 'project-image' ? 3 : candidate.source === 'referenced-image' ? 2 : 1
  return sourceWeight * 1_000_000_000_000 + Math.round(commonRatio * 1_000_000_000) + width * height
}

async function collectProjectFiles(projectPath, extensions, maxFiles) {
  const found = []
  const queue = [{ directory: projectPath, depth: 0 }]
  while (queue.length && found.length < maxFiles) {
    const current = queue.shift()
    let entries
    try { entries = await readdir(current.directory, { withFileTypes: true }) } catch { continue }
    for (const entry of entries) {
      if (found.length >= maxFiles) break
      if (entry.isSymbolicLink()) continue
      const candidatePath = path.join(current.directory, entry.name)
      if (entry.isDirectory()) {
        if (current.depth < MAX_WALLPAPER_SOURCE_SCAN_DEPTH) queue.push({ directory: candidatePath, depth: current.depth + 1 })
        continue
      }
      if (!entry.isFile() || !extensions.has(path.extname(entry.name).toLowerCase())) continue
      const file = await safeWallpaperFileAtPath(projectPath, candidatePath, extensions)
      if (file) found.push(file)
    }
  }
  return found
}

const WALLPAPER_IMAGE_REFERENCE_PATTERN = /(?:url\(\s*|["'`])([^"'`()\s]+?\.(?:png|jpe?g|webp)(?:[?#][^"'`()\s]*)?)/gi

async function findReferencedWallpaperImages(projectPath, type, projectFile) {
  if (type !== 'web') return new Map()
  const files = await collectProjectFiles(projectPath, WALLPAPER_TEXT_EXTENSIONS, MAX_WALLPAPER_TEXT_SCAN_FILES)
  if (projectFile && WALLPAPER_TEXT_EXTENSIONS.has(projectFile.extension)) {
    files.sort((left, right) => (left.path === projectFile.path ? -1 : 0) - (right.path === projectFile.path ? -1 : 0))
  }
  const referenced = new Map()
  for (const file of files) {
    if (file.size > MAX_WALLPAPER_TEXT_BYTES) continue
    let text
    try { text = await readFile(file.path, 'utf8') } catch { continue }
    WALLPAPER_IMAGE_REFERENCE_PATTERN.lastIndex = 0
    for (const match of text.matchAll(WALLPAPER_IMAGE_REFERENCE_PATTERN)) {
      const image = await safeWallpaperReferenceFile(projectPath, match[1], WALLPAPER_IMAGE_EXTENSIONS)
      if (image) referenced.set(image.path, image)
    }
  }
  return referenced
}

function makeWallpaperCandidate(projectPath, file, dimensions, source) {
  const relativePath = toWallpaperRelativePath(projectPath, file.path)
  return {
    id: wallpaperCandidateId(relativePath),
    file,
    dimensions,
    source,
    relativePath,
  }
}

function inferWallpaperType(declaredType, projectFileName) {
  const declared = String(declaredType || '').trim().toLowerCase()
  if (['image', 'video', 'scene', 'web', 'application'].includes(declared)) return declared
  const extension = path.extname(String(projectFileName || '')).toLowerCase()
  if (extension === '.mp4' || extension === '.webm') return 'video'
  if (extension === '.exe') return 'application'
  if (extension === '.html' || extension === '.htm') return 'web'
  if (extension === '.json') return 'scene'
  if (WALLPAPER_IMAGE_EXTENSIONS.has(extension)) return 'image'
  return 'static'
}

function isScenePackageFallbackEligible(project) {
  if (!project || typeof project !== 'object' || Array.isArray(project)) return true
  const declared = String(project.type || '').trim().toLowerCase()
  const inferred = inferWallpaperType(project.type, project.file)
  return inferred === 'scene' || inferred === 'static'
    && !['image', 'video', 'web', 'application'].includes(declared)
}

async function resolveWallpaperRenderTarget(project) {
  const manifestFile = await safeWallpaperFile(project.projectPath, 'project.json', new Set(['.json']))
  const packageFallback = async () => {
    if (project.type !== 'scene') return null
    if (typeof project.scenePackageName === 'string') {
      return safeWallpaperFile(project.projectPath, project.scenePackageName, WALLPAPER_SCENE_PACKAGE_EXTENSIONS)
    }
    return (await readPackagedSceneFallback(project.projectPath))?.scenePackage ?? null
  }
  if (!manifestFile || manifestFile.size > 128 * 1024) {
    return packageFallback()
  }
  try {
    const manifest = JSON.parse(await readFile(manifestFile.path, 'utf8'))
    if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) return packageFallback()
    const projectFileName = typeof manifest.file === 'string' ? manifest.file : ''
    if (inferWallpaperType(manifest.type, projectFileName) !== project.type) {
      return project.type === 'scene' && isScenePackageFallbackEligible(manifest) ? packageFallback() : null
    }
    if (project.type === 'scene') {
      const sceneSource = await safeWallpaperFile(project.projectPath, projectFileName, new Set(['.json']))
      return sceneSource ? manifestFile : packageFallback()
    }
    if (project.type === 'web') return safeWallpaperFile(project.projectPath, projectFileName, new Set(['.html', '.htm']))
    if (project.type === 'application') {
      const executable = await safeWallpaperFile(project.projectPath, projectFileName, new Set(['.exe']))
      return executable ? manifestFile : null
    }
  } catch { return packageFallback() }
  return null
}

async function readPackagedSceneFallback(projectPath) {
  let entries
  try { entries = await readdir(projectPath, { withFileTypes: true }) } catch { return null }
  const packages = entries.filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === '.pkg')
  const packageEntry = packages.length === 1 ? packages[0] : null
  const previewEntry = entries.find((entry) => entry.isFile() && /^preview\.(?:jpe?g|png|gif|webp)$/i.test(entry.name))
  if (!packageEntry || !previewEntry) return null
  const scenePackage = await safeWallpaperFile(projectPath, packageEntry.name, WALLPAPER_SCENE_PACKAGE_EXTENSIONS)
  const preview = await safeWallpaperFile(projectPath, previewEntry.name, WALLPAPER_PREVIEW_EXTENSIONS)
  if (!scenePackage || !preview) return null
  return { scenePackageName: packageEntry.name, scenePackage, preview }
}

async function findWallpaperBackgroundCandidates(projectPath, preview, previewDimensions, type, projectFile) {
  const referenced = await findReferencedWallpaperImages(projectPath, type, projectFile)
  const files = await collectProjectFiles(projectPath, WALLPAPER_IMAGE_EXTENSIONS, MAX_WALLPAPER_SOURCE_SCAN_FILES)
  const candidates = []
  const seen = new Set()
  const directImage = projectFile && WALLPAPER_IMAGE_EXTENSIONS.has(projectFile.extension) ? projectFile : null
  for (const file of files) {
    if (file.path === preview.path || file.path === directImage?.path || seen.has(file.path) || isExcludedWallpaperImage(toWallpaperRelativePath(projectPath, file.path))) continue
    const dimensions = await readWallpaperImageDimensions(file)
    if (!dimensions || Math.max(dimensions.width, dimensions.height) < 1280 || Math.min(dimensions.width, dimensions.height) < 720) continue
    if (previewDimensions && dimensions.width * dimensions.height <= previewDimensions.width * previewDimensions.height) continue
    const source = referenced.has(file.path) ? 'referenced-image' : 'loose-image'
    candidates.push(makeWallpaperCandidate(projectPath, file, dimensions, source))
    seen.add(file.path)
  }
  if (directImage && (directImage.path !== preview.path || type === 'image')) {
    const dimensions = await readWallpaperImageDimensions(directImage)
    if (dimensions) {
      candidates.unshift(makeWallpaperCandidate(projectPath, directImage, dimensions, 'project-image'))
    }
  }
  candidates.sort((left, right) => wallpaperCandidateScore(right) - wallpaperCandidateScore(left) || right.file.size - left.file.size)
  return candidates.slice(0, MAX_WALLPAPER_CANDIDATES)
}

async function readWallpaperProject(root, item) {
  if (!/^\d{5,20}$/.test(item.name) || !item.isDirectory()) return null
  const projectPath = path.join(root, item.name)
  try {
    const canonicalProject = await realpath(projectPath)
    if (!isPathInside(root, canonicalProject)) return null
    const manifestFile = await safeWallpaperFile(canonicalProject, 'project.json', new Set(['.json']))
    let project = null
    if (manifestFile && manifestFile.size <= 128 * 1024) {
      try {
        const parsed = JSON.parse(await readFile(manifestFile.path, 'utf8'))
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) project = parsed
      } catch {}
    }
    let scenePackageName = null
    let preview = project && typeof project.preview === 'string'
      ? await safeWallpaperFile(canonicalProject, project.preview, WALLPAPER_PREVIEW_EXTENSIONS)
      : null
    const inferredType = project ? inferWallpaperType(project.type, project.file) : 'static'
    const fallbackEligible = isScenePackageFallbackEligible(project)
    const incompleteSceneManifest = project && inferredType === 'static' && fallbackEligible
    if ((!project || !preview || incompleteSceneManifest) && fallbackEligible) {
      const fallback = await readPackagedSceneFallback(canonicalProject)
      if (!fallback) return null
      project = { type: 'scene', file: fallback.scenePackageName, preview: toWallpaperRelativePath(canonicalProject, fallback.preview.path) }
      scenePackageName = fallback.scenePackageName
      preview = fallback.preview
    }
    if (!project || !preview) return null
    const previewDimensions = await readWallpaperImageDimensions(preview)
    const type = inferWallpaperType(project.type, project.file)
    const isVideoProject = type === 'video'
    const projectFileName = typeof project.file === 'string' ? project.file : ''
    const projectFile = await safeWallpaperFile(canonicalProject, projectFileName, new Set([
      ...WALLPAPER_IMAGE_EXTENSIONS,
      '.html', '.htm', '.css', '.js', '.mjs', '.mp4', '.webm', '.exe', '.json',
    ]))
    const candidates = await findWallpaperBackgroundCandidates(canonicalProject, preview, previewDimensions, type, projectFile)
    const highConfidence = candidates.filter((candidate) => candidate.source === 'project-image' || candidate.source === 'referenced-image')
    const automaticCandidate = candidates.find((candidate) => candidate.source === 'project-image')
      ?? (highConfidence.length === 1 ? highConfidence[0] : candidates.length === 1 ? candidates[0] : null)
    const background = automaticCandidate?.file ?? preview
    const backgroundDimensions = automaticCandidate?.dimensions || await readWallpaperImageDimensions(background)
    const backgroundSource = automaticCandidate?.source ?? 'preview'
    const media = isVideoProject
      ? await safeWallpaperFile(canonicalProject, projectFileName, new Set(['.mp4', '.webm']))
      : null
    const renderableType = ['scene', 'web', 'application'].includes(type)
    const renderTarget = renderableType ? await resolveWallpaperRenderTarget({
      projectPath: canonicalProject,
      projectFileName,
      scenePackageName,
      type,
    }) : null
    const render = renderableType
      ? {
          protocol: 'dsh-wallpaper-browser-render-v1',
          status: renderTarget ? 'requires-local-window-capture' : 'render-source-unavailable',
          available: Boolean(renderTarget),
        }
      : null
    return {
      id: item.name,
      libraryId: wallpaperLibraryId(root),
      title: typeof project.title === 'string' && project.title.trim() !== '' ? project.title.trim().slice(0, 120) : 'Wallpaper ' + item.name,
      type,
      projectPath: canonicalProject,
      scenePackageName,
      previewPath: preview.path,
      previewType: preview.extension === '.jpg' || preview.extension === '.jpeg' ? 'image/jpeg'
        : preview.extension === '.gif' ? 'image/gif'
          : preview.extension === '.webp' ? 'image/webp' : 'image/png',
      backgroundPath: background.path,
      backgroundType: background.extension === '.jpg' || background.extension === '.jpeg' ? 'image/jpeg'
        : background.extension === '.webp' ? 'image/webp' : background.extension === '.gif' ? 'image/gif' : 'image/png',
      backgroundSource,
      backgroundWidth: backgroundDimensions?.width ?? null,
      backgroundHeight: backgroundDimensions?.height ?? null,
      backgroundCandidateId: automaticCandidate?.id ?? null,
      backgroundCandidates: candidates,
      mediaPath: media?.path ?? null,
      mediaType: media?.extension === '.webm' ? 'video/webm' : media ? 'video/mp4' : null,
      render,
    }
  } catch {
    return null
  }
}

async function refreshWallpaperCache() {
  if (Date.now() < wallpaperCache.expiresAt) return wallpaperCache
  const items = []
  const byId = new Map()
  for (const root of await discoverWallpaperRoots()) {
    let entries
    try { entries = await readdir(root, { withFileTypes: true }) } catch { continue }
    for (const entry of entries.slice(0, MAX_WALLPAPER_PROJECTS)) {
      const project = await readWallpaperProject(root, entry)
      if (!project || byId.has(project.id)) continue
      byId.set(project.id, project)
      items.push({
        id: project.id,
        libraryId: project.libraryId,
        title: project.title,
        type: project.type,
        playable: Boolean(project.mediaPath),
        backgroundSource: project.backgroundSource,
        backgroundWidth: project.backgroundWidth,
        backgroundHeight: project.backgroundHeight,
        backgroundCandidateId: project.backgroundCandidateId,
        backgroundCandidates: project.backgroundCandidates.map((candidate) => ({
          id: candidate.id,
          source: candidate.source,
          width: candidate.dimensions.width,
          height: candidate.dimensions.height,
          relativePath: candidate.relativePath,
        })),
        previewUrl: WALLPAPER_ASSET_PATH + '/' + project.id + '/preview',
        backgroundUrl: WALLPAPER_ASSET_PATH + '/' + project.id + '/background',
        mediaUrl: project.mediaPath ? WALLPAPER_ASSET_PATH + '/' + project.id + '/media' : null,
        render: project.render,
      })
    }
  }
  items.sort((left, right) => left.title.localeCompare(right.title))
  wallpaperCache = { expiresAt: Date.now() + WALLPAPER_CACHE_MS, items: items, byId: byId }
  return wallpaperCache
}

function sendFileRange(request, response, filePath, contentType, allowedRoot) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    sendJson(response, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' }, { allow: 'GET, HEAD' })
    return Promise.resolve()
  }
  return Promise.all([realpath(filePath), realpath(allowedRoot)]).then(([canonicalFile, canonicalRoot]) => {
    if (!isPathInside(canonicalRoot, canonicalFile)) throw new Error('Wallpaper file escaped its project directory')
    return stat(canonicalFile).then((info) => ({ info, canonicalFile }))
  }).then(({ info, canonicalFile }) => {
    if (!info.isFile()) throw new Error('not file')
    const range = parseByteRange(request.headers?.range, info.size)
    if (range?.invalid) {
      response.writeHead(416, {
        'cache-control': 'no-store',
        'content-range': 'bytes */' + info.size,
        'content-length': 0,
        'x-content-type-options': 'nosniff',
      })
      response.end()
      return
    }
    const start = range?.start ?? 0
    const end = range?.end ?? Math.max(0, info.size - 1)
    const headers = {
      'accept-ranges': 'bytes',
      'cache-control': 'private, no-store',
      'content-length': info.size === 0 ? 0 : end - start + 1,
      'content-type': contentType,
      'x-content-type-options': 'nosniff',
    }
    if (range) headers['content-range'] = 'bytes ' + start + '-' + end + '/' + info.size
    response.writeHead(range ? 206 : 200, headers)
    if (request.method === 'HEAD' || info.size === 0) {
      response.end()
      return
    }
    const stream = createReadStream(canonicalFile, { start: start, end: end })
    stream.on('error', () => { if (!response.destroyed) response.destroy() })
    response.on('close', () => stream.destroy())
    stream.pipe(response)
  }).catch(() => {
    if (!response.headersSent) sendJson(response, 404, { ok: false, code: 'WALLPAPER_NOT_FOUND' })
    else if (!response.destroyed) response.destroy()
  })
}

function isSameOriginRequest(request) {
  const fetchSite = request.headers?.['sec-fetch-site']
  if (fetchSite === 'cross-site') return false

  const origin = request.headers?.origin
  if (typeof origin !== 'string' || origin === '') return true
  const host = request.headers?.host
  if (typeof host !== 'string' || host === '') return false
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

async function readBoundedBody(request, maxBytes = MAX_KEY_BODY_BYTES) {
  const declaredLength = Number(request.headers?.['content-length'])
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    request.resume?.()
    return null
  }

  const chunks = []
  let total = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    total += buffer.byteLength
    if (total > maxBytes) {
      request.resume?.()
      return null
    }
    chunks.push(buffer)
  }
  return Buffer.concat(chunks, total).toString('utf8')
}

function parseApiKeyBody(text) {
  let body
  try {
    body = JSON.parse(text)
  } catch {
    return null
  }
  if (body === null || typeof body !== 'object' || Array.isArray(body)) return null
  const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : ''
  if (apiKey === '' || apiKey.length > MAX_API_KEY_LENGTH) return null
  return apiKey
}

function methodNotAllowed(response, allow) {
  sendJson(response, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' }, { allow })
}

function sameOriginFailure(request, response, allowDesktopWallpaperRenderer = false) {
  if (isSameOriginRequest(request)
    || (allowDesktopWallpaperRenderer && trustedDesktopWallpaperOrigin(request))) return false
  sendJson(response, 403, { ok: false, code: 'FORBIDDEN' })
  return true
}

async function handleWallpaperList(request, response) {
  if (sameOriginFailure(request, response)) return
  if (request.method !== 'GET') {
    methodNotAllowed(response, 'GET')
    return
  }
  try {
    const cache = await refreshWallpaperCache()
    sendJson(response, 200, { ok: true, items: cache.items, canAddLibrary: true })
  } catch {
    sendJson(response, 503, { ok: false, code: 'WALLPAPER_SCAN_FAILED', items: [] })
  }
}

async function handleWallpaperLibrary(request, response) {
  if (sameOriginFailure(request, response)) return
  if (request.method !== 'POST') {
    methodNotAllowed(response, 'POST')
    return
  }
  const contentType = String(request.headers?.['content-type'] ?? '')
    .split(';', 1)[0]
    .trim()
    .toLowerCase()
  if (contentType !== 'application/json') {
    sendJson(response, 415, { ok: false, code: 'CONFIG_CONTENT_TYPE' })
    return
  }
  let text
  try { text = await readBoundedBody(request, MAX_WALLPAPER_BODY_BYTES) } catch {
    sendJson(response, 400, { ok: false, code: 'WALLPAPER_PATH_INVALID' })
    return
  }
  if (text === null) {
    sendJson(response, 413, { ok: false, code: 'CONFIG_BODY_TOO_LARGE' })
    return
  }
  let value
  try { value = JSON.parse(text) } catch { value = null }
  const libraryPath = value && typeof value.libraryPath === 'string' ? value.libraryPath.trim() : ''
  if (!path.isAbsolute(libraryPath) || libraryPath.length > 1024) {
    sendJson(response, 400, { ok: false, code: 'WALLPAPER_LIBRARY_INVALID' })
    return
  }
  const root = await contentRootForLibrary(libraryPath)
  if (!root) {
    sendJson(response, 400, { ok: false, code: 'WALLPAPER_LIBRARY_NOT_FOUND' })
    return
  }
  extraSteamLibraries.add(path.resolve(libraryPath))
  wallpaperCache.expiresAt = 0
  sendJson(response, 200, { ok: true })
}

async function handleWallpaperLibraryPicker(request, response) {
  if (sameOriginFailure(request, response)) return
  if (request.method !== 'POST') {
    methodNotAllowed(response, 'POST')
    return
  }
  if (process.platform !== 'win32') {
    sendJson(response, 501, { ok: false, code: 'WALLPAPER_FOLDER_PICKER_UNAVAILABLE' })
    return
  }

  const script = [
    "Add-Type -AssemblyName System.Windows.Forms",
    "$dialog = New-Object System.Windows.Forms.FolderBrowserDialog",
    "$dialog.Description = 'Select a Steam library folder'",
    "$dialog.ShowNewFolderButton = $false",
    "if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($dialog.SelectedPath)) }",
  ].join('; ')
  try {
    const { stdout } = await execFileAsync('powershell.exe', ['-NoLogo', '-NoProfile', '-STA', '-Command', script], {
      windowsHide: true,
      timeout: 300_000,
      maxBuffer: 4096,
    })
    const encodedPath = stdout.trim()
    if (!encodedPath) {
      sendJson(response, 200, { ok: true, cancelled: true })
      return
    }
    const libraryPath = Buffer.from(encodedPath, 'base64').toString('utf8')
    if (!path.isAbsolute(libraryPath) || libraryPath.length > 1024) {
      sendJson(response, 400, { ok: false, code: 'WALLPAPER_LIBRARY_INVALID' })
      return
    }
    sendJson(response, 200, { ok: true, cancelled: false, libraryPath })
  } catch {
    sendJson(response, 500, { ok: false, code: 'WALLPAPER_FOLDER_PICKER_FAILED' })
  }
}

async function readWallpaperRenderBody(request, response) {
  const contentType = String(request.headers?.['content-type'] ?? '')
    .split(';', 1)[0]
    .trim()
    .toLowerCase()
  if (contentType !== 'application/json') {
    sendJson(response, 415, { ok: false, code: 'CONFIG_CONTENT_TYPE' })
    return null
  }
  let text
  try { text = await readBoundedBody(request, MAX_WALLPAPER_RENDER_BODY_BYTES) } catch {
    sendJson(response, 400, { ok: false, code: 'WALLPAPER_RENDER_REQUEST_INVALID' })
    return null
  }
  if (text === null) {
    sendJson(response, 413, { ok: false, code: 'WALLPAPER_RENDER_REQUEST_TOO_LARGE' })
    return null
  }
  try {
    const body = JSON.parse(text)
    return body && typeof body === 'object' && !Array.isArray(body) ? body : null
  } catch {
    return null
  }
}

function localRequestOrigin(request) {
  const origin = request.headers?.origin
  const host = request.headers?.host
  if (typeof origin !== 'string' || typeof host !== 'string') return null
  try {
    const parsed = new URL(origin)
    const loopback = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(parsed.hostname.toLowerCase())
    if (!loopback || !['http:', 'https:'].includes(parsed.protocol) || parsed.host !== host) return null
    return parsed.origin
  } catch {
    return null
  }
}

function wallpaperRenderRequestOrigin(request) {
  const desktopOrigin = trustedDesktopWallpaperOrigin(request)
  if (desktopOrigin) return desktopOrigin
  return localRequestOrigin(request)
}

function trustedDesktopWallpaperOrigin(request) {
  const headers = request.headers || {}
  if (headers['sec-fetch-site'] === 'cross-site') return null
  const suppliedOrigin = typeof headers.origin === 'string' ? headers.origin : ''
  const rendererOrigin = headers[DSH_WALLPAPER_RENDERER_ORIGIN_HEADER]
  if (typeof rendererOrigin === 'string' && DSH_DESKTOP_WALLPAPER_ORIGINS.has(rendererOrigin)) {
    if (suppliedOrigin !== '' && suppliedOrigin !== rendererOrigin) return null
    const expectedHost = new URL(rendererOrigin).host.toLowerCase()
    const requestHost = String(headers.host || '').toLowerCase()
    if (requestHost && requestHost !== expectedHost && !isLoopbackHostAuthority(requestHost)) return null
    const remoteAddress = request.socket?.remoteAddress
    if (remoteAddress && !isLoopbackAddress(remoteAddress)) return null
    return rendererOrigin
  }
  // The Desktop carrier's authenticated forwarder removes Host, Origin and
  // Sec-Fetch-Site before it dispatches this request to the plugin Host.
  // An exact browser-supplied Desktop origin remains trustworthy when present.
  return DSH_DESKTOP_WALLPAPER_ORIGINS.has(suppliedOrigin) ? suppliedOrigin : null
}

function isLoopbackHostAuthority(authority) {
  try {
    const parsed = new URL(`http://${authority}`)
    return !parsed.username && !parsed.password && parsed.pathname === '/'
      && ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname.toLowerCase())
  } catch {
    return false
  }
}

function wallpaperCaptureOrigin(rendererOrigin, webServer) {
  if (!DSH_DESKTOP_WALLPAPER_ORIGINS.has(rendererOrigin)) return rendererOrigin
  const port = Number(webServer?.port)
  if (!Number.isInteger(port) || port < 1 || port > 65535) return null
  return `http://127.0.0.1:${port}`
}

function isLoopbackAddress(address) {
  const normalized = String(address || '').toLowerCase().replace(/^::ffff:/, '')
  return normalized === '::1' || /^127\./.test(normalized)
}

function wallpaperRenderRequestMatchesOrigin(request, expectedOrigin, allowMissingOrigin = false) {
  const desktopOrigin = trustedDesktopWallpaperOrigin(request)
  if (desktopOrigin) return desktopOrigin === expectedOrigin
  const suppliedOrigin = request.headers?.origin
  if (typeof suppliedOrigin === 'string' && suppliedOrigin !== '') {
    return wallpaperRenderRequestOrigin(request) === expectedOrigin
  }
  if (!allowMissingOrigin || request.headers?.['sec-fetch-site'] === 'cross-site') return false
  let expected
  try { expected = new URL(expectedOrigin) } catch { return false }
  if (String(request.headers?.host || '').toLowerCase() !== expected.host.toLowerCase()) return false
  if (expectedOrigin === DSH_DESKTOP_APP_ORIGIN) return true
  return ['localhost', '127.0.0.1', '[::1]', '::1'].includes(expected.hostname.toLowerCase())
    && isLoopbackAddress(request.socket?.remoteAddress)
}

async function wallpaperEngineInstallations() {
  const installations = []
  for (const library of await discoverSteamLibraries()) {
    const engineRoot = path.join(library, 'steamapps', 'common', 'wallpaper_engine')
    let canonicalRoot
    try { canonicalRoot = await realpath(engineRoot) } catch { continue }
    for (const executableName of ['wallpaper64.exe', 'wallpaper32.exe']) {
      try {
        const executablePath = await realpath(path.join(canonicalRoot, executableName))
        if (!isPathInside(canonicalRoot, executablePath) || path.basename(executablePath).toLowerCase() !== executableName) continue
        if (!(await stat(executablePath)).isFile()) continue
        installations.push(executablePath)
      } catch {}
    }
  }
  return installations
}

async function runningWallpaperEngineExecutable(installations) {
  if (process.platform !== 'win32' || installations.length === 0) return null
  const script = "$items = Get-Process -Name wallpaper64,wallpaper32 -ErrorAction SilentlyContinue; $items | ForEach-Object { $_.Path }"
  try {
    const { stdout } = await execFileAsync('powershell.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', script], {
      windowsHide: true, shell: false, timeout: 5_000, maxBuffer: 4096,
    })
    const runningPaths = new Set(stdout.split(/\r?\n/).map((value) => value.trim().toLowerCase()).filter(Boolean))
    return installations.find((value) => runningPaths.has(value.toLowerCase())) ?? null
  } catch {
    return null
  }
}

function serializeWallpaperRenderOperation(operation) {
  const result = wallpaperRenderQueue.then(operation, operation)
  wallpaperRenderQueue = result.catch(() => {})
  return result
}

function stopWallpaperRenderReaperIfIdle() {
  if (wallpaperRenderSessions.size !== 0 || !wallpaperRenderReaper) return
  clearInterval(wallpaperRenderReaper)
  wallpaperRenderReaper = null
}

function ensureWallpaperRenderReaper() {
  if (wallpaperRenderReaper) return
  wallpaperRenderReaper = setInterval(() => {
    const now = Date.now()
    for (const [sessionId, session] of wallpaperRenderSessions) {
      if (session.closing || now - session.lastActivity <= WALLPAPER_RENDER_SESSION_TTL_MS) continue
      session.closing = true
      void serializeWallpaperRenderOperation(() => closeWallpaperRenderSession(sessionId))
    }
  }, 30_000)
  wallpaperRenderReaper.unref?.()
}

async function closeWallpaperRenderSession(sessionId) {
  const session = wallpaperRenderSessions.get(sessionId)
  if (!session) return true
  wallpaperRenderSessions.delete(sessionId)
  stopWallpaperRenderReaperIfIdle()
  try {
    await execFileAsync(session.executablePath, [
      '-control', 'closeWallpaper', '-location', session.windowName,
    ], { windowsHide: true, shell: false, timeout: 10_000, maxBuffer: 4096 })
  } catch {}
  return true
}

async function openWallpaperRender(request, response, webServer) {
  if (request.method !== 'POST') {
    methodNotAllowed(response, 'POST')
    return
  }
  if (process.platform !== 'win32') {
    sendJson(response, 501, { ok: false, code: 'WALLPAPER_RENDER_UNSUPPORTED' })
    return
  }
  const rendererOrigin = wallpaperRenderRequestOrigin(request)
  const captureOrigin = rendererOrigin ? wallpaperCaptureOrigin(rendererOrigin, webServer) : null
  if (!rendererOrigin) {
    sendJson(response, 403, { ok: false, code: 'WALLPAPER_RENDER_LOCAL_ONLY' })
    return
  }
  if (!captureOrigin) {
    sendJson(response, 503, { ok: false, code: 'WALLPAPER_RENDER_HOST_UNAVAILABLE' })
    return
  }
  const body = await readWallpaperRenderBody(request, response)
  if (!body) {
    if (!response.headersSent) sendJson(response, 400, { ok: false, code: 'WALLPAPER_RENDER_REQUEST_INVALID' })
    return
  }
  const wallpaperId = typeof body.wallpaperId === 'string' ? body.wallpaperId : ''
  const libraryId = typeof body.libraryId === 'string' ? body.libraryId : ''
  const projectType = typeof body.type === 'string' ? body.type : ''
  const width = Number(body.width)
  const height = Number(body.height)
  if (!/^\d{5,20}$/.test(wallpaperId)
    || !/^[a-f0-9]{16}$/.test(libraryId)
    || !['scene', 'web', 'application'].includes(projectType)
    || !Number.isSafeInteger(width) || width < 320 || width > 3840
    || !Number.isSafeInteger(height) || height < 200 || height > 2160
    || (projectType === 'application' && body.confirmedApplication !== true)) {
    sendJson(response, 400, { ok: false, code: projectType === 'application' && body.confirmedApplication !== true
      ? 'WALLPAPER_APPLICATION_CONFIRMATION_REQUIRED' : 'WALLPAPER_RENDER_REQUEST_INVALID' })
    return
  }
  const cache = await refreshWallpaperCache()
  const project = cache.byId.get(wallpaperId)
  if (!project || project.libraryId !== libraryId || project.type !== projectType || !project.render?.available) {
    sendJson(response, 404, { ok: false, code: 'WALLPAPER_RENDER_UNAVAILABLE' })
    return
  }
  const renderTarget = await resolveWallpaperRenderTarget(project)
  const installations = await wallpaperEngineInstallations()
  if (!installations.length) {
    sendJson(response, 503, { ok: false, code: 'WALLPAPER_ENGINE_NOT_INSTALLED' })
    return
  }
  const executablePath = await runningWallpaperEngineExecutable(installations)
  if (!executablePath) {
    sendJson(response, 503, { ok: false, code: 'WALLPAPER_ENGINE_NOT_RUNNING' })
    return
  }
  if (!renderTarget || !project.render?.available) {
    sendJson(response, 404, { ok: false, code: 'WALLPAPER_RENDER_UNAVAILABLE' })
    return
  }

  const sessionId = randomUUID()
  const session = {
    id: sessionId,
    executablePath,
    windowName: `DSH Balance ${sessionId.slice(0, 8)}`,
    projectType,
    rendererOrigin,
    captureOrigin,
    createdAt: Date.now(),
    lastActivity: Date.now(),
    closing: false,
    offer: null,
    answer: null,
  }
  const captureUrl = new URL(`${WALLPAPER_RENDER_CAPTURE_API_PATH}/${sessionId}`, captureOrigin).toString()
  const systemRoot = process.env.SystemRoot || 'C:\\Windows'
  const openBrowser = path.join(systemRoot, 'System32', 'rundll32.exe')
  let sessionLimitReached = false
  try {
    await serializeWallpaperRenderOperation(async () => {
      for (const [activeId, activeSession] of wallpaperRenderSessions) {
        if (Date.now() - activeSession.lastActivity > WALLPAPER_RENDER_SESSION_TTL_MS) {
          await closeWallpaperRenderSession(activeId)
        }
      }
      if (wallpaperRenderSessions.size >= WALLPAPER_RENDER_MAX_SESSIONS) {
        sessionLimitReached = true
        return
      }
      wallpaperRenderSessions.set(sessionId, session)
      ensureWallpaperRenderReaper()
      try {
        await execFileAsync(executablePath, [
          '-control', 'openWallpaper', '-file', renderTarget.path,
          '-playInWindow', session.windowName,
          '-width', String(width), '-height', String(height),
          '-borderless', '-activate',
        ], { windowsHide: true, shell: false, timeout: 15_000, maxBuffer: 4096 })
      } catch {
        await closeWallpaperRenderSession(sessionId)
        const error = new Error('WALLPAPER_WINDOW_START_FAILED')
        error.code = 'WALLPAPER_WINDOW_START_FAILED'
        throw error
      }
    })
  } catch (error) {
    await serializeWallpaperRenderOperation(() => closeWallpaperRenderSession(sessionId))
    sendJson(response, 503, { ok: false, code: error?.code === 'WALLPAPER_WINDOW_START_FAILED' ? error.code : 'WALLPAPER_RENDER_START_FAILED' })
    return
  }
  if (sessionLimitReached) {
    sendJson(response, 429, { ok: false, code: 'WALLPAPER_RENDER_LIMIT' })
    return
  }
  try {
    await execFileAsync(openBrowser, ['url.dll,FileProtocolHandler', captureUrl], {
      windowsHide: true, shell: false, timeout: 5_000, maxBuffer: 4096,
    })
  } catch {
    await serializeWallpaperRenderOperation(() => closeWallpaperRenderSession(sessionId))
    sendJson(response, 503, { ok: false, code: 'WALLPAPER_PAIRING_BROWSER_START_FAILED' })
    return
  }
  sendJson(response, 200, { ok: true, sessionId, windowName: session.windowName })
}

function isValidWallpaperRenderSessionId(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

async function handleWallpaperRender(request, response, webServer) {
  if (sameOriginFailure(request, response, true)) return
  let pathname
  try { pathname = new URL(request.url || '/', 'http://localhost').pathname } catch {
    sendJson(response, 400, { ok: false, code: 'WALLPAPER_RENDER_REQUEST_INVALID' })
    return
  }
  if (pathname === WALLPAPER_RENDER_OPEN_API_PATH) {
    await openWallpaperRender(request, response, webServer)
    return
  }
  if (pathname === WALLPAPER_RENDER_CLOSE_API_PATH) {
    if (request.method !== 'POST') { methodNotAllowed(response, 'POST'); return }
    const body = await readWallpaperRenderBody(request, response)
    if (!body) {
      if (!response.headersSent) sendJson(response, 400, { ok: false, code: 'WALLPAPER_RENDER_REQUEST_INVALID' })
      return
    }
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId : ''
    if (!isValidWallpaperRenderSessionId(sessionId)) {
      sendJson(response, 400, { ok: false, code: 'WALLPAPER_RENDER_REQUEST_INVALID' })
      return
    }
    const session = wallpaperRenderSessions.get(sessionId)
    if (session
      && !wallpaperRenderRequestMatchesOrigin(request, session.rendererOrigin, true)
      && !wallpaperRenderRequestMatchesOrigin(request, session.captureOrigin, true)) {
      sendJson(response, 403, { ok: false, code: 'WALLPAPER_RENDER_SIGNAL_FORBIDDEN' })
      return
    }
    await serializeWallpaperRenderOperation(() => closeWallpaperRenderSession(sessionId))
    sendJson(response, 200, { ok: true, closed: true })
    return
  }

  const captureMatch = new RegExp(`^${WALLPAPER_RENDER_CAPTURE_API_PATH}/([0-9a-f-]{36})$`, 'i').exec(pathname)
  if (captureMatch) {
    if (request.method !== 'GET') { methodNotAllowed(response, 'GET'); return }
    const session = wallpaperRenderSessions.get(captureMatch[1])
    if (!session || session.closing || Date.now() - session.lastActivity > WALLPAPER_RENDER_SESSION_TTL_MS) {
      sendJson(response, 404, { ok: false, code: 'WALLPAPER_RENDER_SESSION_EXPIRED' })
      return
    }
    if (!wallpaperRenderRequestMatchesOrigin(request, session.captureOrigin, true)) {
      sendJson(response, 403, { ok: false, code: 'WALLPAPER_RENDER_SIGNAL_FORBIDDEN' })
      return
    }
    session.lastActivity = Date.now()
    const title = session.windowName.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')
    const page = wallpaperCapturePage.replace('<span class="name" id="window-name"></span>', `<span class="name" id="window-name">${title}</span>`)
    sendText(response, 200, page, 'text/html; charset=utf-8', {
      'content-security-policy': "default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; media-src 'self' blob:; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
      'referrer-policy': 'no-referrer',
      'x-frame-options': 'DENY',
    })
    return
  }

  const signalMatch = new RegExp(`^${WALLPAPER_RENDER_API_PATH}/session/([0-9a-f-]{36})/(offer|answer)$`, 'i').exec(pathname)
  if (signalMatch) {
    const [, sessionId, signalType] = signalMatch
    if (!isValidWallpaperRenderSessionId(sessionId)) {
      sendJson(response, 404, { ok: false, code: 'WALLPAPER_RENDER_SESSION_EXPIRED' })
      return
    }
    const session = wallpaperRenderSessions.get(sessionId)
    if (!session || session.closing || Date.now() - session.lastActivity > WALLPAPER_RENDER_SESSION_TTL_MS) {
      if (session) await serializeWallpaperRenderOperation(() => closeWallpaperRenderSession(sessionId))
      sendJson(response, 404, { ok: false, code: 'WALLPAPER_RENDER_SESSION_EXPIRED' })
      return
    }
    session.lastActivity = Date.now()
    if (request.method === 'GET') {
      const expectedOrigin = signalType === 'offer' ? session.captureOrigin : session.rendererOrigin
      if (!wallpaperRenderRequestMatchesOrigin(request, expectedOrigin, true)) {
        sendJson(response, 403, { ok: false, code: 'WALLPAPER_RENDER_SIGNAL_FORBIDDEN' })
        return
      }
      const signal = signalType === 'offer' ? session.offer : session.answer
      if (!signal) {
        sendJson(response, 202, { ok: true, pending: true })
        return
      }
      sendJson(response, 200, { ok: true, signal })
      return
    }
    if (request.method !== 'POST') { methodNotAllowed(response, 'GET, POST'); return }
    const expectedOrigin = signalType === 'offer' ? session.rendererOrigin : session.captureOrigin
    if (!wallpaperRenderRequestMatchesOrigin(request, expectedOrigin)) {
      sendJson(response, 403, { ok: false, code: 'WALLPAPER_RENDER_SIGNAL_FORBIDDEN' })
      return
    }
    const expectedType = signalType === 'offer' ? 'offer' : 'answer'
    const body = await readWallpaperRenderBody(request, response)
    if (!body) {
      if (!response.headersSent) sendJson(response, 400, { ok: false, code: 'WALLPAPER_RENDER_REQUEST_INVALID' })
      return
    }
    const signal = body.signal
    if (!signal || signal.type !== expectedType || typeof signal.sdp !== 'string' || signal.sdp.length < 20 || signal.sdp.length > 96 * 1024) {
      sendJson(response, 400, { ok: false, code: 'WALLPAPER_RENDER_SIGNAL_INVALID' })
      return
    }
    if (signalType === 'offer') {
      if (body.peer !== 'plugin' || session.offer) { sendJson(response, 409, { ok: false, code: 'WALLPAPER_RENDER_SIGNAL_CONFLICT' }); return }
      session.offer = { type: 'offer', sdp: signal.sdp }
    } else {
      if (body.peer !== 'capture' || !session.offer || session.answer) { sendJson(response, 409, { ok: false, code: 'WALLPAPER_RENDER_SIGNAL_CONFLICT' }); return }
      session.answer = { type: 'answer', sdp: signal.sdp }
    }
    sendJson(response, 200, { ok: true })
    return
  }

  const heartbeatMatch = new RegExp(`^${WALLPAPER_RENDER_SESSION_API_PATH}/([0-9a-f-]{36})/heartbeat$`, 'i').exec(pathname)
  if (heartbeatMatch) {
    if (request.method !== 'POST') { methodNotAllowed(response, 'POST'); return }
    const sessionId = heartbeatMatch[1]
    const session = wallpaperRenderSessions.get(sessionId)
    if (!session || session.closing || Date.now() - session.lastActivity > WALLPAPER_RENDER_SESSION_TTL_MS) {
      if (session) await serializeWallpaperRenderOperation(() => closeWallpaperRenderSession(sessionId))
      sendJson(response, 404, { ok: false, code: 'WALLPAPER_RENDER_SESSION_EXPIRED' })
      return
    }
    if (!wallpaperRenderRequestMatchesOrigin(request, session.captureOrigin)) {
      sendJson(response, 403, { ok: false, code: 'WALLPAPER_RENDER_SIGNAL_FORBIDDEN' })
      return
    }
    const body = await readWallpaperRenderBody(request, response)
    if (!body) {
      if (!response.headersSent) sendJson(response, 400, { ok: false, code: 'WALLPAPER_RENDER_REQUEST_INVALID' })
      return
    }
    if (body.peer !== 'capture') {
      sendJson(response, 400, { ok: false, code: 'WALLPAPER_RENDER_REQUEST_INVALID' })
      return
    }
    session.lastActivity = Date.now()
    sendJson(response, 200, { ok: true })
    return
  }

  sendJson(response, 404, { ok: false, code: 'WALLPAPER_RENDER_NOT_FOUND' })
}

async function handleWallpaperCaptureScript(request, response) {
  if (sameOriginFailure(request, response)) return
  if (request.method !== 'GET' && request.method !== 'HEAD') { methodNotAllowed(response, 'GET, HEAD'); return }
  try {
    const script = await readFile(new URL('../client/assets/wallpaper-capture.js', import.meta.url), 'utf8')
    sendText(response, 200, request.method === 'HEAD' ? '' : script, 'text/javascript; charset=utf-8', {
      'content-security-policy': "default-src 'none'; script-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    })
  } catch {
    sendJson(response, 404, { ok: false, code: 'WALLPAPER_CAPTURE_ASSET_MISSING' })
  }
}

async function handleWallpaperAsset(request, response) {
  if (sameOriginFailure(request, response)) return
  let url
  try { url = new URL(request.url || '/', 'http://localhost') } catch {
    sendJson(response, 400, { ok: false, code: 'WALLPAPER_PATH_INVALID' })
    return
  }
  const pathname = url.pathname
  const match = /^\/dsh-deepseek-balance\/wallpapers\/(\d{5,20})\/(preview|background|media)$/.exec(pathname)
  if (!match) {
    sendJson(response, 404, { ok: false, code: 'WALLPAPER_NOT_FOUND' })
    return
  }
  const cache = await refreshWallpaperCache()
  const project = cache.byId.get(match[1])
  if (!project) {
    sendJson(response, 404, { ok: false, code: 'WALLPAPER_NOT_FOUND' })
    return
  }
  if (match[2] === 'preview') {
    await sendFileRange(request, response, project.previewPath, project.previewType, project.projectPath)
    return
  }
  if (match[2] === 'background') {
    const candidateId = url.searchParams.get('candidate')
    if (candidateId !== null && !/^[a-f0-9]{16}$/.test(candidateId)) {
      sendJson(response, 400, { ok: false, code: 'WALLPAPER_CANDIDATE_INVALID' })
      return
    }
    const candidate = candidateId ? project.backgroundCandidates.find((value) => value.id === candidateId) : null
    if (candidateId && !candidate) {
      sendJson(response, 404, { ok: false, code: 'WALLPAPER_CANDIDATE_NOT_FOUND' })
      return
    }
    const filePath = candidate?.file.path ?? project.backgroundPath
    const extension = candidate?.file.extension ?? path.extname(filePath).toLowerCase()
    const contentType = candidate
      ? extension === '.jpg' || extension === '.jpeg' ? 'image/jpeg' : extension === '.webp' ? 'image/webp' : 'image/png'
      : project.backgroundType
    await sendFileRange(request, response, filePath, contentType, project.projectPath)
    return
  }
  if (!project.mediaPath || !project.mediaType) {
    sendJson(response, 404, { ok: false, code: 'WALLPAPER_MEDIA_UNAVAILABLE' })
    return
  }
  await sendFileRange(request, response, project.mediaPath, project.mediaType, project.projectPath)
}

export function mountWallpaperRoutes(webServer) {
  if (!webServer || typeof webServer.register !== 'function') {
    throw new BalancePluginError('CONFIG_INVALID', 500)
  }
  const routes = [
    { kind: 'exact', path: WALLPAPER_API_PATH, handler: handleWallpaperList },
    { kind: 'exact', path: WALLPAPER_LIBRARY_API_PATH, handler: handleWallpaperLibrary },
    { kind: 'exact', path: WALLPAPER_LIBRARY_PICK_API_PATH, handler: handleWallpaperLibraryPicker },
    { kind: 'prefix', path: WALLPAPER_RENDER_API_PATH, handler: (request, response) => handleWallpaperRender(request, response, webServer) },
    { kind: 'exact', path: WALLPAPER_RENDER_SCRIPT_PATH, handler: handleWallpaperCaptureScript },
    { kind: 'prefix', path: WALLPAPER_ASSET_PATH, handler: handleWallpaperAsset },
  ]
  const disposers = routes.map((route) => webServer.register(route))
  return () => {
    for (const sessionId of [...wallpaperRenderSessions.keys()]) {
      void serializeWallpaperRenderOperation(() => closeWallpaperRenderSession(sessionId))
    }
    for (const dispose of disposers.reverse()) dispose?.()
  }
}

export function resetWallpaperCacheForTests() {
  wallpaperCache = { expiresAt: 0, items: [], byId: new Map() }
  extraSteamLibraries.clear()
  wallpaperRenderSessions.clear()
  if (wallpaperRenderReaper) clearInterval(wallpaperRenderReaper)
  wallpaperRenderReaper = null
}

function publicError(error) {
  if (error instanceof BalancePluginError) {
    return { status: error.status, code: error.code }
  }
  return { status: 500, code: 'INTERNAL_ERROR' }
}

function createKeyHandler(options) {
  return async (request, response) => {
    if (sameOriginFailure(request, response)) return

    if (request.method === 'GET') {
      if (typeof options.describeApiKey !== 'function') {
        sendJson(response, 503, { ok: false, code: 'CONFIG_STORE_UNAVAILABLE' })
        return
      }
      try {
        const info = await options.describeApiKey()
        const payload = {
          ok: true,
          configured: info?.configured === true,
          writable: info?.writable === true,
        }
        if (typeof info?.source === 'string' && info.source !== '') payload.source = info.source
        sendJson(response, 200, payload)
      } catch (error) {
        const failure = publicError(error)
        sendJson(response, failure.status, { ok: false, code: failure.code })
      }
      return
    }

    if (request.method !== 'POST') {
      methodNotAllowed(response, 'GET, POST')
      return
    }
    if (typeof options.saveApiKey !== 'function') {
      sendJson(response, 503, { ok: false, code: 'CONFIG_STORE_UNAVAILABLE' })
      return
    }
    const contentType = String(request.headers?.['content-type'] ?? '')
      .split(';', 1)[0]
      .trim()
      .toLowerCase()
    if (contentType !== 'application/json') {
      sendJson(response, 415, { ok: false, code: 'CONFIG_CONTENT_TYPE' })
      return
    }

    let text
    try {
      text = await readBoundedBody(request)
    } catch {
      sendJson(response, 400, { ok: false, code: 'CONFIG_BODY_INVALID' })
      return
    }
    if (text === null) {
      sendJson(response, 413, { ok: false, code: 'CONFIG_BODY_TOO_LARGE' })
      return
    }
    const apiKey = parseApiKeyBody(text)
    if (apiKey === null) {
      sendJson(response, 400, { ok: false, code: 'CONFIG_KEY_INVALID' })
      return
    }

    try {
      await options.saveApiKey(apiKey)
      sendJson(response, 200, { ok: true })
    } catch (error) {
      const failure = publicError(error)
      sendJson(response, failure.status, { ok: false, code: failure.code })
    }
  }
}

export function mountBalanceRoute(webServer, readBalance, options = {}) {
  if (!webServer || typeof webServer.register !== 'function' || typeof readBalance !== 'function') {
    throw new BalancePluginError('CONFIG_INVALID', 500)
  }

  const routes = [{
    kind: 'exact',
    path: BALANCE_API_PATH,
    handler: async (request, response) => {
      if (request.method !== 'GET') {
        methodNotAllowed(response, 'GET')
        return
      }
      if (sameOriginFailure(request, response)) return

      try {
        const result = await readBalance()
        const runtime = typeof options.runtimeInfo === 'function'
          ? await options.runtimeInfo().catch(() => undefined)
          : undefined
        sendJson(response, 200, { ok: true, ...result, ...(runtime ?? {}) })
      } catch (error) {
        const failure = publicError(error)
        sendJson(response, failure.status, { ok: false, code: failure.code })
      }
    },
  }]

  routes.push({
    kind: 'exact',
    path: KEY_API_PATH,
    handler: createKeyHandler(options),
  })

  const disposers = routes.map((route) => webServer.register(route))
  return () => {
    for (const dispose of disposers.reverse()) dispose?.()
  }
}
