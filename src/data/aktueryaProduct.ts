export const AKTUERYA_NAME = 'Aktüerya Hesaplama'
export const AKTUERYA_SLUG = 'aktuerya-hesaplama'
export const AKTUERYA_PATH = `/yazilimlar/${AKTUERYA_SLUG}`

export const AKTUERYA_LOGO_MARK = '/images/products/aktuerya-hesap-icon.png'
export const AKTUERYA_LOGO_HORIZONTAL = '/images/products/aktuerya-logo-horizontal.png'

/** Mevcut deneme kuralı: trialConfig.ts */
export const AKTUERYA_DEMO_DAYS = 7
export const AKTUERYA_DEMO_CREDITS = 10

export const AKTUERYA_MONTHLY_TL = 3000
export const AKTUERYA_YEARLY_TL = 30000

export const AKTUERYA_SEO = {
  title: 'Aktüerya Hesaplama | Trafik ve İş Kazası Tazminat Hesabı | Woontegra',
  description:
    'Aktüerya Hesaplama; trafik ve iş kazalarında yaralanma ile ölüm tazminatı hesaplarını web, masaüstü ve mobil üzerinden yönetmenizi sağlar.',
} as const

export const AKTUERYA_HEADLINE = 'Aktüeryal Tazminat Hesaplamaları Tek Platformda'

export const AKTUERYA_LEAD =
  'Trafik ve iş kazalarında yaralanma ve ölüm tazminatı hesaplamalarınızı Web, Masaüstü ve Mobil uygulamalar üzerinden yönetin.'

export const AKTUERYA_SALES_PENDING = 'Satın alma bu sayfada henüz açılmamıştır.'
export const AKTUERYA_DEMO_PENDING = 'Demo talebi bu sayfada henüz alınmamaktadır.'

export const AKTUERYA_MODULES = [
  {
    title: 'Trafik Kazası — Yaralanma',
    text: 'Trafik kazasından kaynaklanan yaralanma tazminatının aktüeryal hesabı.',
  },
  {
    title: 'Trafik Kazası — Ölüm',
    text: 'Trafik kazasından kaynaklanan ölüm tazminatının aktüeryal hesabı. Sonuç PDF veya Word olarak alınabilir.',
  },
  {
    title: 'İş Kazası — Yaralanma',
    text: 'İş kazasından kaynaklanan yaralanma tazminatının aktüeryal hesabı.',
  },
  {
    title: 'İş Kazası — Ölüm',
    text: 'İş kazasından kaynaklanan ölüm tazminatının aktüeryal hesabı.',
  },
] as const

export const AKTUERYA_FEATURES = [
  {
    title: 'Dört hesap modülü',
    text: 'Trafik ve iş kazasında yaralanma ile ölüm hesapları aynı platformdadır.',
  },
  {
    title: 'Kayıtlı çalışmalar',
    text: 'Tamamladığınız hesaplar hesabınızda saklanır.',
  },
  {
    title: 'Hesabı yeniden açma',
    text: 'Kayıtlı bir çalışmayı daha sonra açıp kaldığınız yerden sürdürebilirsiniz.',
  },
  {
    title: 'Hesap ve lisans',
    text: 'Profil, şifre ve lisans bilgileriniz hesabınızda yer alır.',
  },
  {
    title: 'Bildirim merkezi',
    text: 'Hesabınıza gelen bildirimleri tek yerden izlersiniz.',
  },
  {
    title: 'Destek talebi',
    text: 'Destek talebi açabilir ve yazışmayı aynı yerden takip edebilirsiniz.',
  },
  {
    title: 'Rapor çıktısı',
    text: 'Trafik kazası ölüm hesabının sonucunu PDF veya Word olarak alabilirsiniz.',
  },
  {
    title: 'Web, masaüstü ve mobil',
    text: 'Web, Windows, macOS ve mobil uygulamalar üzerinden kullanabilirsiniz.',
  },
  {
    title: 'Açık ve koyu görünüm',
    text: 'Açık, koyu veya sistem görünümünden birini seçebilirsiniz.',
  },
  {
    title: 'Güvenli hesap',
    text: 'Erişim kullanıcı hesabına bağlıdır. Şifrenizi unutursanız sıfırlama bağlantısı isteyebilirsiniz.',
  },
] as const

/** Gerçek ekran görüntüsü yok. src dolunca aynı çerçevede gösterilir. */
export const AKTUERYA_SCREENSHOTS: { id: string; caption: string; alt: string; src: string | null }[] = [
  {
    id: 'hesap-turleri',
    caption: 'Hesap türleri',
    alt: 'Aktüerya Hesaplama hesap türleri ekranı',
    src: null,
  },
  {
    id: 'hesap-sonucu',
    caption: 'Hesap sonucu',
    alt: 'Aktüerya Hesaplama sonuç ekranı',
    src: null,
  },
  {
    id: 'kayitli-calismalar',
    caption: 'Kayıtlı çalışmalar',
    alt: 'Aktüerya Hesaplama kayıtlı çalışmalar ekranı',
    src: null,
  },
]

export const AKTUERYA_AUDIENCE = [
  {
    title: 'Bilirkişiler',
    text: 'Dosya kapsamında aktüeryal tazminat hesabı hazırlayan bilirkişiler.',
  },
  {
    title: 'Avukatlar',
    text: 'Trafik ve iş kazası dosyalarında tazminat hesabını çalışmasına dahil eden avukatlar.',
  },
  {
    title: 'Mesleki kullanıcılar',
    text: 'Bu hesapları rapor ve dava çalışmalarında düzenli kullanan uzmanlar.',
  },
] as const

export const AKTUERYA_REASONS = [
  {
    title: 'Dört hesap, tek platform',
    text: 'Trafik ve iş kazasının yaralanma ve ölüm hesapları aynı platformda toplanır.',
  },
  {
    title: 'Kayıtlı çalışmalar',
    text: 'Hesaplarınız hesabınızda saklanır ve daha sonra yeniden açılır.',
  },
  {
    title: 'Rapor ve destek',
    text: 'Trafik kazası ölüm hesabında PDF veya Word çıktısı alınır. Bildirimler ve destek talepleri platformdadır.',
  },
  {
    title: 'Hesabınıza bağlı erişim',
    text: 'Abonelik ve demo, kullanıcı hesabına tanımlanır. Demo giriş ekranından kendiliğinden açılmaz.',
  },
] as const

export const AKTUERYA_FAQ = [
  {
    question: 'Aktüerya Hesaplama nedir?',
    answer:
      'Trafik ve iş kazalarında yaralanma ile ölüm tazminatı hesapları için geliştirilen Woontegra platformudur. Web, Windows, macOS ve mobil sürümleri vardır. Hesap çıktısı üretir; dava sonucu veya hukuki değerlendirme garantisi vermez.',
  },
  {
    question: 'Hangi hesaplamaları yapabilirim?',
    answer:
      'Trafik kazası yaralanma, trafik kazası ölüm, iş kazası yaralanma ve iş kazası ölüm. Trafik kazası ölüm hesabının sonucu PDF veya Word olarak alınabilir.',
  },
  {
    question: 'Hangi sürümler var?',
    answer: 'Web, Windows, macOS ve mobil sürümleri vardır.',
  },
  {
    question: 'Hesaplamalarımı kaydedebilir miyim?',
    answer: 'Evet. Hesaplar hesabınıza kaydedilir ve daha sonra yeniden açılabilir.',
  },
  {
    question: 'Demo kullanabilir miyim?',
    answer: `Demo hesabı giriş ekranından açılmaz. Erişim, talebiniz incelendikten sonra tanımlanır. Deneme ${AKTUERYA_DEMO_DAYS} gün sürer ve ${AKTUERYA_DEMO_CREDITS} hesap kredisi içerir. Bu sayfadaki düğme henüz talep oluşturmaz.`,
  },
  {
    question: 'Aylık ve yıllık paket arasındaki fark nedir?',
    answer:
      'Aylık paket 3.000 TL / ay tutarındadır ve esnek kullanım içindir. Yıllık paket 30.000 TL / yıl tutarındadır ve 12 ay kesintisiz kullanım içindir. Satın alma bu sayfada henüz açılmamıştır.',
  },
  {
    question: 'Destek nasıl alabilirim?',
    answer: 'Hesabınıza girdikten sonra destek merkezinden talep açabilir, yanıtı aynı ekrandan takip edebilirsiniz.',
  },
] as const

export function formatTl(amount: number): string {
  return new Intl.NumberFormat('tr-TR').format(amount)
}

/** Tanıtım sayfasının sabit içeriği (CMS / satış API’siz). */
export type AktueryaPageContent = {
  heroTitle: string
  heroHeadline: string
  heroLead: string
  logoUrl: string
  heroImageUrl: string
  gallery: { id: string; caption: string; alt: string; url: string }[]
  modules: { title: string; text: string }[]
  features: { title: string; text: string }[]
  sections: {
    modules: boolean
    features: boolean
    gallery: boolean
    audience: boolean
    reasons: boolean
    demo: boolean
    faq: boolean
    mobile: boolean
    closing: boolean
  }
  mobileTitle: string
  mobileText: string
  googlePlayKicker: string
  googlePlayLabel: string
  googlePlayUrl: string
  appStoreKicker: string
  appStoreLabel: string
  appStoreUrl: string
  monthlyPriceTl: number
  yearlyPriceTl: number
  demoDays: number
  demoCredits: number
}

export function getDefaultAktueryaPageContent(): AktueryaPageContent {
  return {
    heroTitle: AKTUERYA_NAME,
    heroHeadline: AKTUERYA_HEADLINE,
    heroLead: AKTUERYA_LEAD,
    logoUrl: '',
    heroImageUrl: '',
    gallery: AKTUERYA_SCREENSHOTS.map((shot) => ({
      id: shot.id,
      caption: shot.caption,
      alt: shot.alt,
      url: shot.src ?? '',
    })),
    modules: AKTUERYA_MODULES.map((item) => ({ title: item.title, text: item.text })),
    features: AKTUERYA_FEATURES.map((item) => ({ title: item.title, text: item.text })),
    sections: {
      modules: true,
      features: true,
      gallery: true,
      audience: true,
      reasons: true,
      demo: true,
      faq: true,
      mobile: true,
      closing: true,
    },
    mobileTitle: 'Aktüerya Mobil',
    mobileText: 'Android ve iOS uygulaması. Mağaza bağlantıları yayınlandığında buradan indirilebilir.',
    googlePlayKicker: "Google Play'den",
    googlePlayLabel: 'İndirin',
    googlePlayUrl: '',
    appStoreKicker: "App Store'dan",
    appStoreLabel: 'İndirin',
    appStoreUrl: '',
    monthlyPriceTl: AKTUERYA_MONTHLY_TL,
    yearlyPriceTl: AKTUERYA_YEARLY_TL,
    demoDays: AKTUERYA_DEMO_DAYS,
    demoCredits: AKTUERYA_DEMO_CREDITS,
  }
}
