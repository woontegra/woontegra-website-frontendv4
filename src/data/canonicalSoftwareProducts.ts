import { KOOPPLUS_PATH, KOOPPLUS_SLUG } from '@/data/koopplusProduct'
import type { PublicProductDetail, PublicProductListItem } from '@/types/product'

export const BILIRKISI_HESAP_SLUG = 'bilirkisi-hesap'
/** Program giriş (panel) — local override via BFF config */
export const BILIRKISI_HESAP_PANEL_URL = 'https://panel.bilirkisihesap.com'
export const BILIRKISI_HESAP_CHECKOUT_PATH = `/yazilimlar/${BILIRKISI_HESAP_SLUG}/satin-al`
/** Canonical public origin for shareable BH checkout links (admin copy / protocols). */
export const WOONTEGRA_PUBLIC_ORIGIN = 'https://www.woontegra.com'

/** Full Woontegra sales URL for a campaign public code — never /k/ short paths for admin copy. */
export function bilirkisiHesapCampaignCheckoutUrl(campaignCode: string): string {
  const code = String(campaignCode || '').trim()
  const qs = new URLSearchParams()
  if (code) qs.set('c', code)
  const q = qs.toString()
  return `${WOONTEGRA_PUBLIC_ORIGIN}${BILIRKISI_HESAP_CHECKOUT_PATH}${q ? `?${q}` : ''}`
}

export type PromotionalSoftwareMeta = {
  /** @deprecated Prefer checkoutPath for Woontegra-hosted BH sales */
  officialUrl: string
  checkoutPath: string
  badges: string[]
  ctaLabel: string
  priceNote: string
  disclaimer: string
  listCtaLabel: string
  publicProductTypeLabel: string
  useCases: string[]
  deliveryNotes: string[]
  licenseSummary: string
  demoCtaLabel: string
}

export type CanonicalSoftwareNavItem = {
  slug: string
  title: string
  path: string
  order: number
}

/** Header / mobil menü ve builder nav ile hizalı yazılım sırası */
export const CANONICAL_SOFTWARE_NAV: CanonicalSoftwareNavItem[] = [
  {
    slug: BILIRKISI_HESAP_SLUG,
    title: 'Bilirkişi Hesap',
    path: `/yazilimlar/${BILIRKISI_HESAP_SLUG}`,
    order: 0,
  },
  {
    slug: 'muvekkil-kasa-defteri-yazilimi',
    title: 'Müvekkil Kasa Defteri Masaüstü',
    path: '/yazilimlar/muvekkil-kasa-defteri?surum=masaustu',
    order: 1,
  },
  {
    slug: 'muvekkil-kasa-defteri-web-tabanli',
    title: 'Müvekkil Kasa Defteri Çoklu Kullanıcı Web Tabanlı',
    path: '/yazilimlar/muvekkil-kasa-defteri?surum=saas',
    order: 2,
  },
  {
    slug: KOOPPLUS_SLUG,
    title: 'KoopPlus',
    path: KOOPPLUS_PATH,
    order: 3,
  },
  {
    slug: 'sifre-kasasi',
    title: 'Ücretsiz Woontegra Şifre Kasası',
    path: '/yazilimlar/sifre-kasasi',
    order: 4,
  },
]

const PROMOTIONAL_SOFTWARE: Record<string, { meta: PromotionalSoftwareMeta; detail: PublicProductDetail }> = {
  [BILIRKISI_HESAP_SLUG]: {
    meta: {
      officialUrl: BILIRKISI_HESAP_CHECKOUT_PATH,
      checkoutPath: BILIRKISI_HESAP_CHECKOUT_PATH,
      badges: ['Woontegra Yazılımı', 'Web Tabanlı', 'Hukuk / Bilirkişi', 'Öne Çıkan'],
      ctaLabel: 'Satın Al',
      listCtaLabel: 'İncele',
      priceNote: 'Fiyat yükleniyor…',
      disclaimer:
        'Bu ürün Woontegra tarafından geliştirilmiştir. Satın alma sonrası lisans ve program girişi Bilirkişi Hesap paneli üzerinden sağlanır.',
      publicProductTypeLabel: 'Web Tabanlı Yazılım',
      useCases: [
        'Web tabanlı bilirkişi ve işçilik alacağı hesaplamaları için uygundur.',
        'İş hukuku süreçlerinde düzenli hesaplama çıktısı hazırlamak isteyen avukatlar için idealdir.',
        'Tarayıcı üzerinden erişim ve kontrollü hesaplama akışı arayan kullanıcılar için uygundur.',
      ],
      deliveryNotes: [
        'Satın alma Woontegra üzerinden tamamlanır; lisans Bilirkişi Hesap panelinde oluşur.',
        'Demo talebi 7 günlük deneme lisansı oluşturur (panel e-postası ile).',
      ],
      licenseSummary: 'Abonelik · panel erişimi',
      demoCtaLabel: 'Demo Talep Et',
    },
    detail: {
      id: 'promotional-bilirkisi-hesap',
      name: 'Bilirkişi Hesap',
      slug: BILIRKISI_HESAP_SLUG,
      productType: 'SERVICE',
      shortDescription:
        'Woontegra tarafından geliştirilen web tabanlı yazılım; işçilik alacakları, kıdem-ihbar tazminatı, fazla mesai, yıllık izin ve benzeri bilirkişi hesaplamalarını hazırlamak için tasarlanmıştır.',
      description:
        '<p>Bilirkişi Hesap; Woontegra’nın iş hukuku ve bilirkişilik süreçleri için geliştirdiği web tabanlı bir hesaplama yazılımıdır. İşçilik alacakları, kıdem-ihbar tazminatı, fazla mesai, yıllık izin ve benzeri hesaplamaların düzenli ve kontrollü şekilde hazırlanmasına yardımcı olur.</p><p>Satın alma ve demo talebi Woontegra üzerinden yapılır. Program girişi Bilirkişi Hesap paneli üzerinden sağlanır.</p>',
      price: 0,
      compareAtPrice: null,
      currency: 'TRY',
      isActive: true,
      isFeatured: false,
      sortOrder: -100,
      version: null,
      purchaseEnabled: false,
      licenseMonths: 12,
      coverImage: null,
      category: null,
      seoTitle: 'Bilirkişi Hesaplama Yazılımı | Woontegra Yazılımları',
      seoDescription:
        'İşçilik alacakları, kıdem-ihbar tazminatı, fazla mesai ve yıllık izin hesaplamalarını web tabanlı olarak hazırlamak için geliştirilen Bilirkişi Hesaplama Yazılımı.',
      galleryImages: [],
      featureBullets:
        'İşçilik alacakları hesaplama\nKıdem ve ihbar tazminatı\nFazla mesai ve yıllık izin\nBilirkişi raporlarına uygun hesaplama\n40\'dan fazla hesaplama sayfası\nWeb tabanlı erişim ve kullanım',
      licenseRequired: false,
      licenseDays: null,
      licenseMaxDevices: null,
      hasDownload: false,
    },
  },
}

export const PROMOTIONAL_SOFTWARE_SLUGS = new Set(Object.keys(PROMOTIONAL_SOFTWARE))

export function getPromotionalSoftwareMeta(slug: string): PromotionalSoftwareMeta | null {
  return PROMOTIONAL_SOFTWARE[slug]?.meta ?? null
}

export function getPromotionalSoftwareDetail(slug: string): PublicProductDetail | null {
  const entry = PROMOTIONAL_SOFTWARE[slug]
  if (!entry) return null
  return { ...entry.detail }
}

export function getPromotionalSoftwareListItems(): PublicProductListItem[] {
  return Object.values(PROMOTIONAL_SOFTWARE).map(({ detail }) => {
    const { description: _d, seoTitle: _s, seoDescription: _sd, galleryImages: _g, featureBullets: _f, ...listItem } =
      detail
    void _d
    void _s
    void _sd
    void _g
    void _f
    return listItem
  })
}

export function isPromotionalSoftwareSlug(slug: string): boolean {
  return PROMOTIONAL_SOFTWARE_SLUGS.has(slug)
}
