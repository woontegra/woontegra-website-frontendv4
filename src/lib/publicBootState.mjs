/** Public, non-secret boot fields for prerender + first React paint. */

export const PUBLIC_BOOT_GLOBAL_KEY = '__WOONTEGRA_PUBLIC_BOOTSTRAP__'
export const BOOT_LOGO_HEIGHT = 52
export const BOOT_LOGO_WIDTH_MIN = 80
export const BOOT_LOGO_WIDTH_MAX = 260
export const BOOT_LOGO_WIDTH_DEFAULT = 150

export function clampBootLogoWidth(value, fallback = BOOT_LOGO_WIDTH_DEFAULT) {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(BOOT_LOGO_WIDTH_MAX, Math.max(BOOT_LOGO_WIDTH_MIN, parsed))
}

export function isUsablePublicLogoUrl(logo) {
  const raw = String(logo || '').trim()
  if (!raw) return false
  const lower = raw.toLowerCase()
  if (lower === '/logo.png' || lower.endsWith('/logo.png')) return false
  if (lower.includes('woontegra-logo.svg')) return false
  if (/^https?:\/\//i.test(raw)) return true
  if (raw.startsWith('/uploads/') || raw.startsWith('uploads/')) return true
  return false
}

export function buildPublicLogoUrl(logo, logoUpdatedAt) {
  const raw = String(logo || '').trim()
  if (!isUsablePublicLogoUrl(raw)) return ''
  const url = raw.startsWith('uploads/') ? `/${raw}` : raw
  const stamp = String(logoUpdatedAt || '').trim()
  if (!stamp) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${encodeURIComponent(stamp)}`
}

export function extractPublicLogoBoot(raw) {
  if (!raw || typeof raw !== 'object') return null
  const nested = raw.data
  const data =
    nested && typeof nested === 'object' && !Array.isArray(nested) ? nested : raw
  const logo = String(data.logo || '').trim()
  if (!isUsablePublicLogoUrl(logo)) return null
  const siteName = String(data.siteName || 'Woontegra').trim() || 'Woontegra'
  return {
    siteName,
    logo,
    logoUpdatedAt: String(data.logoUpdatedAt || '').trim(),
    navbarLogoWidth: clampBootLogoWidth(data.navbarLogoWidth ?? data.logoWidth),
  }
}

export function serializePublicBootScript(boot) {
  if (!boot?.logo) return ''
  const payload = {
    siteName: boot.siteName,
    logo: boot.logo,
    logoUpdatedAt: boot.logoUpdatedAt || '',
    navbarLogoWidth: clampBootLogoWidth(boot.navbarLogoWidth),
  }
  const json = JSON.stringify(payload).replace(/</g, '\\u003c')
  return `<script id="woontegra-public-boot">window.${PUBLIC_BOOT_GLOBAL_KEY}=${json};</script>`
}

export function readPublicBootState() {
  if (typeof window === 'undefined') return null
  try {
    return extractPublicLogoBoot(window[PUBLIC_BOOT_GLOBAL_KEY])
  } catch {
    return null
  }
}

/** Query/boot birleşimi — text fallback yok; grafik logo URL'si varsa onu koru. */
export function mergePublicLogoFields(settings, boot) {
  const logo = String(settings?.logo || boot?.logo || '').trim()
  const logoUpdatedAt = String(settings?.logoUpdatedAt || boot?.logoUpdatedAt || '').trim()
  const navbarLogoWidth = clampBootLogoWidth(
    settings?.navbarLogoWidth ?? boot?.navbarLogoWidth,
  )
  const siteName = String(settings?.siteName || boot?.siteName || 'Woontegra').trim() || 'Woontegra'
  return { siteName, logo, logoUpdatedAt, navbarLogoWidth }
}
