import {
  CANONICAL_SOFTWARE_NAV,
  getPromotionalSoftwareListItems,
  getPromotionalSoftwareMeta,
  isPromotionalSoftwareSlug,
} from '@/data/canonicalSoftwareProducts'
import type { PublicNavigationMenuItem } from '@/types/navigationMenu'
import type { PublicProductListItem } from '@/types/product'

export {
  BILIRKISI_HESAP_OFFICIAL_URL,
  BILIRKISI_HESAP_SLUG,
  getPromotionalSoftwareDetail,
  getPromotionalSoftwareMeta,
  isPromotionalSoftwareSlug,
  PROMOTIONAL_SOFTWARE_SLUGS,
} from '@/data/canonicalSoftwareProducts'

/** API ürün listesine tanıtım/harici satış ürünlerini ekler ve canonical sıraya göre düzenler. */
export function mergePublicSoftwareList(apiProducts: PublicProductListItem[]): PublicProductListItem[] {
  const promoItems = getPromotionalSoftwareListItems()
  const promoSlugs = new Set(promoItems.map((item) => item.slug))
  const apiWithoutPromo = apiProducts.filter((item) => !promoSlugs.has(item.slug))
  const sortedApi = [...apiWithoutPromo].sort((a, b) => a.sortOrder - b.sortOrder)

  const ordered: PublicProductListItem[] = []
  for (const navItem of CANONICAL_SOFTWARE_NAV) {
    const promo = promoItems.find((item) => item.slug === navItem.slug)
    if (promo) {
      ordered.push(promo)
      continue
    }
    const apiItem = sortedApi.find((item) => item.slug === navItem.slug)
    if (apiItem) ordered.push(apiItem)
  }

  for (const item of sortedApi) {
    if (!ordered.some((existing) => existing.slug === item.slug)) {
      ordered.push(item)
    }
  }

  return ordered
}

export function buildCanonicalSoftwareNavChildren(): PublicNavigationMenuItem[] {
  return CANONICAL_SOFTWARE_NAV.map((item) => ({
    id: `software-${item.slug}`,
    label: item.title,
    href: item.path,
    resolvedUrl: item.path,
    openInNewTab: false,
    sortOrder: item.order,
    children: [],
  }))
}

export function isExternalSalesProduct(product: Pick<PublicProductListItem, 'slug'>): boolean {
  return isPromotionalSoftwareSlug(product.slug)
}

export function getPublicProductTypeLabel(product: Pick<PublicProductListItem, 'slug' | 'productType'>): string {
  const meta = getPromotionalSoftwareMeta(product.slug)
  if (meta?.publicProductTypeLabel) return meta.publicProductTypeLabel
  if (product.productType === 'SAAS') return 'SaaS / Abonelik'
  if (product.productType === 'SERVICE') return 'Hizmet / Teklif'
  return 'Dijital İndirme'
}
