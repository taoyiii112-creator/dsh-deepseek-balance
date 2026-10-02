    // Inserted into the client factory by scripts/build.mjs.
    var APPEARANCE_STORAGE_KEY = 'dsh-deepseek-balance.appearance-v1'
    var APPEARANCE_DB_NAME = 'dsh-deepseek-balance-backgrounds-v1'
    var WALLPAPER_API_PATH = '/dsh-deepseek-balance/api/wallpapers'
    var WALLPAPER_LIBRARY_API_PATH = WALLPAPER_API_PATH + '/library'
    var WALLPAPER_LIBRARY_PICK_API_PATH = WALLPAPER_LIBRARY_API_PATH + '/pick'
    var WALLPAPER_RENDER_API_PATH = WALLPAPER_API_PATH + '/render'
    var WALLPAPER_RENDER_OPEN_API_PATH = WALLPAPER_RENDER_API_PATH + '/open'
    var WALLPAPER_RENDER_CLOSE_API_PATH = WALLPAPER_RENDER_API_PATH + '/close'
    var DSH_DESKTOP_WALLPAPER_ORIGINS = ['dsh-app://app', 'app://dsh']
    var DSH_WALLPAPER_RENDERER_ORIGIN_HEADER = 'x-dsh-wallpaper-renderer-origin'
    var WALLPAPER_ASSET_PATH = '/dsh-deepseek-balance/wallpapers'
    var WALLPAPER_LIBRARY_STORAGE_KEY = 'dsh-deepseek-balance.wallpaper-library'
    var MAX_LOCAL_IMAGE_BYTES = 64 * 1024 * 1024
    var MAX_LOCAL_VIDEO_BYTES = 256 * 1024 * 1024
    var wallpaperDbPromise = null
    var nativeWallpaperLeases = new Map()
    var NATIVE_WALLPAPER_EVENT = 'dsh-deepseek-balance:native-wallpaper-change'

    function defaultAppearance() {
      return {
        page: { source: 'default', dim: 38, assetId: null, mediaType: null, wallpaperId: null, libraryId: null, backgroundId: null, renderMode: null, renderKey: null },
        panel: { source: 'builtin', opacity: 35, assetId: null, mediaType: 'image', wallpaperId: null, libraryId: null, backgroundId: null, renderMode: null, renderKey: null }
      }
    }

    function sameBackgroundSource(left, right) {
      if (!left || !right || left.source !== right.source) return false
      if (left.source === 'local') {
        return Boolean(left.assetId && left.assetId === right.assetId && left.mediaType === right.mediaType)
      }
      if (left.source !== 'wallpaper'
        || left.wallpaperId !== right.wallpaperId
        || (left.libraryId || '') !== (right.libraryId || '')
        || (left.backgroundId || '') !== (right.backgroundId || '')
        || left.mediaType !== right.mediaType) return false
      if (left.renderMode === 'native' || right.renderMode === 'native') {
        return left.renderMode === 'native' && right.renderMode === 'native'
          && Boolean(left.renderKey && left.renderKey === right.renderKey)
      }
      return true
    }

    function readAppearance() {
      var fallback = defaultAppearance()
      try {
        var value = JSON.parse(getLocalStorage()?.getItem(APPEARANCE_STORAGE_KEY) || 'null')
        if (!value || typeof value !== 'object') return fallback
        ;['page', 'panel'].forEach(function (surface) {
          var item = value[surface]
          if (!item || typeof item !== 'object') return
          var allowed = ['default', 'builtin', 'local', 'wallpaper']
          if (allowed.includes(item.source)) fallback[surface].source = item.source
          if (Number.isFinite(Number(item.dim))) fallback.page.dim = Math.max(0, Math.min(75, Math.round(Number(item.dim))))
          if (Number.isFinite(Number(item.opacity))) fallback.panel.opacity = Math.max(10, Math.min(85, Math.round(Number(item.opacity))))
          if (typeof item.assetId === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(item.assetId)) fallback[surface].assetId = item.assetId
          if (item.mediaType === 'image' || item.mediaType === 'video' || item.mediaType === 'native') fallback[surface].mediaType = item.mediaType
          if (typeof item.wallpaperId === 'string' && /^\d{5,20}$/.test(item.wallpaperId)) fallback[surface].wallpaperId = item.wallpaperId
          if (typeof item.libraryId === 'string' && /^[a-f0-9]{16}$/.test(item.libraryId)) fallback[surface].libraryId = item.libraryId
          if (typeof item.backgroundId === 'string' && /^[a-f0-9]{16}$/.test(item.backgroundId)) fallback[surface].backgroundId = item.backgroundId
          if (item.renderMode === 'native' && typeof item.renderKey === 'string' && /^[a-f0-9]{16}:\d{5,20}$/.test(item.renderKey)) {
            fallback[surface].renderMode = 'native'
            fallback[surface].renderKey = item.renderKey
          }
        })
        ;['page', 'panel'].forEach(function (surface) {
          if (fallback[surface].source === 'local' && !fallback[surface].assetId) fallback[surface].source = 'default'
          if (fallback[surface].source === 'wallpaper' && !fallback[surface].wallpaperId) fallback[surface].source = 'default'
        })
        if (fallback.panel.source === 'default') {
          fallback.panel.source = 'builtin'
          if (Number(value.panel?.opacity) === 62) fallback.panel.opacity = 35
        }
        if (fallback.page.source === 'builtin') fallback.page.source = 'default'
      } catch {}
      return fallback
    }

    function writeAppearance(value) {
      try {
        var storage = getLocalStorage()
        if (!storage) return false
        storage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(value))
        return true
      } catch { return false }
    }

    function openAppearanceDb() {
      if (wallpaperDbPromise) return wallpaperDbPromise
      wallpaperDbPromise = new Promise(function (resolve, reject) {
        if (typeof indexedDB === 'undefined') { reject(new Error('当前 DeepSeek Harness 配置不支持本地媒体存储')); return }
        var request = indexedDB.open(APPEARANCE_DB_NAME, 1)
        request.onupgradeneeded = function () {
          if (!request.result.objectStoreNames.contains('assets')) request.result.createObjectStore('assets', { keyPath: 'id' })
        }
        request.onsuccess = function () { resolve(request.result) }
        request.onerror = function () { reject(new Error('无法打开本地背景存储')) }
      }).catch(function (error) { wallpaperDbPromise = null; throw error })
      return wallpaperDbPromise
    }

    async function saveBackgroundAsset(file, poster, mediaType) {
      var db = await openAppearanceDb()
      var id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'bg-' + Date.now() + '-' + Math.random().toString(36).slice(2)
      await new Promise(function (resolve, reject) {
        var transaction = db.transaction('assets', 'readwrite')
        transaction.objectStore('assets').put({ id: id, file: file, poster: poster || file, mediaType: mediaType, name: file.name || 'background' })
        transaction.oncomplete = resolve
        transaction.onerror = function () { reject(new Error('保存背景失败；请检查本机当前配置的存储空间')) }
        transaction.onabort = function () { reject(new Error('保存背景失败；请检查本机当前配置的存储空间')) }
      })
      return id
    }

    async function readBackgroundAsset(id) {
      if (!id) return null
      var db = await openAppearanceDb()
      return new Promise(function (resolve, reject) {
        var request = db.transaction('assets', 'readonly').objectStore('assets').get(id)
        request.onsuccess = function () { resolve(request.result || null) }
        request.onerror = function () { reject(new Error('读取本地背景失败')) }
      })
    }

    function useBackgroundAsset(id) {
      var _asset = React.useState(null), asset = _asset[0], setAsset = _asset[1]
      React.useEffect(function () {
        var active = true
        var urls = []
        setAsset(null)
        if (!id) return function () {}
        readBackgroundAsset(id).then(function (record) {
          if (!active || !record) return
          var fileUrl = URL.createObjectURL(record.file)
          urls.push(fileUrl)
          var posterBlob = record.poster || record.file
          var posterUrl = posterBlob === record.file ? fileUrl : URL.createObjectURL(posterBlob)
          if (posterUrl !== fileUrl) urls.push(posterUrl)
          setAsset({ url: fileUrl, posterUrl: posterUrl, mediaType: record.mediaType, name: record.name })
        }).catch(function () {})
        return function () {
          active = false
          urls.forEach(function (url) { URL.revokeObjectURL(url) })
        }
      }, [id])
      return asset
    }

    function useDocumentVisible() {
      var _visible = React.useState(typeof document === 'undefined' || document.visibilityState !== 'hidden')
      var visible = _visible[0], setVisible = _visible[1]
      React.useEffect(function () {
        var update = function () { setVisible(document.visibilityState !== 'hidden') }
        document.addEventListener('visibilitychange', update)
        return function () { document.removeEventListener('visibilitychange', update) }
      }, [])
      return visible
    }

    function nativeWallpaperKey(item) {
      return /^[a-f0-9]{16}$/.test(String(item?.libraryId || '')) && /^\d{5,20}$/.test(String(item?.id || ''))
        ? item.libraryId + ':' + item.id : null
    }

    function useNativeWallpaperStream(renderKey) {
      var _stream = React.useState(function () { return renderKey ? nativeWallpaperLeases.get(renderKey)?.stream || null : null })
      var stream = _stream[0], setStream = _stream[1]
      React.useEffect(function () {
        function update() { setStream(renderKey ? nativeWallpaperLeases.get(renderKey)?.stream || null : null) }
        window.addEventListener(NATIVE_WALLPAPER_EVENT, update)
        update()
        return function () { window.removeEventListener(NATIVE_WALLPAPER_EVENT, update) }
      }, [renderKey])
      return stream
    }

    function publishNativeWallpaperChange() {
      window.dispatchEvent(new Event(NATIVE_WALLPAPER_EVENT))
    }

    function stopNativeWallpaperLease(renderKey, entry) {
      if (nativeWallpaperLeases.get(renderKey) !== entry) return
      nativeWallpaperLeases.delete(renderKey)
      entry.peerConnection?.close()
      entry.stream.getTracks().forEach(function (track) { track.stop() })
      void requestWallpaperRender(WALLPAPER_RENDER_CLOSE_API_PATH, { sessionId: entry.sessionId }).catch(function () {})
      publishNativeWallpaperChange()
    }

    function wallpaperRendererRequestHeaders() {
      var origin = String(window.location?.origin || '')
      return DSH_DESKTOP_WALLPAPER_ORIGINS.includes(origin)
        ? { [DSH_WALLPAPER_RENDERER_ORIGIN_HEADER]: origin }
        : {}
    }

    function removeNativeWallpaperSurface(surface, renderKey) {
      if (!renderKey) return
      var entry = nativeWallpaperLeases.get(renderKey)
      if (!entry) return
      entry.surfaces.delete(surface)
      if (entry.surfaces.size === 0) stopNativeWallpaperLease(renderKey, entry)
    }

    function attachNativeWallpaperSurface(surface, renderKey) {
      var entry = nativeWallpaperLeases.get(renderKey)
      if (entry) entry.surfaces.add(surface)
    }

    async function requestWallpaperRender(url, body) {
      var options = { credentials: 'same-origin', cache: 'no-store' }
      var headers = wallpaperRendererRequestHeaders()
      if (body) {
        options.method = 'POST'
        headers['content-type'] = 'application/json'
        options.body = JSON.stringify(body)
      }
      if (Object.keys(headers).length) options.headers = headers
      var response = await fetch(url, options)
      var result = await response.json().catch(function () { return null })
      if (!response.ok || !result?.ok) {
        var error = new Error(result?.code || 'WALLPAPER_RENDER_FAILED')
        error.code = result?.code || 'WALLPAPER_RENDER_FAILED'
        throw error
      }
      return result
    }

    function waitForWallpaperIce(connection) {
      if (connection.iceGatheringState === 'complete') return Promise.resolve()
      return new Promise(function (resolve) {
        var timer = setTimeout(finish, 8000)
        function finish() {
          clearTimeout(timer)
          connection.removeEventListener('icegatheringstatechange', onChange)
          resolve()
        }
        function onChange() { if (connection.iceGatheringState === 'complete') finish() }
        connection.addEventListener('icegatheringstatechange', onChange)
      })
    }

    async function acquireNativeWallpaper(item, confirmedApplication) {
      var renderKey = nativeWallpaperKey(item)
      if (!renderKey) throw new Error('WALLPAPER_PROJECT_INVALID')
      var existing = nativeWallpaperLeases.get(renderKey)
      if (existing) return { renderKey: renderKey, entry: existing, created: false }
      if (typeof RTCPeerConnection !== 'function') throw new Error('WALLPAPER_RENDER_UNSUPPORTED')
      var pixelRatio = Math.max(1, Number(window.devicePixelRatio) || 1)
      var width = Math.max(320, Math.min(3840, Math.round((Number(window.screen?.width) || window.innerWidth || 1280) * pixelRatio)))
      var height = Math.max(200, Math.min(2160, Math.round((Number(window.screen?.height) || window.innerHeight || 720) * pixelRatio)))
      var opened = await requestWallpaperRender(WALLPAPER_RENDER_OPEN_API_PATH, {
        wallpaperId: item.id,
        libraryId: item.libraryId,
        type: item.type,
        width: width,
        height: height,
        confirmedApplication: item.type !== 'application' || confirmedApplication === true,
      })
      var sessionId = opened.sessionId
      if (typeof sessionId !== 'string' || !/^[0-9a-f-]{36}$/i.test(sessionId)) throw new Error('WALLPAPER_RENDER_SESSION_INVALID')
      var connection = new RTCPeerConnection({ iceServers: [] })
      var streamTimer = null
      var pendingStreamReject = null
      var entry = null
      function onWallpaperConnectionState() {
        if (connection.connectionState === 'failed' && pendingStreamReject) {
          var rejectStream = pendingStreamReject
          pendingStreamReject = null
          clearTimeout(streamTimer)
          rejectStream(new Error('WALLPAPER_RENDER_WEBRTC_FAILED'))
        }
        if (entry && (connection.connectionState === 'failed' || connection.connectionState === 'closed')) {
          stopNativeWallpaperLease(renderKey, entry)
        }
      }
      connection.addEventListener('connectionstatechange', onWallpaperConnectionState)
      var streamPromise = new Promise(function (resolve, reject) {
        pendingStreamReject = reject
        streamTimer = setTimeout(function () {
          pendingStreamReject = null
          reject(new Error('WALLPAPER_RENDER_CAPTURE_TIMEOUT'))
        }, 120000)
        connection.addEventListener('track', function (event) {
          clearTimeout(streamTimer)
          pendingStreamReject = null
          var stream = event.streams?.[0] || new MediaStream([event.track])
          resolve(stream)
        }, { once: true })
      })
      connection.addTransceiver('video', { direction: 'recvonly' })
      try {
        var offer = await connection.createOffer()
        await connection.setLocalDescription(offer)
        await waitForWallpaperIce(connection)
        await requestWallpaperRender(WALLPAPER_RENDER_API_PATH + '/session/' + sessionId + '/offer', {
          peer: 'plugin', signal: connection.localDescription,
        })
        var answerDeadline = Date.now() + 120000
        var answer = null
        while (Date.now() < answerDeadline) {
          var response
          try {
            response = await fetch(WALLPAPER_RENDER_API_PATH + '/session/' + sessionId + '/answer', {
              credentials: 'same-origin', cache: 'no-store', headers: wallpaperRendererRequestHeaders(),
            })
          } catch {
            throw new Error('WALLPAPER_RENDER_HOST_UNAVAILABLE')
          }
          if (response.status === 202) {
            await new Promise(function (resolve) { setTimeout(resolve, 500) })
            continue
          }
          var result = await response.json().catch(function () { return null })
          if (!response.ok || !result?.ok || !result.signal) throw new Error(result?.code || 'WALLPAPER_RENDER_FAILED')
          answer = result.signal
          break
        }
        if (!answer) throw new Error('WALLPAPER_RENDER_PAIRING_TIMEOUT')
        await connection.setRemoteDescription(answer)
        var stream = await streamPromise
        if (!stream.getVideoTracks().length) throw new Error('WALLPAPER_CAPTURE_SOURCE_INVALID')
        entry = { stream: stream, sessionId: sessionId, peerConnection: connection, surfaces: new Set() }
        nativeWallpaperLeases.set(renderKey, entry)
        stream.getVideoTracks().forEach(function (track) {
          track.addEventListener('ended', function () { stopNativeWallpaperLease(renderKey, entry) }, { once: true })
        })
        publishNativeWallpaperChange()
        return { renderKey: renderKey, entry: entry, created: true }
      } catch (error) {
        clearTimeout(streamTimer)
        streamPromise.catch(function () {})
        connection.close()
        await requestWallpaperRender(WALLPAPER_RENDER_CLOSE_API_PATH, { sessionId: sessionId }).catch(function () {})
        throw error
      }
    }

    function wallpaperPreviewUrl(id) {
      return WALLPAPER_ASSET_PATH + '/' + id + '/preview'
    }

    function wallpaperBackgroundUrl(id, backgroundId) {
      var url = WALLPAPER_ASSET_PATH + '/' + id + '/background'
      return backgroundId ? url + '?candidate=' + encodeURIComponent(backgroundId) : url
    }

    function wallpaperMediaUrl(id) {
      return WALLPAPER_ASSET_PATH + '/' + id + '/media'
    }

    function PageBackground(props) {
      var config = props.config || defaultAppearance().page
      var asset = useBackgroundAsset(config.source === 'local' ? config.assetId : null)
      var nativeStream = useNativeWallpaperStream(config.renderMode === 'native' ? config.renderKey : null)
      var reduced = useReducedMotion()
      var visible = useDocumentVisible()
      var _failed = React.useState(false), failed = _failed[0], setFailed = _failed[1]
      var pageMediaRef = React.useRef(null)
      var videoWallpaper = config.source === 'wallpaper' && config.mediaType === 'video'
      var videoLocal = config.source === 'local' && (asset?.mediaType === 'video' || config.mediaType === 'video')
      // A selected Wallpaper Engine video is a background choice, not decorative UI motion.
      var useVideo = visible && !failed && (Boolean(nativeStream) || videoWallpaper || (!reduced && videoLocal))
      var source = config.source === 'local'
        ? (useVideo ? asset?.url : asset?.posterUrl)
        : config.source === 'wallpaper'
          ? (useVideo ? wallpaperMediaUrl(config.wallpaperId) : wallpaperBackgroundUrl(config.wallpaperId, config.backgroundId))
          : null
      React.useEffect(function () { setFailed(false) }, [config.source, config.assetId, config.wallpaperId, config.backgroundId, config.mediaType])
      React.useEffect(function () {
        var active = true
        if (config.source !== 'local' || !config.assetId) return function () { active = false }
        readBackgroundAsset(config.assetId).then(function (record) {
          if (active && !record) props.onUnavailable?.()
        }).catch(function () { if (active) props.onUnavailable?.() })
        return function () { active = false }
      }, [config.source, config.assetId])
      React.useEffect(function () {
        var html = document.documentElement
        var body = document.body
        if (!body || !source || (config.source === 'local' && !asset)) return undefined
        var oldHtmlBackground = html.style.getPropertyValue('background-color')
        var oldHtmlPriority = html.style.getPropertyPriority('background-color')
        var oldBodyBackground = body.style.getPropertyValue('background-color')
        var oldBodyPriority = body.style.getPropertyPriority('background-color')
        html.style.setProperty('background-color', 'transparent', 'important')
        body.style.setProperty('background-color', 'transparent', 'important')
        var layer = document.createElement('div')
        layer.setAttribute('data-dsh-balance-page-background', '')
        Object.assign(layer.style, { position: 'fixed', inset: '0', zIndex: '-1', overflow: 'hidden', pointerEvents: 'none', isolation: 'isolate' })
        var media
        if (useVideo) {
          media = document.createElement('video')
          media.muted = true; media.loop = true; media.playsInline = true; media.autoplay = false; media.preload = 'metadata'
          if (nativeStream) media.srcObject = nativeStream
          else media.src = source
          media.addEventListener('error', function () { setFailed(true) }, { once: true })
          pageMediaRef.current = media
        } else {
          media = document.createElement('img')
          media.alt = ''
          media.draggable = false
          media.src = source
          media.addEventListener('error', function () {
            if (useVideo) setFailed(true)
            else props.onUnavailable?.()
          }, { once: true })
        }
        Object.assign(media.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' })
        layer.appendChild(media)
        var dim = document.createElement('div')
        Object.assign(dim.style, { position: 'absolute', inset: '0', background: 'rgba(0,0,0,' + (Number(config.dim ?? 38) / 100) + ')' })
        layer.appendChild(dim)
        body.insertBefore(layer, body.firstChild)
        return function () {
          if (pageMediaRef.current === media) pageMediaRef.current = null
          media.pause?.()
          layer.remove()
          html.style.setProperty('background-color', oldHtmlBackground, oldHtmlPriority)
          body.style.setProperty('background-color', oldBodyBackground, oldBodyPriority)
        }
      }, [source, useVideo, asset, nativeStream, config.source, config.dim, videoWallpaper, videoLocal, config.backgroundId])
      React.useEffect(function () {
        if (!useVideo || !pageMediaRef.current) return undefined
        if (props.suspended || !visible) {
          pageMediaRef.current.pause?.()
          return undefined
        }
        var play = pageMediaRef.current.play?.()
        play?.catch?.(function () { setFailed(true) })
        return undefined
      }, [props.suspended, visible, useVideo, source])
      return null
    }

    function PanelBackground(props) {
      var config = props.config || defaultAppearance().panel
      var asset = useBackgroundAsset(config.source === 'local' ? config.assetId : null)
      var nativeStream = useNativeWallpaperStream(config.renderMode === 'native' ? config.renderKey : null)
      var visible = useDocumentVisible()
      var _failed = React.useState(false), failed = _failed[0], setFailed = _failed[1]
      var isVideo = config.source === 'wallpaper' && config.mediaType === 'video'
      var useVideo = (isVideo || Boolean(nativeStream)) && visible && !failed
      var url = config.source === 'builtin' ? PET_IMAGE_PATH
        : config.source === 'local' ? asset?.url
        : config.source === 'wallpaper' ? wallpaperBackgroundUrl(config.wallpaperId, config.backgroundId) : null
      React.useEffect(function () { setFailed(false) }, [config.source, config.assetId, config.wallpaperId, config.backgroundId])
      React.useEffect(function () {
        var video = null
        if (!useVideo) return undefined
        video = props.videoRef?.current
        if (!video) return undefined
        video.muted = true
        video.srcObject = nativeStream || null
        var play = video.play()
        play?.catch?.(function () { setFailed(true) })
        return function () {
          video.pause?.()
        }
      }, [useVideo, props.videoRef, nativeStream])
      var style = { position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 'inherit' }
      if (config.source === 'default' || (config.source === 'local' && !url)) return h('div', { 'aria-hidden': 'true', style: style })
      var media = useVideo
        ? h('video', { ref: props.videoRef, src: nativeStream ? undefined : wallpaperMediaUrl(config.wallpaperId), poster: url, muted: true, loop: true, autoPlay: true, playsInline: true, preload: 'metadata', onError: function () { setFailed(true) },
          style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } })
        : h('img', { src: url, alt: '', draggable: false, onError: function () { if (config.source !== 'builtin') props.onUnavailable?.() },
          style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: config.source === 'builtin' ? 'right center' : 'center', opacity: config.source === 'builtin' ? .72 : 1 } })
      var tint = h('div', { style: { position: 'absolute', inset: 0, background: 'rgba(12,27,49,' + Number(props.opacity ?? 35) / 100 + ')' } })
      return h('div', { 'aria-hidden': 'true', style: style }, media, tint)
    }

    function verifyBackgroundFile(file, allowVideo) {
      return Promise.resolve().then(async function () {
        if (!file || file.size < 16) throw new Error('背景文件为空或无法读取')
        var name = String(file.name || '').toLowerCase()
        var bytes = new Uint8Array(await file.slice(0, 32).arrayBuffer())
        var signature = ''
        for (var index = 0; index < Math.min(bytes.length, 12); index += 1) signature += String.fromCharCode(bytes[index])
        var pngSignature = [137, 80, 78, 71, 13, 10, 26, 10]
        var imageType = pngSignature.every(function (value, index) { return bytes[index] === value })
          ? 'image'
          : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
            ? 'image'
            : signature.slice(0, 4) === 'RIFF' && signature.slice(8, 12) === 'WEBP'
              ? 'image' : null
        var videoType = /\.mp4$/.test(name) && signature.slice(4, 8) === 'ftyp'
          ? 'video'
          : /\.webm$/.test(name) && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3
            ? 'video' : null
        var type = imageType || (allowVideo ? videoType : null)
        if (!type) {
          var imageFileName = /\.(png|jpe?g|webp)$/.test(name)
          throw new Error(imageFileName
            ? '文件名后缀是图片格式，但文件内容不是有效的 PNG、JPG 或 WebP 图片，请检查文件格式或完整性'
            : allowVideo ? '请选择 PNG、JPG、WebP、MP4 或 WebM 文件' : '设置面板背景请选择 PNG、JPG 或 WebP 图片')
        }
        if (file.size > (type === 'video' ? MAX_LOCAL_VIDEO_BYTES : MAX_LOCAL_IMAGE_BYTES)) {
          throw new Error(type === 'video' ? '本地视频不能超过 256 MiB' : '本地图片不能超过 64 MiB')
        }
        if (type === 'image') {
          if (typeof createImageBitmap === 'function') {
            var bitmap = await createImageBitmap(file)
            var dimensionsValid = bitmap.width <= 8192 && bitmap.height <= 8192
            bitmap.close?.()
            if (!dimensionsValid) throw new Error('图片尺寸不能超过 8192×8192 像素')
          }
          return { file: file, poster: file, mediaType: 'image' }
        }
        var url = URL.createObjectURL(file)
        var video = document.createElement('video')
        video.muted = true; video.playsInline = true; video.preload = 'metadata'
        video.src = url
        try {
          await new Promise(function (resolve, reject) {
            video.onloadeddata = resolve
            video.onerror = function () { reject(new Error('浏览器无法解码该视频')) }
          })
          if (!Number.isFinite(video.duration) || video.duration <= 0 || video.duration > 1800) throw new Error('视频时长必须在 30 分钟以内')
          var scale = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight))
          var canvas = document.createElement('canvas')
          canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
          canvas.height = Math.max(1, Math.round(video.videoHeight * scale))
          canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
          var poster = await new Promise(function (resolve, reject) {
            canvas.toBlob(function (blob) { blob ? resolve(blob) : reject(new Error('无法生成视频静态预览')) }, 'image/jpeg', .86)
          })
          return { file: file, poster: poster, mediaType: 'video' }
        } finally {
          video.pause(); video.removeAttribute('src'); video.load(); URL.revokeObjectURL(url)
        }
      })
    }

    function AppearanceSettings(props) {
      var _surface = React.useState(props.initialSurface || 'panel'), surface = _surface[0], setSurface = _surface[1]
      var _source = React.useState(props.appearance?.panel?.source === 'local' ? 'local' : props.appearance?.panel?.source === 'builtin' ? 'builtin' : props.appearance?.panel?.source === 'default' ? 'default' : 'wallpaper'), source = _source[0], setSource = _source[1]
      var _items = React.useState([]), items = _items[0], setItems = _items[1]
      var _busy = React.useState(false), busy = _busy[0], setBusy = _busy[1]
      var _message = React.useState(''), message = _message[0], setMessage = _message[1]
      var _libraryPath = React.useState(''), libraryPath = _libraryPath[0], setLibraryPath = _libraryPath[1]
      var _wallpaperSearch = React.useState(''), wallpaperSearch = _wallpaperSearch[0], setWallpaperSearch = _wallpaperSearch[1]
      var _candidate = React.useState(null), candidate = _candidate[0], setCandidate = _candidate[1]
      var _previewUrl = React.useState(null), previewUrl = _previewUrl[0], setPreviewUrl = _previewUrl[1]
      var _selectedWallpaper = React.useState(null), selectedWallpaper = _selectedWallpaper[0], setSelectedWallpaper = _selectedWallpaper[1]
      var _selectedBackgroundId = React.useState(null), selectedBackgroundId = _selectedBackgroundId[0], setSelectedBackgroundId = _selectedBackgroundId[1]
      var _applicationConfirmed = React.useState(false), applicationConfirmed = _applicationConfirmed[0], setApplicationConfirmed = _applicationConfirmed[1]
      var wallpaperPreviewVideoRef = React.useRef(null)
      var key = surface === 'panel' ? 'panel' : 'page'
      var current = props.appearance[key]
      var currentAsset = useBackgroundAsset(current.source === 'local' ? current.assetId : null)
      React.useEffect(function () {
        setSource(current.source === 'local' ? 'local' : current.source === 'builtin' ? 'builtin' : current.source === 'default' ? 'default' : 'wallpaper')
        setCandidate(null); setSelectedWallpaper(null); setSelectedBackgroundId(current.backgroundId || null)
        setApplicationConfirmed(false)
      }, [props.wallpaperPicker, surface, key, current.source, current.wallpaperId, current.backgroundId, current.assetId])
      React.useEffect(function () {
        var active = true
        if (current.source !== 'local' || !current.assetId) return function () { active = false }
        readBackgroundAsset(current.assetId).then(function (record) {
          if (!active || record) return
          patchCurrent(defaultAppearance()[key])
          setMessage(props.t('backgroundMissing'))
        }).catch(function () {
          if (!active) return
          patchCurrent(defaultAppearance()[key])
          setMessage(props.t('backgroundMissing'))
        })
        return function () { active = false }
      }, [key, current.source, current.assetId])
      React.useEffect(function () {
        if (!candidate) { setPreviewUrl(null); return undefined }
        var url = URL.createObjectURL(candidate.poster || candidate.file)
        setPreviewUrl(url)
        return function () { URL.revokeObjectURL(url) }
      }, [candidate])
      function loadWallpapers() {
        setBusy(true); setMessage('')
        var libraryPath = ''
        try { libraryPath = getLocalStorage()?.getItem(WALLPAPER_LIBRARY_STORAGE_KEY) || '' } catch {}
        var registerSavedLibrary = libraryPath ? fetch(WALLPAPER_LIBRARY_API_PATH, {
          method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ libraryPath: libraryPath })
        }).catch(function () {}) : Promise.resolve()
        registerSavedLibrary.then(function () {
          return fetch(WALLPAPER_API_PATH, { credentials: 'same-origin', cache: 'no-store' })
        }).then(function (response) {
          return response.json().then(function (body) {
            if (!response.ok || !body?.ok) throw new Error(props.t('wallpaperListError'))
            setItems(Array.isArray(body.items) ? body.items : [])
          })
        }).catch(function () { setItems([]); setMessage(props.t('wallpaperListError')) }).finally(function () { setBusy(false) })
      }
      React.useEffect(function () { if (props.wallpaperPicker) loadWallpapers() }, [props.wallpaperPicker])
      function patchCurrent(patch) {
        var next = Object.assign({}, props.appearance, { [key]: Object.assign({}, current, patch) })
        if (!writeAppearance(next)) { setMessage(props.t('backgroundStorageError')); return false }
        props.onChange(next)
        return true
      }
      function chooseFile(file) {
        if (!file) return
        setBusy(true); setMessage('')
        verifyBackgroundFile(file, surface === 'page').then(function (result) {
          setCandidate(Object.assign({ name: file.name }, result))
          setSelectedWallpaper(null); setSelectedBackgroundId(null)
        }).catch(function (error) { setMessage(error.message || props.t('fileFormatError')) }).finally(function () { setBusy(false) })
      }
      async function applyCandidate() {
        if (candidate) {
          setBusy(true); setMessage('')
          try {
            var id = await saveBackgroundAsset(candidate.file, candidate.poster, candidate.mediaType)
            var oldRenderKey = current.renderMode === 'native' ? current.renderKey : null
            var next = Object.assign({}, current, { source: 'local', assetId: id, mediaType: candidate.mediaType, wallpaperId: null, libraryId: null, backgroundId: null, renderMode: null, renderKey: null })
            var changed = Object.assign({}, props.appearance, { [key]: next })
            if (!writeAppearance(changed)) throw new Error(props.t('backgroundStorageError'))
            if (oldRenderKey) removeNativeWallpaperSurface(key, oldRenderKey)
            props.onChange(changed)
            setCandidate(null); setMessage(props.t('backgroundApplied'))
            if (props.wallpaperPicker) props.onClose?.()
          } catch (error) { setMessage(error.message || props.t('backgroundStorageError')) }
          finally { setBusy(false) }
          return
        }
        if (selectedWallpaper || appliedWallpaper) {
          var selected = selectedWallpaper || appliedWallpaper
          var candidateId = selectedBackgroundId || selected.backgroundCandidateId || (selected.backgroundCandidates?.length === 1 ? selected.backgroundCandidates[0].id : null)
          var needsNativeRender = ['scene', 'web', 'application'].includes(selected.type)
          var capture = null
          setBusy(true); setMessage(needsNativeRender ? props.t('wallpaperNativeRenderConnecting') : '')
          try {
            if (needsNativeRender) capture = await acquireNativeWallpaper(selected, applicationConfirmed)
            var renderKey = capture?.renderKey || null
            var wallpaperConfig = Object.assign({}, current, {
              source: 'wallpaper',
              wallpaperId: selected.id,
              libraryId: selected.libraryId || null,
              mediaType: capture ? 'native' : selected.playable ? 'video' : 'image',
              assetId: null,
              backgroundId: candidateId,
              renderMode: capture ? 'native' : null,
              renderKey: renderKey
            })
            var changed = Object.assign({}, props.appearance, { [key]: wallpaperConfig })
            if (!writeAppearance(changed)) throw new Error('BACKGROUND_STORAGE_FAILED')
            var oldRenderKey = current.renderMode === 'native' ? current.renderKey : null
            if (oldRenderKey && oldRenderKey !== renderKey) removeNativeWallpaperSurface(key, oldRenderKey)
            if (renderKey) attachNativeWallpaperSurface(key, renderKey)
            props.onChange(changed); setMessage(props.t('backgroundApplied'))
            if (props.wallpaperPicker) props.onClose?.()
          } catch (error) {
            if (capture?.created && capture.entry.surfaces.size === 0) stopNativeWallpaperLease(capture.renderKey, capture.entry)
            var code = String(error?.code || error?.message || '')
            var failureKey = code === 'BACKGROUND_STORAGE_FAILED' ? 'backgroundStorageError'
              : ['WALLPAPER_APPLICATION_DECLINED', 'WALLPAPER_APPLICATION_CONFIRMATION_REQUIRED'].includes(code) ? 'wallpaperApplicationDeclined'
                      : code === 'WALLPAPER_ENGINE_NOT_RUNNING' ? 'wallpaperEngineNotRunning'
                      : code === 'WALLPAPER_ENGINE_NOT_INSTALLED' ? 'wallpaperEngineNotInstalled'
              : code === 'WALLPAPER_RENDER_UNSUPPORTED' ? 'wallpaperWindowsOnly'
                : code === 'WALLPAPER_RENDER_LOCAL_ONLY' ? 'wallpaperRenderLocalOnly'
                      : code === 'WALLPAPER_RENDER_UNAVAILABLE' ? 'wallpaperRenderUnavailable'
            : code === 'WALLPAPER_WINDOW_START_FAILED' ? 'wallpaperWindowStartFailed'
              : code === 'WALLPAPER_PAIRING_BROWSER_START_FAILED' ? 'wallpaperPairingBrowserStartFailed'
              : code === 'WALLPAPER_RENDER_START_FAILED' ? 'wallpaperRenderStartFailed'
                : code === 'WALLPAPER_RENDER_WEBRTC_FAILED' ? 'wallpaperNativeRenderWebrtcFailed'
              : code === 'WALLPAPER_RENDER_LIMIT' ? 'wallpaperRenderLimit'
                : ['WALLPAPER_RENDER_REQUEST_INVALID', 'WALLPAPER_PROJECT_INVALID'].includes(code) ? 'wallpaperRenderRequestInvalid'
                  : code === 'WALLPAPER_RENDER_SESSION_INVALID' ? 'wallpaperRenderSessionInvalid'
                    : code === 'WALLPAPER_RENDER_FAILED' ? 'wallpaperRenderFailed'
                      : code === 'WALLPAPER_RENDER_HOST_UNAVAILABLE' ? 'wallpaperRenderHostUnavailable'
                        : code === 'WALLPAPER_CAPTURE_SOURCE_INVALID' ? 'wallpaperCaptureSourceInvalid'
              : code === 'WALLPAPER_RENDER_PAIRING_TIMEOUT' ? 'wallpaperPairingTimeout'
                : code === 'WALLPAPER_RENDER_CAPTURE_TIMEOUT' ? 'wallpaperCaptureTimeout'
                  : code === 'WALLPAPER_RENDER_SESSION_EXPIRED' ? 'wallpaperCaptureEnded'
                    : error?.name === 'NotAllowedError' ? 'wallpaperCaptureDenied'
                      : error?.name === 'TypeError' ? 'wallpaperRenderHostUnavailable' : 'wallpaperNativeRenderFailed'
            setMessage(props.t(failureKey))
          } finally { setBusy(false) }
        }
      }
      async function addLibrary(suppliedPath) {
        var value = (typeof suppliedPath === 'string' ? suppliedPath : libraryPath).trim()
        if (!value) return
        setBusy(true); setMessage('')
        try {
          var response = await fetch(WALLPAPER_LIBRARY_API_PATH, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ libraryPath: value })
          })
          var body = await response.json().catch(function () { return null })
          if (!response.ok || !body?.ok) throw new Error(props.t('wallpaperLibraryInvalid'))
          try { getLocalStorage()?.setItem(WALLPAPER_LIBRARY_STORAGE_KEY, value) } catch {}
          setLibraryPath(''); loadWallpapers()
        } catch (error) { setMessage(error.message || props.t('wallpaperLibraryInvalid')) }
        finally { setBusy(false) }
      }
      async function browseSteamLibrary() {
        setBusy(true); setMessage('')
        try {
          var response = await fetch(WALLPAPER_LIBRARY_PICK_API_PATH, {
            method: 'POST', credentials: 'same-origin', headers: { accept: 'application/json' }
          })
          var body = await response.json().catch(function () { return null })
          if (!response.ok || !body?.ok) throw new Error(props.t('wallpaperFolderPickerUnavailable'))
          if (body.cancelled) return
          if (typeof body.libraryPath !== 'string' || !body.libraryPath) throw new Error(props.t('wallpaperFolderPickerUnavailable'))
          setLibraryPath(body.libraryPath)
        } catch (error) { setMessage(error.message || props.t('wallpaperFolderPickerUnavailable')) }
        finally { setBusy(false) }
      }
      function restoreDefault() {
        var oldRenderKey = current.renderMode === 'native' ? current.renderKey : null
        if (patchCurrent(defaultAppearance()[key]) && oldRenderKey) removeNativeWallpaperSurface(key, oldRenderKey)
        setSource(surface === 'panel' ? 'builtin' : 'default'); setCandidate(null); setSelectedWallpaper(null); setSelectedBackgroundId(null)
        setApplicationConfirmed(false)
      }
      var button = Object.assign({}, dialogStyles.button, { color: 'inherit', borderColor: 'rgba(198,220,245,.35)', background: 'rgba(255,255,255,.08)', padding: '8px 11px', margin: 2 })
      var activeSource = candidate ? 'local' : source
      var appliedWallpaper = current.source === 'wallpaper' ? items.find(function (item) { return item.id === current.wallpaperId }) : null
      var qualityWallpaper = selectedWallpaper || appliedWallpaper
      var applicationConsentNeeded = qualityWallpaper?.type === 'application'
      var wallpaperCandidates = qualityWallpaper?.backgroundCandidates || []
      var activeBackgroundId = selectedWallpaper ? selectedBackgroundId
        : selectedBackgroundId || appliedWallpaper?.backgroundCandidateId || (appliedWallpaper?.backgroundCandidates?.length === 1 ? appliedWallpaper.backgroundCandidates[0].id : null)
      var activeRenderKey = qualityWallpaper && current.source === 'wallpaper' && current.wallpaperId === qualityWallpaper.id && current.renderMode === 'native'
        ? current.renderKey : null
      var nativePreviewStream = useNativeWallpaperStream(activeRenderKey)
      var wallpaperSelectionReady = Boolean(qualityWallpaper && (
        qualityWallpaper.playable
        || (['scene', 'web', 'application'].includes(qualityWallpaper.type) && qualityWallpaper.render?.available === true
          && typeof RTCPeerConnection === 'function')
        || (qualityWallpaper.type === 'image' && activeBackgroundId
          && wallpaperCandidates.some(function (item) { return item.id === activeBackgroundId }))
      ))
      React.useEffect(function () {
        var video = wallpaperPreviewVideoRef.current
        if (!video || !props.wallpaperPicker) return undefined
        video.srcObject = nativePreviewStream || null
        if (nativePreviewStream) video.play()?.catch?.(function () {})
        return function () { video.pause?.(); if (video.srcObject) video.srcObject = null }
      }, [props.wallpaperPicker, nativePreviewStream])
      function wallpaperNativeStatus(item) {
        if (!item || !['scene', 'web', 'application'].includes(item.type)) return ''
        if (item.render?.available !== true) return props.t('wallpaperRenderSourceUnavailable')
        if (typeof RTCPeerConnection !== 'function') return props.t('wallpaperNativeRenderUnavailable')
        var renderKey = nativeWallpaperKey(item)
        if (renderKey && nativeWallpaperLeases.has(renderKey)) return props.t('wallpaperNativeRenderActive')
        if (current.renderMode === 'native' && current.renderKey === renderKey) return props.t('wallpaperNativeRenderReapply')
        return props.t('wallpaperNativeRenderAvailable')
      }
      function wallpaperQualityText(item) {
        if (!item) return ''
        var width = Number(item.backgroundWidth)
        var height = Number(item.backgroundHeight)
        var resolution = width > 0 && height > 0 ? width + ' × ' + height : ''
        if (item.playable) return props.t('wallpaperVideoQuality') + (resolution ? ' · ' + props.t('wallpaperVideoFallback') + ' ' + resolution : '')
        if (['scene', 'web', 'application'].includes(item.type)) {
          return props.t(item.render?.available === true ? 'wallpaperNativeSource' : 'wallpaperRenderSourceUnavailable')
        }
        if (item.backgroundSource === 'preview' && item.backgroundCandidates?.length > 1) return props.t('wallpaperCandidateChoice') + ' · ' + item.backgroundCandidates.length
        var hasDimensions = width > 0 && height > 0
        var lowResolution = hasDimensions ? Math.max(width, height) < 1280 || Math.min(width, height) < 720 : item.backgroundSource === 'preview'
        var label = lowResolution
          ? props.t(item.backgroundSource === 'preview' ? 'wallpaperPreviewOnly' : 'wallpaperSourceLow')
          : props.t(item.backgroundSource === 'preview' ? 'wallpaperPreviewSource' : 'wallpaperSourceImage')
        return label + (resolution ? ' · ' + resolution : '')
      }
      var previewWallpaper = selectedWallpaper || appliedWallpaper
      var preview = candidate ? previewUrl
        : previewWallpaper ? (previewWallpaper.playable ? wallpaperMediaUrl(previewWallpaper.id) : wallpaperBackgroundUrl(previewWallpaper.id, activeBackgroundId))
          : current.source === 'builtin' ? PET_IMAGE_PATH
            : current.source === 'local' ? currentAsset?.posterUrl : current.source === 'wallpaper' && current.wallpaperId ? wallpaperBackgroundUrl(current.wallpaperId, current.backgroundId) : null
      var previewTitle = candidate?.name || selectedWallpaper?.title || (current.source === 'builtin' ? props.t('defaultPhoto') : current.source === 'wallpaper' ? current.wallpaperId : '')
      var panelLabel = props.t('panelBackground')
      var pageLabel = props.t('pageBackground')
      var query = wallpaperSearch.trim().toLocaleLowerCase()
      var visibleItems = query ? items.filter(function (item) {
        return [item.title, item.id, item.type].some(function (value) { return String(value || '').toLocaleLowerCase().includes(query) })
      }) : items
      var wallpaperTypeLabelKeys = {
        image: 'wallpaperTypeImage',
        video: 'wallpaperTypeVideo',
        scene: 'wallpaperTypeScene',
        web: 'wallpaperTypeWeb',
        application: 'wallpaperTypeApplication',
      }
      var choiceList = visibleItems.map(function (item) {
        var active = selectedWallpaper?.id === item.id
        var applied = !candidate && current.source === 'wallpaper' && current.wallpaperId === item.id
        var thumbnailCandidateId = item.backgroundCandidateId || item.backgroundCandidates?.[0]?.id
        var thumbnailUrl = item.type === 'image' && thumbnailCandidateId
          ? wallpaperBackgroundUrl(item.id, thumbnailCandidateId) : item.previewUrl
        return h('button', { type: 'button', key: item.id, onClick: function () {
            setSelectedWallpaper(item); setSelectedBackgroundId(item.backgroundCandidateId || (item.backgroundCandidates?.length === 1 ? item.backgroundCandidates[0].id : null)); setCandidate(null); setApplicationConfirmed(false); setMessage('')
          },
          'aria-pressed': active, style: Object.assign({}, button, { display: 'flex', alignItems: 'center', gap: 8, width: '100%', minWidth: 0, padding: 6, textAlign: 'left', borderColor: active ? '#94c8ff' : button.borderColor }) },
          h('img', { src: thumbnailUrl, alt: props.t('wallpaperThumbnail'), loading: 'lazy', style: { flex: 'none', width: props.wallpaperPicker ? 86 : 64, height: props.wallpaperPicker ? 54 : 40, objectFit: 'cover', borderRadius: 5 } }),
          h('span', { style: { minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 } },
            h('strong', { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, item.title),
            applied ? h('small', { style: { color: '#a8d8ff' } }, props.t('wallpaperCurrentInUse')) : null,
            h('small', { style: { opacity: .78 } }, props.t(wallpaperTypeLabelKeys[item.type] || 'wallpaperTypeUnknown')),
            h('small', { style: { opacity: .84, color: item.backgroundSource === 'preview' && !(['scene', 'web', 'application'].includes(item.type) && item.render?.available === true) ? '#ffd08a' : 'inherit', lineHeight: 1.25 } }, wallpaperQualityText(item))))
      })
      if (props.wallpaperPicker) {
        var pickerTitle = surface === 'panel' ? panelLabel : pageLabel
        var previewElement = nativePreviewStream
          ? h('video', { ref: wallpaperPreviewVideoRef, autoPlay: true, muted: true, playsInline: true, style: { display: 'block', width: '100%', maxHeight: 'min(42vh, 360px)', objectFit: 'contain', background: '#050a11', borderRadius: 10 } })
          : qualityWallpaper?.playable
            ? h('video', { src: preview, autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata', style: { display: 'block', width: '100%', maxHeight: 'min(42vh, 360px)', objectFit: 'contain', background: '#050a11', borderRadius: 10 } })
            : preview ? h('img', { src: preview, alt: '', style: { display: 'block', width: '100%', maxHeight: 'min(42vh, 360px)', objectFit: 'contain', background: '#050a11', borderRadius: 10 } }) : null
        var sourceHint = qualityWallpaper?.type === 'image' && qualityWallpaper.backgroundSource === 'preview'
          ? props.t('wallpaperOriginalUnavailable')
          : qualityWallpaper && ['scene', 'web', 'application'].includes(qualityWallpaper.type)
            ? wallpaperNativeStatus(qualityWallpaper) : qualityWallpaper ? wallpaperQualityText(qualityWallpaper) : props.t('wallpaperPickerHint')
        return h('div', { role: 'presentation', style: { position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 18, background: 'rgba(7,15,27,.86)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', pointerEvents: 'auto' } },
          h('section', { role: 'dialog', 'aria-modal': 'true', 'aria-label': props.t('wallpaperPickerTitle'), style: { display: 'flex', flexDirection: 'column', width: 'min(1160px, calc(100vw - 36px))', height: 'min(860px, calc(100vh - 36px))', minHeight: 300, padding: 18, color: '#eff6ff', background: 'rgba(18,35,59,.96)', border: '1px solid rgba(161,196,228,.42)', borderRadius: 16, boxShadow: '0 22px 72px rgba(0,0,0,.48)', overflow: 'hidden' } },
            h('header', { style: { display: 'flex', alignItems: 'center', gap: 12, flex: 'none', paddingBottom: 12, borderBottom: '1px solid rgba(198,220,245,.2)' } },
              h('button', { type: 'button', style: button, onClick: props.onClose }, '‹ ' + props.t('wallpaperPickerBack')),
              h('div', { style: { minWidth: 0 } }, h('h2', { style: Object.assign({}, dialogStyles.title, { margin: 0 }) }, props.t('wallpaperPickerTitle')),
                h('small', { style: { opacity: .76 } }, pickerTitle))),
            h('p', { style: { flex: 'none', opacity: .8, lineHeight: 1.5, margin: '10px 0' } }, props.t('wallpaperPickerHint')),
            h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 14, flex: '1 1 auto', minHeight: 0 } },
              h('div', { style: { display: 'flex', flexDirection: 'column', minHeight: 0 } },
                h('div', { style: { display: 'flex', gap: 8, flex: 'none' } },
                  h('input', { type: 'search', value: wallpaperSearch, placeholder: props.t('wallpaperSearch'), onChange: function (event) { setWallpaperSearch(event.target.value) }, style: Object.assign({}, dialogStyles.input, { flex: 1, minWidth: 0, color: 'inherit', background: 'rgba(0,0,0,.2)' }) }),
                  h('button', { type: 'button', style: button, disabled: busy, onClick: loadWallpapers }, busy ? '…' : props.t('refreshWallpapers'))),
                h('small', { style: { display: 'block', flex: 'none', opacity: .72, margin: '7px 0' } }, props.t('wallpaperLocalOnly')),
                choiceList.length ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, flex: '1 1 auto', minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', padding: '4px 5px 4px 0' } }, choiceList)
                  : h('p', { style: { opacity: .76 } }, busy ? '…' : items.length ? props.t('wallpaperNoResults') : props.t('noWallpapers')),
                h('div', { style: { display: 'flex', gap: 6, flex: 'none', marginTop: 8 } },
                  h('input', { type: 'text', value: libraryPath, placeholder: props.t('steamLibraryPlaceholder'), onChange: function (event) { setLibraryPath(event.target.value) }, style: Object.assign({}, dialogStyles.input, { flex: 1, minWidth: 0, color: 'inherit', background: 'rgba(0,0,0,.16)' }) }),
                  h('button', { type: 'button', style: button, disabled: busy, onClick: function () { void browseSteamLibrary() } }, props.t('browseSteamLibrary')),
                  h('button', { type: 'button', style: button, disabled: busy || !libraryPath.trim(), onClick: addLibrary }, props.t('addSteamLibrary')))),
              h('div', { style: { minWidth: 0, overflowY: 'auto', overscrollBehavior: 'contain', padding: 12, borderRadius: 10, background: 'rgba(5,22,43,.44)' } },
                qualityWallpaper ? h('div', null,
                  previewElement || h('p', { style: { opacity: .75 } }, props.t('wallpaperPickerHint')),
                  h('h3', { style: { margin: '12px 0 4px' } }, qualityWallpaper.title),
                  h('p', { style: { margin: '0 0 8px', opacity: .78 } }, props.t(wallpaperTypeLabelKeys[qualityWallpaper.type] || 'wallpaperTypeUnknown')),
                  h('small', { style: { display: 'block', color: qualityWallpaper.type === 'image' && qualityWallpaper.backgroundSource === 'preview' || ['scene', 'web', 'application'].includes(qualityWallpaper.type) ? '#b8d8ff' : 'inherit', lineHeight: 1.45 } }, sourceHint),
                  qualityWallpaper.type === 'image' && wallpaperCandidates.length > 1 ? h('div', { style: { marginTop: 12 } },
                    h('small', { style: { display: 'block', opacity: .82, marginBottom: 6 } }, props.t('wallpaperCandidateHint')),
                    h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } }, wallpaperCandidates.map(function (item) {
                      var active = activeBackgroundId === item.id
                      return h('button', { type: 'button', key: item.id, 'aria-pressed': active, style: Object.assign({}, button, { margin: 0, background: active ? 'rgba(118,165,218,.48)' : button.background }), onClick: function () { setSelectedBackgroundId(item.id); setMessage('') } }, item.width + ' × ' + item.height)
                    }))) : null,
                  ['scene', 'web', 'application'].includes(qualityWallpaper.type) && qualityWallpaper.render?.available === true ? h('p', { style: { marginTop: 12, opacity: .82, lineHeight: 1.45 } }, props.t('wallpaperQualityHint')) : null,
                  qualityWallpaper.type === 'application' ? h('label', { style: { display: 'flex', alignItems: 'flex-start', gap: 7, marginTop: 12, color: '#ffd08a', lineHeight: 1.4 } },
                    h('input', { type: 'checkbox', checked: applicationConfirmed, onChange: function (event) { setApplicationConfirmed(event.target.checked) } }),
                    props.t('wallpaperApplicationConsent')) : null)
                  : h('p', { style: { opacity: .76 } }, props.t('wallpaperPickerHint')),
                h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 14 } },
                  h('p', { role: 'status', 'aria-live': 'polite', style: Object.assign({}, dialogStyles.status, { flex: 1, color: message ? '#ffd2c7' : 'inherit' }) }, message),
                  h('button', { type: 'button', style: Object.assign({}, button, { background: 'rgba(84,137,197,.58)' }), disabled: busy || !wallpaperSelectionReady || (applicationConsentNeeded && !applicationConfirmed), onClick: function () { void applyCandidate() } }, busy ? '…' : props.t('useThisBackground')))))))
      }
      return h('div', null,
        h('div', { style: { display: 'flex', gap: 6, margin: '10px 0 14px' } },
          h('button', { type: 'button', role: 'tab', 'aria-selected': surface === 'panel', style: button, onClick: function () { setSurface('panel'); setCandidate(null); setSelectedWallpaper(null) } }, panelLabel),
          h('button', { type: 'button', role: 'tab', 'aria-selected': surface === 'page', style: button, onClick: function () { setSurface('page'); setCandidate(null); setSelectedWallpaper(null) } }, pageLabel)),
        surface === 'page' ? h('strong', null, pageLabel) : h('div', null,
          h('strong', null, panelLabel),
          h('p', { style: { opacity: .8, margin: '4px 0 10px' } }, props.t('panelBackgroundHint'))),
        h('div', { style: { display: 'flex', gap: 6, margin: '10px 0' } },
          h('button', { type: 'button', style: Object.assign({}, button, { background: (surface === 'panel' ? current.source === 'builtin' : current.source === 'default') ? 'rgba(118,165,218,.4)' : button.background }), onClick: restoreDefault }, surface === 'panel' ? props.t('defaultPhoto') : props.t('defaultBackground')),
          h('button', { type: 'button', style: Object.assign({}, button, { background: activeSource === 'wallpaper' ? 'rgba(118,165,218,.4)' : button.background }), onClick: function () { setSource('wallpaper'); setCandidate(null); setMessage(''); props.onOpenWallpaperPicker?.(surface) } }, props.t('wallpaperEngine')),
          h('button', { type: 'button', style: Object.assign({}, button, { background: activeSource === 'local' ? 'rgba(118,165,218,.4)' : button.background }), onClick: function () { setSource('local'); setSelectedWallpaper(null); setSelectedBackgroundId(null); setMessage('') } }, props.t('localFile'))),
        activeSource === 'local' ? h('div', { style: { margin: '8px 0' } },
          h('label', { style: { display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' } },
            h('span', null, props.t('chooseBackgroundFile')),
            h('input', { type: 'file', accept: surface === 'page' ? 'image/png,image/jpeg,image/webp,video/mp4,video/webm' : 'image/png,image/jpeg,image/webp',
              onChange: function (event) { chooseFile(event.target.files?.[0]); event.target.value = '' } })),
          h('small', { style: { display: 'block', opacity: .72, marginTop: 5 } }, surface === 'page' ? props.t('pageFileSupport') : props.t('panelFileSupport')),
          h('small', { style: { display: 'block', opacity: .68, marginTop: 4 } }, props.t('localImageQualityHint'))) : null,
        activeSource === 'wallpaper' ? h('div', null,
          h('p', { style: { opacity: .8, lineHeight: 1.45 } }, props.t('wallpaperPickerHint')),
          h('button', { type: 'button', style: Object.assign({}, button, { background: 'rgba(84,137,197,.58)' }), onClick: function () { props.onOpenWallpaperPicker?.(surface) } }, props.t('wallpaperPickerTitle'))) : null,
        activeSource !== 'wallpaper' && preview ? h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, padding: 8, marginTop: 10, borderRadius: 8, background: 'rgba(7,21,40,.48)' } },
          h('img', { src: preview, alt: '', style: { width: 88, height: 68, objectFit: 'cover', borderRadius: 6 } }),
          h('div', { style: { minWidth: 0 } }, h('strong', null, previewTitle || props.t('backgroundPreview')),
            h('p', { style: { margin: '4px 0', opacity: .76 } }, candidate?.mediaType === 'video' || qualityWallpaper?.playable ? props.t('wallpaperVideo') : props.t('wallpaperStatic')),
            qualityWallpaper ? h('small', { style: { display: 'block', color: qualityWallpaper.backgroundSource === 'preview' && (!qualityWallpaper.backgroundWidth || Math.max(Number(qualityWallpaper.backgroundWidth), Number(qualityWallpaper.backgroundHeight)) < 1280 || Math.min(Number(qualityWallpaper.backgroundWidth), Number(qualityWallpaper.backgroundHeight)) < 720) ? '#ffd08a' : 'inherit', lineHeight: 1.35 } }, wallpaperQualityText(qualityWallpaper)) : null)) : null,
        surface === 'page' ? h('label', { style: { display: 'block', marginTop: 14 } }, props.t('pageDim') + ' · ' + Number(current.dim ?? 38) + '%',
          h('input', { type: 'range', min: 0, max: 75, value: current.dim ?? 38, onChange: function (event) { patchCurrent({ dim: Number(event.target.value) }) }, style: { width: '100%' } })) :
          h('label', { style: { display: 'block', marginTop: 14 } }, props.t('panelOpacity') + ' · ' + Number(current.opacity ?? 35) + '%',
            h('input', { type: 'range', min: 10, max: 85, value: current.opacity ?? 35, onChange: function (event) { patchCurrent({ opacity: Number(event.target.value) }) }, style: { width: '100%' } })),
        h('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 12 } },
          h('button', { type: 'button', style: button, onClick: restoreDefault }, props.t('restoreDefault')),
          h('button', { type: 'button', style: Object.assign({}, button, { background: 'rgba(84,137,197,.58)' }), disabled: busy || (!candidate && !selectedWallpaper && !appliedWallpaper) || (applicationConsentNeeded && !applicationConfirmed), onClick: function () { void applyCandidate() } }, props.t('useThisBackground'))),
        h('p', { role: 'status', 'aria-live': 'polite', style: Object.assign({}, dialogStyles.status, { color: busy ? '#acd6ff' : message ? '#ffd2c7' : 'inherit' }) }, message))
    }

    var PAGE_BACKGROUND_TOKENS = {
      '--dsw-alias-bg-base': { light: 'rgba(248,250,255,0.08)', dark: 'rgba(8,18,34,0.08)' },
      '--dsw-alias-bg-layer-1': { light: 'rgba(235,242,251,0.40)', dark: 'rgba(12,25,44,0.44)' },
      '--dsw-alias-bg-layer-2': { light: 'rgba(232,240,251,0.54)', dark: 'rgba(15,29,50,0.56)' },
      '--dsw-alias-bg-layer-3': { light: 'rgba(230,239,251,0.64)', dark: 'rgba(18,34,57,0.68)' },
      '--dsw-specific-sidebar-fill': { light: 'rgba(232,239,249,0.56)', dark: 'rgba(13,26,45,0.58)' },
      '--dsw-specific-bubble': { light: 'rgba(251,252,255,0.72)', dark: 'rgba(17,30,50,0.74)' },
      '--dsw-specific-bubble-highlight': { light: 'rgba(245,249,255,0.72)', dark: 'rgba(24,39,62,0.76)' }
    }
