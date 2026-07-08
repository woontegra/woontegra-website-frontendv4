import type { ProductDetailBlock } from '@/builder/types/productDetail'
import { createDefaultProductDetailBlock } from '@/builder/types/productDetail'
import { renderIfText } from '@/builder/render/renderRules'
import type { PublicProductDetail } from '@/types/product'
import { canPurchaseProduct } from '@/utils/productPurchase'

function galleryOverrideFromBlock(
  block: ProductDetailBlock,
): Pick<PublicProductDetail, 'coverImage' | 'galleryImages'> | null {
  const entries = block.settings.gallery
    .map((g) => ({
      id: g.id,
      url: g.url?.trim() ?? '',
      alt: g.alt?.trim() ?? '',
      title: g.title?.trim() ?? '',
    }))
    .filter((g) => g.url)

  if (entries.length === 0) return null

  return {
    coverImage: entries[0].url,
    galleryImages: entries.map((g, i) => ({
      id: g.id || `builder-gal-${i}`,
      url: g.url,
      sortOrder: i,
      alt: g.alt || undefined,
      title: g.title || undefined,
    })),
  }
}

export function publicProductToDetailBlock(
  product: PublicProductDetail,
  blockId: string,
  sortOrder = 0,
): ProductDetailBlock {
  const pdp = createDefaultProductDetailBlock(blockId, sortOrder)
  pdp.title = product.name
  pdp.description = product.shortDescription
  pdp.settings.slug = product.slug
  pdp.settings.breadcrumbs = ['Ana Sayfa', 'Yazılımlar', product.name]
  pdp.settings.productType = product.productType
  pdp.settings.price = product.price
  pdp.settings.compareAtPrice = product.compareAtPrice ?? null
  pdp.settings.currency = product.currency
  pdp.settings.licenseMonths = product.licenseMonths ?? 12
  pdp.settings.showYearSelector = product.productType === 'SAAS'
  pdp.settings.showAddToCart = canPurchaseProduct(product)
  pdp.settings.showPrice = true
  pdp.settings.purchaseEnabled = product.purchaseEnabled
  pdp.settings.version = product.version?.trim() || '1.0.0'
  pdp.settings.longDescriptionHtml = product.description
  pdp.settings.featureBullets = product.featureBullets
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((text, i) => ({ id: `${product.slug}-feat-${i}`, text }))
  pdp.settings.systemRequirements = ''
  pdp.settings.deliveryInfo = ''
  pdp.settings.licenseInfo = ''
  pdp.settings.supportNote = ''
  pdp.settings.faqItems = []
  const galleryItems: ProductDetailBlock['settings']['gallery'] = []
  if (product.coverImage?.trim()) {
    galleryItems.push({ id: `${product.slug}-cover`, url: product.coverImage.trim() })
  }
  for (const g of product.galleryImages) {
    const url = g.url?.trim()
    if (!url) continue
    if (galleryItems.some((item) => item.url === url)) continue
    galleryItems.push({
      id: g.id,
      url,
      alt: g.alt,
      title: g.title,
    })
  }
  pdp.settings.gallery = galleryItems
  return pdp
}

/**
 * Builder blokundaki CMS override'ları API ürününe uygular.
 * Satın alma, indirme dosyaları ve fiyat davranışı her zaman API kaynağından gelir.
 */
export function mergeProductDetailForRender(
  api: PublicProductDetail,
  block: ProductDetailBlock,
): PublicProductDetail {
  const title = renderIfText(block.title)
  const shortDesc = renderIfText(block.description)
  const longHtml = renderIfText(block.settings.longDescriptionHtml)
  const overrideFeatures = block.settings.featureBullets
    .map((f) => f.text.trim())
    .filter(Boolean)
  const galleryOverride = galleryOverrideFromBlock(block)

  return {
    ...api,
    name: title ?? api.name,
    shortDescription: shortDesc ?? api.shortDescription,
    description: longHtml ?? api.description,
    featureBullets:
      overrideFeatures.length > 0 ? overrideFeatures.join('\n') : api.featureBullets,
    ...(galleryOverride ?? {}),
  }
}
