export const DEEPSEEK_BALANCE_URL = 'https://api.deepseek.com/user/balance'
export const DEFAULT_API_KEY_ENV = 'DEEPSEEK_API_KEY'
export const DEFAULT_TIMEOUT_MS = 8_000
export const MAX_RESPONSE_BYTES = 64 * 1024

const MAX_BALANCE_ITEMS = 16
const ENV_NAME_PATTERN = /^[A-Z_][A-Z0-9_]*$/
const CURRENCY_PATTERN = /^[A-Z]{3,8}$/
const DECIMAL_PATTERN = /^(?:0|[1-9]\d{0,29})(?:\.\d{1,18})?$/

export class BalancePluginError extends Error {
  constructor(code, status = 502) {
    super(code)
    this.name = 'BalancePluginError'
    this.code = code
    this.status = status
  }
}

function asApiKeyEnv(value) {
  const candidate = typeof value === 'string' ? value.trim() : DEFAULT_API_KEY_ENV
  if (!ENV_NAME_PATTERN.test(candidate)) {
    throw new BalancePluginError('CONFIG_INVALID', 500)
  }
  return candidate
}

function asTimeout(value) {
  if (value === undefined) return DEFAULT_TIMEOUT_MS
  if (!Number.isInteger(value) || value < 1_000 || value > 30_000) {
    throw new BalancePluginError('CONFIG_INVALID', 500)
  }
  return value
}

function asDecimal(value) {
  if (typeof value !== 'string' || !DECIMAL_PATTERN.test(value)) {
    throw new BalancePluginError('UPSTREAM_INVALID_RESPONSE', 502)
  }
  return value
}

function parseBalanceInfo(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new BalancePluginError('UPSTREAM_INVALID_RESPONSE', 502)
  }
  if (typeof value.currency !== 'string' || !CURRENCY_PATTERN.test(value.currency)) {
    throw new BalancePluginError('UPSTREAM_INVALID_RESPONSE', 502)
  }
  return Object.freeze({
    currency: value.currency,
    totalBalance: asDecimal(value.total_balance),
    grantedBalance: asDecimal(value.granted_balance),
    toppedUpBalance: asDecimal(value.topped_up_balance),
  })
}

export function parseBalancePayload(payload, now = () => new Date()) {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new BalancePluginError('UPSTREAM_INVALID_RESPONSE', 502)
  }
  if (typeof payload.is_available !== 'boolean' || !Array.isArray(payload.balance_infos)) {
    throw new BalancePluginError('UPSTREAM_INVALID_RESPONSE', 502)
  }
  if (payload.balance_infos.length > MAX_BALANCE_ITEMS) {
    throw new BalancePluginError('UPSTREAM_INVALID_RESPONSE', 502)
  }

  const balances = payload.balance_infos.map(parseBalanceInfo)
  if (new Set(balances.map((item) => item.currency)).size !== balances.length) {
    throw new BalancePluginError('UPSTREAM_INVALID_RESPONSE', 502)
  }

  const fetchedAt = now()
  if (!(fetchedAt instanceof Date) || Number.isNaN(fetchedAt.getTime())) {
    throw new BalancePluginError('INTERNAL_ERROR', 500)
  }

  return Object.freeze({
    isAvailable: payload.is_available,
    balances: Object.freeze(balances),
    fetchedAt: fetchedAt.toISOString(),
  })
}

function errorForStatus(status) {
  if (status === 401 || status === 403) {
    return new BalancePluginError('UPSTREAM_AUTH_FAILED', 502)
  }
  if (status === 402) {
    return new BalancePluginError('UPSTREAM_NO_BALANCE', 402)
  }
  if (status === 429) {
    return new BalancePluginError('UPSTREAM_RATE_LIMIT', 429)
  }
  return new BalancePluginError('UPSTREAM_UNAVAILABLE', 502)
}

function headerValue(response, name) {
  return response?.headers && typeof response.headers.get === 'function'
    ? response.headers.get(name)
    : null
}

async function readLimitedText(response, maximumBytes) {
  const declaredLength = Number(headerValue(response, 'content-length'))
  if (Number.isFinite(declaredLength) && declaredLength > maximumBytes) {
    throw new BalancePluginError('UPSTREAM_INVALID_RESPONSE', 502)
  }

  if (response.body && typeof response.body.getReader === 'function') {
    const reader = response.body.getReader()
    const chunks = []
    let total = 0
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        total += value.byteLength
        if (total > maximumBytes) {
          await reader.cancel()
          throw new BalancePluginError('UPSTREAM_INVALID_RESPONSE', 502)
        }
        chunks.push(value)
      }
    } finally {
      reader.releaseLock?.()
    }
    const combined = new Uint8Array(total)
    let offset = 0
    for (const chunk of chunks) {
      combined.set(chunk, offset)
      offset += chunk.byteLength
    }
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(combined)
    } catch {
      throw new BalancePluginError('UPSTREAM_INVALID_RESPONSE', 502)
    }
  }

  const text = await response.text()
  if (Buffer.byteLength(text, 'utf8') > maximumBytes) {
    throw new BalancePluginError('UPSTREAM_INVALID_RESPONSE', 502)
  }
  return text
}

async function requestBalance({ apiKey, endpoint, fetchImpl, timeoutMs, now }) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchImpl(endpoint, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      redirect: 'error',
      cache: 'no-store',
      signal: controller.signal,
    })

    if (!response || typeof response.ok !== 'boolean' || typeof response.status !== 'number') {
      throw new BalancePluginError('UPSTREAM_INVALID_RESPONSE', 502)
    }
    if (!response.ok) throw errorForStatus(response.status)

    const contentType = headerValue(response, 'content-type')?.toLowerCase()
    if (typeof contentType !== 'string' || (!contentType.includes('application/json') && !contentType.includes('+json'))) {
      throw new BalancePluginError('UPSTREAM_INVALID_RESPONSE', 502)
    }

    const raw = await readLimitedText(response, MAX_RESPONSE_BYTES)
    let payload
    try {
      payload = JSON.parse(raw)
    } catch {
      throw new BalancePluginError('UPSTREAM_INVALID_RESPONSE', 502)
    }
    return parseBalancePayload(payload, now)
  } catch (error) {
    if (error instanceof BalancePluginError) throw error
    if (controller.signal.aborted || error?.name === 'AbortError') {
      throw new BalancePluginError('UPSTREAM_TIMEOUT', 504)
    }
    throw new BalancePluginError('UPSTREAM_NETWORK', 502)
  } finally {
    clearTimeout(timeout)
  }
}

export function createBalanceReader(options = {}) {
  const env = options.env ?? process.env
  const apiKeyEnv = asApiKeyEnv(options.apiKeyEnv)
  const endpoint = options.endpoint ?? DEEPSEEK_BALANCE_URL
  const fetchImpl = options.fetchImpl ?? globalThis.fetch
  const timeoutMs = asTimeout(options.timeoutMs)
  const now = options.now ?? (() => new Date())
  const resolveApiKey = options.resolveApiKey

  if (typeof fetchImpl !== 'function' || endpoint !== DEEPSEEK_BALANCE_URL) {
    throw new BalancePluginError('CONFIG_INVALID', 500)
  }

  let active = null

  return async function readBalance() {
    const rawKey = typeof resolveApiKey === 'function'
      ? await resolveApiKey()
      : env[apiKeyEnv]
    const apiKey = typeof rawKey === 'string' ? rawKey.trim() : ''
    if (apiKey === '') throw new BalancePluginError('CONFIG_MISSING', 503)

    if (active?.apiKey === apiKey) return active.promise

    const promise = requestBalance({ apiKey, endpoint, fetchImpl, timeoutMs, now })
      .finally(() => {
        if (active?.promise === promise) active = null
      })
    active = { apiKey, promise }
    return promise
  }
}
