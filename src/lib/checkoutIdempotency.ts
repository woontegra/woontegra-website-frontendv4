/** Checkout başına tek işlem anahtarı — timeout yeniden denemelerinde aynı kalır. */

const STORAGE_PREFIX = 'wt_checkout_idempotency:'

function storageKey(cartFingerprint: string): string {
  return `${STORAGE_PREFIX}${cartFingerprint || 'default'}`
}

export function getOrCreateCheckoutIdempotencyKey(cartFingerprint: string): string {
  if (typeof window === 'undefined') {
    return `ssr-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }
  const k = storageKey(cartFingerprint)
  try {
    const existing = window.sessionStorage.getItem(k)?.trim()
    if (existing && existing.length >= 16) return existing
    const next =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID().replace(/-/g, '')
        : `ck${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`
    window.sessionStorage.setItem(k, next)
    return next
  } catch {
    return `ck${Date.now().toString(36)}${Math.random().toString(36).slice(2, 18)}`
  }
}

/** Başarılı sipariş sonrası sonraki alışveriş için yeni anahtar. */
export function clearCheckoutIdempotencyKey(cartFingerprint: string): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(storageKey(cartFingerprint))
  } catch {
    /* ignore */
  }
}
