import type { BuilderBlock } from '@/builder/types'
import type { BuilderPageDefinition } from '@/builder/pages/builderPageRegistry'
import {
  extractSeoFromRaw,
  parseBuilderBlocksFromRaw,
} from '@/builder/load/parseBuilderBlocks'
import { extractBlocksForPage } from '@/builder/load/pageContentPersistence'
import { sanitizeAboutBuilderBlocks } from '@/builder/templates/aboutEditableTemplate'
import {
  isAutoMkCompareLegacyDocument,
  sanitizeMkCompareBuilderBlocks,
} from '@/builder/templates/mkCompareBuilderTemplate'
import { isMkCompareBuilderPageKey } from '@/components/public/muvekkil-kasa/comparePageUtils'

/** Builder store / canvas modu */
export type BuilderCanvasMode = 'builder-blocks' | 'legacy-public'

/** Yükleme kaynağı — canvas için */
export type PageLoadSource = 'builder-json' | 'legacy-public' | 'builder-draft'

export type ResolvedBuilderPage = {
  pageKey: string
  pageTitle: string
  blocks: BuilderBlock[]
  source: PageLoadSource
  canvasMode: BuilderCanvasMode
  seoTitle?: string
  seoDescription?: string
}

/**
 * Builder yükleme — yalnızca gerçek builder JSON store'a alınır.
 * Builder JSON yoksa canvas public site bileşenlerini gösterir (legacy-public).
 *
 * pageContentToBlocks adaptörü burada KULLANILMAZ (geçiş aracı olarak dosyada kalır).
 */
export function resolveBuilderPageLoad(
  def: BuilderPageDefinition,
  raw: Record<string, unknown> | null,
): ResolvedBuilderPage {
  const seo = extractSeoFromRaw(raw)
  const builderBlocks = extractBlocksForPage(raw, def) ?? parseBuilderBlocksFromRaw(raw)

  if (builderBlocks && builderBlocks.length > 0) {
    if (isMkCompareBuilderPageKey(def.key) && isAutoMkCompareLegacyDocument(builderBlocks)) {
      return {
        pageKey: def.key,
        pageTitle: def.title,
        blocks: [],
        source: 'legacy-public',
        canvasMode: 'legacy-public',
        ...seo,
      }
    }
    let normalizedBlocks = def.key === 'about' ? sanitizeAboutBuilderBlocks(builderBlocks) : builderBlocks
    if (isMkCompareBuilderPageKey(def.key)) {
      normalizedBlocks = sanitizeMkCompareBuilderBlocks(builderBlocks)
    }
    return {
      pageKey: def.key,
      pageTitle: def.title,
      blocks: normalizedBlocks,
      source: 'builder-json',
      canvasMode: 'builder-blocks',
      ...seo,
    }
  }

  return {
    pageKey: def.key,
    pageTitle: def.title,
    blocks: [],
    source: 'legacy-public',
    canvasMode: 'legacy-public',
    ...seo,
  }
}
