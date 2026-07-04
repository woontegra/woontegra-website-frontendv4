import { remapLegacyServiceUrl } from '@/lib/serviceSlugs'
import { normalizeLegalPublicHref } from '@/lib/legalSlugs'

/** Backend menü / footer URL'lerini V4 public slug route'larına normalize eder. */
export function resolvePublicHref(url: string): string {
  const raw = url?.trim() ?? ''
  if (!raw || raw === '#') return raw
  if (raw.startsWith('http') || raw.startsWith('mailto:') || raw.startsWith('tel:')) return raw

  const legalNormalized = normalizeLegalPublicHref(raw)
  if (legalNormalized !== raw) return legalNormalized

  const pathOnly = raw.split('?')[0]?.split('#')[0] ?? raw

  const SERVICE_PATH_ALIASES: Record<string, string> = {
    '/ozel-yazilim': '/hizmetler/yazilim-gelistirme',
    '/hizmetler/ozel-yazilim': '/hizmetler/yazilim-gelistirme',
    '/yazilim-gelistirme': '/hizmetler/yazilim-gelistirme',
  }
  if (SERVICE_PATH_ALIASES[pathOnly]) return SERVICE_PATH_ALIASES[pathOnly]

  if (pathOnly.startsWith('/urun/')) {
    return pathOnly.replace(/^\/urun\//, '/yazilimlar/')
  }

  if (pathOnly === '/kategori/yazilimlar' || pathOnly === '/kategori/yazilim') {
    return '/yazilimlar'
  }

  if (pathOnly.startsWith('/kategori/')) {
    const slug = pathOnly.slice('/kategori/'.length).replace(/\/+$/, '')
    if (slug === 'yazilimlar') return '/yazilimlar'
  }

  return remapLegacyServiceUrl(pathOnly)
}

export function resolvePublicNavHref(url: string): string {
  return resolvePublicHref(url)
}
