import { getApiBaseUrl } from '@/lib/env'
import { resolveMediaUrl } from '@/media/resolveMediaUrl'

function encodeUriPathSegments(pathname: string): string {
  const segs = pathname.split('/').filter((s) => s.length > 0)
  if (segs.length === 0) return ''
  return `/${segs.map((seg) => encodeURIComponent(seg)).join('/')}`
}

function usesSameOriginApiProxy(): boolean {
  const api = getApiBaseUrl().replace(/\/+$/, '')
  if (api === '/api') return true
  if (import.meta.env.DEV && /^(https?:\/\/)?(127\.0\.0\.1|localhost)(:\d+)?\/api$/i.test(api)) {
    return true
  }
  return false
}

/** Admin medya kütüphanesi önizlemesi — R2/CDN https veya legacy /uploads/ */
export function resolveCatalogMediaPreviewUrl(path: string | null | undefined): string {
  if (!path) return ''
  const normalized = path.trim()
  if (!normalized) return ''

  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized
  }

  if (normalized.startsWith('/uploads/') && usesSameOriginApiProxy()) {
    return encodeUriPathSegments(normalized)
  }

  return resolveMediaUrl(normalized)
}
