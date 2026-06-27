import type { BuilderBlock } from '@/builder/types/blocks'
import type { ProductDetailBlock } from '@/builder/types/productDetail'
import { createDefaultProductDetailBlock } from '@/builder/types/productDetail'
import { createDefaultCtaBlock } from '@/builder/types/blockModels'
import { assignSortOrder } from '@/builder/load/parseBuilderBlocks'
import { resolveProductBuilderSource } from '@/builder/data/productBuilderSeeds'
import { productTypeLabel } from '@/types/product'

function blockId(slug: string, part: string): string {
  return `pdp-${slug}-${part}`
}

/**
 * Ürün detay — dev hero YOK; tek PDP bloğu + alt CTA.
 */
export function createProductDetailEditableTemplate(
  slug: string,
  raw: Record<string, unknown> | null,
): BuilderBlock[] {
  const source = resolveProductBuilderSource(slug, raw)
  const pdp = createDefaultProductDetailBlock(blockId(slug, 'pdp'), 0)
  pdp.title = source.name
  pdp.description = source.shortDescription
  pdp.settings.slug = slug
  pdp.settings.breadcrumbs = ['Ana Sayfa', 'Yazılımlar', source.name]
  pdp.settings.productType = source.productType
  pdp.settings.price = source.price
  pdp.settings.compareAtPrice = source.compareAtPrice ?? null
  pdp.settings.currency = source.currency
  pdp.settings.licenseMonths = source.licenseMonths
  pdp.settings.showYearSelector = source.productType === 'SAAS'
  pdp.settings.version = source.version
  pdp.settings.longDescriptionHtml = source.description
  pdp.settings.featureBullets = source.featureBullets.map((text, i) => ({
    id: `${slug}-feat-${i}`,
    text,
  }))
  pdp.settings.systemRequirements = source.systemRequirements
  pdp.settings.deliveryInfo = source.deliveryInfo
  pdp.settings.licenseInfo = source.licenseInfo
  pdp.settings.gallery = [
    ...(source.coverImage ? [{ id: `${slug}-cover`, url: source.coverImage }] : []),
    ...source.gallery.map((url, i) => ({ id: `${slug}-gal-${i}`, url })),
  ]

  const cta = createDefaultCtaBlock(1)
  cta.id = blockId(slug, 'cta')
  cta.title = 'Satın alma veya demo'
  cta.description = `${productTypeLabel(source.productType)} — ${source.name}`
  cta.settings.buttons = [
    {
      id: `${slug}-cta-buy`,
      label: source.price > 0 ? 'Sepete Ekle' : 'Ücretsiz İndir',
      href: '/sepet',
      visible: true,
      variant: 'primary',
    },
    {
      id: `${slug}-cta-contact`,
      label: 'İletişim',
      href: '/iletisim',
      visible: true,
      variant: 'outline',
    },
  ]

  const blocks: BuilderBlock[] = [pdp as ProductDetailBlock, cta]
  return assignSortOrder(blocks)
}

export function productDetailHasHero(blocks: BuilderBlock[]): boolean {
  return blocks.some((b) => b.type === 'hero')
}
