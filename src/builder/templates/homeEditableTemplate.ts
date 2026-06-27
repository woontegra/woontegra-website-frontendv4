import type { BuilderBlock } from '@/builder/types/blocks'
import type { HeroBlock } from '@/builder/types/hero'
import type { CardGridBlock, CtaBlock, ProductsShowcaseBlock, BlogShowcaseBlock } from '@/builder/types/blockModels'
import {
  createDefaultBlogShowcaseBlock,
  createDefaultCardGridBlock,
  createDefaultCtaBlock,
  createDefaultProductsShowcaseBlock,
} from '@/builder/types/blockModels'
import { createDefaultHeroBlock } from '@/builder/types/hero'
import { assignSortOrder } from '@/builder/load/parseBuilderBlocks'
import {
  defaultSolutionCardsBundle,
  getActiveSolutionCards,
  mergeSolutionCards,
} from '@/data/solutionCardsContent'
import {
  enabledBrands,
  enabledProcessSteps,
  enabledServices,
  enabledWhy,
  normalizeHomePageContent,
  type HomePageContent,
} from '@/types/homePageContent'

export const HOME_EDITABLE_BLOCK_IDS = {
  hero: 'home-block-hero',
  intro: 'home-block-intro',
  services: 'home-block-services',
  solutions: 'home-block-solutions',
  products: 'home-block-products',
  brands: 'home-block-brands',
  why: 'home-block-why',
  process: 'home-block-process',
  blog: 'home-block-blog',
  cta: 'home-block-cta',
} as const

function homeHeroBlock(content: HomePageContent['hero'], order: number): HeroBlock {
  const hero = createDefaultHeroBlock(HOME_EDITABLE_BLOCK_IDS.hero, order)
  hero.title = content.title
  hero.description = content.subtitle
  hero.settings.layout = 'split'
  hero.settings.badge = content.tag
  hero.settings.contentAlign = 'left'
  hero.settings.height = { desktop: '520px', tablet: '440px', mobile: '400px' }
  hero.style.containerWidth = 'full'
  hero.style.backgroundGradient =
    'linear-gradient(to bottom right, #0f172a, #1e293b, #14532d)'
  hero.style.paddingTop = { desktop: '48px', mobile: '32px' }
  hero.style.paddingBottom = { desktop: '48px', mobile: '32px' }

  if (content.image?.trim()) {
    hero.settings.mode = 'single-image'
    hero.settings.desktopImage = { url: content.image.trim() }
    hero.settings.mobileImage = { url: content.image.trim() }
  } else {
    hero.settings.mode = 'gradient'
    hero.settings.gradient = 'linear-gradient(135deg, #0f172a, #1e293b, #065f46)'
  }

  hero.settings.buttons = [
    {
      id: 'home-hero-btn-1',
      label: content.button1Text || 'Keşfet',
      href: content.button1Href || '/',
      visible: Boolean(content.button1Text?.trim()),
      variant: 'primary',
    },
    {
      id: 'home-hero-btn-2',
      label: content.button2Text || 'İletişim',
      href: content.button2Href || '/iletisim',
      visible: Boolean(content.button2Text?.trim()),
      variant: 'outline',
    },
  ]
  return hero
}

function homeIntroBlock(content: HomePageContent['intro'], order: number): CardGridBlock {
  const grid = createDefaultCardGridBlock(order)
  grid.id = HOME_EDITABLE_BLOCK_IDS.intro
  grid.settings.variant = 'intro'
  grid.settings.eyebrow = content.eyebrow
  grid.title = content.title
  grid.description = [content.text1, content.text2].filter(Boolean).join('\n\n')
  grid.settings.columns = 3
  grid.style.paddingTop = { desktop: '56px', mobile: '40px' }
  grid.style.paddingBottom = { desktop: '56px', mobile: '40px' }
  grid.settings.cards = content.cards
    .filter((c) => c.enabled)
    .sort((a, b) => a.order - b.order)
    .map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      icon: c.icon,
    }))
  return grid
}

function homeServicesBlock(content: HomePageContent['services'], order: number): CardGridBlock {
  const grid = createDefaultCardGridBlock(order)
  grid.id = HOME_EDITABLE_BLOCK_IDS.services
  grid.settings.variant = 'icon-dark'
  grid.title = content.title
  grid.description = content.subtitle
  grid.settings.columns = 3
  grid.style.backgroundColor = '#0f172a'
  grid.style.paddingTop = { desktop: '64px', mobile: '48px' }
  grid.style.paddingBottom = { desktop: '64px', mobile: '48px' }
  grid.settings.cards = enabledServices(content.cards).map((s) => ({
    id: s.id,
    title: s.title,
    description: s.text,
    icon: s.icon,
    color: s.color,
  }))
  return grid
}

function homeSolutionsBlock(raw: Record<string, unknown> | null, order: number): CardGridBlock {
  const bundle = mergeSolutionCards(
    defaultSolutionCardsBundle,
    (raw?.solutionCards as typeof defaultSolutionCardsBundle) ?? null,
  )
  const cards = getActiveSolutionCards(bundle).slice(0, 3)
  const grid = createDefaultCardGridBlock(order)
  grid.id = HOME_EDITABLE_BLOCK_IDS.solutions
  grid.settings.variant = 'solutions'
  grid.settings.eyebrow = 'Çözümler'
  grid.title = 'E-Ticaret ve Operasyon Çözümleri'
  grid.description = 'Markanızı büyüten, operasyonu sadeleştiren hazır altyapılar.'
  grid.settings.columns = 3
  grid.style.paddingTop = { desktop: '56px', mobile: '40px' }
  grid.style.paddingBottom = { desktop: '56px', mobile: '40px' }
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

function homeProductsBlock(order: number): ProductsShowcaseBlock {
  const block = createDefaultProductsShowcaseBlock(order)
  block.id = HOME_EDITABLE_BLOCK_IDS.products
  block.title = 'Yazılımlarımız'
  block.description = 'Öne çıkan dijital ürünlerimiz'
  block.settings.source = 'featured'
  block.settings.limit = 4
  block.settings.showPrice = true
  block.settings.showAddToCart = true
  return block
}

function homeBrandsBlock(content: HomePageContent['brands'], order: number): CardGridBlock {
  const grid = createDefaultCardGridBlock(order)
  grid.id = HOME_EDITABLE_BLOCK_IDS.brands
  grid.settings.variant = 'logo'
  grid.title = content.title
  grid.description = content.subtitle
  grid.settings.columns = 3
  grid.settings.cards = enabledBrands(content.cards).map((b) => ({
    id: b.id,
    title: b.name,
    description: b.text,
    imageUrl: b.image,
    href: b.url,
  }))
  return grid
}

function homeWhyBlock(content: HomePageContent['why'], order: number): CardGridBlock {
  const grid = createDefaultCardGridBlock(order)
  grid.id = HOME_EDITABLE_BLOCK_IDS.why
  grid.settings.variant = 'why'
  grid.title = content.title
  grid.description = content.subtitle
  grid.settings.columns = 3
  grid.settings.cards = enabledWhy(content.cards).map((c) => ({
    id: c.id,
    title: c.title,
    description: c.text,
    icon: c.icon,
    color: c.color,
  }))
  return grid
}

function homeProcessBlock(content: HomePageContent['process'], order: number): CardGridBlock {
  const grid = createDefaultCardGridBlock(order)
  grid.id = HOME_EDITABLE_BLOCK_IDS.process
  grid.settings.variant = 'steps'
  grid.title = content.title
  grid.description = content.subtitle
  grid.settings.columns = 4
  grid.settings.cards = enabledProcessSteps(content.steps).map((s) => ({
    id: s.id,
    title: s.title,
    description: s.text,
    icon: s.step,
    color: s.color,
  }))
  return grid
}

function homeBlogBlock(order: number): BlogShowcaseBlock {
  const block = createDefaultBlogShowcaseBlock(order)
  block.id = HOME_EDITABLE_BLOCK_IDS.blog
  block.title = 'Son blog yazıları'
  block.description = 'Güncel içerikler ve sektör haberleri'
  block.settings.source = 'recent'
  block.settings.limit = 3
  return block
}

function homeCtaBlock(content: HomePageContent['cta'], order: number): CtaBlock {
  const cta = createDefaultCtaBlock(order)
  cta.id = HOME_EDITABLE_BLOCK_IDS.cta
  cta.title = content.title
  cta.description = content.subtitle
  cta.settings.backgroundType = 'gradient'
  cta.settings.gradient = 'linear-gradient(to bottom right, #059669, #10b981, #0d9488)'
  cta.style.paddingTop = { desktop: '64px', mobile: '48px' }
  cta.style.paddingBottom = { desktop: '64px', mobile: '48px' }
  cta.settings.buttons = [
    {
      id: 'home-cta-btn-1',
      label: content.buttonText || 'İletişime Geç',
      href: content.buttonHref || '/iletisim',
      visible: true,
      variant: 'primary',
    },
    {
      id: 'home-cta-btn-2',
      label: 'Hizmetler',
      href: '/hizmetler',
      visible: false,
      variant: 'outline',
    },
  ]
  return cta
}

/**
 * Ana sayfa — gerçek düzenlenebilir builder blokları (legacy-section değil).
 * CMS page-content/home verisi ile seed edilir.
 */
export function createHomeEditableTemplate(raw: Record<string, unknown> | null): BuilderBlock[] {
  const content = normalizeHomePageContent(raw)
  const blocks: BuilderBlock[] = []
  let order = 0

  if (content.hero.enabled) blocks.push(homeHeroBlock(content.hero, order++))
  if (content.intro.enabled) blocks.push(homeIntroBlock(content.intro, order++))
  if (content.services.enabled) blocks.push(homeServicesBlock(content.services, order++))
  blocks.push(homeSolutionsBlock(raw, order++))
  blocks.push(homeProductsBlock(order++))
  if (content.brands.enabled) blocks.push(homeBrandsBlock(content.brands, order++))
  if (content.why.enabled) blocks.push(homeWhyBlock(content.why, order++))
  if (content.process.enabled) blocks.push(homeProcessBlock(content.process, order++))
  blocks.push(homeBlogBlock(order++))
  if (content.cta.enabled) blocks.push(homeCtaBlock(content.cta, order++))

  return assignSortOrder(blocks)
}

export function countHomeEditableBlocks(blocks: BuilderBlock[]): number {
  return blocks.filter((b) => b.type !== 'legacy-section').length
}
