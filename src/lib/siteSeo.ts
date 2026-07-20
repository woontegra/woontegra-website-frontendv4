/** Canonical public site origin — sitemap, robots, canonical, schema */
export const SITE_ORIGIN = 'https://www.woontegra.com'

export const ORGANIZATION_LEGAL_NAME = 'Woontegra Teknoloji Yazılım ve Dijital Hizmetler Ltd. Şti.'

export const SITE_LOGO_URL = `${SITE_ORIGIN}/images/woontegra-logo.svg`

export type PageSeo = {
  title: string
  description: string
}

/** Path → default title/description (CMS override geçerli olduğunda sayfa birleştirir) */
export const PAGE_SEO_BY_PATH: Record<string, PageSeo> = {
  '/': {
    title: 'Woontegra | Yazılım, E-Ticaret ve Dijital Dönüşüm Çözümleri',
    description:
      'Woontegra Teknoloji Yazılım ve Dijital Hizmetler Ltd. Şti.; işletmeler için özel yazılım, e-ticaret altyapısı, web sitesi, masaüstü yazılım ve dijital dönüşüm çözümleri geliştirir.',
  },
  '/hakkimizda': {
    title: 'Woontegra Hakkında | Woontegra Teknoloji Yazılım',
    description:
      'Woontegra Teknoloji Yazılım ve Dijital Hizmetler Ltd. Şti.; özel yazılım, e-ticaret altyapısı, web tasarım ve dijital sistem çözümleri geliştiren yazılım şirketidir.',
  },
  '/hizmetler': {
    title: 'Woontegra Hizmetleri | Yazılım ve Dijital Çözümler',
    description:
      'Woontegra hizmetleri: özel yazılım geliştirme, SaaS ürün altyapısı, e-ticaret, web tasarım ve marka vekilliği çözümleri.',
  },
  '/yazilimlar': {
    title: 'Woontegra Yazılımları | İşletmelere Özel Yazılım Çözümleri',
    description:
      'Woontegra yazılımları; işletmeler için masaüstü programlar, SaaS ürünleri ve lisanslı dijital çözümler sunar.',
  },
  '/blog': {
    title: 'Woontegra Blog | Yazılım ve Dijital Dönüşüm',
    description:
      'Woontegra blog — yazılım, e-ticaret, SaaS ve dijital dönüşüm üzerine rehber içerikler.',
  },
  '/hizmetler/e-ticaret': {
    title: 'Woontegra E-Ticaret Altyapısı | Online Satış Sistemleri',
    description:
      'Woontegra e-ticaret altyapısı ile online satış, ödeme, sipariş ve operasyon süreçlerinizi tek panelden yönetin.',
  },
  '/hizmetler/web-tasarim': {
    title: 'Woontegra Web Tasarım | Kurumsal Web Sitesi Çözümleri',
    description:
      'Woontegra web tasarım ile hızlı, modern ve dönüşüm odaklı kurumsal web siteleri geliştirir.',
  },
  '/hizmetler/yazilim-gelistirme': {
    title: 'Woontegra Özel Yazılım | İşletmelere Özel Sistem Geliştirme',
    description:
      'Woontegra özel yazılım ile işletmenize özel panel, entegrasyon ve operasyon sistemleri geliştirir.',
  },
  '/veri-silme-talebi': {
    title: 'Kullanıcı Verilerinin Silinmesi | Woontegra MailCenter',
    description:
      'MailCenter ve Meta WhatsApp bağlantıları kapsamında saklanan kullanıcı verilerinin silinmesi için izlenecek adımlar.',
  },
}

/** Sitemap’e girmemesi gereken path önekleri */
export const NOINDEX_PATH_PREFIXES = [
  '/admin',
  '/giris',
  '/kayit',
  '/sifremi-unuttum',
  '/sifre-sifirla',
  '/sepet',
  '/odeme',
  '/hesabim',
  '/builder-preview',
  '/api',
] as const

export function normalizePublicPath(pathname: string): string {
  const clean = pathname.split('?')[0]?.split('#')[0] ?? '/'
  if (clean === '' || clean === '/') return '/'
  return clean.endsWith('/') && clean.length > 1 ? clean.slice(0, -1) : clean
}

export function siteUrl(path = '/'): string {
  const normalized = normalizePublicPath(path)
  if (normalized === '/') return `${SITE_ORIGIN}/`
  return `${SITE_ORIGIN}${normalized}`
}

export function mergePageSeo(pathname: string, cms?: Partial<PageSeo>): PageSeo {
  const path = normalizePublicPath(pathname)
  const defaults = PAGE_SEO_BY_PATH[path] ?? PAGE_SEO_BY_PATH['/']
  return {
    title: cms?.title?.trim() || defaults.title,
    description: cms?.description?.trim() || defaults.description,
  }
}

/** @deprecated mergePageSeo kullanın */
export function pageSeoForPath(pathname: string, overrides?: Partial<PageSeo>): PageSeo {
  return mergePageSeo(pathname, overrides)
}

export function isNoIndexPath(pathname: string): boolean {
  const path = normalizePublicPath(pathname)
  return NOINDEX_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

export function organizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Woontegra',
    legalName: ORGANIZATION_LEGAL_NAME,
    url: SITE_ORIGIN,
    logo: SITE_LOGO_URL,
    description:
      'Woontegra, işletmeler için özel yazılım, e-ticaret altyapısı, web sitesi ve dijital dönüşüm çözümleri geliştirir.',
  }
}

export function webSiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Woontegra',
    url: SITE_ORIGIN,
  }
}
