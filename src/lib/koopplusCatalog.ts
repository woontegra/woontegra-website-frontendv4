import type { PublicProductDetail } from '@/types/product'
import { canPurchaseProduct } from '@/utils/productPurchase'
import { KOOPPLUS_PRICE_LABEL, KOOPPLUS_SLUG } from '@/data/koopplusProduct'

export const KOOPPLUS_CART_PATH = '/sepet'

export type KoopPlusCatalogOffer = {
  priceAmount: number | null
  priceLabel: string | null
  packageLabel: string
  licenseDays: number | null
  licenseDaysLabel: string | null
  licenseMaxDevices: number | null
  devicesLabel: string | null
  purchaseEnabled: boolean
  productId: string | null
}

export type KoopPlusWindowsBuyAction =
  | { type: 'disabled'; reason: 'missing_product' | 'purchase_disabled' }
  | { type: 'addToCart'; productId: string; nextPath: typeof KOOPPLUS_CART_PATH }

export function formatKoopPlusPriceLabel(amount: number | null | undefined): string | null {
  if (amount == null || !Number.isFinite(amount) || amount <= 0) return null
  const formatted = new Intl.NumberFormat('tr-TR', {
    maximumFractionDigits: 0,
  }).format(amount)
  return `${formatted} TL`
}

export function mapKoopPlusCatalogOffer(product: PublicProductDetail | null | undefined): KoopPlusCatalogOffer {
  if (!product || product.slug !== KOOPPLUS_SLUG) {
    return {
      priceAmount: null,
      priceLabel: null,
      packageLabel: KOOPPLUS_PRICE_LABEL,
      licenseDays: null,
      licenseDaysLabel: null,
      licenseMaxDevices: null,
      devicesLabel: null,
      purchaseEnabled: false,
      productId: null,
    }
  }

  const priceAmount = Number.isFinite(product.price) && product.price > 0 ? product.price : null
  const licenseDays =
    product.licenseRequired && typeof product.licenseDays === 'number' && product.licenseDays > 0
      ? product.licenseDays
      : null
  const licenseMaxDevices =
    product.licenseRequired && typeof product.licenseMaxDevices === 'number' && product.licenseMaxDevices > 0
      ? product.licenseMaxDevices
      : null

  return {
    priceAmount,
    priceLabel: formatKoopPlusPriceLabel(priceAmount),
    packageLabel: KOOPPLUS_PRICE_LABEL,
    licenseDays,
    licenseDaysLabel: licenseDays != null ? `${licenseDays} gün` : null,
    licenseMaxDevices,
    devicesLabel:
      licenseMaxDevices != null
        ? licenseMaxDevices === 1
          ? '1 bilgisayar'
          : `${licenseMaxDevices} bilgisayar`
        : null,
    purchaseEnabled: product.purchaseEnabled === true,
    productId: product.id,
  }
}

export function resolveKoopPlusWindowsBuyAction(
  product: PublicProductDetail | null | undefined,
): KoopPlusWindowsBuyAction {
  if (!product || product.slug !== KOOPPLUS_SLUG || !product.id) {
    return { type: 'disabled', reason: 'missing_product' }
  }
  if (!canPurchaseProduct(product)) {
    return { type: 'disabled', reason: 'purchase_disabled' }
  }
  return { type: 'addToCart', productId: product.id, nextPath: KOOPPLUS_CART_PATH }
}
