import { isAssetChunkUrl, isChunkLoadError } from '@/lib/chunkLoadError'
import { cacheBustReload } from '@/lib/cacheBustReload'

let initialized = false

function isFailedAssetElement(target: EventTarget | null): target is HTMLScriptElement | HTMLLinkElement {
  if (target instanceof HTMLScriptElement) {
    return Boolean(target.src) && isAssetChunkUrl(target.src)
  }
  if (target instanceof HTMLLinkElement) {
    return Boolean(target.href) && isAssetChunkUrl(target.href)
  }
  return false
}

function assetElementUrl(target: HTMLScriptElement | HTMLLinkElement): string {
  return target instanceof HTMLScriptElement ? target.src : target.href
}

function tryRecoverFromChunkError(reason: unknown): void {
  if (!isChunkLoadError(reason)) return
  cacheBustReload()
}

/** Lazy/entry chunk hatalarında tek seferlik cache-bust — UI kilitlemez. */
export function initChunkLoadRecovery(): void {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  window.addEventListener('unhandledrejection', (event) => {
    tryRecoverFromChunkError(event.reason)
  })

  window.addEventListener(
    'error',
    (event) => {
      if (isFailedAssetElement(event.target)) {
        tryRecoverFromChunkError(`Failed to fetch dynamically imported module: ${assetElementUrl(event.target)}`)
      }
    },
    true,
  )
}
