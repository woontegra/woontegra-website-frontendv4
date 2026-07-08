import type { PublicProductDetail, PublicProductListItem } from '@/types/product'

export const BILIRKISI_HESAP_SLUG = 'bilirkisi-hesap'
export const BILIRKISI_HESAP_OFFICIAL_URL = 'https://www.bilirkisihesap.com/'

export type PromotionalSoftwareMeta = {
  officialUrl: string
  badges: string[]
  ctaLabel: string
  priceNote: string
  disclaimer: string
  listCtaLabel: string
  publicProductTypeLabel: string
  useCases: string[]
  deliveryNotes: string[]
  licenseSummary: string
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
    title: 'Bilirkişi Hesaplama Yazılımı',
    path: `/yazilimlar/${BILIRKISI_HESAP_SLUG}`,
    order: 0,
  },
  {
    slug: 'muvekkil-kasa-defteri-yazilimi',
    title: 'Müvekkil Kasa Defteri Masaüstü',
    path: '/yazilimlar/muvekkil-kasa-defteri-yazilimi',
    order: 1,
  },
  {
    slug: 'muvekkil-kasa-defteri-web-tabanli',
    title: 'Müvekkil Kasa Defteri Çoklu Kullanıcı Web Tabanlı',
    path: '/yazilimlar/muvekkil-kasa-defteri-web-tabanli',
    order: 2,
  },
  {
    slug: 'sifre-kasasi',
    title: 'Ücretsiz Woontegra Şifre Kasası',
    path: '/yazilimlar/sifre-kasasi',
    order: 3,
  },
]

const PROMOTIONAL_SOFTWARE: Record<string, { meta: PromotionalSoftwareMeta; detail: PublicProductDetail }> = {
  [BILIRKISI_HESAP_SLUG]: {
    meta: {
      officialUrl: BILIRKISI_HESAP_OFFICIAL_URL,
      badges: ['Harici Satış', 'Web Tabanlı Yazılım', 'Hukuk / Bilirkişi', 'Öne Çıkan'],
      ctaLabel: 'Resmi Siteye Git',
      listCtaLabel: 'İncele',
      priceNote: 'Detaylar resmi sitede',
      disclaimer:
        'Bu ürün Woontegra tarafından geliştirilmiştir. Satış, lisans üretimi ve kullanıcı işlemleri Bilirkişi Hesaplama Yazılımı resmi sitesi üzerinden yürütülmektedir.',
      publicProductTypeLabel: 'Web Tabanlı Yazılım',
      useCases: [
        'Web tabanlı bilirkişi ve işçilik alacağı hesaplamaları için uygundur.',
        'İş hukuku süreçlerinde düzenli hesaplama çıktısı hazırlamak isteyen avukatlar için idealdir.',
        'Tarayıcı üzerinden erişim ve kontrollü hesaplama akışı arayan kullanıcılar için uygundur.',
      ],
      deliveryNotes: [
        'Satın alma, lisans ve kullanıcı işlemleri resmi sitede yürütülür.',
        'Woontegra sepeti ve ödeme akışına dahil değildir.',
      ],
      licenseSummary: 'Resmi sitede',
    },
    detail: {
      id: 'promotional-bilirkisi-hesap',
      name: 'Bilirkişi Hesaplama Yazılımı',
      slug: BILIRKISI_HESAP_SLUG,
      productType: 'SERVICE',
      shortDescription:
        'İşçilik alacakları, kıdem-ihbar tazminatı, fazla mesai, yıllık izin ve benzeri bilirkişi hesaplamalarını web tabanlı olarak hazırlamak için geliştirilen profesyonel hesaplama yazılımı.',
      description:
        '<p>Bilirkişi Hesaplama Yazılımı; iş hukuku ve bilirkişilik süreçlerinde kullanılan hesaplama kalemlerini tek merkezde toplayan, web tabanlı bir hesaplama yazılımıdır. İşçilik alacakları, kıdem-ihbar tazminatı, fazla mesai, yıllık izin ve benzeri hesaplamaların düzenli ve kontrollü şekilde hazırlanmasına yardımcı olur.</p><p>Satın alma, lisans üretimi, kullanıcı hesabı ve destek süreçleri Bilirkişi Hesaplama Yazılımı’nın resmi sitesi üzerinden yürütülür.</p>',
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
