export const ABOUT_PAGE_VERSION = 2

export type AboutHighlightCard = {
  id: string
  icon: string
  title: string
  cardClass: string
  iconClass: string
  order: number
  enabled: boolean
}

export type AboutSimpleCard = {
  id: string
  title: string
  text: string
  order: number
  enabled: boolean
}

export type AboutIconCard = {
  id: string
  icon: string
  title: string
  text: string
  gradient: string
  order: number
  enabled: boolean
}

export type AboutTimelineStep = {
  id: string
  icon: string
  title: string
  text: string
  color: string
  order: number
  enabled: boolean
}

export type AboutBrandCard = {
  id: string
  name: string
  text: string
  image: string
  url: string
  order: number
  enabled: boolean
}

export type AboutStatCard = {
  id: string
  icon: string
  title: string
  text: string
  order: number
  enabled: boolean
}

export type AboutPageContent = {
  version: number
  hero: {
    eyebrow: string
    title: string
    subtitle: string
    image: string
    highlights: AboutHighlightCard[]
  }
  whatIs: {
    title: string
    paragraphs: string[]
    highlight: string
    cards: AboutSimpleCard[]
  }
  timeline: {
    title: string
    subtitle: string
    steps: AboutTimelineStep[]
  }
  differentiators: {
    title: string
    subtitle: string
    cards: AboutIconCard[]
  }
  brands: {
    title: string
    subtitle: string
    cards: AboutBrandCard[]
  }
  workApproach: {
    title: string
    subtitle: string
    cards: AboutIconCard[]
  }
  structure: {
    title: string
    paragraphs: string[]
    stats: AboutStatCard[]
  }
  vision: {
    title: string
    paragraphs: string[]
  }
  cta: {
    title: string
    subtitle: string
    buttonText: string
    buttonHref: string
  }
  metaDescription?: string
}

const FORBIDDEN_ABOUT_TERMS = [
  'optimoon',
  'datça',
  'datca',
  'tropikal',
  'mercan',
  'aktif olarak yönettiğimiz markalar',
  'dijital pazarlama & web tasarım danışmanlık',
  'doğal taş takı',
  'datça’dan sofranıza',
] as const

function uid(): string {
  return crypto.randomUUID()
}

function toStr(v: unknown, fb = ''): string {
  return v == null ? fb : String(v).trim()
}

function includesForbiddenAboutTerm(value: string): boolean {
  const lower = value.toLocaleLowerCase('tr-TR')
  return FORBIDDEN_ABOUT_TERMS.some((term) => lower.includes(term))
}

function createCanonicalAboutSoftwareCards(): AboutBrandCard[] {
  return [
    {
      id: uid(),
      name: 'Bilirkişi Hesaplama Yazılımı',
      image: '',
      text: 'Web tabanlı bilirkişi ve işçilik alacağı hesaplamaları için geliştirilen profesyonel hesaplama yazılımı.',
      url: '/yazilimlar/bilirkisi-hesap',
      order: 0,
      enabled: true,
    },
    {
      id: uid(),
      name: 'Müvekkil Kasa Defteri Masaüstü',
      image: '',
      text: 'Lisanslı masaüstü kullanım için geliştirilen, güvenli kayıt ve düzenli iş akışı sunan masaüstü yazılım.',
      url: '/yazilimlar/muvekkil-kasa-defteri-yazilimi',
      order: 1,
      enabled: true,
    },
    {
      id: uid(),
      name: 'Müvekkil Kasa Defteri Web Tabanlı',
      image: '',
      text: 'Web tabanlı kullanım, yıllık erişim ve çoklu kullanıcı ihtiyaçları için geliştirilen çevrim içi çözüm.',
      url: '/yazilimlar/muvekkil-kasa-defteri-web-tabanli',
      order: 2,
      enabled: true,
    },
    {
      id: uid(),
      name: 'Woontegra Şifre Kasası',
      image: '',
      text: 'Ücretsiz kullanım sunan, temel güvenli kayıt ve erişim ihtiyacına odaklanan pratik yardımcı yazılım.',
      url: '/yazilimlar/sifre-kasasi',
      order: 3,
      enabled: true,
    },
  ]
}

function sanitizeAboutBrandsSection(brands: AboutPageContent['brands']): AboutPageContent['brands'] {
  const title = toStr(brands.title, 'Geliştirdiğimiz Yazılımlar')
  const subtitle = toStr(
    brands.subtitle,
    'Woontegra, hukuk, güvenli kayıt, lisans ve işletme süreçleri için kendi yazılım ürünlerini geliştiren bir teknoloji şirketidir.',
  )

  const hasForbiddenTitle = includesForbiddenAboutTerm(title) || includesForbiddenAboutTerm(subtitle)
  const cards = Array.isArray(brands.cards) ? brands.cards : []
  const hasForbiddenCards = cards.some((card) =>
    includesForbiddenAboutTerm(`${card.name} ${card.text} ${card.image} ${card.url}`),
  )

  if (hasForbiddenTitle || hasForbiddenCards || cards.length === 0) {
    return {
      title: 'Geliştirdiğimiz Yazılımlar',
      subtitle:
        'Woontegra, hukuk, güvenli kayıt, lisans ve işletme süreçleri için kendi yazılım ürünlerini geliştiren bir teknoloji şirketidir.',
      cards: createCanonicalAboutSoftwareCards(),
    }
  }

  return {
    title: 'Geliştirdiğimiz Yazılımlar',
    subtitle:
      'Woontegra, hukuk, güvenli kayıt, lisans ve işletme süreçleri için kendi yazılım ürünlerini geliştiren bir teknoloji şirketidir.',
    cards,
  }
}

function toBool(v: unknown, fb: boolean): boolean {
  return typeof v === 'boolean' ? v : fb
}

function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return items.slice().sort((a, b) => a.order - b.order)
}

export const defaultAboutPageContent: AboutPageContent = {
  version: ABOUT_PAGE_VERSION,
  hero: {
    eyebrow: 'Hakkımızda',
    title: 'Yazılım Üreten, Lisanslayan ve Geliştiren Woontegra',
    subtitle:
      'Woontegra; masaüstü yazılımlar, web tabanlı ürünler ve lisans yönetimli çözümler geliştiren, güvenli satış ve teslimat akışlarını tek çatı altında kurgulayan bir yazılım şirketidir.',
    image: '/images/hakkimizda-hero.jpg',
    highlights: [
      {
        id: uid(),
        icon: 'boxes',
        title: 'Kendi yazılım ürünlerini geliştiren yapı',
        cardClass: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20',
        iconClass: 'text-emerald-400',
        order: 0,
        enabled: true,
      },
      {
        id: uid(),
        icon: 'sparkles',
        title: 'Gerçek kullanım senaryolarından doğan çözümler',
        cardClass: 'from-blue-500/20 to-blue-500/5 border-blue-500/20',
        iconClass: 'text-blue-400',
        order: 1,
        enabled: true,
      },
    ],
  },
  whatIs: {
    title: 'Woontegra Nedir?',
    paragraphs: [
      'Woontegra; masaüstü, web tabanlı ve lisans yönetimli yazılım ürünleri geliştiren, bu ürünlerin satış ve teslimat sürecini tek merkezden yöneten bir teknoloji şirketidir.',
    ],
    highlight:
      'Amacımız yalnızca yazılım teslim etmek değil; yönetilebilir ve sürdürülebilir ürün sistemleri kurmaktır.',
    cards: [
      {
        id: uid(),
        title: 'Önce geliştiren yapı',
        text: 'Kendi ürünlerini aktif olarak geliştirip yöneten bir yazılım şirketiyiz.',
        order: 0,
        enabled: true,
      },
      {
        id: uid(),
        title: 'Gerçek deneyim',
        text: 'Ürünleri gerçek kullanım, lisans ve teslimat deneyimiyle şekillendiririz.',
        order: 1,
        enabled: true,
      },
      {
        id: uid(),
        title: 'Sürdürülebilir sistem',
        text: 'Ürünlerin güncellenebilir ve uzun vadede sürdürülebilir kalmasına odaklanırız.',
        order: 2,
        enabled: true,
      },
    ],
  },
  timeline: {
    title: 'Nasıl Başladık?',
    subtitle: 'Ürün yaklaşımımızı kısa ve net bir yolculukta özetliyoruz.',
    steps: [
      {
        id: uid(),
        icon: 'eye',
        title: 'İhtiyaçları sahada gördük',
        text: 'Sahadaki tekrar eden ihtiyaçların yazılımla çözülebileceğini gördük.',
        color: 'bg-blue-500',
        order: 0,
        enabled: true,
      },
      {
        id: uid(),
        icon: 'rocket',
        title: 'İlk ürünlerimizi geliştirdik',
        text: 'İlk masaüstü ve web tabanlı ürünlerimizi geliştirdik.',
        color: 'bg-purple-500',
        order: 1,
        enabled: true,
      },
      {
        id: uid(),
        icon: 'settings',
        title: 'Lisans ve teslimat altyapısını kurduk',
        text: 'Lisans, teslimat ve güvenli satış altyapısını kurduk.',
        color: 'bg-emerald-500',
        order: 2,
        enabled: true,
      },
      {
        id: uid(),
        icon: 'building-2',
        title: 'Bugün ürünleri tek merkezden sunuyoruz',
        text: 'Ürünleri bugün tek merkezden sunuyor ve geliştiriyoruz.',
        color: 'bg-orange-500',
        order: 3,
        enabled: true,
      },
    ],
  },
  differentiators: {
    title: 'Bizi Farklı Yapan Ne?',
    subtitle: 'Hizmet üretmenin ötesine geçen, doğrudan yazılım ürünü odağıyla çalışan yaklaşımımız.',
    cards: [
      {
        id: uid(),
        icon: 'package',
        title: 'Sadece hizmet değil, ürün',
        text: 'Kendi yazılımlarımızı geliştiriyor ve gerçek geri bildirimle iyileştiriyoruz.',
        gradient: 'from-blue-500 to-cyan-500',
        order: 0,
        enabled: true,
      },
      {
        id: uid(),
        icon: 'award',
        title: 'Merkezi lisans altyapısı',
        text: 'Lisanslı kullanım ve kontrollü teslimat için güvenli altyapılar kuruyoruz.',
        gradient: 'from-purple-500 to-pink-500',
        order: 1,
        enabled: true,
      },
      {
        id: uid(),
        icon: 'layers',
        title: 'Gerçek kullanım senaryoları',
        text: 'Ürünleri kullanım, destek ve teslimat süreçleriyle birlikte tasarlıyoruz.',
        gradient: 'from-emerald-500 to-teal-500',
        order: 2,
        enabled: true,
      },
      {
        id: uid(),
        icon: 'refresh-cw',
        title: 'Sürdürülebilir geliştirme',
        text: 'Yayın sonrası bakım ve yeni sürümlerle ürünleri yaşayan sistemler olarak ele alıyoruz.',
        gradient: 'from-orange-500 to-rose-500',
        order: 3,
        enabled: true,
      },
    ],
  },
  brands: {
    title: 'Geliştirdiğimiz Yazılımlar',
    subtitle:
      'Woontegra; hukuk, güvenli kayıt, lisans ve işletme süreçleri için kendi yazılım ürünlerini geliştiren bir ürün şirketidir.',
    cards: createCanonicalAboutSoftwareCards(),
  },
  workApproach: {
    title: 'Çalışma Yaklaşımımız',
    subtitle: 'Yazılımı yalnızca geliştirmek değil, yayına ve kullanıma hazır hale getirmek.',
    cards: [
      { id: uid(), icon: 'search', title: 'Analiz', text: 'İhtiyacı ve kullanım senaryosunu netleştiririz.', gradient: 'from-blue-500 to-cyan-500', order: 0, enabled: true },
      { id: uid(), icon: 'pen-tool', title: 'Kurgu', text: 'Arayüzü, veri akışını ve ürün yapısını tasarlarız.', gradient: 'from-purple-500 to-pink-500', order: 1, enabled: true },
      { id: uid(), icon: 'wrench', title: 'Geliştirme', text: 'Ürünü güvenli ve sürdürülebilir mimariyle inşa ederiz.', gradient: 'from-emerald-500 to-teal-500', order: 2, enabled: true },
      { id: uid(), icon: 'shield-check', title: 'Teslimat ve destek', text: 'Lisans, test ve destek süreçlerini birlikte yürütürüz.', gradient: 'from-orange-500 to-red-500', order: 3, enabled: true },
    ],
  },
  structure: {
    title: 'Nasıl Çalışıyoruz?',
    paragraphs: [
      'Ürün geliştirme, lisans yönetimi, güvenli ödeme, dijital teslimat ve destek süreçlerini tek bir ürün sistemi olarak ele alıyoruz.',
    ],
    stats: [
      { id: uid(), icon: 'code-2', title: 'Ürün geliştirme', text: 'Yazılımları fikirden yayına kadar içeride geliştiririz.', order: 0, enabled: true },
      { id: uid(), icon: 'key-round', title: 'Lisans ve teslimat', text: 'Lisanslı erişim ve kontrollü teslimat aynı sistemde kurgulanır.', order: 1, enabled: true },
      { id: uid(), icon: 'credit-card', title: 'Güvenli satış', text: 'Ödeme ve erişimi tek deneyim içinde ele alırız.', order: 2, enabled: true },
      { id: uid(), icon: 'refresh-cw', title: 'Sürekli geliştirme', text: 'Ürünleri günceller, destekler ve büyütürüz.', order: 3, enabled: true },
    ],
  },
  vision: {
    title: 'Nereye Gidiyoruz?',
    paragraphs: [
      "Woontegra'nın hedefi; masaüstü ve web tabanlı yazılım ürünlerini tek çatı altında büyüten, lisanslı ve sürdürülebilir ürün yaklaşımıyla güçlenen bir yazılım şirketi olmaktır.",
      'Yeni ürünler geliştirirken mevcut çözümleri de daha güvenli, daha kullanışlı ve daha ölçeklenebilir hale getirmeye devam ediyoruz.',
    ],
  },
  cta: {
    title: 'Woontegra yazılımlarını yakından inceleyin.',
    subtitle:
      'Masaüstü, web tabanlı ve ücretsiz ürünlerimizi inceleyin; ihtiyaçlarınıza en uygun çözüm için bizimle iletişime geçin.',
    buttonText: 'Yazılımlarımızı İnceleyin',
    buttonHref: '/yazilimlar',
  },
  metaDescription:
    'Woontegra; masaüstü, web tabanlı ve lisans yönetimli yazılım ürünleri geliştiren bir yazılım şirketidir.',
}

function mergeAbout(base: AboutPageContent, partial: Partial<AboutPageContent>): AboutPageContent {
  return {
    ...base,
    ...partial,
    hero: { ...base.hero, ...partial.hero, highlights: partial.hero?.highlights ?? base.hero.highlights },
    whatIs: { ...base.whatIs, ...partial.whatIs, paragraphs: partial.whatIs?.paragraphs ?? base.whatIs.paragraphs, cards: partial.whatIs?.cards ?? base.whatIs.cards },
    timeline: { ...base.timeline, ...partial.timeline, steps: partial.timeline?.steps ?? base.timeline.steps },
    differentiators: { ...base.differentiators, ...partial.differentiators, cards: partial.differentiators?.cards ?? base.differentiators.cards },
    brands: { ...base.brands, ...partial.brands, cards: partial.brands?.cards ?? base.brands.cards },
    workApproach: { ...base.workApproach, ...partial.workApproach, cards: partial.workApproach?.cards ?? base.workApproach.cards },
    structure: { ...base.structure, ...partial.structure, paragraphs: partial.structure?.paragraphs ?? base.structure.paragraphs, stats: partial.structure?.stats ?? base.structure.stats },
    vision: { ...base.vision, ...partial.vision, paragraphs: partial.vision?.paragraphs ?? base.vision.paragraphs },
    cta: { ...base.cta, ...partial.cta },
  }
}

function applyBuilderSections(row: Record<string, unknown>, base: AboutPageContent): AboutPageContent {
  const next = structuredClone(base)
  const sections = row.sections
  if (!Array.isArray(sections)) return next

  for (const section of sections) {
    if (!section || typeof section !== 'object') continue
    const s = section as Record<string, unknown>
    const data = s.data
    if (s.type !== 'hero' || !data || typeof data !== 'object') continue
    const d = data as Record<string, unknown>
    if (toStr(d.tag)) next.hero.eyebrow = toStr(d.tag)
    if (toStr(d.title)) next.hero.title = toStr(d.title)
    if (toStr(d.subtitle)) next.hero.subtitle = toStr(d.subtitle)
    if (toStr(d.image)) next.hero.image = toStr(d.image)
  }

  return next
}

function applyLegacyFlat(row: Record<string, unknown>, base: AboutPageContent): AboutPageContent {
  const next = structuredClone(base)
  if (toStr(row.heroTitle)) {
    next.hero.title = toStr(row.heroTitle)
    next.hero.subtitle = toStr(row.heroSubtitle, next.hero.subtitle)
  }
  if (toStr(row.whatIsTitle)) next.whatIs.title = toStr(row.whatIsTitle)
  const p1 = toStr(row.whatIsParagraph1)
  const p2 = toStr(row.whatIsParagraph2)
  const p3 = toStr(row.whatIsParagraph3)
  const p4 = toStr(row.whatIsParagraph4)
  if (p1 || p2) next.whatIs.paragraphs = [p1, p2, p3, p4].filter(Boolean)
  if (toStr(row.whatIsParagraph5)) next.whatIs.highlight = toStr(row.whatIsParagraph5)
  if (toStr(row.storyTitle)) {
    next.timeline.title = toStr(row.storyTitle)
    const steps = [...next.timeline.steps]
    const texts = [row.storyParagraph1, row.storyParagraph2, row.storyParagraph3, row.storyParagraph4].map((t) => toStr(t))
    texts.forEach((text, i) => {
      if (text && steps[i]) steps[i] = { ...steps[i], text }
    })
    next.timeline.steps = steps
  }
  if (toStr(row.differenceTitle)) next.differentiators.title = toStr(row.differenceTitle)
  const diffs = [
    { t: row.diff1Title, d: row.diff1Desc },
    { t: row.diff2Title, d: row.diff2Desc },
    { t: row.diff3Title, d: row.diff3Desc },
  ]
  diffs.forEach((d, i) => {
    if (toStr(d.t) && next.differentiators.cards[i]) {
      next.differentiators.cards[i] = { ...next.differentiators.cards[i], title: toStr(d.t), text: toStr(d.d) || next.differentiators.cards[i].text }
    }
  })
  next.brands = sanitizeAboutBrandsSection(next.brands)
  return next
}

export function normalizeAboutContent(raw: unknown): AboutPageContent {
  const base = structuredClone(defaultAboutPageContent)
  if (!raw || typeof raw !== 'object') return base
  const row = raw as Record<string, unknown>

  const fromBuilder = applyBuilderSections(row, base)

  if (toNum(row.version, 0) >= ABOUT_PAGE_VERSION && row.hero && typeof row.hero === 'object') {
    const partial = row as unknown as Partial<AboutPageContent>
    return mergeAbout(fromBuilder, {
      ...partial,
      version: ABOUT_PAGE_VERSION,
      hero: {
        ...fromBuilder.hero,
        ...(partial.hero ?? {}),
        image: toStr(partial.hero?.image, fromBuilder.hero.image) || fromBuilder.hero.image,
        highlights: sortByOrder((partial.hero?.highlights ?? fromBuilder.hero.highlights).map((c, i) => normalizeHighlight(c, i)).filter(Boolean) as AboutHighlightCard[]),
      },
      whatIs: {
        ...fromBuilder.whatIs,
        ...(partial.whatIs ?? {}),
        cards: sortByOrder((partial.whatIs?.cards ?? fromBuilder.whatIs.cards).map((c, i) => normalizeSimpleCard(c, i)).filter(Boolean) as AboutSimpleCard[]),
      },
      timeline: {
        ...fromBuilder.timeline,
        ...(partial.timeline ?? {}),
        steps: sortByOrder((partial.timeline?.steps ?? fromBuilder.timeline.steps).map((s, i) => normalizeTimelineStep(s, i)).filter(Boolean) as AboutTimelineStep[]),
      },
      differentiators: {
        ...fromBuilder.differentiators,
        ...(partial.differentiators ?? {}),
        cards: sortByOrder((partial.differentiators?.cards ?? fromBuilder.differentiators.cards).map((c, i) => normalizeIconCard(c, i)).filter(Boolean) as AboutIconCard[]),
      },
      brands: sanitizeAboutBrandsSection({
        ...fromBuilder.brands,
        ...(partial.brands ?? {}),
        cards: sortByOrder((partial.brands?.cards ?? fromBuilder.brands.cards).map((c, i) => normalizeBrand(c, i)).filter(Boolean) as AboutBrandCard[]),
      }),
      workApproach: {
        ...fromBuilder.workApproach,
        ...(partial.workApproach ?? {}),
        cards: sortByOrder((partial.workApproach?.cards ?? fromBuilder.workApproach.cards).map((c, i) => normalizeIconCard(c, i)).filter(Boolean) as AboutIconCard[]),
      },
      structure: {
        ...fromBuilder.structure,
        ...(partial.structure ?? {}),
        stats: sortByOrder((partial.structure?.stats ?? fromBuilder.structure.stats).map((c, i) => normalizeStat(c, i)).filter(Boolean) as AboutStatCard[]),
      },
      vision: { ...fromBuilder.vision, ...(partial.vision ?? {}) },
      cta: { ...fromBuilder.cta, ...(partial.cta ?? {}) },
      metaDescription: toStr(partial.metaDescription, fromBuilder.metaDescription),
    })
  }

  return applyLegacyFlat(row, fromBuilder)
}

function toNum(v: unknown, fb: number): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : fb
}

function normalizeHighlight(raw: unknown, index: number): AboutHighlightCard | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const title = toStr(r.title)
  if (!title) return null
  return { id: toStr(r.id, uid()), icon: toStr(r.icon, 'sparkles'), title, cardClass: toStr(r.cardClass), iconClass: toStr(r.iconClass), order: toNum(r.order, index), enabled: toBool(r.enabled, true) }
}

function normalizeSimpleCard(raw: unknown, index: number): AboutSimpleCard | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const title = toStr(r.title)
  if (!title) return null
  return { id: toStr(r.id, uid()), title, text: toStr(r.text ?? r.desc), order: toNum(r.order, index), enabled: toBool(r.enabled, true) }
}

function normalizeIconCard(raw: unknown, index: number): AboutIconCard | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const title = toStr(r.title)
  if (!title) return null
  return { id: toStr(r.id, uid()), icon: toStr(r.icon, 'sparkles'), title, text: toStr(r.text ?? r.desc), gradient: toStr(r.gradient, 'from-blue-500 to-cyan-500'), order: toNum(r.order, index), enabled: toBool(r.enabled, true) }
}

function normalizeTimelineStep(raw: unknown, index: number): AboutTimelineStep | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const title = toStr(r.title)
  if (!title) return null
  return { id: toStr(r.id, uid()), icon: toStr(r.icon, 'eye'), title, text: toStr(r.text ?? r.desc), color: toStr(r.color, 'bg-blue-500'), order: toNum(r.order, index), enabled: toBool(r.enabled, true) }
}

function normalizeBrand(raw: unknown, index: number): AboutBrandCard | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const name = toStr(r.name)
  if (!name) return null
  return { id: toStr(r.id, uid()), name, text: toStr(r.text ?? r.desc), image: toStr(r.image), url: toStr(r.url, '#'), order: toNum(r.order, index), enabled: toBool(r.enabled, true) }
}

function normalizeStat(raw: unknown, index: number): AboutStatCard | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const title = toStr(r.title)
  if (!title) return null
  return { id: toStr(r.id, uid()), icon: toStr(r.icon, 'target'), title, text: toStr(r.text ?? r.desc), order: toNum(r.order, index), enabled: toBool(r.enabled, true) }
}

export function enabledSimpleCards(cards: AboutSimpleCard[]): AboutSimpleCard[] {
  return sortByOrder(cards).filter((c) => c.enabled)
}

export function enabledIconCards(cards: AboutIconCard[]): AboutIconCard[] {
  return sortByOrder(cards).filter((c) => c.enabled)
}

export function enabledTimelineSteps(steps: AboutTimelineStep[]): AboutTimelineStep[] {
  return sortByOrder(steps).filter((s) => s.enabled)
}

export function enabledBrands(cards: AboutBrandCard[]): AboutBrandCard[] {
  return sortByOrder(cards).filter((c) => c.enabled)
}

export function enabledStats(cards: AboutStatCard[]): AboutStatCard[] {
  return sortByOrder(cards).filter((c) => c.enabled)
}

export function enabledHighlights(cards: AboutHighlightCard[]): AboutHighlightCard[] {
  return sortByOrder(cards).filter((c) => c.enabled)
}

/** @deprecated use defaultAboutPageContent */
export const defaultAboutContent = defaultAboutPageContent
