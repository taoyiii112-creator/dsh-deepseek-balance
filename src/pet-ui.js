    // Inserted into the client factory by scripts/build.mjs.
    function PetRuntime(props) {
      var studio = React.useSyncExternalStore(petStudio.subscribe, petStudio.snapshot, petStudio.snapshot)
      var reduced = useReducedMotion()
      var _position = React.useState(readPetPosition), position = _position[0], setPosition = _position[1]
      var _phase = React.useState('video'), phase = _phase[0], setPhase = _phase[1]
      var _active = React.useState(null), active = _active[0], setActive = _active[1]
      var _revision = React.useState(0), revision = _revision[0], setRevision = _revision[1]
      var _failed = React.useState(false), failed = _failed[0], setFailed = _failed[1]
      var _imageFailed = React.useState(false), imageFailed = _imageFailed[0], setImageFailed = _imageFailed[1]
      var _visible = React.useState(document.visibilityState !== 'hidden'), visible = _visible[0], setVisible = _visible[1]
      var _urls = React.useState(null), urls = _urls[0], setUrls = _urls[1]
      var _builtinBounds = React.useState({ left: 0, top: 0, right: 1, bottom: 1 }), builtinBounds = _builtinBounds[0], setBuiltinBounds = _builtinBounds[1]
      var drag = React.useRef(null)
      var frameRef = React.useRef(null)
      var videoRef = React.useRef(null)
      var idleSince = React.useRef(Date.now())
      var positionRef = React.useRef(position); positionRef.current = position
      var scheme = petStudio.selectedScheme()
      var slot = active?.slot || (scheme ? scheme.slots.idle : { media: null, poster: null, kind: 'video' })
      var bounds = slot?.bounds || builtinBounds
      var imageUrl = slot?.media ? (reduced || failed || phase === 'static' ? urls?.poster : urls?.media) : PET_IMAGE_PATH
      var videoUrl = slot?.media ? urls?.media : PET_VIDEO_PATH
      var mediaKind = slot?.media ? slot.kind : 'video'

      React.useEffect(function () {
        var update = function () { setVisible(document.visibilityState !== 'hidden') }
        document.addEventListener('visibilitychange', update)
        return function () { document.removeEventListener('visibilitychange', update) }
      }, [])
      React.useEffect(function () {
        var cancelled = false
        Promise.all([fetch(PET_VIDEO_PATH), fetch(PET_IMAGE_PATH)]).then(function (responses) {
          if (!responses.every(function (response) { return response.ok })) throw new Error('builtin media unavailable')
          return Promise.all(responses.map(function (response) { return response.blob() }))
        }).then(function (blobs) {
          return Promise.all([
            petStudio.importMedia(new File([blobs[0]], 'idle.webm', { type: 'video/webm' })),
            petStudio.importMedia(new File([blobs[1]], 'idle.png', { type: 'image/png' }))
          ])
        }).then(function (items) {
          if (cancelled) return
          setBuiltinBounds({
            left: Math.min(items[0].bounds.left, items[1].bounds.left),
            top: Math.min(items[0].bounds.top, items[1].bounds.top),
            right: Math.max(items[0].bounds.right, items[1].bounds.right),
            bottom: Math.max(items[0].bounds.bottom, items[1].bounds.bottom)
          })
        }).catch(function () {})
        return function () { cancelled = true }
      }, [])
      React.useEffect(function () {
        if (!props.hidden) return
        setActive(null); setPhase('video'); setFailed(false)
      }, [props.hidden])
      React.useEffect(function () { if (!active) idleSince.current = Date.now() }, [active])
      React.useEffect(function () {
        setActive(null); setPhase('video'); setFailed(false); setImageFailed(false); setRevision(function (value) { return value + 1 })
      }, [studio.selectedId, studio.revision])
      React.useEffect(function () {
        if (!slot?.media) { setUrls(null); return undefined }
        var next = { media: URL.createObjectURL(slot.media), poster: URL.createObjectURL(slot.poster || scheme?.cover || slot.media) }
        setUrls(next)
        return function () { URL.revokeObjectURL(next.media); URL.revokeObjectURL(next.poster) }
      }, [slot, scheme])
      React.useEffect(function () {
        var video = videoRef.current
        if (!video || props.hidden || !visible || reduced || failed || phase === 'static' || mediaKind !== 'video') return undefined
        try {
          video.muted = true
          var play = video.play()
          play?.catch?.(function () { setFailed(true); setPhase('static') })
        } catch { setFailed(true); setPhase('static') }
        return function () { video.pause?.() }
      }, [props.hidden, visible, reduced, failed, phase, mediaKind, videoUrl, revision])
      React.useEffect(function () {
        if (!studio.event || !visible || props.hidden) return
        var event = studio.event
        if (event.type === 'local-time' && active?.rule?.play === 'until-end' && active.rule.event === 'local-time') {
          if (active.rule.conditions.every(function (condition) { return petStudio.matchesCondition(condition, event) })) {
            if (!event.chosen || event.chosen.rule === active.rule) return
          } else setActive(null)
        }
        if (event.type === 'query-success' || event.type === 'query-failure') {
          if (active?.rule?.play === 'until-end' && active.rule.event === 'query-start') setActive(null)
        }
        var custom = event.chosen
        var baseKey = event.type === 'query-start' ? 'loading' : event.type === 'query-failure' ? 'error' :
          event.type === 'balance-decrease' ? 'decrease' : event.type === 'balance-increase' ? 'increase' : null
        var base = baseKey && scheme?.slots[baseKey]?.media ? scheme.slots[baseKey] : null
        if (!custom && !base) return
        if (custom && custom.rule.base === 'after' && base) {
          setActive({ slot: base, queued: custom.slot, rule: custom.rule })
        } else setActive({ slot: custom?.slot || base, rule: custom?.rule || null })
        setPhase('video'); setFailed(false); setImageFailed(false); setRevision(function (value) { return value + 1 })
      }, [studio.event?.sequence])
      React.useEffect(function () {
        if (!studio.preview || props.hidden) return
        setActive({ slot: studio.preview.slot, preview: true })
        setPhase('video'); setFailed(false); setImageFailed(false); setRevision(function (value) { return value + 1 })
      }, [studio.preview?.sequence])
      React.useEffect(function () {
        if (props.hidden || !visible || reduced) return undefined
        if (phase !== 'static' && !(active && (mediaKind !== 'video' || failed))) return undefined
        var seconds = active ? Math.max(1, Math.min(60, Number(active.rule?.duration || 3))) : PET_STATIC_DURATION / 1000
        var timer = setTimeout(function () {
          if (active?.rule?.play === 'until-end') return
          if (active?.queued) setActive({ slot: active.queued, rule: active.rule })
          else if (active) setActive(null)
          else { petStudio.dispatch({ type: 'idle-cycle', idle: true }); setPhase('video') }
          setRevision(function (value) { return value + 1 })
        }, seconds * 1000)
        return function () { clearTimeout(timer) }
      }, [props.hidden, visible, reduced, phase, active, mediaKind, failed])
      React.useEffect(function () {
        if (props.hidden || !visible || reduced) return undefined
        var timer = setInterval(function () {
          var events = [{ type: 'local-time', hour: new Date().getHours(), idle: !active }]
          if (!active) events.push({ type: 'idle-duration', idle: true, idleSeconds: Math.floor((Date.now() - idleSince.current) / 1000) })
          petStudio.dispatchBatch(events)
        }, 60000)
        return function () { clearInterval(timer) }
      }, [props.hidden, visible, reduced, active])
      React.useEffect(function () {
        var resize = function () {
          var scale = Math.max(.5, Math.min(2, Number(props.scale || 100) / 100))
          var width = Math.min(180 * scale, window.innerWidth * .28 * scale)
          var height = frameRef.current?.getBoundingClientRect?.().height || width
          setPosition(function (current) {
            var next = {
              right: Math.max(-width * (1 - bounds.right), Math.min(current.right, window.innerWidth - width * (1 - bounds.left))),
              bottom: Math.max(-height * (1 - bounds.bottom), Math.min(current.bottom, window.innerHeight - height * (1 - bounds.top)))
            }
            writePetPosition(next); return next
          })
        }
        window.addEventListener('resize', resize)
        resize()
        return function () { window.removeEventListener('resize', resize) }
      }, [bounds.left, bounds.top, bounds.right, bounds.bottom, props.scale])
      React.useEffect(function () {
        if (!props.resetRevision) return
        var next = { right: 24, bottom: 76 }
        writePetPosition(next); setPosition(next)
      }, [props.resetRevision])
      function endVideo() {
        if (active?.rule?.play === 'until-end') { setPhase('static'); return }
        if (active?.queued) setActive({ slot: active.queued, rule: active.rule })
        else if (active) setActive(null)
        else { petStudio.dispatch({ type: 'idle-cycle', idle: true }); setPhase('static') }
        setRevision(function (value) { return value + 1 })
      }
      function pointerDown(event) {
        if (event.button !== undefined && event.button !== 0) return
        var rect = frameRef.current?.getBoundingClientRect?.() || event.currentTarget.getBoundingClientRect()
        drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, right: position.right, bottom: position.bottom, width: rect.width, height: rect.height, moved: false }
        event.currentTarget.setPointerCapture?.(event.pointerId)
        event.preventDefault?.()
      }
      function pointerMove(event) {
        var start = drag.current
        if (!start || (start.id !== undefined && event.pointerId !== start.id)) return
        var dx = event.clientX - start.x, dy = event.clientY - start.y
        if (!start.moved && Math.abs(dx) + Math.abs(dy) > 4) {
          start.moved = true
          if (!active) { setPhase('video'); setRevision(function (value) { return value + 1 }) }
        }
        var width = Math.max(1, start.width), height = Math.max(1, start.height)
        var right = Math.max(-width * (1 - bounds.right), Math.min(start.right - dx, window.innerWidth - width * (1 - bounds.left)))
        var bottom = Math.max(-height * (1 - bounds.bottom), Math.min(start.bottom - dy, window.innerHeight - height * (1 - bounds.top)))
        setPosition({ right: right, bottom: bottom })
      }
      function pointerUp(event) {
        var start = drag.current
        if (!start || (start.id !== undefined && event.pointerId !== start.id)) return
        drag.current = null
        writePetPosition(positionRef.current)
        if (!start.moved) {
          petStudio.dispatch({ type: 'pet-click', idle: !active })
          if (!petStudio.snapshot().event?.chosen) { setActive(null); setPhase('video'); setRevision(function (value) { return value + 1 }) }
        } else if (!active) { setPhase('video'); setRevision(function (value) { return value + 1 }) }
      }
      if (props.hidden || !visible || imageFailed || (scheme && !slot) || (slot?.media && !urls)) return null
      var scale = Math.max(.5, Math.min(2, Number(props.scale || 100) / 100))
      var petWidth = Math.max(1, Math.min(180 * scale, window.innerWidth * .28 * scale))
      var frameStyle = Object.assign({}, styles.petFrame, { right: position.right, bottom: position.bottom, width: petWidth, maxWidth: petWidth, border: 0, background: 'transparent', pointerEvents: 'none' })
      var hitStyle = { position: 'absolute', left: bounds.left * 100 + '%', top: bounds.top * 100 + '%', width: (bounds.right - bounds.left) * 100 + '%', height: (bounds.bottom - bounds.top) * 100 + '%', pointerEvents: 'auto', touchAction: 'none', cursor: 'grab' }
      var media = reduced || failed || phase === 'static' || mediaKind !== 'video'
        ? h('img', { src: imageUrl, alt: '', draggable: false, style: styles.petMedia, onError: function () { if (active) setActive(null); else setImageFailed(true) } })
        : h('video', { key: 'pet-video-' + revision, ref: videoRef, src: videoUrl, muted: true, autoPlay: true, playsInline: true, preload: 'auto', controls: false, loop: active?.rule?.play === 'until-end',
          style: styles.petMedia, onEnded: endVideo, onError: function () { setFailed(true); setPhase('static') } })
      return h('div', { ref: frameRef, style: frameStyle, 'aria-label': 'DeepSeek pet' }, media,
        h('div', { style: hitStyle, onPointerDown: pointerDown, onPointerMove: pointerMove, onPointerUp: pointerUp, onPointerCancel: pointerUp }))
    }

    function PetCover(props) {
      var _url = React.useState(null), url = _url[0], setUrl = _url[1]
      React.useEffect(function () {
        if (!props.blob) return undefined
        var next = URL.createObjectURL(props.blob)
        setUrl(next)
        return function () { URL.revokeObjectURL(next) }
      }, [props.blob])
      return h('img', { src: props.blob ? url : PET_IMAGE_PATH, alt: '', style: { width: 36, height: 36, objectFit: 'contain', verticalAlign: 'middle' } })
    }

    function PetEditor(props) {
      var studio = React.useSyncExternalStore(petStudio.subscribe, petStudio.snapshot, petStudio.snapshot)
      var _draft = React.useState(null), draft = _draft[0], setDraft = _draft[1]
      var _message = React.useState(''), message = _message[0], setMessage = _message[1]
      var _busy = React.useState(false), busy = _busy[0], setBusy = _busy[1]
      React.useEffect(function () { void petStudio.reload() }, [])
      function edit(scheme) { setDraft(scheme ? Object.assign({}, scheme, { slots: Object.assign({}, scheme.slots), custom: scheme.custom.slice() }) : petStudio.newScheme(null)); setMessage('') }
      async function copyBuiltin() {
        setBusy(true); setMessage('')
        try {
          var results = await Promise.all([fetch(PET_VIDEO_PATH), fetch(PET_IMAGE_PATH)])
          if (!results.every(function (result) { return result.ok })) throw new Error('无法读取内置素材')
          var video = new File([await results[0].blob()], 'idle.webm', { type: 'video/webm' })
          var image = new File([await results[1].blob()], 'idle.png', { type: 'image/png' })
          var idle = await petStudio.importMedia(video)
          var cover = await petStudio.importMedia(image)
          var next = petStudio.newScheme(null)
          next.name = '内置桌宠副本'; next.cover = cover.poster; next.slots.idle = idle
          setDraft(next)
        } catch (error) { setMessage(error.message) }
        finally { setBusy(false) }
      }
      function change(field, value) { setDraft(Object.assign({}, draft, { [field]: value })) }
      function slotChange(key, slot) { setDraft(function (current) { return Object.assign({}, current, { slots: Object.assign({}, current.slots, { [key]: slot }), cover: key === 'idle' && !current.cover ? slot.poster : current.cover }) }) }
      async function importSlot(key, file) {
        if (!file) return
        setBusy(true); setMessage('')
        try {
          var slot = await petStudio.importMedia(file)
          slotChange(key, slot)
        } catch (error) { setMessage(error.message) }
        finally { setBusy(false) }
      }
      async function importCover(file) {
        if (!file) return
        setBusy(true)
        try {
          var cover = await petStudio.importMedia(file)
          if (cover.kind !== 'image') throw new Error('封面请选择透明静态图片')
          change('cover', cover.poster)
        } catch (error) { setMessage(error.message) }
        finally { setBusy(false) }
      }
      function updateCustom(index, patch) {
        var next = draft.custom.slice(); next[index] = Object.assign({}, next[index], patch)
        change('custom', next)
      }
      function addCustom() {
        if (draft.custom.length >= 5) return
        change('custom', draft.custom.concat({ id: 'scene-' + Date.now() + '-' + Math.random().toString(36).slice(2), name: '', media: null, poster: null, rules: [] }))
      }
      async function save() {
        setBusy(true); setMessage('')
        try { await petStudio.saveScheme(draft); setDraft(null) }
        catch (error) { setMessage(error.message) }
        finally { setBusy(false) }
      }
      async function remove(id) {
        if (!window.confirm('确定删除这个桌宠方案及其本地素材吗？')) return
        setBusy(true)
        try { await petStudio.removeScheme(id); setDraft(null) } catch (error) { setMessage(error.message) }
        finally { setBusy(false) }
      }
      var button = Object.assign({}, dialogStyles.button, { margin: 3 })
      var input = Object.assign({}, dialogStyles.input, { margin: '4px 0 8px' })
      if (!draft) return h('div', null,
        h('p', null, '方案保存在本机当前 DeepSeek Harness 配置中；清除应用数据或删除 profile 会删除用户方案。内置方案不占 3 个名额。'),
        h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } },
          h('button', { type: 'button', style: button, onClick: function () { petStudio.select('builtin') } }, h(PetCover, null), '内置桌宠' + (studio.selectedId === 'builtin' ? ' ✓' : '')),
          studio.schemes.map(function (scheme) { return h('span', { key: scheme.id },
            h('button', { type: 'button', style: button, onClick: function () { petStudio.select(scheme.id) } }, h(PetCover, { blob: scheme.cover }), scheme.name + (studio.selectedId === scheme.id ? ' ✓' : '')),
            h('button', { type: 'button', style: button, onClick: function () { edit(scheme) } }, '编辑')) })
        ),
        h('button', { type: 'button', style: button, disabled: studio.schemes.length >= 3, onClick: function () { edit(null) } }, '导入新方案（' + studio.schemes.length + '/3）'),
        h('button', { type: 'button', style: button, disabled: busy || studio.schemes.length >= 3, onClick: function () { void copyBuiltin() } }, '复制内置方案'),
        h('p', { role: 'status' }, studio.error || message))

      return h('div', null,
        h('label', null, '方案名称', h('input', { style: input, maxLength: 24, value: draft.name, onChange: function (event) { change('name', event.target.value) } })),
        h('label', null, '透明封面', h('input', { type: 'file', accept: '.png,.webp', onChange: function (event) { void importCover(event.target.files?.[0]) } })),
        h('p', null, '场景槽位 ' + (5 + draft.custom.length) + '/10；视频必须无音轨、带真实透明像素。'),
        petStudio.BASE_SLOTS.map(function (key) { return h('div', { key: key, style: { marginBottom: 8 } },
          h('label', null, ({ idle: '待机（必填）', loading: '查询中', decrease: '余额减少', increase: '余额增加', error: '错误' })[key],
            h('input', { type: 'file', accept: '.webm,.png,.webp', onChange: function (event) { void importSlot(key, event.target.files?.[0]) } })),
          draft.slots[key]?.media ? h('span', null, ' 已导入 ', draft.slots[key].media.name || '媒体') : h('span', null, ' 空槽位')) }),
        draft.custom.map(function (slot, index) { return h('fieldset', { key: slot.id, style: { margin: '10px 0', border: '1px solid #8885', borderRadius: 8 } },
          h('legend', null, '自定义槽位 ' + (index + 1)),
          h('input', { style: input, maxLength: 24, placeholder: '场景名称', value: slot.name, onChange: function (event) { updateCustom(index, { name: event.target.value }) } }),
          h('input', { type: 'file', accept: '.webm,.png,.webp', onChange: function (event) { var file = event.target.files?.[0]; if (file) { setBusy(true); petStudio.importMedia(file).then(function (media) { updateCustom(index, media) }).catch(function (error) { setMessage(error.message) }).finally(function () { setBusy(false) }) } } }),
          h('button', { type: 'button', style: button, disabled: !slot.media, onClick: function () { petStudio.preview(slot) } }, '播放预览'),
          h('button', { type: 'button', style: button, onClick: function () { change('custom', draft.custom.filter(function (_, n) { return n !== index })) } }, '删除槽位'),
          slot.rules.map(function (rule, ruleIndex) { return h('div', { key: ruleIndex, style: { padding: 6, background: '#8881', margin: 4 } },
            h('label', null, '当 ', h('select', { value: rule.event, onChange: function (event) { var rules = slot.rules.slice(); rules[ruleIndex] = Object.assign({}, rule, { event: event.target.value, conditions: [], play: 'once' }); updateCustom(index, { rules: rules }) } }, petStudio.EVENT_TYPES.map(function (eventName) { return h('option', { key: eventName, value: eventName }, eventName) }))),
            h('label', null, '播放 ', h('select', { value: rule.play, onChange: function (event) { var rules = slot.rules.slice(); rules[ruleIndex] = Object.assign({}, rule, { play: event.target.value }); updateCustom(index, { rules: rules }) } }, h('option', { value: 'once' }, '单次'),
              rule.event === 'query-start' || (rule.event === 'local-time' && rule.conditions.some(function (condition) { return condition.field === 'hour-from' || condition.field === 'hour-to' }))
                ? h('option', { value: 'until-end' }, '至状态结束') : null)),
            h('label', null, '基础动作 ', h('select', { value: rule.base, onChange: function (event) { var rules = slot.rules.slice(); rules[ruleIndex] = Object.assign({}, rule, { base: event.target.value }); updateCustom(index, { rules: rules }) } }, h('option', { value: 'replace' }, '替代'), h('option', { value: 'after' }, '播完后再播'))),
            ['cooldown', 'priority', 'duration'].map(function (field) { return h('label', { key: field }, field, h('input', { type: 'number', style: { width: 62 }, value: rule[field] || 0, onChange: function (event) { var rules = slot.rules.slice(); rules[ruleIndex] = Object.assign({}, rule, { [field]: Number(event.target.value) }); updateCustom(index, { rules: rules }) } })) }),
            rule.conditions.map(function (condition, conditionIndex) { return h('span', { key: conditionIndex },
              h('select', { value: condition.field, onChange: function (event) { var conditions = rule.conditions.slice(); conditions[conditionIndex] = Object.assign({}, condition, { field: event.target.value }); var rules = slot.rules.slice(); rules[ruleIndex] = Object.assign({}, rule, { conditions: conditions }); updateCustom(index, { rules: rules }) } },
                petStudio.conditionFields(rule.event).map(function (field) { return h('option', { key: field, value: field }, field) })),
              h('input', { style: { width: 90 }, value: condition.value, onChange: function (event) { var conditions = rule.conditions.slice(); conditions[conditionIndex] = Object.assign({}, condition, { value: event.target.value }); var rules = slot.rules.slice(); rules[ruleIndex] = Object.assign({}, rule, { conditions: conditions }); updateCustom(index, { rules: rules }) } }),
              h('button', { type: 'button', onClick: function () { var rules = slot.rules.slice(); rules[ruleIndex] = Object.assign({}, rule, { conditions: rule.conditions.filter(function (_, n) { return n !== conditionIndex }) }); updateCustom(index, { rules: rules }) } }, '×')) }),
            h('button', { type: 'button', style: button, disabled: petStudio.conditionFields(rule.event).length === 0, onClick: function () { var rules = slot.rules.slice(); rules[ruleIndex] = Object.assign({}, rule, { conditions: rule.conditions.concat({ field: petStudio.conditionFields(rule.event)[0], value: '' }) }); updateCustom(index, { rules: rules }) } }, '＋且条件'),
            h('button', { type: 'button', style: button, onClick: function () { updateCustom(index, { rules: slot.rules.filter(function (_, n) { return n !== ruleIndex }) }) } }, '删除规则')) }),
          h('button', { type: 'button', style: button, onClick: function () { updateCustom(index, { rules: slot.rules.concat({ event: 'pet-click', conditions: [], play: 'once', base: 'replace', cooldown: 0, priority: 0, duration: 3 }) }) } }, '＋触发规则')) }),
        h('button', { type: 'button', style: button, disabled: draft.custom.length >= 5, onClick: addCustom }, '＋添加自定义槽位'),
        h('p', { role: 'status', style: { color: '#c45151' } }, message),
        h('button', { type: 'button', style: button, onClick: function () { setDraft(null) } }, '取消'),
        h('button', { type: 'button', style: button, disabled: busy, onClick: save }, busy ? '处理中…' : '保存方案'),
        studio.schemes.some(function (item) { return item.id === draft.id }) ? h('button', { type: 'button', style: button, onClick: function () { void remove(draft.id) } }, '删除方案') : null)
    }
