import type { BhProduct } from '@/services/bilirkisiHesapService'

export const BH_PUBLIC_PRODUCT_PRICE_CACHE_KEY = 'bh.publicProductPrice.v1'

export function isDisplayableBhProduct(value: unknown): value is BhProduct {
  if (!value || typeof value !== 'object') return false
  const row = value as Partial<BhProduct>
  return typeof row.price === 'number' && Number.isFinite(row.price) && row.price >= 0
}

export function parseCachedBhProduct(raw: string | null): BhProduct | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    return isDisplayableBhProduct(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function readCachedBhProduct(): BhProduct | null {
  if (typeof sessionStorage === 'undefined') return null
  try {
    return parseCachedBhProduct(sessionStorage.getItem(BH_PUBLIC_PRODUCT_PRICE_CACHE_KEY))
  } catch {
    return null
  }
}

export function writeCachedBhProduct(product: BhProduct): void {
  if (!isDisplayableBhProduct(product) || typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(BH_PUBLIC_PRODUCT_PRICE_CACHE_KEY, JSON.stringify(product))
  } catch {
    /* Depolama kapalıysa fiyat isteği yine de ekranda kalır. */
  }
}

/** 429 dışında eski fiyat gösterilmez. 429'da yalnız son başarılı API kaydı kalır. */
export function productToKeepOnPriceError(
  status: number | undefined,
  cached: BhProduct | null,
): BhProduct | null {
  if (status !== 429 || !cached) return null
  return cached
}
