import type { BuilderBlock } from '@/builder/types/blocks'
import type { ProductDetailBlock } from '@/builder/types/productDetail'
import { assignSortOrder } from '@/builder/load/parseBuilderBlocks'
import { resolveProductBuilderSource } from '@/builder/data/productBuilderSeeds'
import { productSeedToPublicDetail } from '@/builder/parity/contentMappers'
import { publicProductToDetailBlock } from '@/builder/parity/productDetailMapper'
import type { PublicProductDetail } from '@/types/product'

function blockId(slug: string, part: string): string {
  return `pdp-${slug}-${part}`
}

function readApiProduct(raw: Record<string, unknown> | null): PublicProductDetail | null {
  const row = raw?.__productDetail
  if (!row || typeof row !== 'object') return null
  return row as PublicProductDetail
}

/**
 * Ürün detay — public SoftwareDetailView ile aynı veri; dev hero ve generic CTA yok.
 */
export function createProductDetailEditableTemplate(
  slug: string,
  raw: Record<string, unknown> | null,
): BuilderBlock[] {
  const apiProduct = readApiProduct(raw)
  if (apiProduct) {
    const pdp = publicProductToDetailBlock(apiProduct, blockId(slug, 'pdp'), 0)
    return assignSortOrder([pdp as ProductDetailBlock])
  }

  const source = resolveProductBuilderSource(slug, raw)
  const seedProduct = productSeedToPublicDetail(source)
  const pdp = publicProductToDetailBlock(seedProduct, blockId(slug, 'pdp'), 0)
  return assignSortOrder([pdp as ProductDetailBlock])
}

export function productDetailHasHero(blocks: BuilderBlock[]): boolean {
  return blocks.some((b) => b.type === 'hero')
}
