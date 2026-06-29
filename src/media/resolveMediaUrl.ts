import { getApiRootUrl } from '@/lib/env'

const INVALID_LITERALS = new Set(['null', 'undefined', 'none', 'false', 'n/a'])

function getUploadsBase(): string {
  const fromEnv =
    import.meta.env.VITE_UPLOADS_BASE_URL?.trim() ||
    import.meta.env.VITE_BACKEND_PUBLIC_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/+$/, '')

  const apiRoot = getApiRootUrl()
  if (apiRoot) return apiRoot

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }

  return ''
}

/** /uploads için göreli path — Vercel/Vite proxy uyumlu. */
export function resolveMediaUrl(path: string | null | undefined): string {
  if (path == null) return ''
  const raw = path.trim()
  if (!raw || INVALID_LITERALS.has(raw.toLowerCase())) return ''

  if (/^https?:\/\//i.test(raw)) return raw // Vercel Blob, R2 legacy ve harici CDN URL'leri

  if (raw.startsWith('/uploads/') || raw.startsWith('uploads/')) {
    const rel = raw.startsWith('/') ? raw : `/${raw}`
    const explicit = import.meta.env.VITE_UPLOADS_BASE_URL?.trim() || import.meta.env.VITE_BACKEND_PUBLIC_URL?.trim()
    if (!explicit) return rel
    return `${getUploadsBase().replace(/\/+$/, '')}${rel}`
  }

  if (raw.startsWith('/')) return raw
  return `/images/${raw.replace(/^\/+/, '')}`
}

export function isValidMediaUrl(path?: string | null): boolean {
  return Boolean(resolveMediaUrl(path ?? ''))
}
