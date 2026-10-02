export interface Config {
  /** Environment variable/reference containing the official DeepSeek API key; the top-bar setup dialog stores it through DSH credentials when available. */
  apiKeyEnv?: string
  /** Total request timeout, in milliseconds (1000-30000). */
  timeoutMs?: number
}

export declare const name = "dsh-deepseek-balance"

export declare function apply(ctx: {
  inject(services: string[], callback: (ctx: unknown) => void): void
}, config?: Config): void
