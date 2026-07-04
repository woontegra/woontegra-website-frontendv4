import type { BuilderBlock } from '@/builder/types/blocks'
import type { CardGridBlock, CtaBlock } from '@/builder/types/blockModels'
import { createDefaultCardGridBlock, createDefaultCtaBlock } from '@/builder/types/blockModels'
import { createDefaultHeroBlock } from '@/builder/types/hero'
import type { HeroBlock } from '@/builder/types/hero'
import { assignSortOrder } from '@/builder/load/parseBuilderBlocks'
import { defaultServiceCardsBundle, mergeServiceCardsWithCanonical } from '@/data/canonicalServices'
import { SERVICE_CARDS_KEY } from '@/data/serviceCardsContent'
import {
  defaultServicesPageContent,
  mergeMarketingPageContent,
  type MarketingPageContent,
} from '@/types/marketingPageContent'

const PROCESS_STEPS = [
  { step: '01', title: 'Analiz', desc: 'İhtiyaçları ve hedefleri netleştiririz.', color: 'from-blue-500 to-cyan-500' },
  { step: '02', title: 'Planlama', desc: 'Yol haritası ve sistem mimarisini oluştururuz.', color: 'from-purple-500 to-pink-500' },
  { step: '03', title: 'Geliştirme', desc: 'Modern teknolojilerle üretime geçeriz.', color: 'from-emerald-500 to-teal-500' },
  { step: '04', title: 'Yayın & Destek', desc: 'Canlıya alır ve sürdürülebilir hale getiririz.', color: 'from-orange-500 to-red-500' },
] as const

const WHY_ITEMS = [
  { icon: 'target', title: 'Yazılım Deneyimi', desc: 'E-ticaret ve SaaS projelerinde kanıtlanmış teknik tecrübe.' },
  { icon: 'workflow', title: 'Tek Yapı', desc: 'Yazılım, satış ve operasyonu entegre yönetiyoruz.' },
  { icon: 'zap', title: 'Performans', desc: 'Hızlı, stabil ve büyümeye hazır sistemler kuruyoruz.' },
] as const

function readEnriched(raw: Record<string, unknown> | null, key: string): unknown {
  if (!raw) return null
  return raw[key]
}

function servicesHero(page: MarketingPageContent): HeroBlock {
  const hero = createDefaultHeroBlock('svc-landing-hero', 0)
  hero.title = page.heroTitle
  hero.description = page.heroDescription
  hero.settings.layout = 'about'
  hero.settings.badge = page.heroEyebrow
  hero.settings.mode = page.heroImage?.trim() ? 'single-image' : 'gradient'
  hero.settings.showBreadcrumbs = true
  hero.settings.breadcrumbs = [{ label: 'Ana Sayfa', href: '/' }, { label: 'Hizmetler' }]
  if (page.heroImage?.trim()) {
    hero.settings.desktopImage = { url: page.heroImage }
    hero.settings.mobileImage = { url: page.heroImage }
  }
  hero.settings.highlights = [
    {
      id: 'svc-h1',
      icon: 'code-2',
      title: page.highlight1,
      cardClass: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20',
      iconClass: 'text-emerald-400',
    },
    {
      id: 'svc-h2',
      icon: 'bar-chart-3',
      title: page.highlight2,
      cardClass: 'from-blue-500/20 to-blue-500/5 border-blue-500/20',
      iconClass: 'text-blue-400',
    },
  ]
  hero.settings.buttons = []
  hero.visibility.showButton = false
  hero.style.backgroundGradient = 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
  return hero
}

function servicesCardsGrid(page: MarketingPageContent, raw: Record<string, unknown> | null): CardGridBlock {
  const cardsRaw = readEnriched(raw, `__${SERVICE_CARDS_KEY}`)
  const cards = mergeServiceCardsWithCanonical(
    cardsRaw as Partial<ReturnType<typeof defaultServiceCardsBundle>> | null,
    null,
  ).cards
  const grid = createDefaultCardGridBlock(1)
  grid.id = 'svc-landing-grid'
  grid.settings.variant = 'solutions'
  grid.settings.eyebrow = page.sectionEyebrow
  grid.title = page.sectionTitle
  grid.description = page.sectionDescription
  grid.settings.columns = 3
  grid.settings.cards = cards.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    icon: c.icon,
    href: c.href,
    color: c.gradient,
  }))
  return grid
}

function servicesProcessGrid(): CardGridBlock {
  const grid = createDefaultCardGridBlock(2)
  grid.id = 'svc-landing-process'
  grid.settings.variant = 'icon-dark'
  grid.title = 'Nasıl Çalışıyoruz?'
  grid.description = 'Şeffaf, planlı ve sonuç odaklı bir iş akışı ile projelerinizi hayata geçiriyoruz.'
  grid.settings.columns = 4
  grid.style.backgroundGradient = 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
  grid.settings.cards = PROCESS_STEPS.map((s) => ({
    id: `svc-process-${s.step}`,
    title: s.title,
    description: s.desc,
    icon: s.step,
    color: s.color,
  }))
  return grid
}

function servicesWhyGrid(): CardGridBlock {
  const grid = createDefaultCardGridBlock(3)
  grid.id = 'svc-landing-why'
  grid.settings.variant = 'why'
  grid.title = 'Neden Woontegra?'
  grid.description = ''
  grid.settings.columns = 3
  grid.settings.cards = WHY_ITEMS.map((w, i) => ({
    id: `svc-why-${i}`,
    title: w.title,
    description: w.desc,
    icon: w.icon,
    color: 'from-emerald-500 to-green-600',
  }))
  return grid
}

function servicesCta(page: MarketingPageContent): CtaBlock {
  const cta = createDefaultCtaBlock(4)
  cta.id = 'svc-landing-cta'
  cta.title = page.ctaTitle
  cta.description = page.ctaDescription
  cta.settings.backgroundType = 'gradient'
  cta.settings.gradient = 'linear-gradient(to bottom right, #059669, #0d9488)'
  cta.settings.buttons = [
    {
      id: 'svc-cta-primary',
      label: page.ctaButtonText,
      href: page.ctaButtonLink,
      visible: Boolean(page.ctaButtonText?.trim()),
      variant: 'primary',
    },
    {
      id: 'svc-cta-secondary',
      label: page.ctaSecondaryButtonText,
      href: page.ctaSecondaryButtonLink,
      visible: Boolean(page.ctaSecondaryButtonText?.trim()),
      variant: 'outline',
    },
  ]
  return cta
}

export function createServicesLandingEditableTemplate(raw: Record<string, unknown> | null): BuilderBlock[] {
  const page = mergeMarketingPageContent(defaultServicesPageContent, raw)
  const blocks: BuilderBlock[] = [
    servicesHero(page),
    servicesCardsGrid(page, raw),
    servicesProcessGrid(),
    servicesWhyGrid(),
    servicesCta(page),
  ]
  return assignSortOrder(blocks)
}
