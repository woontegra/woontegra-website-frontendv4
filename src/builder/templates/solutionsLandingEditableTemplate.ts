import type { BuilderBlock } from '@/builder/types/blocks'
import type { CardGridBlock, CtaBlock, RichTextBlock } from '@/builder/types/blockModels'
import {
  createDefaultCardGridBlock,
  createDefaultCtaBlock,
  createDefaultRichTextBlock,
} from '@/builder/types/blockModels'
import { createDefaultHeroBlock } from '@/builder/types/hero'
import type { HeroBlock } from '@/builder/types/hero'
import { assignSortOrder } from '@/builder/load/parseBuilderBlocks'
import {
  defaultSolutionBenefitCardsBundle,
  defaultSolutionCardsBundle,
  getActiveSolutionBenefitCards,
  getActiveSolutionCards,
  mergeSolutionBenefitCards,
  mergeSolutionCards,
  SOLUTION_BENEFIT_CARDS_KEY,
  SOLUTION_CARDS_KEY,
} from '@/data/solutionCardsContent'
import {
  defaultSolutionsPageContent,
  mergeMarketingPageContent,
  type MarketingPageContent,
} from '@/types/marketingPageContent'

function readEnriched(raw: Record<string, unknown> | null, key: string): unknown {
  if (!raw) return null
  return raw[key]
}

function solutionsHero(page: MarketingPageContent): HeroBlock {
  const hero = createDefaultHeroBlock('sol-landing-hero', 0)
  hero.title = page.heroTitle
  hero.description = page.heroDescription
  hero.settings.layout = 'about'
  hero.settings.badge = page.heroEyebrow
  hero.settings.mode = page.heroImage?.trim() ? 'single-image' : 'gradient'
  hero.settings.showBreadcrumbs = true
  hero.settings.breadcrumbs = [{ label: 'Ana Sayfa', href: '/' }, { label: 'Çözümler' }]
  if (page.heroImage?.trim()) {
    hero.settings.desktopImage = { url: page.heroImage }
  }
  hero.settings.highlights = [
    { id: 'sol-h1', icon: 'boxes', title: page.highlight1, cardClass: 'border-white/10 from-white/5 to-white/0', iconClass: 'text-emerald-400' },
    { id: 'sol-h2', icon: 'layout-dashboard', title: page.highlight2, cardClass: 'border-white/10 from-white/5 to-white/0', iconClass: 'text-blue-400' },
  ]
  hero.settings.buttons = []
  hero.visibility.showButton = false
  hero.style.backgroundGradient = 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
  return hero
}

function solutionsCardsGrid(page: MarketingPageContent, raw: Record<string, unknown> | null): CardGridBlock {
  const cards = getActiveSolutionCards(
    mergeSolutionCards(
      defaultSolutionCardsBundle,
      readEnriched(raw, `__${SOLUTION_CARDS_KEY}`) as Partial<typeof defaultSolutionCardsBundle> | null,
    ),
  )
  const grid = createDefaultCardGridBlock(1)
  grid.id = 'sol-landing-grid'
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

function solutionsBenefitsGrid(raw: Record<string, unknown> | null): CardGridBlock {
  const benefits = getActiveSolutionBenefitCards(
    mergeSolutionBenefitCards(
      defaultSolutionBenefitCardsBundle,
      readEnriched(raw, `__${SOLUTION_BENEFIT_CARDS_KEY}`) as Partial<typeof defaultSolutionBenefitCardsBundle> | null,
    ),
  )
  const grid = createDefaultCardGridBlock(2)
  grid.id = 'sol-landing-benefits'
  grid.settings.variant = 'why'
  grid.title = 'İşletmeye Ne Kazandırır?'
  grid.description = ''
  grid.settings.columns = 3
  grid.settings.cards = benefits.map((b) => ({
    id: b.id,
    title: b.title,
    description: b.description,
    icon: b.icon,
    color: 'from-emerald-500 to-green-600',
  }))
  return grid
}

function solutionsCentralBlock(): RichTextBlock {
  const block = createDefaultRichTextBlock(3)
  block.id = 'sol-landing-central'
  block.title = 'Tek Merkezden Yönetim'
  block.description = ''
  block.visibility.showDescription = false
  block.settings.variant = 'about-vision'
  block.settings.paragraphs = [
    'E-ticaret, pazaryeri entegrasyonu ve operasyon süreçlerini tek merkezden yönetilebilir dijital altyapılar kuruyoruz.',
    'Dağınık sistemler yerine entegre, ölçülebilir ve sürdürülebilir yazılım mimarileri tasarlıyoruz.',
  ]
  block.style.backgroundGradient = 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
  return block
}

function solutionsCta(page: MarketingPageContent): CtaBlock {
  const cta = createDefaultCtaBlock(4)
  cta.id = 'sol-landing-cta'
  cta.title = page.ctaTitle
  cta.description = page.ctaDescription
  cta.settings.backgroundType = 'gradient'
  cta.settings.gradient = 'linear-gradient(to bottom right, #059669, #0d9488)'
  cta.settings.buttons = [
    {
      id: 'sol-cta-primary',
      label: page.ctaButtonText,
      href: page.ctaButtonLink,
      visible: Boolean(page.ctaButtonText?.trim()),
      variant: 'primary',
    },
    {
      id: 'sol-cta-secondary',
      label: page.ctaSecondaryButtonText,
      href: page.ctaSecondaryButtonLink,
      visible: Boolean(page.ctaSecondaryButtonText?.trim()),
      variant: 'outline',
    },
  ]
  return cta
}

export function createSolutionsLandingEditableTemplate(raw: Record<string, unknown> | null): BuilderBlock[] {
  const page = mergeMarketingPageContent(defaultSolutionsPageContent, raw)
  const blocks: BuilderBlock[] = [
    solutionsHero(page),
    solutionsCardsGrid(page, raw),
    solutionsBenefitsGrid(raw),
    solutionsCentralBlock(),
    solutionsCta(page),
  ]
  return assignSortOrder(blocks)
}
