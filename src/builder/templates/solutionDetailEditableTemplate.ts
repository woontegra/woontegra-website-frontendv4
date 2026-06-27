import type { BuilderBlock } from '@/builder/types/blocks'
import {
  createDefaultCtaBlock,
  createDefaultRichTextBlock,
} from '@/builder/types/blockModels'
import { createDefaultHeroBlock } from '@/builder/types/hero'
import { assignSortOrder } from '@/builder/load/parseBuilderBlocks'
import { SOLUTION_DETAIL_BY_SLUG, type SolutionDetailContent } from '@/data/solutionCatalog'

function blockId(slug: string, part: string): string {
  return `sol-${slug}-${part}`
}

function resolveSolutionContent(slug: string, raw: Record<string, unknown> | null): SolutionDetailContent {
  const base = SOLUTION_DETAIL_BY_SLUG[slug]
  if (!base) {
    return {
      slug,
      title: slug,
      description: '',
      enabled: true,
      seoTitle: slug,
      seoDescription: '',
    }
  }
  if (!raw || typeof raw !== 'object') return base
  const pages = raw.pages as Record<string, Partial<SolutionDetailContent>> | undefined
  const override = pages?.[slug]
  if (!override) return base
  return { ...base, ...override }
}

export function createSolutionDetailEditableTemplate(
  slug: string,
  raw: Record<string, unknown> | null,
): BuilderBlock[] {
  const content = resolveSolutionContent(slug, raw)
  const blocks: BuilderBlock[] = []
  let order = 0

  const hero = createDefaultHeroBlock(blockId(slug, 'hero'), order++)
  hero.title = content.title
  hero.description = content.description
  hero.settings.layout = 'compact'
  hero.settings.mode = content.logo?.trim() ? 'single-image' : 'gradient'
  hero.settings.height = { desktop: '260px', mobile: '200px' }
  if (content.logo?.trim()) {
    hero.settings.desktopImage = { url: content.logo }
  }
  if (content.externalUrl?.trim()) {
    hero.settings.buttons = [
      {
        id: `${slug}-ext`,
        label: 'Siteyi Ziyaret Et',
        href: content.externalUrl,
        visible: true,
        variant: 'primary',
      },
    ]
  }
  blocks.push(hero)

  const desc = createDefaultRichTextBlock(order++)
  desc.id = blockId(slug, 'description')
  desc.title = content.title
  desc.description = content.seoDescription
  desc.settings.body = content.description
  blocks.push(desc)

  const cta = createDefaultCtaBlock(order++)
  cta.id = blockId(slug, 'cta')
  cta.title = `${content.title} hakkında konuşalım`
  cta.description = content.description
  cta.settings.buttons = [
    {
      id: `${slug}-cta-contact`,
      label: 'İletişime Geç',
      href: '/iletisim',
      visible: true,
      variant: 'primary',
    },
    ...(content.externalUrl?.trim()
      ? [
          {
            id: `${slug}-cta-ext`,
            label: 'Siteyi Ziyaret Et',
            href: content.externalUrl,
            visible: true,
            variant: 'outline' as const,
          },
        ]
      : []),
  ]
  blocks.push(cta)

  return assignSortOrder(blocks)
}
