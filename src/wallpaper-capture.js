const routeRoot = '/dsh-deepseek-balance/api/wallpapers/render'
const sessionMatch = /^\/dsh-deepseek-balance\/api\/wallpapers\/render\/capture\/([0-9a-f-]{36})$/i.exec(location.pathname)
const sessionId = sessionMatch?.[1]
const shareButton = document.getElementById('share')
const status = document.getElementById('status')
const preview = document.getElementById('preview')
let connection
let capturedStream
let closed = false
let heartbeatTimer = null

function setStatus(message, isError = false) {
  status.textContent = message
  status.style.color = isError ? '#ffb8ac' : '#a9d6ff'
}

async function readJson(response) {
  const body = await response.json().catch(() => null)
  if (!response.ok || !body?.ok) throw new Error(body?.code || 'WALLPAPER_RENDER_FAILED')
  return body
}

async function waitForOffer() {
  const expiresAt = Date.now() + 120_000
  while (Date.now() < expiresAt) {
    const response = await fetch(`${routeRoot}/session/${sessionId}/offer`, { credentials: 'same-origin', cache: 'no-store' })
    if (response.status === 202) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      continue
    }
    const body = await readJson(response)
    return body.signal
  }
  throw new Error('WALLPAPER_RENDER_PAIRING_TIMEOUT')
}

function waitForIceGathering(connection) {
  if (connection.iceGatheringState === 'complete') return Promise.resolve()
  return new Promise((resolve) => {
    const finish = () => {
      clearTimeout(timer)
      connection.removeEventListener('icegatheringstatechange', onChange)
      resolve()
    }
    const onChange = () => { if (connection.iceGatheringState === 'complete') finish() }
    const timer = setTimeout(finish, 8000)
    connection.addEventListener('icegatheringstatechange', onChange)
  })
}

async function closeSession() {
  if (closed || !sessionId) return
  closed = true
  if (heartbeatTimer) clearInterval(heartbeatTimer)
  heartbeatTimer = null
  try {
    await fetch(`${routeRoot}/close`, {
      method: 'POST',
      credentials: 'same-origin',
      keepalive: true,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
  } catch {}
}

function stopLocalCapture(message) {
  if (closed) return
  closed = true
  if (heartbeatTimer) clearInterval(heartbeatTimer)
  heartbeatTimer = null
  capturedStream?.getTracks().forEach((track) => track.stop())
  connection?.close()
  setStatus(message, true)
}

async function sendHeartbeat() {
  if (closed || !sessionId) return
  try {
    const response = await fetch(`${routeRoot}/session/${sessionId}/heartbeat`, {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ peer: 'capture' }),
    })
    await readJson(response)
  } catch (error) {
    if (['WALLPAPER_RENDER_SESSION_EXPIRED', 'WALLPAPER_RENDER_SIGNAL_FORBIDDEN'].includes(error?.message)) {
      stopLocalCapture('DeepSeek Harness 会话已结束；请返回设置重新应用此壁纸。')
    }
  }
}

shareButton.addEventListener('click', async () => {
  if (!sessionId || !window.isSecureContext || !navigator.mediaDevices?.getDisplayMedia || typeof RTCPeerConnection !== 'function') {
    setStatus('当前浏览器不支持安全的窗口捕获。请使用最新版 Chrome 或 Edge。', true)
    return
  }
  shareButton.disabled = true
  setStatus('请选择“Wallpaper Engine”窗口。捕获只会在你批准后开始。')
  try {
    // Request capture synchronously from this click so the browser preserves its user-gesture requirement.
    const capturePromise = navigator.mediaDevices.getDisplayMedia({
      audio: false,
      video: { displaySurface: 'window', cursor: 'never', frameRate: { ideal: 30, max: 60 } },
    }).then((stream) => {
      capturedStream = stream
      if (closed) {
        stream.getTracks().forEach((track) => track.stop())
        throw new Error('WALLPAPER_RENDER_SESSION_EXPIRED')
      }
      return stream
    })
    const offerPromise = waitForOffer()
    const [stream, offer] = await Promise.all([capturePromise, offerPromise])
    const track = stream.getVideoTracks()[0]
    const displaySurface = track?.getSettings?.().displaySurface
    if (!track || (displaySurface && displaySurface !== 'window')) throw new Error('WALLPAPER_RENDER_SELECT_WINDOW')
    connection = new RTCPeerConnection({ iceServers: [] })
    stream.getTracks().forEach((mediaTrack) => connection.addTrack(mediaTrack, stream))
    await connection.setRemoteDescription(offer)
    const answer = await connection.createAnswer()
    await connection.setLocalDescription(answer)
    await waitForIceGathering(connection)
    const response = await fetch(`${routeRoot}/session/${sessionId}/answer`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ peer: 'capture', signal: connection.localDescription }),
    })
    await readJson(response)
    preview.srcObject = stream
    await preview.play().catch(() => {})
    setStatus('窗口已连接；壁纸正在共享。关闭此页或停止共享即可结束捕获。')
    heartbeatTimer = setInterval(() => { void sendHeartbeat() }, 30_000)
    track.addEventListener('ended', () => { void closeSession(); setStatus('窗口共享已停止。') }, { once: true })
  } catch (error) {
    capturedStream?.getTracks().forEach((track) => track.stop())
    connection?.close()
    await closeSession()
    const code = String(error?.message || '')
    setStatus(code === 'WALLPAPER_RENDER_SELECT_WINDOW'
      ? '请选择单独的 Wallpaper Engine 窗口，不要共享整个屏幕。'
      : error?.name === 'NotAllowedError' ? '你取消或拒绝了窗口共享，当前壁纸没有启用。'
        : error?.name === 'NotReadableError' ? '浏览器无法读取所选窗口。请关闭该窗口的其他共享，再返回插件重试。'
          : code === 'WALLPAPER_RENDER_SESSION_EXPIRED' ? '配对会话已结束。请返回 DeepSeek Harness 重新点击“应用背景”。'
            : code === 'WALLPAPER_RENDER_SIGNAL_CONFLICT' ? '此配对会话已被使用。请返回 DeepSeek Harness 重新应用壁纸。'
              : '窗口已选择，但本机画面连接失败。请返回 DeepSeek Harness 重新应用，并再次选择页面显示的 Wallpaper Engine 窗口。', true)
    shareButton.textContent = '返回 DeepSeek Harness 重新应用'
    shareButton.disabled = true
  }
})

window.addEventListener('pagehide', () => {
  if (heartbeatTimer) clearInterval(heartbeatTimer)
  heartbeatTimer = null
  capturedStream?.getTracks().forEach((track) => track.stop())
  connection?.close()
  if (sessionId && !closed) {
    navigator.sendBeacon(`${routeRoot}/close`, new Blob([JSON.stringify({ sessionId })], { type: 'application/json' }))
  }
})
