export type PreloadImageResult = 'loaded' | 'error'

const DEFAULT_TIMEOUT_MS = 8_000

/**
 * Tarayıcı önbelleğine almak için görseli önceden yükler.
 * Zaman aşımı veya hata durumunda 'error' döner — sonsuz bekleme yok.
 */
export function preloadImage(src: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<PreloadImageResult> {
  const trimmed = src.trim()
  if (!trimmed) return Promise.resolve('error')

  return new Promise((resolve) => {
    const img = new Image()
    let settled = false

    const finish = (result: PreloadImageResult) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      resolve(result)
    }

    const timer = window.setTimeout(() => finish('error'), timeoutMs)
    img.onload = () => finish('loaded')
    img.onerror = () => finish('error')
    img.src = trimmed
  })
}
