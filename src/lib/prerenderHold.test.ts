import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  capturePrerenderHold,
  PRERENDER_HOLD_ID,
  PRERENDER_HOLD_STYLE,
  PRERENDER_HOLD_TIMEOUT_MS,
  releasePrerenderHold,
  resetPrerenderHoldForTests,
  shouldCapturePrerenderHold,
} from '@/lib/prerenderHold'

type FakeEl = {
  id: string
  innerHTML: string
  style: { cssText: string }
  childElementCount: number
  attrs: Record<string, string>
  setAttribute: (k: string, v: string) => void
  insertAdjacentElement: (pos: string, node: FakeEl) => void
  remove: () => void
}

function installDom(pathname: string, childHtml = '<header>shell</header>') {
  const byId = new Map<string, FakeEl>()

  function createElement(): FakeEl {
    const el: FakeEl = {
      id: '',
      innerHTML: '',
      style: { cssText: '' },
      childElementCount: 0,
      attrs: {},
      setAttribute(k, v) {
        this.attrs[k] = v
      },
      insertAdjacentElement(_pos, node) {
        if (node.id) byId.set(node.id, node)
      },
      remove() {
        if (this.id) byId.delete(this.id)
      },
    }
    return el
  }

  const root = createElement()
  root.id = 'root'
  root.innerHTML = childHtml
  root.childElementCount = childHtml ? 1 : 0
  byId.set('root', root)

  vi.stubGlobal('document', {
    getElementById(id: string) {
      return byId.get(id) ?? null
    },
    createElement,
  })
  vi.stubGlobal('window', {
    location: { pathname },
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
  })

  return { root, byId }
}

describe('prerender hold', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    resetPrerenderHoldForTests()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('captures only the homepage path', () => {
    expect(shouldCapturePrerenderHold('/')).toBe(true)
    expect(shouldCapturePrerenderHold('/index.html')).toBe(true)
    expect(shouldCapturePrerenderHold('/hakkimizda')).toBe(false)
    expect(shouldCapturePrerenderHold('/yazilimlar')).toBe(false)
  })

  it('overlay style is branded, not a white flash', () => {
    expect(PRERENDER_HOLD_STYLE).toContain('background-color:#0f172a')
    expect(PRERENDER_HOLD_STYLE).not.toMatch(/background:#fff/i)
    expect(PRERENDER_HOLD_STYLE).toContain('pointer-events:none')
    expect(PRERENDER_HOLD_STYLE).toContain('overflow:hidden')
    expect(PRERENDER_HOLD_TIMEOUT_MS).toBe(4000)
  })

  it('captures the prerender shell before createRoot and releases when React is ready', () => {
    const { root, byId } = installDom('/')
    capturePrerenderHold(root as unknown as HTMLElement)
    const hold = byId.get(PRERENDER_HOLD_ID)
    expect(hold).toBeTruthy()
    expect(hold?.innerHTML).toContain('<header>shell</header>')
    expect(hold?.style.cssText).toBe(PRERENDER_HOLD_STYLE)
    expect(hold?.attrs['aria-hidden']).toBe('true')

    releasePrerenderHold()
    expect(byId.get(PRERENDER_HOLD_ID)).toBeUndefined()
  })

  it('does not stay forever — safety timeout releases the hold', () => {
    const { root, byId } = installDom('/')
    capturePrerenderHold(root as unknown as HTMLElement)
    expect(byId.get(PRERENDER_HOLD_ID)).toBeTruthy()
    vi.advanceTimersByTime(PRERENDER_HOLD_TIMEOUT_MS)
    expect(byId.get(PRERENDER_HOLD_ID)).toBeUndefined()
  })

  it('does not capture on non-home routes', () => {
    const { root, byId } = installDom('/hakkimizda')
    capturePrerenderHold(root as unknown as HTMLElement)
    expect(byId.get(PRERENDER_HOLD_ID)).toBeUndefined()
  })
})
