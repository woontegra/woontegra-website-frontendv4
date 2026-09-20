import type { BuilderBlock } from '@/builder/types'
import { productBuilderPageKey } from '@/builder/data/builderNavCatalog'
import { isMuvekkilKasaCompareSlug } from '@/components/public/muvekkil-kasa/comparePageUtils'
import { isKoopPlusPublicSlug, KOOPPLUS_SLUG } from '@/data/koopplusProduct'

export const KOOPPLUS_BUILDER_PAGE_KEY = productBuilderPageKey(KOOPPLUS_SLUG)
export const KOOPPLUS_GENERIC_PDP_TEMPLATE_VERSION = 'koopplus-public-preview-v1'

export type ProductDetailPreviewKind = 'koopplus' | 'mk-compare' | 'software-detail'

export function isKoopPlusBuilderSlug(slug?: string | null): boolean {
  return isKoopPlusPublicSlug(slug)
}

export function isKoopPlusBuilderPageKey(pageKey?: string | null): boolean {
  return pageKey?.trim().toLowerCase() === KOOPPLUS_BUILDER_PAGE_KEY
}

export function resolveProductDetailPreviewKind(slug?: string | null): ProductDetailPreviewKind {
  if (isMuvekkilKasaCompareSlug(slug)) return 'mk-compare'
  if (isKoopPlusBuilderSlug(slug)) return 'koopplus'
  return 'software-detail'
}

function blockSlug(block: BuilderBlock): string {
  const settings = (block as { settings?: { slug?: unknown } }).settings
  return typeof settings?.slug === 'string' ? settings.slug : ''
}

/**
 * Yalnız otomatik generic PDP conversion taslağı.
 * Başka block type veya başka ürün slug’ı varsa dokunulmaz.
 */
export function isStaleKoopPlusGenericPdpBlocks(
  blocks: BuilderBlock[] | null | undefined,
  pageSlug?: string | null,
): boolean {
  if (!isKoopPlusBuilderSlug(pageSlug) && pageSlug != null && pageSlug !== '') {
    return false
  }
  if (!blocks?.length) return false
  return blocks.every((block) => {
    if (block.type !== 'product-detail') return false
    const slug = blockSlug(block)
    return !slug || isKoopPlusBuilderSlug(slug)
  })
}

export function shouldIgnoreKoopPlusGenericPdp(
  pageKey: string | null | undefined,
  pageSlug: string | null | undefined,
  blocks: BuilderBlock[] | null | undefined,
): boolean {
  if (!isKoopPlusBuilderPageKey(pageKey) && !isKoopPlusBuilderSlug(pageSlug)) {
    return false
  }
  return isStaleKoopPlusGenericPdpBlocks(blocks, pageSlug ?? KOOPPLUS_SLUG)
}

export function clearStaleKoopPlusGenericDraft(
  storage: Pick<Storage, 'getItem' | 'removeItem'>,
  storageKey: string,
  pageKey: string,
  slug?: string,
): boolean {
  try {
    const raw = storage.getItem(storageKey)
    if (!raw) return false
    const parsed = JSON.parse(raw) as { blocks?: BuilderBlock[]; pageMeta?: { slug?: string } }
    if (!shouldIgnoreKoopPlusGenericPdp(pageKey, slug ?? parsed.pageMeta?.slug, parsed.blocks)) {
      return false
    }
    storage.removeItem(storageKey)
    return true
  } catch {
    return false
  }
}
