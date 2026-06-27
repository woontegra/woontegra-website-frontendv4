import type { BuilderBlock } from '@/builder/types'
import type { HeroBlock } from '@/builder/types/hero'
import type { BuilderPageDefinition } from '@/builder/pages/builderPageRegistry'
import { assignSortOrder } from '@/builder/load/parseBuilderBlocks'
import { parseBuilderBlocksFromRaw } from '@/builder/load/parseBuilderBlocks'

function cloneRaw(raw: Record<string, unknown> | null): Record<string, unknown> {
  if (!raw) return {}
  return JSON.parse(JSON.stringify(raw)) as Record<string, unknown>
}

function heroImageFromBlock(block: BuilderBlock): string | undefined {
  if (block.type !== 'hero') return undefined
  const hero = block as HeroBlock
  const url =
    hero.settings.desktopImage?.url?.trim() ||
    hero.settings.slides.find((s) => s.enabled !== false)?.desktopImage?.url?.trim() ||
    hero.settings.slides[0]?.desktopImage?.url?.trim()
  return url || undefined
}

/** API / localStorage ham JSON içinden sayfa bloklarını çıkarır */
export function extractBlocksForPage(
  raw: Record<string, unknown> | null,
  def: BuilderPageDefinition,
): BuilderBlock[] | null {
  const top = parseBuilderBlocksFromRaw(raw)
  if (top?.length) return top

  if (def.slug && raw?.pages && typeof raw.pages === 'object') {
    const page = (raw.pages as Record<string, unknown>)[def.slug]
    if (page && typeof page === 'object') {
      const nested = parseBuilderBlocksFromRaw(page as Record<string, unknown>)
      if (nested?.length) return nested
    }
  }

  return null
}

function syncHeroImageForValidation(
  payload: Record<string, unknown>,
  blocks: BuilderBlock[],
  def: BuilderPageDefinition,
): void {
  const heroBlock = blocks.find((b) => b.type === 'hero')
  const image = heroBlock ? heroImageFromBlock(heroBlock) : undefined
  if (!image) return

  if (def.key === 'home') {
    const hero =
      payload.hero && typeof payload.hero === 'object'
        ? { ...(payload.hero as Record<string, unknown>) }
        : {}
    hero.image = image
    hero.enabled = hero.enabled ?? true
    payload.hero = hero
    return
  }

  if (def.key === 'about') {
    const hero =
      payload.hero && typeof payload.hero === 'object'
        ? { ...(payload.hero as Record<string, unknown>) }
        : {}
    hero.image = image
    payload.hero = hero
    return
  }

  if (def.key === 'contact') {
    payload.heroImage =
      image ??
      (typeof payload.heroImage === 'string' && payload.heroImage.trim() ? payload.heroImage : '/images/services-hero.jpg')
    return
  }

  if (def.key === 'services' || def.key === 'solutions') {
    payload.heroImage = image
    return
  }

  if (def.slug && def.kind !== 'landing' && def.kind !== 'legal') {
    const pages = payload.pages as Record<string, unknown> | undefined
    if (!pages || typeof pages !== 'object') return
    const page = pages[def.slug]
    if (!page || typeof page !== 'object') return
    const row = { ...(page as Record<string, unknown>) }
    const hero = row.hero && typeof row.hero === 'object' ? { ...(row.hero as Record<string, unknown>) } : {}
    hero.image = image
    row.hero = hero
    pages[def.slug] = row
  }
}

/** Builder bloklarını mevcut CMS JSON'una birleştirerek PUT gövdesi üretir */
export function buildPageContentPayload(
  def: BuilderPageDefinition,
  blocks: BuilderBlock[],
  existingRaw: Record<string, unknown> | null,
): Record<string, unknown> {
  const sorted = assignSortOrder(blocks)
  const base = cloneRaw(existingRaw)

  if (
    def.kind === 'service-detail' ||
    def.kind === 'solution-detail' ||
    def.kind === 'product-detail' ||
    def.kind === 'blog-detail'
  ) {
    const slug = def.slug ?? ''
    const pages =
      base.pages && typeof base.pages === 'object'
        ? { ...(base.pages as Record<string, unknown>) }
        : ({} as Record<string, unknown>)
    const prev =
      pages[slug] && typeof pages[slug] === 'object'
        ? { ...(pages[slug] as Record<string, unknown>) }
        : ({} as Record<string, unknown>)
    pages[slug] = { ...prev, blocks: sorted }
    base.pages = pages
    syncHeroImageForValidation(base, sorted, def)
    return base
  }

  const payload: Record<string, unknown> = { ...base, blocks: sorted }
  syncHeroImageForValidation(payload, sorted, def)
  return payload
}
