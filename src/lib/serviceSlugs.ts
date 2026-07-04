import { SERVICE_DETAIL_BY_SLUG } from '@/data/serviceDetailContent'



/** Siteden kaldırılmış hizmet slug'ları — menü ve doğrudan URL erişimi filtrelenir */
export const REMOVED_SERVICE_SLUGS = new Set(['oyun-gelistirme', 'dijital-danismanlik'])

export function isRemovedServiceSlug(slug: string): boolean {
  return REMOVED_SERVICE_SLUGS.has(slug.trim().toLowerCase())
}

function hrefTargetsRemovedService(href: string): boolean {
  const raw = (href || '').trim().toLowerCase()
  if (!raw || raw === '#') return false
  const pathOnly = raw.split('?')[0]?.split('#')[0] ?? raw

  // /hizmetler/<slug>
  const hizmetlerMatch = pathOnly.match(/\/hizmetler\/([^/?#]+)/i)
  if (hizmetlerMatch && isRemovedServiceSlug(hizmetlerMatch[1])) return true

  // Herhangi bir yolun son segmenti kaldırılmış slug ise (ör. /oyun-gelistirme)
  const segments = pathOnly.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1]
  if (lastSegment && isRemovedServiceSlug(lastSegment)) return true

  return false
}

/** "Oyun Geliştirme" gibi kaldırılmış hizmetleri label üzerinden de yakalar. */
function labelTargetsRemovedService(label: string): boolean {
  const normalized = (label || '')
    .trim()
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return isRemovedServiceSlug(normalized)
}

export function filterRemovedServiceNavItems<
  T extends { label?: string; href: string; resolvedUrl?: string; children?: T[] },
>(items: T[]): T[] {
  return items
    .map((item) => ({
      ...item,
      children: item.children?.length ? filterRemovedServiceNavItems(item.children) : [],
    }))
    .filter(
      (item) =>
        !hrefTargetsRemovedService(item.href) &&
        !hrefTargetsRemovedService(item.resolvedUrl ?? item.href) &&
        !labelTargetsRemovedService(item.label ?? ''),
    )
}

export const SERVICE_SLUG_ALIASES: Record<string, string> = {

  'e-ticaret-cozumleri': 'e-ticaret',

  'saas-urun-gelistirme': 'saas',

  'ozel-yazilim': 'yazilim-gelistirme',

}



export const KNOWN_SERVICE_SLUGS = new Set([

  ...Object.keys(SERVICE_DETAIL_BY_SLUG),

  ...Object.keys(SERVICE_SLUG_ALIASES),

])



export function resolveServiceSlug(slug: string): string {

  const key = slug.trim().toLowerCase()

  return SERVICE_SLUG_ALIASES[key] ?? key

}



export function isKnownServiceSlug(slug: string): boolean {
  const key = slug.trim().toLowerCase()
  if (!key || isRemovedServiceSlug(key)) return false
  if (KNOWN_SERVICE_SLUGS.has(key)) return true
  return Boolean(SERVICE_DETAIL_BY_SLUG[resolveServiceSlug(key)])
}



export function canonicalServicePath(slug: string): string {

  return `/hizmetler/${resolveServiceSlug(slug)}`

}



/** CMS tek segment yollarını (/saas) kanonik hizmet rotasına çevirir. */

export function remapLegacyServiceUrl(url: string): string {

  if (!url || url === '#') return url

  const match = url.match(/^\/([^/?#]+)\/?$/)

  if (!match) return url

  if (isKnownServiceSlug(match[1])) return canonicalServicePath(match[1])

  return url

}


