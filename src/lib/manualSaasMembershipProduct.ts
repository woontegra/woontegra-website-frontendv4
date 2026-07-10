import { isPromotionalSoftwareSlug } from '@/data/canonicalSoftwareProducts'
import { isMuvekkilKasaSaasProduct } from '@/lib/muvekkilKasaSaasProduct'
import type { AdminProduct } from '@/types/product'

function isPublicFreeDownloadProduct(
  product: Pick<AdminProduct, 'productType' | 'purchaseEnabled' | 'price'>,
): boolean {
  return product.productType === 'DOWNLOAD' && !product.purchaseEnabled && product.price <= 0
}

/** Website DB üzerinde manuel CustomerSaasMembership oluşturulabilecek ürünler. */
export function isManualSaasMembershipProduct(product: AdminProduct): boolean {
  if (!product.isActive) return false

  const slug = product.slug.trim().toLowerCase()
  if (slug && isPromotionalSoftwareSlug(slug)) return false

  if (isPublicFreeDownloadProduct(product)) return false
  if (product.productType === 'DOWNLOAD') return false

  if (isMuvekkilKasaSaasProduct(product)) return true

  return product.productType === 'SAAS' && !product.licenseRequired
}
