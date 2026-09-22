export const PRERENDER_HOLD_ID = 'woontegra-prerender-hold'
export const PRERENDER_HOLD_TIMEOUT_MS = 4000
/** Branded, not #fff — clone paints the real shell; this only fills gaps. */
export const PRERENDER_HOLD_STYLE =
  'position:fixed;inset:0;z-index:10000;overflow:hidden;pointer-events:none;background-color:#0f172a;'

let released = false
let timeoutId: number | null = null

function clearHoldTimer() {
  if (timeoutId != null && typeof window !== 'undefined') {
    window.clearTimeout(timeoutId)
    timeoutId = null
  }
}

function isHomePath(pathname: string): boolean {
  const path = pathname.replace(/\/index\.html$/i, '') || '/'
  return path === '/'
}

export function shouldCapturePrerenderHold(pathname = window.location.pathname): boolean {
  return isHomePath(pathname)
}

/** createRoot #root'u silmeden önce crawler HTML'ini boyada tutar. */
export function capturePrerenderHold(rootEl: HTMLElement): void {
  if (typeof document === 'undefined' || released) return
  if (!shouldCapturePrerenderHold()) return
  if (!rootEl.childElementCount) return
  if (document.getElementById(PRERENDER_HOLD_ID)) return

  const hold = document.createElement('div')
  hold.id = PRERENDER_HOLD_ID
  hold.setAttribute('aria-hidden', 'true')
  hold.style.cssText = PRERENDER_HOLD_STYLE
  hold.innerHTML = rootEl.innerHTML
  rootEl.insertAdjacentElement('afterend', hold)

  timeoutId = window.setTimeout(() => {
    releasePrerenderHold()
  }, PRERENDER_HOLD_TIMEOUT_MS)
}

export function releasePrerenderHold(): void {
  if (released) return
  released = true
  clearHoldTimer()
  document.getElementById(PRERENDER_HOLD_ID)?.remove()
}

export function resetPrerenderHoldForTests(): void {
  released = false
  clearHoldTimer()
  if (typeof document !== 'undefined') {
    document.getElementById(PRERENDER_HOLD_ID)?.remove()
  }
}
