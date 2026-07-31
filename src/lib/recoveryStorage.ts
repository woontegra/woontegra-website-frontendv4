export const CHUNK_RELOAD_SESSION_KEY = 'woontegra_chunk_reload_attempted'
export const CHUNK_RELOAD_AT_KEY = 'woontegra_chunk_reload_at'

/** Otomatik yenileme cooldown — sonsuz reload döngüsünü engeller (özellikle Safari). */
export const CHUNK_RELOAD_COOLDOWN_MS = 5 * 60 * 1000

/** Yalnızca deploy/chunk recovery bayrakları — auth/sepet key'leri burada olmamalı. */
export const RECOVERY_SESSION_KEYS = [CHUNK_RELOAD_SESSION_KEY, CHUNK_RELOAD_AT_KEY] as const

export const RECOVERY_URL_PARAMS = ['__v', '__reload', '__recovery', '_fresh', 'fresh'] as const

const RECOVERY_BYPASS_PARAMS = ['fresh', '_fresh', '__recovery', '__reset'] as const

export function clearRecoverySessionState(): void {
  try {
    for (const key of RECOVERY_SESSION_KEYS) {
      sessionStorage.removeItem(key)
    }
  } catch {
    /* ignore */
  }
}

/**
 * Başarılı boot sonrası yalnızca "attempted" bayrağını temizler.
 * Cooldown timestamp kalır — kısa sürede ikinci otomatik reload olmaz.
 */
export function clearChunkReloadAttemptFlagSafe(): void {
  try {
    sessionStorage.removeItem(CHUNK_RELOAD_SESSION_KEY)
  } catch {
    /* ignore */
  }
}

export function isWithinChunkReloadCooldown(): boolean {
  try {
    const at = Number(sessionStorage.getItem(CHUNK_RELOAD_AT_KEY) || '0')
    if (!Number.isFinite(at) || at <= 0) return false
    return Date.now() - at < CHUNK_RELOAD_COOLDOWN_MS
  } catch {
    // Storage yoksa otomatik reload yapma (sonsuz döngü riski)
    return true
  }
}

export function isRecoveryBypassRequested(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const params = new URLSearchParams(window.location.search)
    return RECOVERY_BYPASS_PARAMS.some((param) => params.has(param))
  } catch {
    return false
  }
}

export function stripRecoveryUrlParams(url: URL): URL {
  const next = new URL(url.href)
  for (const param of RECOVERY_URL_PARAMS) {
    next.searchParams.delete(param)
  }
  return next
}

/** ?fresh=1 vb. ile gelindiyse recovery kilidini kaldır. */
export function applyRecoveryBypassOnBoot(): void {
  if (isRecoveryBypassRequested()) {
    clearRecoverySessionState()
  }
}

/**
 * Manuel yenileme — recovery bayraklarını temizler, URL parametrelerini söker,
 * cache-bust ile gerçek HTML alır. Auth/sepet localStorage'a dokunmaz.
 */
export function performCleanRecoveryReload(options?: { cacheBust?: boolean }): void {
  clearRecoverySessionState()

  const url = stripRecoveryUrlParams(new URL(window.location.href))
  if (options?.cacheBust !== false) {
    url.searchParams.set('__v', String(Date.now()))
  }

  window.location.replace(url.toString())
}

declare global {
  interface Window {
    __woontegraCleanReload?: () => void
  }
}

export function registerCleanRecoveryReloadGlobal(): void {
  if (typeof window === 'undefined') return
  window.__woontegraCleanReload = () => performCleanRecoveryReload()
}
