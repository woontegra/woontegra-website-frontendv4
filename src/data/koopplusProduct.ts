import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeftRight,
  Building2,
  Calculator,
  Database,
  FileSpreadsheet,
  Landmark,
  Layers,
  Percent,
  Receipt,
  ShieldCheck,
  Users,
  Wallet,
} from 'lucide-react'

export const KOOPPLUS_SLUG = 'koopplus'
export const KOOPPLUS_PATH = `/yazilimlar/${KOOPPLUS_SLUG}`
export const KOOPPLUS_NAME = 'KoopPlus'
export const KOOPPLUS_TAGLINE = 'Kooperatif Yönetim Sistemi'

/** Özel checkout route yok. Satış açılınca generic addToCart(productId) → /sepet. */
export const KOOPPLUS_WINDOWS_CHECKOUT_PATH: string | null = null

/**
 * Windows installer public URL — Cloudflare R2 (ileride).
 * Vercel public, GitHub Release veya lisans sunucusu kullanılmaz.
 * Gerçek R2 URL’si bağlanana kadar null; r2.dev / custom domain uydurulmaz.
 */
export const KOOPPLUS_WINDOWS_DOWNLOAD_URL: string | null = null

/**
 * macOS satış anahtarı. D-U-N-S/onay tamamlanmadan true yapılmamalı.
 * Tarih bazlı otomatik açılış yok.
 */
export const KOOPPLUS_MACOS_AVAILABLE = false

export const KOOPPLUS_MACOS_CHECKOUT_PATH: string | null = null

/**
 * Dağıtım ayrımı (bu dosya yalnızca website satış config’idir; R2’ye bağlanmaz).
 * Website = satış sayfası · Payment = satın alma · License server = demo/aktivasyon
 * R2 = Windows installer + uygulama güncelleme artifact’ları · Desktop = lisans API + R2 updater
 */
export const KOOPPLUS_DISTRIBUTION = {
  windows: {
    artifacts: 'r2' as const,
    checkoutPath: KOOPPLUS_WINDOWS_CHECKOUT_PATH,
    downloadUrl: KOOPPLUS_WINDOWS_DOWNLOAD_URL,
  },
  macos: {
    available: KOOPPLUS_MACOS_AVAILABLE,
    checkoutPath: KOOPPLUS_MACOS_CHECKOUT_PATH,
  },
} as const

/** Resmi ürün ekran görüntüsü eklenince public path yazılır. Uydurma görsel yok. */
export const KOOPPLUS_HERO_IMAGE: string | null = null

/** Resmi kare KoopPlus uygulama ikonu (Desktop favicon kopyası). Screenshot değil. */
export const KOOPPLUS_BRAND_ICON = '/images/products/koopplus-icon.png'

export const KOOPPLUS_PRICE_LABEL = 'Yıllık Lisans'
/** Satış fiyatı Product API’den gelir; burada ikinci bir tutar tutulmaz. */
export const KOOPPLUS_PRICE_AMOUNT: number | null = null
export const KOOPPLUS_PRICE_CURRENCY = 'TRY'

export const KOOPPLUS_SEO = {
  title: 'KoopPlus | Kooperatif Yönetim Programı | Woontegra',
  description:
    'Kooperatif aidat, tahsilat, üye, faiz, kasa ve banka işlemlerini tek masaüstü uygulamasında yönetin. KoopPlus’ı 7 gün ücretsiz deneyin.',
} as const

export const KOOPPLUS_HERO = {
  kicker: KOOPPLUS_NAME,
  identity: KOOPPLUS_TAGLINE,
  title: 'Kooperatif yönetimini tek merkezde toplayın.',
  description:
    'Üyelerden aidat ve tahsilata, faiz işlemlerinden kasa ve banka hareketlerine kadar kooperatifinizin günlük yönetimini tek uygulamada takip edin.',
  primaryCta: 'Windows için Satın Al',
  secondaryCta: '7 Gün Ücretsiz Dene',
} as const

export const KOOPPLUS_TRIAL = {
  title: '7 Gün Ücretsiz Deneyin',
  intro: 'KoopPlus’ı masaüstü uygulamada 7 gün ücretsiz deneyebilirsiniz.',
  points: [
    'Deneme süresi 7 gündür ve masaüstü uygulamada başlatılır.',
    'Demo sonunda verileriniz silinmez.',
    'Lisans etkinleştirildiğinde aynı verilerle çalışmaya devam edilir.',
  ],
} as const

export type KoopPlusFeature = {
  title: string
  description: string
  icon: LucideIcon
}

export const KOOPPLUS_FEATURES: KoopPlusFeature[] = [
  {
    title: 'Üye Yönetimi',
    description: 'Kooperatif üyelerini tek listede tutun, üye bilgilerini düzenli kaydedin.',
    icon: Users,
  },
  {
    title: 'Aidat / Borç Takibi',
    description: 'Aidat ve borç bakiyelerini üye bazında izleyin.',
    icon: Calculator,
  },
  {
    title: 'Tahsilat Yönetimi',
    description: 'Tahsilatları kaydedin ve ödeme durumunu tek ekrandan takip edin.',
    icon: Receipt,
  },
  {
    title: 'Faiz İşletme',
    description: 'Geciken alacaklar için faiz işlemlerini uygulamadan yürütün.',
    icon: Percent,
  },
  {
    title: 'Kooperatif Kasası',
    description: 'Kasa giriş-çıkışlarını kooperatif kayıtlarıyla birlikte görün.',
    icon: Wallet,
  },
  {
    title: 'Banka Hareketleri',
    description: 'Banka hareketlerini kaydedin ve kasa ile birlikte kontrol edin.',
    icon: Landmark,
  },
  {
    title: 'Excel / Banka Eşleştirme',
    description: 'Excel veya banka hareketlerini aidat ve tahsilat kayıtlarıyla eşleştirin.',
    icon: FileSpreadsheet,
  },
  {
    title: 'Aidat Dağıtımı',
    description: 'Aidat dağıtımını üyelere düzenli şekilde yansıtın.',
    icon: ArrowLeftRight,
  },
  {
    title: 'Raporlar',
    description: 'Üye, tahsilat, kasa ve banka özetlerini raporlayın.',
    icon: Layers,
  },
  {
    title: 'Yedekleme',
    description: 'Kooperatif kayıtlarınız için yedek alma imkânı vardır.',
    icon: Database,
  },
  {
    title: 'Çoklu Kooperatif Yönetimi',
    description: 'Bir uygulama içinde birden fazla kooperatif hesabını ayrı tutarak yönetin.',
    icon: Building2,
  },
]

export const KOOPPLUS_WHY = [
  {
    title: 'Dağınık Excel yerine tek sistem',
    description: 'Üye, aidat ve tahsilat kayıtlarını ayrı dosyalarda aramak yerine tek düzenli yapıda tutun.',
  },
  {
    title: 'Aidat ve tahsilatı tek ekrandan izleyin',
    description: 'Kimin ödediğini, kimin borcu kaldığını daha hızlı görün.',
  },
  {
    title: 'Üye borç/alacak durumunu netleştirin',
    description: 'Üye bazında bakiyeyi uygulamadan kontrol edin.',
  },
  {
    title: 'Kasa ve bankayı daha kontrollü takip edin',
    description: 'Nakit ve banka hareketlerini ayrı ayrı, aynı uygulamada izleyin.',
  },
  {
    title: 'Geçmiş dönem kayıtlarıyla çalışın',
    description: 'Önceki dönem işlemlerini kaybetmeden devam edin.',
  },
  {
    title: 'Birden fazla kooperatifi ayrı yönetin',
    description: 'Aynı uygulamada kooperatifler arasında geçiş yapın; veriler birbirine karışmaz.',
  },
] as const

export const KOOPPLUS_MULTI_COOP = {
  title: 'Birden fazla kooperatif, tek KoopPlus.',
  description:
    'Bir uygulama içinden birden fazla kooperatif hesabı oluşturabilir ve kooperatifler arasında geçiş yapabilirsiniz. Her kooperatifin verileri birbirinden ayrı tutulur.',
} as const

export const KOOPPLUS_LOCAL_DATA = {
  title: 'Verileriniz sizin bilgisayarınızda.',
  description:
    'KoopPlus bir masaüstü uygulamadır. Kooperatif kayıtları cihazınızdaki yerel veritabanında tutulur. Yedekleme özelliği ile kopya alabilirsiniz.',
} as const

export const KOOPPLUS_LICENSE_POINTS = [
  'Yıllık lisans modeli',
  '1 lisans = 1 bilgisayar',
  '7 günlük ücretsiz deneme',
  'Lisans yenilendiğinde aynı lisans anahtarı devam eder',
  'Yenilemede lisans süresi uzatılır',
] as const

export const KOOPPLUS_FAQ = [
  {
    question: 'Ücretsiz deneme kaç gün?',
    answer: '7 gün.',
  },
  {
    question: 'Bir lisansı kaç bilgisayarda kullanabilirim?',
    answer: '1 bilgisayarda.',
  },
  {
    question: 'Demo sonunda verilerim silinir mi?',
    answer: 'Hayır; lisans etkinleştirildiğinde aynı verilerle devam edilebilir.',
  },
  {
    question: 'Birden fazla kooperatif yönetebilir miyim?',
    answer: 'Evet, uygulama içinde birden fazla kooperatif hesabı yönetilebilir.',
  },
  {
    question: 'Lisansımı yenilediğimde yeni anahtar mı alırım?',
    answer: 'Hayır, mevcut lisans anahtarının süresi uzatılır.',
  },
  {
    question: 'Mac sürümü var mı?',
    answer: 'macOS sürümü henüz satışa açık değildir; yakında sunulacaktır.',
  },
] as const

export function isKoopPlusWindowsCheckoutReady(): boolean {
  return Boolean(KOOPPLUS_WINDOWS_CHECKOUT_PATH?.trim())
}

export function isKoopPlusWindowsDownloadReady(): boolean {
  return Boolean(KOOPPLUS_WINDOWS_DOWNLOAD_URL?.trim())
}

export function isKoopPlusMacCheckoutReady(): boolean {
  return KOOPPLUS_MACOS_AVAILABLE && Boolean(KOOPPLUS_MACOS_CHECKOUT_PATH?.trim())
}

export const KOOPPLUS_TRUST_ICON = ShieldCheck
