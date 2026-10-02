import { readdir, readFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

async function collect(directory) {
  const found = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) found.push(...await collect(path))
    else if (/\.(?:js|mjs)$/.test(entry.name)) found.push(path)
  }
  return found
}

const files = [...await collect('src'), ...await collect('scripts'), ...await collect('test')]
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

const client = await readFile('src/client.js', 'utf8')
for (const forbidden of ['DEEPSEEK_API_KEY', 'api.deepseek.com', 'Bearer ']) {
  if (client.includes(forbidden)) throw new Error(`Client bundle contains forbidden server detail: ${forbidden}`)
}

console.log(`Syntax and client-boundary checks passed for ${files.length} files.`)
