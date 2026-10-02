import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import test from 'node:test'

async function loadRollingAmount() {
  const source = await readFile('src/client.js', 'utf8')
  const instrumented = source.replace(
    "    var name = 'dsh-deepseek-balance'",
    "    window.__testHooks = { RollingAmount };\n    var name = 'dsh-deepseek-balance'",
  )
  let definition
  const context = {
    window: {},
    Symbol, Object, Error, Date, AbortController, BigInt,
    setInterval, clearInterval, setTimeout, clearTimeout,
  }
  context.window.__ModuleLoader__ = { load(value) { definition = value } }
  vm.runInNewContext(instrumented, context)
  const renderer = createTestReact(context.window)
  definition.factory((name) => name === 'react' ? renderer.react : undefined)
  return { RollingAmount: context.window.__testHooks.RollingAmount, renderer }
}

function createTestReact(windowObject) {
  let hookIndex = 0
  let rendering = false
  let rerenderQueued = false
  let currentComponent
  let currentProps
  let tree
  const states = []
  const refs = []
  const effects = []
  const frames = new Map()
  const animations = []
  let frameId = 0
  let trackNode

  function sameDeps(left, right) {
    if (!left || !right || left.length !== right.length) return false
    return left.every((value, index) => Object.is(value, right[index]))
  }

  function useState(initial) {
    const index = hookIndex++
    if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial
    return [states[index], (next) => {
      const value = typeof next === 'function' ? next(states[index]) : next
      if (Object.is(value, states[index])) return
      states[index] = value
      requestRender()
    }]
  }

  function useRef(initial) {
    const index = hookIndex++
    if (!(index in refs)) refs[index] = { current: initial }
    return refs[index]
  }

  function registerEffect(kind, callback, dependencies) {
    const index = hookIndex++
    const previous = effects[index]
    const changed = !previous || !sameDeps(previous.dependencies, dependencies)
    effects[index] = { kind, callback, dependencies, changed, cleanup: previous?.cleanup }
  }

  function createElement(type, props, ...children) {
    const safeProps = props || {}
    if (safeProps.ref && typeof safeProps.ref === 'object') {
      trackNode = {
        style: {},
        animate(keyframes, options) {
          let resolveFinished
          let rejectFinished
          const finished = new Promise((resolve, reject) => {
            resolveFinished = resolve
            rejectFinished = reject
          })
          const animation = {
            keyframes,
            options,
            finished,
            cancel() { rejectFinished(new Error('cancelled')) },
            resolve() { resolveFinished() },
          }
          animations.push(animation)
          return animation
        },
      }
      safeProps.ref.current = trackNode
    }
    return { type, props: safeProps, children }
  }

  function runEffects(kind) {
    for (const effect of effects) {
      if (!effect || effect.kind !== kind || !effect.changed) continue
      effect.cleanup?.()
      effect.cleanup = effect.callback() || undefined
      effect.changed = false
    }
  }

  function requestRender() {
    if (rendering) {
      rerenderQueued = true
      return
    }
    render()
  }

  function render() {
    if (rendering) {
      rerenderQueued = true
      return
    }
    do {
      rerenderQueued = false
      rendering = true
      hookIndex = 0
      tree = currentComponent(currentProps)
      rendering = false
      runEffects('layout')
      runEffects('passive')
    } while (rerenderQueued)
  }

  Object.assign(windowObject, {
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    requestAnimationFrame(callback) {
      const id = ++frameId
      frames.set(id, callback)
      return id
    },
    cancelAnimationFrame(id) { frames.delete(id) },
  })

  const react = {
    createElement,
    useState,
    useRef,
    useEffect(callback, dependencies) { registerEffect('passive', callback, dependencies) },
    useLayoutEffect(callback, dependencies) { registerEffect('layout', callback, dependencies) },
  }

  return {
    react,
    mount(component, props) {
      currentComponent = component
      currentProps = props
      render()
      return { tree: () => tree, track: () => trackNode, animations, flushFrame() {
        const next = frames.entries().next()
        if (next.done) return false
        frames.delete(next.value[0])
        next.value[1]()
        return true
      } }
    },
  }
}

function findTrack(node) {
  if (!node || typeof node !== 'object') return null
  if (node.props?.ref) return node
  for (const child of node.children ?? []) {
    const found = findTrack(Array.isArray(child) ? child[0] : child)
    if (found) return found
  }
  return null
}

function lineTexts(track) {
  return (track?.children ?? []).flatMap((child) => Array.isArray(child) ? child : [child]).map((child) => child?.children?.[0] ?? '')
}

test('renders a real two-line roll and commits the final value only after finish', async () => {
  const { RollingAmount, renderer } = await loadRollingAmount()
  const mounted = renderer.mount(RollingAmount, {
    value: '99.80', previousValue: '100.00', currency: 'CNY', animate: true, direction: 'decrease', revision: 1,
  })

  const initialTrack = findTrack(mounted.tree())
  assert.deepEqual(lineTexts(initialTrack), ['¥100.00', '¥99.80'])
  assert.equal(initialTrack.props.style.transform, 'translateY(0)')
  assert.equal(mounted.animations.length, 0)
  assert.equal(mounted.flushFrame(), true)
  assert.equal(mounted.flushFrame(), true)
  assert.equal(mounted.animations.length, 1)
  assert.deepEqual(JSON.parse(JSON.stringify(mounted.animations[0].keyframes)), [
    { transform: 'translateY(0)' },
    { transform: 'translateY(-50%)' },
  ])
  assert.deepEqual(lineTexts(findTrack(mounted.tree())), ['¥100.00', '¥99.80'])

  mounted.animations[0].resolve()
  await Promise.resolve()
  await Promise.resolve()
  assert.deepEqual(lineTexts(findTrack(mounted.tree())), ['¥99.80'])
})

test('reverses the two-line track for an increase and skips it for reduced motion', async () => {
  const { RollingAmount, renderer } = await loadRollingAmount()
  const mounted = renderer.mount(RollingAmount, {
    value: '100.00', previousValue: '99.80', currency: 'CNY', animate: true, direction: 'increase', revision: 2,
  })
  assert.deepEqual(lineTexts(findTrack(mounted.tree())), ['¥100.00', '¥99.80'])
  mounted.flushFrame()
  mounted.flushFrame()
  assert.deepEqual(JSON.parse(JSON.stringify(mounted.animations[0].keyframes)), [
    { transform: 'translateY(-50%)' },
    { transform: 'translateY(0)' },
  ])
})
