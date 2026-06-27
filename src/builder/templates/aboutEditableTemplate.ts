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
  enabledBrands,
  enabledHighlights,
  enabledIconCards,
  enabledSimpleCards,
  enabledStats,
  enabledTimelineSteps,
  normalizeAboutContent,
  type AboutPageContent,
} from '@/types/aboutPageContent'

export const ABOUT_EDITABLE_BLOCK_IDS = {
  hero: 'about-block-hero',
  whatIs: 'about-block-what-is',
  structure: 'about-block-structure',
  timeline: 'about-block-timeline',
  differentiators: 'about-block-differentiators',
  brands: 'about-block-brands',
  workApproach: 'about-block-work-approach',
  vision: 'about-block-vision',
  cta: 'about-block-cta',
} as const

function aboutHeroBlock(hero: AboutPageContent['hero'], order: number): HeroBlock {
  const block = createDefaultHeroBlock(ABOUT_EDITABLE_BLOCK_IDS.hero, order)
  block.title = hero.title
  block.description = hero.subtitle
  block.settings.layout = 'about'
  block.settings.badge = hero.eyebrow
  block.settings.mode = 'single-image'
  block.settings.showBreadcrumbs = true
  block.settings.breadcrumbs = [
    { label: 'Ana Sayfa', href: '/' },
    { label: 'Hakkımızda' },
  ]
  block.settings.desktopImage = { url: hero.image }
  block.settings.mobileImage = { url: hero.image }
  block.settings.highlights = enabledHighlights(hero.highlights).map((h) => ({
    id: h.id,
    icon: h.icon,
    title: h.title,
    cardClass: h.cardClass,
    iconClass: h.iconClass,
  }))
  block.settings.buttons = []
  block.visibility.showButton = false
  block.style.backgroundGradient =
    'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
  block.style.paddingTop = { desktop: '48px', mobile: '32px' }
  block.style.paddingBottom = { desktop: '64px', mobile: '40px' }
  return block
}

function aboutWhatIsBlock(whatIs: AboutPageContent['whatIs'], order: number): RichTextBlock {
  const block = createDefaultRichTextBlock(order)
  block.id = ABOUT_EDITABLE_BLOCK_IDS.whatIs
  block.title = whatIs.title
  block.description = ''
  block.visibility.showDescription = false
  block.settings.variant = 'about-split'
  block.settings.paragraphs = whatIs.paragraphs.filter(Boolean)
  block.settings.highlight = whatIs.highlight
  block.settings.sideCards = enabledSimpleCards(whatIs.cards).map((c) => ({
    id: c.id,
    title: c.title,
    description: c.text,
  }))
  block.style.backgroundGradient = 'linear-gradient(to bottom, #f8fafc, #ffffff)'
  block.style.paddingTop = { desktop: '80px', mobile: '56px' }
  block.style.paddingBottom = { desktop: '80px', mobile: '56px' }
  return block
}

function aboutStructureBlock(section: AboutPageContent['structure'], order: number): RichTextBlock {
  const block = createDefaultRichTextBlock(order)
  block.id = ABOUT_EDITABLE_BLOCK_IDS.structure
  block.title = section.title
  block.description = ''
  block.visibility.showDescription = false
  block.settings.variant = 'about-structure'
  block.settings.paragraphs = section.paragraphs.filter(Boolean)
  block.settings.sideCards = enabledStats(section.stats).map((s) => ({
    id: s.id,
    title: s.title,
    description: s.text,
    icon: s.icon,
  }))
  block.style.backgroundColor = '#f8fafc'
  block.style.paddingTop = { desktop: '80px', mobile: '56px' }
  block.style.paddingBottom = { desktop: '80px', mobile: '56px' }
  return block
}

function aboutTimelineBlock(timeline: AboutPageContent['timeline'], order: number): CardGridBlock {
  const block = createDefaultCardGridBlock(order)
  block.id = ABOUT_EDITABLE_BLOCK_IDS.timeline
  block.settings.variant = 'timeline'
  block.title = timeline.title
  block.description = timeline.subtitle
  block.settings.columns = 3
  block.style.contentAlign = 'center'
  block.style.paddingTop = { desktop: '80px', mobile: '56px' }
  block.style.paddingBottom = { desktop: '80px', mobile: '56px' }
  block.settings.cards = enabledTimelineSteps(timeline.steps).map((s) => ({
    id: s.id,
    title: s.title,
    description: s.text,
    icon: s.icon,
    color: s.color,
  }))
  return block
}

function aboutDifferentiatorsBlock(
  section: AboutPageContent['differentiators'],
  order: number,
): CardGridBlock {
  const block = createDefaultCardGridBlock(order)
  block.id = ABOUT_EDITABLE_BLOCK_IDS.differentiators
  block.settings.variant = 'icon-dark'
  block.title = section.title
  block.description = section.subtitle
  block.settings.columns = 3
  block.style.backgroundColor = '#0f172a'
  block.style.backgroundGradient =
    'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
  block.style.paddingTop = { desktop: '80px', mobile: '56px' }
  block.style.paddingBottom = { desktop: '80px', mobile: '56px' }
  block.settings.cards = enabledIconCards(section.cards).map((c) => ({
    id: c.id,
    title: c.title,
    description: c.text,
    icon: c.icon,
    color: c.gradient,
  }))
  return block
}

function aboutBrandsBlock(brands: AboutPageContent['brands'], order: number): CardGridBlock {
  const block = createDefaultCardGridBlock(order)
  block.id = ABOUT_EDITABLE_BLOCK_IDS.brands
  block.settings.variant = 'about-brands'
  block.title = brands.title
  block.description = brands.subtitle
  block.settings.columns = 2
  block.style.backgroundGradient = 'linear-gradient(to bottom, #f8fafc, #ffffff)'
  block.style.paddingTop = { desktop: '80px', mobile: '56px' }
  block.style.paddingBottom = { desktop: '80px', mobile: '56px' }
  block.settings.cards = enabledBrands(brands.cards).map((b) => ({
    id: b.id,
    title: b.name,
    description: b.text,
    imageUrl: b.image,
    href: b.url,
  }))
  return block
}

function aboutWorkApproachBlock(
  section: AboutPageContent['workApproach'],
  order: number,
): CardGridBlock {
  const block = createDefaultCardGridBlock(order)
  block.id = ABOUT_EDITABLE_BLOCK_IDS.workApproach
  block.settings.variant = 'why'
  block.title = section.title
  block.description = section.subtitle
  block.settings.columns = 4
  block.style.paddingTop = { desktop: '80px', mobile: '56px' }
  block.style.paddingBottom = { desktop: '80px', mobile: '56px' }
  block.settings.cards = enabledIconCards(section.cards).map((c) => ({
    id: c.id,
    title: c.title,
    description: c.text,
    icon: c.icon,
    color: c.gradient,
  }))
  return block
}

function aboutVisionBlock(vision: AboutPageContent['vision'], order: number): RichTextBlock {
  const block = createDefaultRichTextBlock(order)
  block.id = ABOUT_EDITABLE_BLOCK_IDS.vision
  block.title = vision.title
  block.description = ''
  block.visibility.showDescription = false
  block.settings.variant = 'about-vision'
  block.settings.paragraphs = vision.paragraphs.filter(Boolean)
  block.style.backgroundGradient = 'linear-gradient(to bottom right, #0f172a, #1e293b)'
  block.style.paddingTop = { desktop: '80px', mobile: '56px' }
  block.style.paddingBottom = { desktop: '80px', mobile: '56px' }
  return block
}

function aboutCtaBlock(cta: AboutPageContent['cta'], order: number): CtaBlock {
  const block = createDefaultCtaBlock(order)
  block.id = ABOUT_EDITABLE_BLOCK_IDS.cta
  block.title = cta.title
  block.description = cta.subtitle
  block.settings.variant = 'about'
  block.settings.backgroundType = 'gradient'
  block.settings.gradient = 'linear-gradient(to bottom right, #059669, #059669, #0d9488)'
  block.style.paddingTop = { desktop: '80px', mobile: '56px' }
  block.style.paddingBottom = { desktop: '80px', mobile: '56px' }
  block.settings.buttons = [
    {
      id: 'about-cta-btn',
      label: cta.buttonText,
      href: cta.buttonHref || '/iletisim',
      visible: Boolean(cta.buttonText?.trim()),
      variant: 'outline',
    },
  ]
  block.visibility.showButton = true
  return block
}

export function createAboutEditableTemplate(raw: Record<string, unknown> | null): BuilderBlock[] {
  const content = normalizeAboutContent(raw)
  const blocks: BuilderBlock[] = [
    aboutHeroBlock(content.hero, 0),
    aboutWhatIsBlock(content.whatIs, 1),
    aboutStructureBlock(content.structure, 2),
    aboutTimelineBlock(content.timeline, 3),
    aboutDifferentiatorsBlock(content.differentiators, 4),
    aboutBrandsBlock(content.brands, 5),
    aboutWorkApproachBlock(content.workApproach, 6),
    aboutVisionBlock(content.vision, 7),
    aboutCtaBlock(content.cta, 8),
  ]
  return assignSortOrder(blocks)
}
