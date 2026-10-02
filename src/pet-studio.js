    // Inserted into the client factory by scripts/build.mjs.
    var petStudio = (function () {
      var DB_NAME = 'dsh-deepseek-balance-pets-v1'
      var SELECTED_KEY = 'dsh-deepseek-balance.pet-scheme'
      var BASE_SLOTS = ['idle', 'loading', 'decrease', 'increase', 'error']
      var EVENT_TYPES = ['query-start', 'query-success', 'query-failure', 'balance-decrease', 'balance-increase', 'balance-same', 'pet-click', 'idle-cycle', 'idle-duration', 'local-time']
      var MAX_FILE_BYTES = 8 * 1024 * 1024
      var MAX_SCHEME_BYTES = 24 * 1024 * 1024
      var listeners = new Set()
      var state = { schemes: [], selectedId: 'builtin', error: '', ready: false, event: null, preview: null, revision: 0 }
      var dbPromise = null
      var eventNumber = 0
      var lastFired = new Map()

      function publish(next) {
        state = Object.assign({}, state, next)
        listeners.forEach(function (listener) { listener() })
      }
      function subscribe(listener) { listeners.add(listener); return function () { listeners.delete(listener) } }
      function snapshot() { return state }
      function selectedScheme() { return state.schemes.find(function (item) { return item.id === state.selectedId }) || null }
      function select(id) {
        if (id !== 'builtin' && !state.schemes.some(function (item) { return item.id === id })) return false
        var storage = getLocalStorage()
        try { storage?.setItem(SELECTED_KEY, id) } catch {}
        publish({ selectedId: id, event: null, preview: null, revision: state.revision + 1 })
        return true
      }
      function openDb() {
        if (dbPromise) return dbPromise
        dbPromise = new Promise(function (resolve, reject) {
          if (typeof indexedDB === 'undefined') { reject(new Error('当前 DeepSeek Harness 配置无法保存桌宠方案')); return }
          var request = indexedDB.open(DB_NAME, 1)
          request.onupgradeneeded = function () {
            if (!request.result.objectStoreNames.contains('schemes')) request.result.createObjectStore('schemes', { keyPath: 'id' })
          }
          request.onsuccess = function () { resolve(request.result) }
          request.onerror = function () { reject(new Error('桌宠方案数据库无法打开')) }
        }).catch(function (error) { dbPromise = null; throw error })
        return dbPromise
      }
      function allSchemes() {
        return openDb().then(function (db) {
          return new Promise(function (resolve, reject) {
            var transaction = db.transaction('schemes', 'readonly')
            var request = transaction.objectStore('schemes').getAll()
            request.onsuccess = function () { resolve(request.result || []) }
            request.onerror = function () { reject(new Error('无法读取桌宠方案')) }
          })
        })
      }
      function reload() {
        return allSchemes().then(function (schemes) {
          var stored = null
          try { stored = getLocalStorage()?.getItem(SELECTED_KEY) } catch {}
          var selectedId = schemes.some(function (item) { return item.id === stored }) ? stored : 'builtin'
          publish({ schemes: schemes, selectedId: selectedId, ready: true, error: '' })
        }).catch(function (error) { publish({ ready: true, error: error.message }) })
      }
      function validName(value) {
        var text = String(value || '').trim()
        return text.length >= 1 && text.length <= 24 ? text : null
      }
      function validRules(rules) {
        if (!Array.isArray(rules)) return false
        return rules.every(function (rule) {
          if (!EVENT_TYPES.includes(rule.event) || !Array.isArray(rule.conditions)) return false
          if (!['once', 'until-end'].includes(rule.play) || !['replace', 'after'].includes(rule.base)) return false
          if (!Number.isInteger(rule.cooldown) || rule.cooldown < 0 || rule.cooldown > 86400) return false
          if (!Number.isInteger(rule.priority) || rule.priority < -100 || rule.priority > 100) return false
          if (rule.play === 'until-end' && rule.event !== 'query-start' &&
              !(rule.event === 'local-time' && rule.conditions.some(function (condition) { return condition.field === 'hour-from' || condition.field === 'hour-to' }))) return false
          return rule.conditions.every(function (condition) {
            var fields = conditionFields(rule.event)
            if (!fields.includes(condition.field) || typeof condition.value !== 'string') return false
            if (condition.field === 'currency') return CURRENCY_PATTERN.test(condition.value.toUpperCase())
            if (condition.field === 'amount-min' || condition.field === 'amount-max') return DECIMAL_PATTERN.test(condition.value)
            if (condition.field === 'hour-from' || condition.field === 'hour-to') return /^(?:[0-9]|1[0-9]|2[0-3])$/.test(condition.value)
            if (condition.field === 'idle-seconds-min') return /^(?:[1-9]\d{0,4})$/.test(condition.value) && Number(condition.value) <= 86400
            if (condition.field === 'idle') return condition.value === 'true' || condition.value === 'false'
            return condition.value.length >= 1 && condition.value.length <= 64
          })
        })
      }
      function conditionFields(event) {
        if (event === 'balance-decrease' || event === 'balance-increase' || event === 'balance-same') return ['currency', 'amount-min', 'amount-max']
        if (event === 'query-failure') return ['error-code']
        if (event === 'local-time') return ['hour-from', 'hour-to', 'idle']
        if (event === 'idle-duration') return ['idle', 'idle-seconds-min']
        if (event === 'pet-click' || event === 'idle-cycle') return ['idle']
        return []
      }
      function validateScheme(scheme) {
        if (!scheme || !validName(scheme.name) || !scheme.cover || !scheme.slots || !scheme.slots.idle?.media) throw new Error('方案需要名称、透明封面和待机素材')
        if (!Array.isArray(scheme.custom) || scheme.custom.length > 5) throw new Error('每个方案最多 10 个槽位')
        var names = new Set(BASE_SLOTS.concat(['待机', '查询中', '余额减少', '余额增加', '错误']))
        var bytes = scheme.cover.size || 0
        BASE_SLOTS.forEach(function (name) {
          var slot = scheme.slots[name]
          if (slot) bytes += (slot.media?.size || 0) + (slot.poster?.size || 0)
        })
        scheme.custom.forEach(function (slot) {
          var name = validName(slot.name)
          if (!name || names.has(name) || !slot.media || !slot.poster || !validRules(slot.rules)) throw new Error('自定义槽位名称、素材或规则无效')
          names.add(name)
          bytes += (slot.media.size || 0) + (slot.poster.size || 0)
        })
        if (bytes > MAX_SCHEME_BYTES) throw new Error('方案素材总量超过 24 MiB，请压缩后重试')
      }
      async function saveScheme(scheme) {
        validateScheme(scheme)
        var db = await openDb()
        scheme.name = validName(scheme.name)
        scheme.updatedAt = Date.now()
        if (!scheme.createdAt) scheme.createdAt = scheme.updatedAt
        await new Promise(function (resolve, reject) {
          var transaction = db.transaction('schemes', 'readwrite')
          var store = transaction.objectStore('schemes')
          var current = store.get(scheme.id)
          current.onsuccess = function () {
            var count = store.count()
            count.onsuccess = function () {
              if (!current.result && count.result >= 3) { transaction.abort(); return }
              store.put(scheme)
            }
          }
          transaction.oncomplete = resolve
          transaction.onerror = function () { reject(new Error('保存失败；请检查浏览器存储空间')) }
          transaction.onabort = function () { reject(new Error('最多保存 3 个用户方案，或存储空间不足；原方案已保留')) }
        })
        await reload()
        select(scheme.id)
      }
      async function removeScheme(id) {
        var db = await openDb()
        await new Promise(function (resolve, reject) {
          var transaction = db.transaction('schemes', 'readwrite')
          transaction.objectStore('schemes').delete(id)
          transaction.oncomplete = resolve
          transaction.onerror = function () { reject(new Error('删除失败')) }
        })
        if (state.selectedId === id) select('builtin')
        await reload()
      }
      function scanAlpha(canvas, width, height) {
        var pixels = canvas.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, width, height).data
        var left = width, top = height, right = 0, bottom = 0, transparent = false, visible = false
        for (var y = 0; y < height; y += 1) for (var x = 0; x < width; x += 1) {
          var alpha = pixels[(y * width + x) * 4 + 3]
          if (alpha < 255) transparent = true
          if (alpha > 8) { visible = true; left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x + 1); bottom = Math.max(bottom, y + 1) }
        }
        if (!transparent || !visible) throw new Error('素材必须包含可见图像和真实透明像素')
        return { left: left / width, top: top / height, right: right / width, bottom: bottom / height }
      }
      function canvasFor(width, height) {
        if (width < 1 || height < 1 || width > 1024 || height > 1024) throw new Error('素材尺寸须在 1024×1024 像素以内')
        var canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height
        return canvas
      }
      async function imageInfo(file) {
        var url = URL.createObjectURL(file)
        try {
          var image = await new Promise(function (resolve, reject) {
            var element = new Image()
            element.onload = function () { resolve(element) }
            element.onerror = function () { reject(new Error('图片无法解码')) }
            element.src = url
          })
          var canvas = canvasFor(image.naturalWidth, image.naturalHeight)
          canvas.getContext('2d').drawImage(image, 0, 0)
          var bounds = scanAlpha(canvas, canvas.width, canvas.height)
          var poster = await new Promise(function (resolve, reject) { canvas.toBlob(function (blob) { blob ? resolve(blob) : reject(new Error('无法提取静态封面')) }, 'image/png') })
          return { bounds: bounds, poster: poster, width: canvas.width, height: canvas.height }
        } finally { URL.revokeObjectURL(url) }
      }
      async function videoInfo(file) {
        var url = URL.createObjectURL(file)
        var video = document.createElement('video')
        video.muted = true; video.preload = 'auto'; video.playsInline = true
        video.src = url
        try {
          await new Promise(function (resolve, reject) { video.onloadedmetadata = resolve; video.onerror = function () { reject(new Error('视频无法解码')) } })
          if (!Number.isFinite(video.duration) || video.duration <= 0 || video.duration > 30) throw new Error('视频时长须在 30 秒以内')
          var canvas = canvasFor(video.videoWidth, video.videoHeight)
          var bounds = { left: 1, top: 1, right: 0, bottom: 0 }
          var frames = [0.05, 0.5, 0.95]
          for (var index = 0; index < frames.length; index += 1) {
            video.currentTime = Math.min(video.duration - 0.001, Math.max(0, video.duration * frames[index]))
            await new Promise(function (resolve, reject) { video.onseeked = resolve; video.onerror = function () { reject(new Error('视频帧无法解码')) } })
            var context = canvas.getContext('2d', { willReadFrequently: true })
            context.clearRect(0, 0, canvas.width, canvas.height)
            context.drawImage(video, 0, 0)
            var one = scanAlpha(canvas, canvas.width, canvas.height)
            bounds.left = Math.min(bounds.left, one.left); bounds.top = Math.min(bounds.top, one.top)
            bounds.right = Math.max(bounds.right, one.right); bounds.bottom = Math.max(bounds.bottom, one.bottom)
          }
          var poster = await new Promise(function (resolve, reject) { canvas.toBlob(function (blob) { blob ? resolve(blob) : reject(new Error('无法提取静态后备帧')) }, 'image/png') })
          return { bounds: bounds, poster: poster, width: canvas.width, height: canvas.height }
        } finally { video.pause(); video.removeAttribute('src'); video.load(); URL.revokeObjectURL(url) }
      }
      async function importMedia(file) {
        if (!file || file.size > MAX_FILE_BYTES || file.size < 16) throw new Error('单个素材须小于 8 MiB 且不能是空文件')
        var name = String(file.name || '').toLowerCase()
        var bytes = new Uint8Array(await file.slice(0, Math.min(file.size, 65536)).arrayBuffer())
        var png = /\.png$/.test(name) && bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71
        var webp = /\.webp$/.test(name) && String.fromCharCode.apply(null, bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode.apply(null, bytes.slice(8, 12)) === 'WEBP'
        var webm = /\.webm$/.test(name) && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3
        if (!png && !webp && !webm) throw new Error('仅支持透明 PNG、WebP、APNG 或 VP9 WebM')
        var info
        if (webm) {
          var header = new TextDecoder('latin1').decode(new Uint8Array(await file.arrayBuffer()))
          if (!header.includes('V_VP9') || header.includes('A_OPUS') || header.includes('A_VORBIS')) throw new Error('视频须为无音轨 VP9 WebM')
          info = await videoInfo(file)
        } else info = await imageInfo(file)
        return { media: file, kind: webm ? 'video' : 'image', poster: info.poster, bounds: info.bounds, width: info.width, height: info.height }
      }
      function compareSignedDecimal(value, target) {
        if (!/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(String(target))) return null
        var negative = String(value).charAt(0) === '-'
        var otherNegative = String(target).charAt(0) === '-'
        if (negative !== otherNegative) return negative ? -1 : 1
        var compared = compareDecimals(negative ? String(value).slice(1) : String(value), otherNegative ? String(target).slice(1) : String(target))
        return negative ? -compared : compared
      }
      function matchesCondition(condition, event) {
        if (condition.field === 'currency') return event.currency === condition.value.toUpperCase()
        if (condition.field === 'error-code') return event.code === condition.value
        if (condition.field === 'idle') return Boolean(event.idle) === (condition.value === 'true')
        if (condition.field === 'idle-seconds-min') return Number(event.idleSeconds) >= Number(condition.value)
        if (condition.field === 'hour-from' || condition.field === 'hour-to') {
          var hour = Number(condition.value)
          if (!Number.isInteger(hour) || hour < 0 || hour > 23) return false
          return condition.field === 'hour-from' ? event.hour >= hour : event.hour <= hour
        }
        var comparison = compareSignedDecimal(String(event.delta || '').replace(/^-/, ''), condition.value)
        return comparison !== null && (condition.field === 'amount-min' ? comparison >= 0 : comparison <= 0)
      }
      function matchingRules(scheme, event, now) {
        if (!scheme) return []
        var matches = []
        scheme.custom.forEach(function (slot, slotIndex) {
          slot.rules.forEach(function (rule, ruleIndex) {
            if (rule.event !== event.type || !rule.conditions.every(function (condition) { return matchesCondition(condition, event) })) return
            var key = scheme.id + ':' + slot.id + ':' + ruleIndex
            if (now - (lastFired.get(key) || -Infinity) < rule.cooldown * 1000) return
            matches.push({ slot: slot, rule: rule, key: key, order: slotIndex * 100 + ruleIndex })
          })
        })
        return matches.sort(function (a, b) { return b.rule.priority - a.rule.priority || a.order - b.order })
      }
      function dispatchBatch(events) {
        var scheme = selectedScheme()
        var candidates = []
        events.forEach(function (event, index) {
          matchingRules(scheme, event, Date.now()).forEach(function (match) { candidates.push({ event: event, match: match, index: index }) })
        })
        candidates.sort(function (a, b) { return b.match.rule.priority - a.match.rule.priority || a.index - b.index || a.match.order - b.match.order })
        var winner = candidates[0]
        var event = winner?.event || events[0]
        var chosen = winner?.match || null
        if (chosen) lastFired.set(chosen.key, Date.now())
        publish({ event: Object.assign({ sequence: ++eventNumber, chosen: chosen }, event), preview: null })
      }
      function dispatch(event) { dispatchBatch([event]) }
      function preview(slot) { publish({ preview: { slot: slot, sequence: ++eventNumber } }) }
      function newScheme(source) {
        var id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'pet-' + Date.now() + '-' + Math.random().toString(36).slice(2)
        return { id: id, name: source?.name ? source.name + ' 副本' : '我的桌宠', cover: source?.cover || null,
          slots: Object.assign({ idle: null, loading: null, decrease: null, increase: null, error: null }, source?.slots || {}), custom: source?.custom?.slice() || [] }
      }
      return { subscribe: subscribe, snapshot: snapshot, selectedScheme: selectedScheme, select: select, reload: reload,
        saveScheme: saveScheme, removeScheme: removeScheme, newScheme: newScheme, importMedia: importMedia, dispatch: dispatch,
        dispatchBatch: dispatchBatch, preview: preview, matchingRules: matchingRules, validateScheme: validateScheme,
        conditionFields: conditionFields, matchesCondition: matchesCondition, BASE_SLOTS: BASE_SLOTS, EVENT_TYPES: EVENT_TYPES }
    })()
    void petStudio.reload()
