import type { ProductType } from '@/types/product'

export type ProductBuilderSeed = {
  slug: string
  name: string
  shortDescription: string
  productType: ProductType
  price: number
  compareAtPrice?: number | null
  currency: string
  licenseMonths: number
  version: string
  coverImage: string | null
  gallery: string[]
  description: string
  featureBullets: string[]
  systemRequirements: string
  deliveryInfo: string
  licenseInfo: string
}

export const PRODUCT_BUILDER_SEEDS: Record<string, ProductBuilderSeed> = {
  'bilirkisi-hesap': {
    slug: 'bilirkisi-hesap',
    name: 'Bilirkişi Hesaplama Yazılımı',
    shortDescription:
      'İşçilik alacakları, kıdem-ihbar tazminatı, fazla mesai, yıllık izin ve benzeri bilirkişi hesaplamalarını web tabanlı olarak hazırlamak için geliştirilen profesyonel hesaplama yazılımı.',
    productType: 'SERVICE',
    price: 0,
    currency: 'TRY',
    licenseMonths: 12,
    version: '1.0.0',
    coverImage: null,
    gallery: [],
    description:
      '<p>Bilirkişi Hesaplama Yazılımı; iş hukuku ve bilirkişilik süreçlerinde kullanılan hesaplama kalemlerini tek merkezde toplayan, web tabanlı bir hesaplama yazılımıdır. Satın alma, lisans ve destek süreçleri resmi site üzerinden yürütülür.</p>',
    featureBullets: [
      'İşçilik alacakları',
      'Kıdem ve ihbar tazminatı',
      'Fazla mesai',
      'Yıllık izin',
      'Bilirkişi raporlarına uygun hesaplama',
      '40\'dan fazla hesaplama sayfası',
      'Web tabanlı erişim',
    ],
    systemRequirements: 'Modern tarayıcı, internet bağlantısı',
    deliveryInfo: 'Satış ve lisans işlemleri resmi sitede yürütülür.',
    licenseInfo: 'Lisans üretimi Bilirkişi Hesaplama Yazılımı resmi sitesi üzerinden yapılır.',
  },
  'muvekkil-kasa-defteri-yazilimi': {
    slug: 'muvekkil-kasa-defteri-yazilimi',
    name: 'Müvekkil Kasa Defteri Masaüstü',
    shortDescription: 'Avukatlar için masaüstü müvekkil kasa defteri yazılımı.',
    productType: 'DOWNLOAD',
    price: 4990,
    currency: 'TRY',
    licenseMonths: 12,
    version: '3.2.0',
    coverImage: '/images/products/mk-desktop.png',
    gallery: [],
    description: '<p>Müvekkil kasa hareketlerini güvenle takip edin.</p>',
    featureBullets: ['Masaüstü kurulum', 'Offline çalışma', 'Raporlama'],
    systemRequirements: 'Windows 10+, 4 GB RAM',
    deliveryInfo: 'Dijital teslimat — indirme linki satın alma sonrası iletilir.',
    licenseInfo: 'Cihaz bazlı lisans anahtarı tanımlanır.',
  },
  'muvekkil-kasa-defteri-web-tabanli': {
    slug: 'muvekkil-kasa-defteri-web-tabanli',
    name: 'Müvekkil Kasa Defteri Çoklu Kullanıcı Web Tabanlı',
    shortDescription: 'Bulut tabanlı çoklu kullanıcı müvekkil kasa defteri.',
    productType: 'SAAS',
    price: 7990,
    currency: 'TRY',
    licenseMonths: 12,
    version: '2.1.0',
    coverImage: '/images/products/mk-web.png',
    gallery: [],
    description: '<p>Ofis genelinde eşzamanlı erişim ve merkezi yönetim.</p>',
    featureBullets: ['Çoklu kullanıcı', 'Web erişim', 'Yıllık abonelik'],
    systemRequirements: 'Modern tarayıcı, internet bağlantısı',
    deliveryInfo: 'Hesap aktivasyonu e-posta ile gönderilir.',
    licenseInfo: 'Yıllık SaaS abonelik — kullanıcı sayısına göre planlanır.',
  },
  'sifre-kasasi': {
    slug: 'sifre-kasasi',
    name: 'Ücretsiz Woontegra Şifre Kasası',
    shortDescription: 'Şifrelerinizi cihazınızda güvenle saklayın — ücretsiz.',
    productType: 'DOWNLOAD',
    price: 0,
    currency: 'TRY',
    licenseMonths: 12,
    version: '1.0.0',
    coverImage: '/images/woontegra-sifre-kasasi-ekran.png',
    gallery: ['/images/woontegra-sifre-kasasi-ekran.png'],
    description: '<p>Yerel şifre kasası — veriler sunucuya gönderilmez.</p>',
    featureBullets: ['Ücretsiz', 'Yerel depolama', 'Masaüstü uygulama'],
    systemRequirements: 'Windows 10+',
    deliveryInfo: 'Ücretsiz indirme — kayıt gerekmez.',
    licenseInfo: 'Ücretsiz kullanım lisansı.',
  },
}

export function getProductBuilderSeed(slug: string): ProductBuilderSeed {
  return (
    PRODUCT_BUILDER_SEEDS[slug] ?? {
      slug,
      name: slug.replace(/-/g, ' '),
      shortDescription: 'Ürün açıklaması',
      productType: 'DOWNLOAD',
      price: 0,
      currency: 'TRY',
      licenseMonths: 12,
      version: '1.0.0',
      coverImage: null,
      gallery: [],
      description: '<p>Ürün detay açıklaması</p>',
      featureBullets: ['Özellik 1'],
      systemRequirements: '',
      deliveryInfo: '',
      licenseInfo: '',
    }
  )
}

function extractProductPageOverride(
  raw: Record<string, unknown> | null,
  slug: string,
): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object') return null
  const pages = raw.pages as Record<string, unknown> | undefined
  if (pages && typeof pages === 'object') {
    const page = pages[slug]
    return page && typeof page === 'object' ? (page as Record<string, unknown>) : null
  }
  return null
}

export function resolveProductBuilderSource(
  slug: string,
  raw: Record<string, unknown> | null,
): ProductBuilderSeed {
  const seed = getProductBuilderSeed(slug)
  const override = extractProductPageOverride(raw, slug)
  if (!override) return seed
  return {
    ...seed,
    name: String(override.name ?? seed.name),
    shortDescription: String(override.shortDescription ?? seed.shortDescription),
    price: Number(override.price ?? seed.price),
    description: String(override.description ?? seed.description),
  }
}
