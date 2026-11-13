const API_URL = import.meta.env.VITE_API_URL?.trim() || '/api'

/** Canlı sitede same-origin `/api` (Vercel→Railway rewrite) — partner HttpOnly oturum çerezi için. */
function isWoontegraPublicHost(): boolean {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname
  return host === 'woontegra.com' || host === 'www.woontegra.com'
}

export function getApiBaseUrl(): string {
  // Vercel’de VITE_API_URL absolute Railway olsa bile www’de göreli /api kullan:
  // aksi halde consume 200 döner ama SameSite=Lax çerez çapraz origin’de tutunmaz.
  if (isWoontegraPublicHost()) return '/api'
  const normalized = API_URL.replace(/\/+$/, '')
  if (normalized.endsWith('/api')) return normalized
  return `${normalized}/api`
}

export function getApiRootUrl(): string {
  const base = getApiBaseUrl()
  return base.endsWith('/api') ? base.slice(0, -4) : base
}
