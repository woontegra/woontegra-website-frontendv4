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
import { mergeSolutionPage, type SolutionPageOverrides } from '@/lib/solutionPageMerge'
import { SOLUTION_DETAIL_BY_SLUG, type SolutionDetailContent } from '@/data/solutionDetailContent'
import { normalizeSolutionPages } from '@/pages/public/SolutionDetailPage'

function blockId(slug: string, part: string): string {
  return `sol-${slug}-${part}`
}

function genericSolutionContent(slug: string, title: string): SolutionDetailContent {
  return {
    slug,
    title,
    description: `${title} çözümü hakkında detaylı bilgi.`,
    enabled: true,
    seoTitle: `${title} | Woontegra Çözümler`,
    seoDescription: `${title} — Woontegra yazılım çözümleri.`,
    hero: {
      eyebrow: 'Çözüm',
      title,
      description: `${title} çözümü hakkında detaylı bilgi.`,
      image: '/images/solutions-hero.jpg',
      imageAlt: title,
      primaryCta: { text: 'Projeniz için görüşelim', to: '/iletisim' },
      secondaryCta: { text: 'Tüm Çözümler', to: '/cozumler' },
    },
    audience: {
      title: 'Kimler için?',
      subtitle: 'Bu çözümden kimler yararlanabilir?',
      items: [{ icon: 'Target', title: 'Hedef kitle', description: 'Dijital dönüşüm hedefleyen işletmeler.' }],
    },
    benefits: {
      title: 'Ne sağlar?',
      subtitle: 'Operasyonel kazanımlar',
      items: [{ icon: 'CheckCircle', title: 'Merkezi yönetim', description: 'Süreçleri tek panelde toplar.' }],
    },
    modules: {
      title: 'Temel modüller',
      subtitle: 'Çözüm bileşenleri',
      items: [{ icon: 'Boxes', title: 'Modül', description: 'Temel işlev seti.', gradient: 'from-emerald-500 to-teal-500' }],
    },
    implementation: {
      title: 'Woontegra nasıl uygular?',
      description: 'Analiz, geliştirme ve yayın süreci.',
      bullets: ['İhtiyaç analizi', 'Mimari tasarım', 'Geliştirme ve test'],
      flowSteps: ['Analiz', 'Tasarım', 'Geliştirme', 'Yayın'],
    },
    related: {
      title: 'İlgili hizmetler',
      links: [{ label: 'Yazılım Geliştirme', href: '/hizmetler/yazilim-gelistirme', description: 'Özel yazılım hizmeti' }],
    },
    cta: {
      title: 'Projeniz için görüşelim',
      description: 'İhtiyacınıza uygun çözüm mimarisini birlikte planlayalım.',
      buttonText: 'İletişime Geç',
      buttonTo: '/iletisim',
      secondaryButtonText: 'Tüm Çözümler',
      secondaryButtonTo: '/cozumler',
    },
  }
}

export function resolveSolutionDetailContent(
  slug: string,
  title: string,
  raw: Record<string, unknown> | null,
): SolutionDetailContent {
  const base = SOLUTION_DETAIL_BY_SLUG[slug] ?? genericSolutionContent(slug, title)
  const pages = normalizeSolutionPages(raw)
  const overrides = (pages[slug] ?? {}) as SolutionPageOverrides
  return mergeSolutionPage(base, overrides)
}

function compactHero(slug: string, content: SolutionDetailContent, order: number): HeroBlock {
  const hero = createDefaultHeroBlock(blockId(slug, 'hero'), order)
  const hasImage = Boolean(content.hero.image?.trim())
  hero.title = content.hero.title
  hero.description = content.hero.description
  hero.settings.layout = hasImage ? 'about' : 'compact'
  hero.settings.badge = content.hero.eyebrow
  hero.settings.contentAlign = 'left'
  hero.settings.mode = hasImage ? 'single-image' : 'gradient'
  hero.settings.height = { desktop: '260px', tablet: '220px', mobile: '180px' }
  hero.settings.showBreadcrumbs = true
  hero.settings.breadcrumbs = [
    { label: 'Ana Sayfa', href: '/' },
    { label: 'Çözümler', href: '/cozumler' },
    { label: content.title },
  ]
  if (hasImage) {
    hero.settings.desktopImage = { url: content.hero.image }
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

function cardGridFromItems(
  slug: string,
  part: string,
  title: string,
  description: string,
  order: number,
  items: Array<{ id?: string; title: string; description?: string; icon?: string; gradient?: string; color?: string }>,
  variant: CardGridBlock['settings']['variant'] = 'default',
  columns: 2 | 3 | 4 = 3,
): CardGridBlock {
  const grid = createDefaultCardGridBlock(order)
  grid.id = blockId(slug, part)
  grid.title = title
  grid.description = description
  grid.settings.variant = variant
  grid.settings.columns = columns
  grid.settings.cards = items.map((item, i) => ({
    id: item.id ?? `${slug}-${part}-${i}`,
    title: item.title,
    description: item.description ?? '',
    icon: item.icon,
    color: item.gradient ?? item.color,
  }))
  return grid
}

function implementationBlock(slug: string, content: SolutionDetailContent, order: number): RichTextBlock {
  const block = createDefaultRichTextBlock(order)
  block.id = blockId(slug, 'implementation')
  block.title = content.implementation.title
  block.description = content.implementation.description
  const bullets = content.implementation.bullets.map((b) => `• ${b}`).join('\n')
  const steps = content.implementation.flowSteps.length
    ? `\n\nSüreç: ${content.implementation.flowSteps.join(' → ')}`
    : ''
  block.settings.body = `${bullets}${steps}`
  return block
}

function relatedBlock(slug: string, content: SolutionDetailContent, order: number): CardGridBlock {
  return cardGridFromItems(
    slug,
    'related',
    content.related.title,
    '',
    order,
    content.related.links.map((link, i) => ({
      id: `${slug}-rel-${i}`,
      title: link.label,
      description: link.description,
      icon: 'ArrowRight',
      color: 'from-slate-600 to-slate-800',
      href: link.href,
    })),
    'default',
    3,
  )
}

function ctaBlock(slug: string, content: SolutionDetailContent, order: number): CtaBlock {
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
      label: content.cta.secondaryButtonText,
      href: content.cta.secondaryButtonTo,
      visible: Boolean(content.cta.secondaryButtonText?.trim()),
      variant: 'outline',
    },
  ]
  return cta
}

export function createSolutionDetailEditableTemplate(
  slug: string,
  title: string,
  raw: Record<string, unknown> | null,
): BuilderBlock[] {
  const content = resolveSolutionDetailContent(slug, title, raw)
  const blocks: BuilderBlock[] = [
    compactHero(slug, content, 0),
    cardGridFromItems(
      slug,
      'audience',
      content.audience.title,
      content.audience.subtitle,
      1,
      content.audience.items,
      'why',
      3,
    ),
    cardGridFromItems(
      slug,
      'benefits',
      content.benefits.title,
      content.benefits.subtitle,
      2,
      content.benefits.items.map((item) => ({ ...item, color: 'from-emerald-500 to-teal-500' })),
      'why',
      3,
    ),
    cardGridFromItems(slug, 'modules', content.modules.title, content.modules.subtitle, 3, content.modules.items, 'solutions', 3),
    implementationBlock(slug, content, 4),
    relatedBlock(slug, content, 5),
    ctaBlock(slug, content, 6),
  ]
  return assignSortOrder(blocks)
}
