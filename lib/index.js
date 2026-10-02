import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { BalancePluginError, DEFAULT_API_KEY_ENV, createBalanceReader } from './balance.js'
import { mountBalanceRoute, mountPetAssetRoutes, mountWallpaperRoutes } from './http.js'

export const name = 'dsh-deepseek-balance'

const packageUrl = new URL('../package.json', import.meta.url)
const clientUrl = new URL('../client/client.js', import.meta.url)
const petAssetRoot = new URL('../client/assets/pet/', import.meta.url)
let runtimeInfoPromise

function readRuntimeInfo() {
  if (!runtimeInfoPromise) {
    runtimeInfoPromise = Promise.all([
      readFile(packageUrl, 'utf8'),
      readFile(clientUrl),
    ]).then(([packageText, clientBytes]) => {
      const packageManifest = JSON.parse(packageText)
      return Object.freeze({
        pluginVersion: packageManifest.version,
        clientSha256: createHash('sha256').update(clientBytes).digest('hex').toUpperCase(),
      })
    }).catch(() => Object.freeze({ pluginVersion: 'unknown', clientSha256: null }))
  }
  return runtimeInfoPromise
}

export function apply(ctx, config = {}) {
  ctx.inject(['webServer', 'credentials'], (hostCtx) => {
    const webServer = hostCtx.get?.('webServer') ?? hostCtx.webServer
    const credentials = typeof hostCtx.get === 'function'
      ? hostCtx.get('credentials')
      : undefined
    const apiKeyEnv = config.apiKeyEnv ?? DEFAULT_API_KEY_ENV
    const readBalance = createBalanceReader({
      apiKeyEnv,
      timeoutMs: config.timeoutMs,
      resolveApiKey: typeof credentials?.resolve === 'function'
        ? async () => (await credentials.resolve(apiKeyEnv))?.value
        : undefined,
    })
    const describeApiKey = typeof credentials?.describe === 'function'
      ? () => credentials.describe(apiKeyEnv)
      : undefined
    const saveApiKey = typeof credentials?.set === 'function'
      ? async (value) => {
        try {
          await credentials.set(apiKeyEnv, value)
        } catch (error) {
          const info = typeof credentials.describe === 'function'
            ? await credentials.describe(apiKeyEnv).catch(() => undefined)
            : undefined
          if (info?.source === 'env' || info?.writable === false) {
            throw new BalancePluginError('CONFIG_ENV_READONLY', 409)
          }
          throw new BalancePluginError('CONFIG_WRITE_FAILED', 503)
        }
      }
      : undefined
    hostCtx.effect(
      () => {
        const disposeBalance = mountBalanceRoute(webServer, readBalance, {
          describeApiKey,
          saveApiKey,
          runtimeInfo: readRuntimeInfo,
        })
        const disposePetAssets = mountPetAssetRoutes(webServer, petAssetRoot)
        const disposeWallpapers = mountWallpaperRoutes(webServer)
        return () => {
          disposeWallpapers()
          disposePetAssets()
          disposeBalance()
        }
      },
      'dsh-deepseek-balance: http routes',
    )
  })
}
