import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'

const packageManifest = JSON.parse(await readFile('package.json', 'utf8'))
const pluginManifest = JSON.parse(await readFile('dsh.plugin.json', 'utf8'))
if (pluginManifest.version !== packageManifest.version) {
  throw new Error(`Version mismatch: package.json=${packageManifest.version}, dsh.plugin.json=${pluginManifest.version}`)
}

await rm('lib', { recursive: true, force: true })
await rm('client', { recursive: true, force: true })
await mkdir('lib', { recursive: true })
await mkdir('client', { recursive: true })
await mkdir('client/assets/pet', { recursive: true })
await mkdir('client/assets', { recursive: true })
await mkdir('dist', { recursive: true })

for (const file of ['balance.js', 'http.js', 'index.js', 'index.d.ts']) {
  await cp(`src/${file}`, `lib/${file}`)
}
const clientSource = await readFile('src/client.js', 'utf8')
const petStudioSource = await readFile('src/pet-studio.js', 'utf8')
const petUiSource = await readFile('src/pet-ui.js', 'utf8')
const appearanceUiSource = await readFile('src/appearance-ui.js', 'utf8')
if (!clientSource.includes('/*__DshPetStudio__*/')) throw new Error('Client pet studio insertion point is missing.')
if (!clientSource.includes('/*__DshPetUi__*/')) throw new Error('Client pet UI insertion point is missing.')
if (!clientSource.includes('/*__DshAppearanceUi__*/')) throw new Error('Client appearance UI insertion point is missing.')
const clientBundle = clientSource
  .replace('/*__DshPetStudio__*/', petStudioSource)
  .replace('/*__DshPetUi__*/', petUiSource)
  .replace('/*__DshAppearanceUi__*/', appearanceUiSource)
  .replaceAll('__DshBalancePluginVersion__', packageManifest.version)
if (clientBundle.includes('__DshBalancePluginVersion__')) {
  throw new Error('Client bundle still contains the package version placeholder.')
}
await writeFile('client/client.js', clientBundle, 'utf8')

for (const [source, target] of [
  ['桌宠/idle-transparent.webm', 'client/assets/pet/idle.webm'],
  ['桌宠/idle-static-transparent.png', 'client/assets/pet/idle.png'],
  ['src/wallpaper-capture.js', 'client/assets/wallpaper-capture.js'],
]) {
  await cp(source, target)
}

console.log(`Built host and client bundles for ${packageManifest.name}@${packageManifest.version}.`)
