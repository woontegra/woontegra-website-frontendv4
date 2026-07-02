import type { ProductsShowcaseBlock } from '@/builder/types'
import type { PublicProductListItem } from '@/types/product'

/** Ürün Vitrini bloğu ayarlarına göre gerçek ürünleri seçer. */
export function pickShowcaseProducts(
  products: PublicProductListItem[],
  settings: ProductsShowcaseBlock['settings'],
): PublicProductListItem[] {
  const limit = Math.min(Math.max(settings.limit ?? 4, 1), 24)
  const active = products.filter((p) => p.isActive !== false)

  if (settings.source === 'manual') {
    const ids = settings.manualProductIds ?? []
    const byId = new Map(active.map((p) => [p.id, p]))
    return ids
      .map((id) => byId.get(id))
      .filter((p): p is PublicProductListItem => Boolean(p))
      .slice(0, limit)
  }

  let filtered = active

  if (settings.source === 'category' && settings.categoryId?.trim()) {
    const key = settings.categoryId.trim().toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.category?.id === settings.categoryId ||
        p.category?.slug?.toLowerCase() === key ||
        p.category?.name?.toLowerCase() === key,
    )
  } else if (settings.source === 'featured') {
    const featured = filtered.filter((p) => p.isFeatured)
    filtered = featured.length > 0 ? featured : filtered
  } else if (settings.source === 'campaign') {
    filtered = filtered.filter((p) => Boolean(p.campaign))
  }
  // 'recent' ve 'bestseller' → doğal sıralama (sortOrder) korunur.

  const sorted = [...filtered].sort((a, b) => a.sortOrder - b.sortOrder)
  return sorted.slice(0, limit)
}
