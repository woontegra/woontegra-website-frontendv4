import type { BuilderBlock } from '@/builder/types'
import type { HeroBlock } from '@/builder/types/hero'
import { getHeroSettingsImageSources } from '@/builder/render/heroResponsiveImage'
import { resolveMediaUrl } from '@/media/resolveMediaUrl'
import type { HomePageContent } from '@/types/homePageContent'
import { defaultHomePageContent, normalizeHomePageContent } from '@/types/homePageContent'
export type HomeHeroShellLayout = 'split' | 'fullscreen' | 'compact' | 'none'

export type HomeHeroShell = {
  layout: HomeHeroShellLayout
  minHeight: string
  imageUrl: string | null
}

export type HomeRenderPlan =
  | { mode: 'builder'; blocks: BuilderBlock[]; seoTitle?: string; seoDescription?: string }
  | { mode: 'sections'; content: HomePageContent; seoTitle?: string; seoDescription?: string }

function isBuilderBlock(value: unknown): value is BuilderBlock {
  if (!value || typeof value !== 'object') return false
  const row = value as Record<string, unknown>
  return typeof row.type === 'string' && typeof row.id === 'string'
}

function parseBlocks(raw: unknown): BuilderBlock[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null
  const blocks = raw.filter(isBuilderBlock)
  return blocks.length > 0 ? blocks : null
}

function extractSeo(raw: Record<string, unknown> | null): { title?: string; description?: string } {
  if (!raw) return {}
  const title = String(raw.seoTitle ?? '').trim()
  const description = String(raw.seoDescription ?? '').trim()
  return {
    title: title || undefined,
    description: description || undefined,
  }
}

/**
 * Ana sayfa render planı — öncelik:
 * 1) Çok bloklu builder JSON → PageBlocksRenderer
 * 2) page-content/home veya fallback → tam bölüm vitrini (HomePageView)
 */
export function resolveHomeRenderPlan(raw: Record<string, unknown> | null): HomeRenderPlan {
  const seo = extractSeo(raw)

  if (raw && typeof raw === 'object') {
    const blocks =
      parseBlocks(raw.blocks) ??
      parseBlocks((raw.page as Record<string, unknown> | undefined)?.blocks) ??
      null

    if (blocks && blocks.length >= 1) {
      return { mode: 'builder', blocks, ...seo }
    }
  }

  const content = normalizeHomePageContent(raw)

  return {
    mode: 'sections',
    content,
    seoTitle: seo.title ?? defaultHomePageContent.hero.title,
    seoDescription:
      seo.description ??
      'Woontegra Teknoloji Yazılım ve Dijital Hizmetler Ltd. Şti.; işletmeler için özel yazılım, e-ticaret altyapısı, web sitesi, masaüstü yazılım ve dijital dönüşüm çözümleri geliştirir.',
  }
}

export function homePlanSeo(plan: HomeRenderPlan): { title?: string; description?: string } {
  return { title: plan.seoTitle, description: plan.seoDescription }
}

function heroImageFromBlock(hero: HeroBlock): string | null {
  const { settings } = hero
  if (settings.mode === 'gradient' || settings.mode === 'solid-color' || settings.mode === 'video') {
    return null
  }

  const sources = getHeroSettingsImageSources(settings)
  return sources?.desktop || null
}

function heroLayoutFromBlock(hero: HeroBlock): HomeHeroShellLayout {  if (hero.settings.layout === 'compact') return 'compact'
  if (hero.settings.layout === 'split') return 'split'
  return 'fullscreen'
}

/**
 * Ana sayfa hero kabuğu — skeleton ölçüsü ve preload URL'i için.
 */
export function extractHomeHeroShell(plan: HomeRenderPlan): HomeHeroShell {
  if (plan.mode === 'sections') {
    if (!plan.content.hero.enabled) {
      return { layout: 'none', minHeight: '0px', imageUrl: null }
    }

    const imageUrl = plan.content.hero.image?.trim()
      ? resolveMediaUrl(plan.content.hero.image) || null
      : null

    return {
      layout: 'split',
      minHeight: '520px',
      imageUrl,
    }
  }

  const hero = plan.blocks.find((block): block is HeroBlock => block.type === 'hero')
  if (!hero?.visibility?.enabled) {
    return { layout: 'none', minHeight: '0px', imageUrl: null }
  }

  return {
    layout: heroLayoutFromBlock(hero),
    minHeight: hero.settings.height?.desktop ?? (hero.settings.layout === 'compact' ? '280px' : '520px'),
    imageUrl: heroImageFromBlock(hero),
  }
}
