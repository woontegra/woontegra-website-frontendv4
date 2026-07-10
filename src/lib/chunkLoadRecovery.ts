import { isChunkLoadError } from '@/lib/chunkLoadError'
import { cacheBustReload } from '@/lib/cacheBustReload'

let initialized = false

function isAssetScript(target: EventTarget | null): target is HTMLScriptElement {
  return (
    target instanceof HTMLScriptElement &&
    Boolean(target.src) &&
    (target.src.includes('/assets/') || target.type === 'module')
  )
}

function tryRecoverFromChunkError(reason: unknown): void {
  if (!isChunkLoadError(reason)) return
  cacheBustReload()
}

/** Lazy/entry chunk hatalarında tek seferlik cache-bust — DOM kilitlemez. */
export function initChunkLoadRecovery(): void {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  window.addEventListener('unhandledrejection', (event) => {
    tryRecoverFromChunkError(event.reason)
  })

  window.addEventListener(
    'error',
    (event) => {
      if (isAssetScript(event.target)) {
        tryRecoverFromChunkError(`Failed to fetch dynamically imported module: ${event.target.src}`)
      }
    },
    true,
  )
}
