/** Canonical public site origin — sitemap, robots, canonical, schema */
export const SITE_ORIGIN = 'https://www.woontegra.com'

export const ORGANIZATION_LEGAL_NAME = 'Woontegra Teknoloji Yazılım ve Dijital Hizmetler Ltd. Şti.'

/** Stable Organization entity id — WebSite / SoftwareApplication references */
export const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`

export const SITE_LOGO_URL = `${SITE_ORIGIN}/images/woontegra-logo.svg`

export const DEFAULT_OG_IMAGE = SITE_LOGO_URL

export type SocialProfileId = 'linkedin' | 'instagram' | 'facebook' | 'youtube'

export type SocialProfile = {
  id: SocialProfileId
  label: string
  url: string
}

/** Verified Woontegra social profiles — single source for sameAs + footer */
export const SOCIAL_PROFILES: readonly SocialProfile[] = [
  { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/company/woontegra' },
  { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/woontegra_teknoloji/' },
  { id: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/woontegra' },
  { id: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@woontegra_teknoloji' },
] as const

export function socialProfileUrls(
  overrides?: Partial<Record<SocialProfileId, string | null | undefined>>,
): string[] {
  return SOCIAL_PROFILES.map((profile) => {
    const override = overrides?.[profile.id]?.trim()
    return override || profile.url
  })
}

/** Public product hub — crawlable entity links on /yazilimlar */
export const SOFTWARE_ENTITY_HUB = [
  {
    name: 'Bilirkişi Hesap',
    path: '/yazilimlar/bilirkisi-hesap',
    description: 'İş hukuku ve bilirkişilik hesaplamaları için Woontegra web yazılımı.',
  },
  {
    name: 'Müvekkil Kasa Defteri',
    path: '/yazilimlar/muvekkil-kasa-defteri',
    description: 'Avukat büroları için Woontegra masaüstü ve web tabanlı kasa defteri.',
  },
  {
    name: 'Şifre Kasası',
    path: '/yazilimlar/sifre-kasasi',
    description: 'Woontegra’nın ücretsiz Windows şifre yönetim aracı.',
  },
] as const

export type PageSeo = {
  title: string
  description: string
}

/** Path → default title/description (CMS override geçerli olduğunda sayfa birleştirir) */
export const PAGE_SEO_BY_PATH: Record<string, PageSeo> = {
  '/': {
    title: 'Woontegra | Yazılım, E-Ticaret ve Dijital Dönüşüm Çözümleri',
    description:
      'Woontegra; işletmeler için özel yazılım, e-ticaret altyapısı, web sitesi, masaüstü yazılım ve dijital dönüşüm çözümleri geliştiren bir yazılım şirketidir.',
  },
  '/hakkimizda': {
    title: 'Woontegra Hakkında | Woontegra Teknoloji Yazılım',
    description:
      'Woontegra; özel yazılım, e-ticaret altyapısı, web tasarım ve dijital sistem çözümleri geliştiren bir yazılım şirketidir.',
  },
  '/hizmetler': {
    title: 'Woontegra Hizmetleri | Yazılım ve Dijital Çözümler',
    description:
      'Woontegra hizmetleri: özel yazılım geliştirme, SaaS ürün altyapısı, e-ticaret, web tasarım ve marka danışmanlığı çözümleri.',
  },
  '/yazilimlar': {
    title: 'Woontegra Yazılımları | İşletmelere Özel Yazılım Çözümleri',
    description:
      'Woontegra yazılımları: Bilirkişi Hesap, Müvekkil Kasa Defteri ve Şifre Kasası — masaüstü, web ve lisanslı dijital ürünler.',
  },
  '/blog': {
    title: 'Woontegra Blog | Yazılım ve Dijital Dönüşüm',
    description:
      'Woontegra blog — yazılım, e-ticaret, SaaS ve dijital dönüşüm üzerine rehber içerikler.',
  },
  '/cozumler': {
    title: 'Woontegra Çözümleri | Sektörel Yazılım ve Dijital Sistemler',
    description:
      'Woontegra çözümleri; işletmelerin operasyon, satış ve dijital süreçleri için hazırlanan yazılım ve sistem yaklaşımlarını sunar.',
  },
  '/iletisim': {
    title: 'Woontegra İletişim | Woontegra Teknoloji',
    description:
      'Woontegra Teknoloji Yazılım ve Dijital Hizmetler Ltd. Şti. ile iletişime geçin. Yazılım, lisans ve proje sorularınız için bize ulaşın.',
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
  const defaults = PAGE_SEO_BY_PATH[path] ?? {
    title: 'Woontegra',
    description: PAGE_SEO_BY_PATH['/'].description,
  }
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

export type OrganizationContactInput = {
  email?: string | null
  telephone?: string | null
  streetAddress?: string | null
  addressLocality?: string | null
  addressRegion?: string | null
  postalCode?: string | null
  sameAs?: string[]
}

function compactSameAs(urls?: string[]): string[] | undefined {
  const cleaned = (urls ?? []).map((u) => u.trim()).filter(Boolean)
  return cleaned.length ? cleaned : undefined
}

export function organizationSchema(contact?: OrganizationContactInput): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: 'Woontegra',
    legalName: ORGANIZATION_LEGAL_NAME,
    url: SITE_ORIGIN,
    logo: SITE_LOGO_URL,
    description:
      'Woontegra, işletmeler için özel yazılım, e-ticaret altyapısı, web sitesi ve dijital dönüşüm çözümleri geliştiren bir yazılım şirketidir.',
  }

  const email = contact?.email?.trim()
  const telephone = contact?.telephone?.trim()
  if (email) schema.email = email
  if (telephone) schema.telephone = telephone

  const streetAddress = contact?.streetAddress?.trim()
  const addressLocality = contact?.addressLocality?.trim()
  if (streetAddress || addressLocality) {
    schema.address = {
      '@type': 'PostalAddress',
      ...(streetAddress ? { streetAddress } : {}),
      ...(addressLocality ? { addressLocality } : {}),
      ...(contact?.addressRegion?.trim() ? { addressRegion: contact.addressRegion.trim() } : {}),
      ...(contact?.postalCode?.trim() ? { postalCode: contact.postalCode.trim() } : {}),
      addressCountry: 'TR',
    }
  }

  if (email || telephone) {
    schema.contactPoint = {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      ...(email ? { email } : {}),
      ...(telephone ? { telephone } : {}),
      availableLanguage: ['Turkish'],
    }
  }

  schema.sameAs = compactSameAs(contact?.sameAs) ?? socialProfileUrls()

  return schema
}

export function webSiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Woontegra',
    url: `${SITE_ORIGIN}/`,
    publisher: { '@id': ORGANIZATION_ID },
  }
}

function organizationRef(): { '@id': string } {
  return { '@id': ORGANIZATION_ID }
}

export type SoftwareApplicationInput = {
  name: string
  description: string
  url: string
  applicationCategory?: string
  operatingSystem?: string | null
  price?: number | null
  priceCurrency?: string | null
  offerAvailable?: boolean
}

export function softwareApplicationSchema(input: SoftwareApplicationInput): Record<string, unknown> {
  const org = organizationRef()
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: input.name,
    description: input.description,
    url: input.url,
    applicationCategory: input.applicationCategory || 'BusinessApplication',
    publisher: org,
    author: org,
    creator: org,
  }

  const os = input.operatingSystem?.trim()
  if (os) schema.operatingSystem = os

  if (input.offerAvailable && input.price != null && Number.isFinite(input.price)) {
    schema.offers = {
      '@type': 'Offer',
      price: String(input.price),
      priceCurrency: (input.priceCurrency || 'TRY').toUpperCase(),
      url: input.url,
      availability: 'https://schema.org/InStock',
    }
  }

  return schema
}

export type BreadcrumbItemInput = {
  name: string
  path: string
}

export function breadcrumbListSchema(items: BreadcrumbItemInput[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: siteUrl(item.path),
    })),
  }
}
