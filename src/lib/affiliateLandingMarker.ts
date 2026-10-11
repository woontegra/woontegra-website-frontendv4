/**
 * /r/:code yönlendirmesi iş ortağı kodunu URL'de taşımaz (çerez HttpOnly).
 * İş ortağı vurgusu yalnızca bu sekmede az önce /r/:code üzerinden gelindiyse gösterilir;
 * ?surum= tek başına iş ortağı bağlantısı sayılmaz.
 */
export const AFFILIATE_LANDING_MARKER_KEY = 'wt_aff_landing_at'
export const AFFILIATE_LANDING_MARKER_MAX_AGE_MS = 2 * 60 * 1000

export function markAffiliateLanding(now: number = Date.now()): void {
  try {
    window.sessionStorage.setItem(AFFILIATE_LANDING_MARKER_KEY, String(now))
  } catch {
    /* depolama kapalı: vurgu gösterilmez */
  }
}

export function readRecentAffiliateLanding(now: number = Date.now()): boolean {
  try {
    if (typeof window === 'undefined') return false
    const at = Number(window.sessionStorage.getItem(AFFILIATE_LANDING_MARKER_KEY) || '0')
    return at > 0 && now - at >= 0 && now - at <= AFFILIATE_LANDING_MARKER_MAX_AGE_MS
  } catch {
    return false
  }
}

export function clearAffiliateLanding(): void {
  try {
    window.sessionStorage.removeItem(AFFILIATE_LANDING_MARKER_KEY)
  } catch {
    /* yok say */
  }
}
