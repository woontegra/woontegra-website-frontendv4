export const HOME_PAGE_KEY = 'home' as const
export const HOME_PAGE_CONTENT_VERSION = 4

export type HomeServiceCard = {
  id: string
  icon: string
  title: string
  text: string
  color: string
  order: number
  enabled: boolean
}

export type HomeBrandCard = {
  id: string
  name: string
  text: string
  image: string
  url: string
  order: number
  enabled: boolean
}

export type HomeWhyCard = {
  id: string
  icon: string
  title: string
  text: string
  color: string
  order: number
  enabled: boolean
}

export type HomeProcessStep = {
  id: string
  step: string
  title: string
  text: string
  color: string
  order: number
  enabled: boolean
}

export type HomeIntroCard = {
  id: string
  title: string
  description: string
  icon?: string
  order: number
  enabled: boolean
}

export type HomePageContent = {
  version: number
  hero: {
    enabled: boolean
    tag: string
    title: string
    subtitle: string
    image: string
    button1Text: string
    button1Href: string
    button2Text: string
    button2Href: string
  }
  intro: {
    enabled: boolean
    eyebrow: string
    title: string
    text1?: string
    text2?: string
    cards: HomeIntroCard[]
  }
  services: {
    enabled: boolean
    title: string
    subtitle: string
    cards: HomeServiceCard[]
  }
  brands: {
    enabled: boolean
    title: string
    subtitle: string
    cards: HomeBrandCard[]
  }
  why: {
    enabled: boolean
    title: string
    subtitle: string
    cards: HomeWhyCard[]
  }
  process: {
    enabled: boolean
    title: string
    subtitle: string
    steps: HomeProcessStep[]
  }
  cta: {
    enabled: boolean
    title: string
    subtitle: string
    buttonText: string
    buttonHref: string
  }
}

function toStr(v: unknown, fb = ''): string {
  return v == null ? fb : String(v).trim()
}

function toBool(v: unknown, fb: boolean): boolean {
  return typeof v === 'boolean' ? v : fb
}

function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return items.slice().sort((a, b) => a.order - b.order)
}

export const defaultHomePageContent: HomePageContent = {
  version: HOME_PAGE_CONTENT_VERSION,
  hero: {
    enabled: true,
    tag: 'Woontegra',
    title: 'Dijital Dünyada Gerçek Çözümler Üretiyoruz',
    subtitle:
      'Sadece yazılım geliştirmiyoruz; kendi ürünlerimizi yaratıyor ve yönetiyoruz. E-ticaret, SaaS ve danışmanlık — hepsini deneyimliyoruz.',
    image: '/images/ana-sayfa-hero.jpg',
    button1Text: 'Çözümleri İncele',
    button1Href: '/cozumler',
    button2Text: 'İletişime Geç',
    button2Href: '/iletisim',
  },
  intro: {
    enabled: true,
    eyebrow: 'Bir web sitesinden fazlası',
    title:
      'Woontegra, fikrinizi yalnızca yayına almakla kalmaz; onu çalışan, ölçülebilir ve sürdürülebilir bir dijital sisteme dönüştürür.',
    cards: [
      { id: 'intro-1', title: 'Planlarız', description: 'İhtiyacı, hedefi ve doğru teknolojiyi birlikte netleştiririz.', icon: '01', order: 0, enabled: true },
      { id: 'intro-2', title: 'Geliştiririz', description: 'Web, e-ticaret ve yazılım çözümlerini sürdürülebilir şekilde üretiriz.', icon: '02', order: 1, enabled: true },
      { id: 'intro-3', title: 'Yönetiriz', description: 'Yayın sonrası destek, bakım ve geliştirme sürecini takip ederiz.', icon: '03', order: 2, enabled: true },
    ],
  },
  services: {
    enabled: true,
    title: 'İşinizi Büyüten Dijital Çözümler',
    subtitle: 'Tam kapsamlı teknoloji hizmetleri',
    cards: [
      { id: 'svc-1', icon: 'code', title: 'Yazılım Geliştirme', text: 'Ölçeklenebilir, performans odaklı yazılım sistemleri.', color: 'from-blue-500 to-cyan-500', order: 0, enabled: true },
      { id: 'svc-2', icon: 'palette', title: 'Web Tasarım', text: 'Modern, hızlı ve dönüşüm odaklı web arayüzleri.', color: 'from-purple-500 to-pink-500', order: 1, enabled: true },
      { id: 'svc-3', icon: 'shopping-cart', title: 'E-Ticaret', text: 'Satış odaklı, yönetilebilir e-ticaret altyapıları.', color: 'from-green-500 to-emerald-500', order: 2, enabled: true },
      { id: 'svc-4', icon: 'cloud', title: 'SaaS', text: 'Abonelik tabanlı yazılım ürünleri ve merkezi lisans.', color: 'from-orange-500 to-red-500', order: 3, enabled: true },
      { id: 'svc-5', icon: 'scale', title: 'Marka & Patent', text: 'Marka tescil ve danışmanlık süreçleri.', color: 'from-yellow-500 to-orange-500', order: 4, enabled: true },
      { id: 'svc-6', icon: 'lightbulb', title: 'Danışmanlık', text: 'Dijital büyüme için strateji ve yol haritası.', color: 'from-teal-500 to-green-500', order: 5, enabled: true },
    ],
  },
  brands: {
    enabled: true,
    title: 'Woontegra Çatısı Altında Geliştirilen Markalar',
    subtitle: 'Gerçek projelerle kanıtlanmış deneyim',
    cards: [
      { id: 'br-1', name: 'Bilirkişi Hesap', image: '/images/brand-bilirkisi.jpg', text: 'Hukuk ve aktüerya alanında profesyonel hesaplama yazılımı.', url: 'https://www.bilirkisihesap.com/', order: 0, enabled: true },
      { id: 'br-2', name: 'Optimoon', image: '/images/brand-optimoon.jpg', text: 'Doğal taş ve özel tasarım ürünler e-ticaret markası.', url: 'https://optimoon.com/', order: 1, enabled: true },
      { id: 'br-3', name: 'Datça Tropikal', image: '/images/brand-datca.jpg', text: 'Yerel üretim ve doğal ürünler e-ticaret markası.', url: 'https://datcatropikal.com/', order: 2, enabled: true },
    ],
  },
  why: {
    enabled: true,
    title: 'Neden Woontegra?',
    subtitle: 'Gerçek projelerle kanıtlanmış uzmanlık',
    cards: [
      { id: 'why-1', icon: 'award', title: 'Gerçek Ürün Deneyimi', text: 'Kendi ürünlerimizi de geliştiriyor ve işletiyoruz.', color: 'bg-gradient-to-br from-yellow-500 to-orange-500', order: 0, enabled: true },
      { id: 'why-2', icon: 'target', title: 'Uçtan Uca Sistem', text: 'Yazılım, satış ve operasyon tek yapı altında.', color: 'bg-gradient-to-br from-blue-500 to-cyan-500', order: 1, enabled: true },
      { id: 'why-3', icon: 'zap', title: 'Performans', text: 'Hızlı, stabil ve sürdürülebilir sistemler.', color: 'bg-gradient-to-br from-purple-500 to-pink-500', order: 2, enabled: true },
      { id: 'why-4', icon: 'code', title: 'Modern Teknoloji', text: 'Güncel yazılım teknolojileri ile çalışıyoruz.', color: 'bg-gradient-to-br from-green-500 to-emerald-500', order: 3, enabled: true },
      { id: 'why-5', icon: 'trending-up', title: 'Aktif Markalar', text: 'Kendi markalarımızı aktif olarak yönetiyoruz.', color: 'bg-gradient-to-br from-red-500 to-pink-500', order: 4, enabled: true },
      { id: 'why-6', icon: 'check-circle', title: 'Sürekli Gelişim', text: 'Yayın sonrası sürekli iyileştirme.', color: 'bg-gradient-to-br from-teal-500 to-green-500', order: 5, enabled: true },
    ],
  },
  process: {
    enabled: true,
    title: 'Çalışma Sürecimiz',
    subtitle: 'Profesyonel ve şeffaf süreç yönetimi',
    steps: [
      { id: 'pr-1', step: '01', title: 'Analiz', text: 'İhtiyaçları doğru şekilde belirliyoruz.', color: 'from-blue-500 to-cyan-500', order: 0, enabled: true },
      { id: 'pr-2', step: '02', title: 'Planlama', text: 'Proje yapısını ve stratejisini oluşturuyoruz.', color: 'from-purple-500 to-pink-500', order: 1, enabled: true },
      { id: 'pr-3', step: '03', title: 'Geliştirme', text: 'Modern teknolojilerle inşa ediyoruz.', color: 'from-green-500 to-emerald-500', order: 2, enabled: true },
      { id: 'pr-4', step: '04', title: 'Yayın', text: 'Test sonrası canlıya alıyoruz.', color: 'from-orange-500 to-red-500', order: 3, enabled: true },
    ],
  },
  cta: {
    enabled: true,
    title: 'Projenizi Hayata Geçirmeye Hazır mısınız?',
    subtitle: 'İşinize en uygun dijital yapıyı birlikte kuralım.',
    buttonText: 'İletişime Geç',
    buttonHref: '/iletisim',
  },
}

export function normalizeHomePageContent(raw: unknown): HomePageContent {
  const base = structuredClone(defaultHomePageContent)
  if (!raw || typeof raw !== 'object') return base
  const row = raw as Record<string, unknown>

  if (row.hero && typeof row.hero === 'object') {
    const hero = row.hero as Record<string, unknown>
    base.hero = {
      enabled: toBool(hero.enabled, true),
      tag: toStr(hero.tag ?? hero.eyebrow, base.hero.tag),
      title: toStr(hero.title, base.hero.title),
      subtitle: toStr(hero.subtitle ?? hero.description, base.hero.subtitle),
      image: toStr(hero.image ?? hero.imageUrl, base.hero.image),
      button1Text: toStr(hero.button1Text, base.hero.button1Text),
      button1Href: toStr(hero.button1Href, base.hero.button1Href),
      button2Text: toStr(hero.button2Text, base.hero.button2Text),
      button2Href: toStr(hero.button2Href, base.hero.button2Href),
    }
  } else {
    if (toStr(row.heroTitle)) base.hero.title = toStr(row.heroTitle)
    if (toStr(row.heroSubtitle)) base.hero.subtitle = toStr(row.heroSubtitle)
    if (toStr(row.heroImage)) base.hero.image = toStr(row.heroImage)
  }

  const mergeSection = <K extends 'intro' | 'services' | 'brands' | 'why' | 'process' | 'cta'>(key: K) => {
    const section = row[key]
    if (section && typeof section === 'object' && !Array.isArray(section)) {
      base[key] = { ...base[key], ...(section as HomePageContent[K]) }
    }
  }

  mergeSection('intro')
  mergeSection('services')
  mergeSection('brands')
  mergeSection('why')
  mergeSection('process')
  mergeSection('cta')

  return base
}

export function enabledServices(cards: HomeServiceCard[]): HomeServiceCard[] {
  return sortByOrder(cards).filter((c) => c.enabled)
}

export function enabledBrands(cards: HomeBrandCard[]): HomeBrandCard[] {
  return sortByOrder(cards).filter((c) => c.enabled)
}

export function enabledWhy(cards: HomeWhyCard[]): HomeWhyCard[] {
  return sortByOrder(cards).filter((c) => c.enabled)
}

export function enabledProcessSteps(steps: HomeProcessStep[]): HomeProcessStep[] {
  return sortByOrder(steps).filter((s) => s.enabled)
}
