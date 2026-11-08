import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeftRight,
  Building2,
  Calculator,
  Cloud,
  FileSpreadsheet,
  Landmark,
  Layers,
  Percent,
  Receipt,
  ShieldCheck,
  Smartphone,
  Users,
  Wallet,
} from 'lucide-react'

/** Product API / cart kimliği — public SEO path değildir. */
export const KOOPPLUS_SLUG = 'koopplus'
/** Public canonical path slug — Product DB slug değildir. */
export const KOOPPLUS_SEO_SLUG = 'kooperatif-yonetim-yazilimi'
export const KOOPPLUS_PATH = `/yazilimlar/${KOOPPLUS_SEO_SLUG}`
export const KOOPPLUS_LEGACY_PATH = `/yazilimlar/${KOOPPLUS_SLUG}`
export const KOOPPLUS_NAME = 'KoopPlus'
export const KOOPPLUS_SEO_TOPIC = 'Kooperatif Yönetim Yazılımı'
export const KOOPPLUS_TAGLINE = KOOPPLUS_SEO_TOPIC
export const KOOPPLUS_APP_URL = 'https://koopplus.woontegra.com'
export const KOOPPLUS_KVKK_PATH = '/kvkk-aydinlatma-metni'
/** KVKK onay metni sürümü — KoopPlus’a gönderilir; metin değişince güncellenir. */
export const KOOPPLUS_KVKK_CONSENT_VERSION = 'kvkk-demo-2026-11'

export function isKoopPlusPublicSlug(slug?: string | null): boolean {
  const normalized = slug?.trim().toLowerCase()
  return normalized === KOOPPLUS_SLUG || normalized === KOOPPLUS_SEO_SLUG
}

/** @deprecated Masaüstü indirme kaldırıldı — SaaS. */
export const KOOPPLUS_WINDOWS_CHECKOUT_PATH: string | null = null
/** @deprecated */
export const KOOPPLUS_WINDOWS_SETUP_FILENAME = ''
/** @deprecated */
export const KOOPPLUS_WINDOWS_DOWNLOAD_URL = ''
/** @deprecated */
export const KOOPPLUS_MACOS_AVAILABLE = false
/** @deprecated */
export const KOOPPLUS_MACOS_CHECKOUT_PATH: string | null = null

export const KOOPPLUS_DISTRIBUTION = {
  saas: { appUrl: KOOPPLUS_APP_URL },
} as const

/** SaaS giriş ekranı (Playwright: koopplus.woontegra.com, 1440×900). */
export const KOOPPLUS_HERO_IMAGE = '/images/products/koopplus-login-saas.png'
export const KOOPPLUS_BRAND_ICON = '/images/products/koopplus-icon.optavif-w512.webp'

export const KOOPPLUS_PRICE_LABEL = 'KoopPlus Yıllık'
/** Satış fiyatı Product API’den gelir; burada ikinci bir tutar tutulmaz. */
export const KOOPPLUS_PRICE_AMOUNT: number | null = null
export const KOOPPLUS_PRICE_CURRENCY = 'TRY'

export const KOOPPLUS_SEO = {
  title: 'Kooperatif Yönetim Yazılımı | KoopPlus | Woontegra',
  description:
    'KoopPlus ile üye, aidat, tahsilat, faiz, kasa ve banka yönetimini tarayıcıdan yönetin. Kurulum yok; bilgisayar, tablet ve telefondan erişim. 7 gün ücretsiz demo.',
} as const

export const KOOPPLUS_HERO = {
  kicker: KOOPPLUS_NAME,
  identity: KOOPPLUS_TAGLINE,
  title: 'Kooperatif yönetimini tarayıcıdan, her yerden.',
  description:
    'Kurulum yok. KoopPlus web tabanlıdır; bilgisayar, tablet veya telefondan güvenli giriş yapın. Üye, aidat, tahsilat, faiz, kasa ve banka tek panelde.',
  primaryCta: 'Hemen Satın Al',
  secondaryCta: '7 Gün Ücretsiz Dene',
} as const

export const KOOPPLUS_TRIAL = {
  eyebrow: 'Ücretsiz Demo',
  title: '7 Gün Ücretsiz Deneyin',
  intro:
    'Kredi kartı gerekmez. Kısa formu doldurun; e-postanızdaki onay bağlantısıyla 7 günlük demo hesabınız açılsın.',
  highlights: [
    {
      title: 'Kredi kartı gerekmez',
      description: 'Demo için ödeme bilgisi istemiyoruz.',
    },
    {
      title: 'Hemen başlayın',
      description: 'Onay bağlantısına tıkladığınızda hesap hazırlanır.',
    },
    {
      title: '7 gün tam erişim',
      description: 'Tüm özellikleri demo süresince kullanabilirsiniz.',
    },
  ],
  downloadCta: '7 Gün Ücretsiz Demoyu Başlat',
  trustLine: 'Kredi kartı gerekmez · Onay e-posta ile',
  downloadHint: 'Demo formu birkaç dakika sürer.',
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
    description: 'Geciken alacaklar için faiz işlemlerini panelden yürütün.',
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
    title: 'PDF ve Excel Raporlar',
    description: 'Üye, tahsilat, kasa ve banka özetlerini PDF veya Excel olarak alın.',
    icon: Layers,
  },
  {
    title: 'Çoklu kullanıcı ve yetkiler',
    description: 'Yönetici, Personel ve İzleyici rolleriyle ekibinizi güvenle yetkilendirin.',
    icon: Users,
  },
  {
    title: 'Her cihazdan erişim',
    description: 'Bilgisayar, tablet ve telefondan aynı kooperatif hesabına giriş yapın.',
    icon: Smartphone,
  },
  {
    title: 'Masaüstü yedeğini içe aktarma',
    description: 'Eski masaüstü KoopPlus yedeğinizi tek adımda SaaS hesabına taşıyın.',
    icon: Cloud,
  },
  {
    title: 'Çoklu Kooperatif Yönetimi',
    description: 'Bir hesap içinde birden fazla kooperatifi ayrı tutarak yönetin.',
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
    description: 'Üye bazında bakiyeyi panelden kontrol edin.',
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
    description: 'Kooperatifler arasında geçiş yapın; veriler birbirine karışmaz.',
  },
] as const

export const KOOPPLUS_MULTI_COOP = {
  title: 'Birden fazla kooperatif, tek KoopPlus.',
  description:
    'Bir hesap içinden birden fazla kooperatif oluşturabilir ve aralarında geçiş yapabilirsiniz. Her kooperatifin verileri birbirinden ayrı tutulur.',
} as const

export const KOOPPLUS_LOCAL_DATA = {
  title: 'Verileriniz güvende.',
  description:
    'Bağlantı şifrelidir (HTTPS). Her kooperatifin verisi diğerlerinden tamamen ayrı tutulur. Düzenli yedekleme yapılır; istediğiniz zaman kendi bilgisayarınıza şifreli yedek alabilirsiniz.',
} as const

export const KOOPPLUS_LICENSE_POINTS = [
  'Yıllık abonelik (KDV dahil fiyat ürün kaydından)',
  'Lisans kooperatif başınadır',
  'Kurulum yok — tarayıcıdan kullanın',
  'Cihaz sınırı yok',
  'Yenilemede verileriniz aynen devam eder',
  'Demo sonunda satın alırsanız demoda girdiğiniz veriler korunur',
] as const

export const KOOPPLUS_FAQ = [
  {
    question: 'Deneme kaç gün?',
    answer: '7 gün. Kredi kartı gerekmez.',
  },
  {
    question: 'Kredi kartı gerekir mi?',
    answer: 'Hayır. Demo için ödeme bilgisi istemiyoruz.',
  },
  {
    question: 'Demo bitince verilerime ne olur?',
    answer:
      'Demo süresi dolunca giriş kapanabilir; satın aldığınızda demoda girdiğiniz veriler korunur ve yıllık aboneliğe geçilir.',
  },
  {
    question: 'Hangi cihazlardan kullanabilirim?',
    answer: 'Bilgisayar, tablet ve telefondan modern bir tarayıcıyla.',
  },
  {
    question: 'Kaç kullanıcı ekleyebilirim?',
    answer: 'Yönetici, Personel ve İzleyici rollerinde ekip üyeleri ekleyebilirsiniz.',
  },
  {
    question: 'Masaüstü KoopPlus kullanıyorum, ne olacak?',
    answer: 'Yedeğinizi SaaS hesabına tek tıkla içe aktarabilirsiniz.',
  },
  {
    question: 'Lisansımı nasıl yenilerim?',
    answer:
      'Satın alma sırasında “Lisansımı yenile”yi seçip mevcut lisans anahtarınızı girin; süre bir yıl uzatılır.',
  },
  {
    question: 'Fatura kesiliyor mu?',
    answer: 'Evet. Ödeme sonrası fatura bilgilerinize göre işlem yapılır.',
  },
] as const

export function isKoopPlusWindowsCheckoutReady(): boolean {
  return false
}

export type KoopPlusWindowsTrialDownload = {
  href: string
  filename: string
}

/** @deprecated İndirme kaldırıldı. */
export function getKoopPlusWindowsTrialDownload(): KoopPlusWindowsTrialDownload | null {
  return null
}

export function isKoopPlusWindowsDownloadReady(): boolean {
  return false
}

export function isKoopPlusMacCheckoutReady(): boolean {
  return false
}

export const KOOPPLUS_TRUST_ICON = ShieldCheck
