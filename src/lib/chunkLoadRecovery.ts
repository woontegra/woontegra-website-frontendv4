import { isChunkLoadError, markChunkReloadAttempted } from '@/lib/chunkLoadError'

let initialized = false

function tryReloadForChunkError(reason: unknown): void {
  if (!isChunkLoadError(reason)) return
  if (!markChunkReloadAttempted()) return
  window.location.reload()
}

/** Script/module yükleme hatalarında tek seferlik otomatik yenileme. */
export function initChunkLoadRecovery(): void {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  window.addEventListener('unhandledrejection', (event) => {
    tryReloadForChunkError(event.reason)
  })

  window.addEventListener(
    'error',
    (event) => {
      const target = event.target
      if (target instanceof HTMLScriptElement && target.src) {
        tryReloadForChunkError(`Failed to fetch dynamically imported module: ${target.src}`)
        return
      }
      tryReloadForChunkError(event.error ?? event.message)
    },
    true,
  )
}
