import type { BuilderBlock } from '@/builder/types/blocks'
import type { HeroBlock } from '@/builder/types/hero'
import type { CardGridBlock, CtaBlock, RichTextBlock } from '@/builder/types/blockModels'
import {
  createDefaultCardGridBlock,
  createDefaultCtaBlock,
  createDefaultRichTextBlock,
} from '@/builder/types/blockModels'
import { createDefaultHeroBlock } from '@/builder/types/hero'
import { assignSortOrder } from '@/builder/load/parseBuilderBlocks'
import { mergeServicePage, type ServicePageOverrides } from '@/lib/servicePageMerge'
import { SERVICE_DETAIL_BY_SLUG, type ServiceDetailContent } from '@/data/serviceDetailContent'
import { normalizeServicePages } from '@/pages/public/ServiceDetailPage'

function blockId(slug: string, part: string): string {
  return `svc-${slug}-${part}`
}

function genericServiceContent(slug: string, title: string): ServiceDetailContent {
  return {
    slug,
    heroTheme: 'emerald',
    hero: {
      eyebrow: 'Hizmet',
      title,
      description: `${title} hizmetimiz hakkında detaylı bilgi.`,
      image: '',
      imageAlt: title,
      primaryCta: { text: 'Teklif Al', to: '/iletisim' },
      secondaryCta: { text: 'İletişim', to: '/iletisim' },
    },
    problems: {
      title: 'Kimler için?',
      subtitle: 'Bu hizmetten kimler yararlanabilir?',
      items: [{ icon: 'Target', title: 'Hedef kitle', description: 'İlgili sektör ve işletmeler.' }],
    },
    approach: {
      title: 'Hizmet özeti',
      description: 'Süreç ve yaklaşımımızın özeti.',
      bullets: ['Analiz', 'Planlama', 'Uygulama'],
      flowSteps: [],
    },
    scope: {
      title: 'Neler sunuyoruz',
      subtitle: 'Kapsam ve teslimatlar',
      items: [{ icon: 'CheckCircle', title: 'Temel paket', description: 'Standart teslimat kapsamı.', gradient: 'from-emerald-500 to-green-600' }],
    },
    process: {
      title: 'Süreç',
      subtitle: 'Adım adım ilerleyiş',
      steps: [{ step: '01', title: 'Keşif', description: 'İhtiyaç analizi' }],
    },
    whyUs: {
      title: 'Avantajlarımız',
      items: [{ title: 'Deneyim', description: 'Sektör tecrübesi' }],
    },
    technology: {
      title: 'Teknoloji',
      description: '',
      items: [],
    },
    cta: {
      title: 'Projenize başlayalım',
      description: 'İletişime geçin.',
      buttonText: 'İletişime Geç',
      buttonTo: '/iletisim',
    },
  }
}

export function resolveServiceDetailContent(
  slug: string,
  title: string,
  raw: Record<string, unknown> | null,
): ServiceDetailContent {
  const base = SERVICE_DETAIL_BY_SLUG[slug] ?? genericServiceContent(slug, title)
  const pages = normalizeServicePages(raw)
  const overrides = (pages[slug] ?? {}) as ServicePageOverrides
  return mergeServicePage(base, overrides)
}

function compactHero(slug: string, content: ServiceDetailContent, order: number): HeroBlock {
  const hero = createDefaultHeroBlock(blockId(slug, 'hero'), order)
  const hasImage = Boolean(content.hero.image?.trim())
  hero.title = content.hero.title
  hero.description = content.hero.description
  // 'about' düzeni, legacy PageHero(compact) ile birebir aynı: metin solda, çerçeveli görsel sağda.
  // 'compact' düzeni görseli hiç render etmediği için hero görseli kayboluyordu.
  hero.settings.layout = hasImage ? 'about' : 'compact'
  hero.settings.badge = content.hero.eyebrow
  hero.settings.contentAlign = 'left'
  hero.settings.mode = hasImage ? 'single-image' : 'gradient'
  hero.settings.height = { desktop: '280px', tablet: '240px', mobile: '200px' }
  if (hasImage) {
    hero.settings.desktopImage = { url: content.hero.image }
  }
  if (content.hero.highlights?.length) {
    hero.settings.highlights = content.hero.highlights.map((item, i) => ({
      id: `${slug}-hl-${i}`,
      icon: item.icon,
      title: item.title,
    }))
  }
  hero.settings.buttons = [
    {
      id: `${slug}-btn-1`,
      label: content.hero.primaryCta.text,
      href: content.hero.primaryCta.to,
      visible: true,
      variant: 'primary',
    },
    {
      id: `${slug}-btn-2`,
      label: content.hero.secondaryCta.text,
      href: content.hero.secondaryCta.to,
      visible: Boolean(content.hero.secondaryCta.text?.trim()),
      variant: 'outline',
    },
  ]
  return hero
}

function summaryBlock(slug: string, content: ServiceDetailContent, order: number): RichTextBlock {
  const block = createDefaultRichTextBlock(order)
  block.id = blockId(slug, 'summary')
  block.title = content.approach.title
  block.description = content.approach.description
  const bullets = content.approach.bullets.map((b) => `• ${b}`).join('\n')
  block.settings.body = bullets
  return block
}

function cardGridFromItems(
  slug: string,
  part: string,
  title: string,
  description: string,
  order: number,
  items: Array<{ id?: string; title: string; description?: string; text?: string; icon?: string; step?: string; gradient?: string; color?: string }>,
  variant: CardGridBlock['settings']['variant'] = 'default',
): CardGridBlock {
  const grid = createDefaultCardGridBlock(order)
  grid.id = blockId(slug, part)
  grid.title = title
  grid.description = description
  grid.settings.variant = variant
  grid.settings.columns = items.length >= 4 ? 4 : 3
  grid.settings.cards = items.map((item, i) => ({
    id: item.id ?? `${slug}-${part}-${i}`,
    title: item.title,
    description: item.description ?? item.text ?? '',
    icon: item.icon ?? item.step,
    color: item.gradient ?? item.color,
  }))
  return grid
}

function technologyGridBlock(slug: string, content: ServiceDetailContent, order: number): CardGridBlock {
  return cardGridFromItems(
    slug,
    'technology',
    content.technology.title,
    content.technology.description,
    order,
    content.technology.items,
    'default',
  )
}

function relatedLinksBlock(slug: string, content: ServiceDetailContent, order: number): CardGridBlock | null {
  if (!content.related?.links.length) return null
  return cardGridFromItems(
    slug,
    'related',
    content.related.title,
    '',
    order,
    content.related.links.map((link, i) => ({
      id: `${slug}-rel-${i}`,
      title: link.label,
      description: link.description ?? '',
      icon: 'Link',
    })),
    'default',
  )
}

function ctaBlock(slug: string, content: ServiceDetailContent, order: number): CtaBlock {
  const cta = createDefaultCtaBlock(order)
  cta.id = blockId(slug, 'cta')
  cta.title = content.cta.title
  cta.description = content.cta.description
  cta.settings.buttons = [
    {
      id: `${slug}-cta-1`,
      label: content.cta.buttonText,
      href: content.cta.buttonTo,
      visible: true,
      variant: 'primary',
    },
    {
      id: `${slug}-cta-2`,
      label: content.cta.secondaryButtonText ?? '',
      href: content.cta.secondaryButtonTo ?? '/iletisim',
      visible: Boolean(content.cta.secondaryButtonText?.trim()),
      variant: 'outline',
    },
  ]
  return cta
}

export function createServiceDetailEditableTemplate(
  slug: string,
  title: string,
  raw: Record<string, unknown> | null,
): BuilderBlock[] {
  const content = resolveServiceDetailContent(slug, title, raw)
  const blocks: BuilderBlock[] = []
  let order = 0

  blocks.push(compactHero(slug, content, order++))
  blocks.push(summaryBlock(slug, content, order++))
  blocks.push(
    cardGridFromItems(slug, 'scope', content.scope.title, content.scope.subtitle, order++, content.scope.items, 'why'),
  )
  if (content.process.steps.length > 0) {
    blocks.push(
      cardGridFromItems(slug, 'process', content.process.title, content.process.subtitle, order++, content.process.steps, 'steps'),
    )
  }
  blocks.push(
    cardGridFromItems(slug, 'who-for', content.problems.title, content.problems.subtitle, order++, content.problems.items),
  )
  if (content.technology.items.length > 0) {
    blocks.push(technologyGridBlock(slug, content, order++))
  }
  blocks.push(
    cardGridFromItems(
      slug,
      'advantages',
      content.whyUs.title,
      '',
      order++,
      content.whyUs.items.map((w, i) => ({ id: `${slug}-why-${i}`, title: w.title, description: w.description })),
      'why',
    ),
  )
  const related = relatedLinksBlock(slug, content, order++)
  if (related) blocks.push(related)
  blocks.push(ctaBlock(slug, content, order++))

  return assignSortOrder(blocks)
}
