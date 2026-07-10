import { isChunkLoadError } from '@/lib/chunkLoadError'
import { cacheBustReload, showPreReactBootMessage } from '@/lib/cacheBustReload'

let initialized = false

function tryRecoverFromChunkError(reason: unknown): void {
  if (!isChunkLoadError(reason)) return

  if (cacheBustReload()) {
    showPreReactBootMessage('Site güncellendi', 'Woontegra yeni sürüme geçiyor, sayfa yenileniyor…')
    return
  }

  showPreReactBootMessage(
    'Site güncellendi',
    'Woontegra\'nın yeni sürümü yayınlandı. Devam etmek için sayfayı yenileyin.',
  )
}

/** Script/module yükleme hatalarında tek seferlik cache-bust yenileme. */
export function initChunkLoadRecovery(): void {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  window.addEventListener('unhandledrejection', (event) => {
    tryRecoverFromChunkError(event.reason)
  })

  window.addEventListener(
    'error',
    (event) => {
      const target = event.target
      if (target instanceof HTMLScriptElement && target.src) {
        tryRecoverFromChunkError(`Failed to fetch dynamically imported module: ${target.src}`)
        return
      }
      if (target instanceof HTMLLinkElement && target.rel === 'stylesheet' && target.href) {
        tryRecoverFromChunkError(`Unable to preload CSS for ${target.href}`)
        return
      }
      tryRecoverFromChunkError(event.error ?? event.message)
    },
    true,
  )
}
