import { describe, expect, it } from 'vitest'
import { normalizePublicDetail } from '@/types/product'
import {
  formatKoopPlusPriceLabel,
  isKoopPlusOrderSuccess,
  KOOPPLUS_ORDER_SUCCESS_MESSAGE,
  mapKoopPlusCatalogOffer,
  resolveKoopPlusBuyAction,
  resolveKoopPlusWindowsBuyAction,
} from '@/lib/koopplusCatalog'
import { KOOPPLUS_PRICE_AMOUNT } from '@/data/koopplusProduct'

const KOOPPLUS_API_FIXTURE = {
  id: '075ce900-d6d9-4076-8bba-37478c49fd60',
  name: 'KoopPlus',
  slug: 'koopplus',
  productType: 'SAAS',
  shortDescription: '',
  description: '',
  price: 3000,
  compareAtPrice: null,
  currency: 'TRY',
  isFeatured: false,
  sortOrder: 0,
  version: null,
  purchaseEnabled: false,
  licenseMonths: 12,
  coverImage: '/images/products/koopplus-icon.optavif-w512.webp',
  category: null,
  seoTitle: null,
  seoDescription: null,
  galleryImages: [],
  featureBullets: '',
  licenseRequired: true,
  licenseDays: 365,
  licenseMaxDevices: 1,
  hasDownload: false,
}

describe('KoopPlus catalog from Product API (SaaS)', () => {
  it('maps slug=koopplus price from a public product fixture', () => {
    const product = normalizePublicDetail(KOOPPLUS_API_FIXTURE)
    expect(product?.slug).toBe('koopplus')
    expect(product?.price).toBe(3000)
    expect(product?.currency).toBe('TRY')
    const offer = mapKoopPlusCatalogOffer(product)
    expect(offer.priceAmount).toBe(3000)
    expect(offer.priceLabel).toBe('3.000 ₺')
    expect(offer.packageLabel).toBe('KoopPlus Yıllık')
    expect(formatKoopPlusPriceLabel(3000)).toBe('3.000 ₺')
    // "KDV dahil" amount içinde değil, arayüzde ayrıca gösterilir.
    expect(offer.priceLabel).not.toContain('KDV')
  })

  it('reads licenseDays but exposes no device limit wording for SaaS', () => {
    const product = normalizePublicDetail(KOOPPLUS_API_FIXTURE)
    const offer = mapKoopPlusCatalogOffer(product)
    expect(offer.licenseDays).toBe(365)
    expect(offer.licenseDaysLabel).toBe('365 gün')
    expect(offer.licenseMaxDevices).toBeNull()
    expect(offer.devicesLabel).toBeNull()
  })

  it('does not hardcode the catalog price in website config', () => {
    expect(KOOPPLUS_PRICE_AMOUNT).toBeNull()
    const empty = mapKoopPlusCatalogOffer(null)
    expect(empty.priceAmount).toBeNull()
    expect(empty.priceLabel).toBeNull()
  })

  it('does not expose any installer / download URL on the offer mapping', () => {
    const product = normalizePublicDetail({ ...KOOPPLUS_API_FIXTURE, purchaseEnabled: true })
    expect(product && 'downloadUrl' in product).toBe(false)
    const json = JSON.stringify(mapKoopPlusCatalogOffer(product))
    expect(json).not.toContain('.exe')
    expect(json).not.toContain('r2.dev')
  })

  it('blocks checkout when purchaseEnabled=false', () => {
    const product = normalizePublicDetail(KOOPPLUS_API_FIXTURE)
    expect(resolveKoopPlusBuyAction(product)).toEqual({
      type: 'disabled',
      reason: 'purchase_disabled',
    })
  })

  it('prepares generic addToCart(productId) when purchaseEnabled=true', () => {
    const product = normalizePublicDetail({ ...KOOPPLUS_API_FIXTURE, purchaseEnabled: true })
    expect(resolveKoopPlusBuyAction(product)).toEqual({
      type: 'addToCart',
      productId: '075ce900-d6d9-4076-8bba-37478c49fd60',
      nextPath: '/sepet',
    })
  })

  it('keeps resolveKoopPlusWindowsBuyAction as a compatibility alias', () => {
    expect(resolveKoopPlusWindowsBuyAction).toBe(resolveKoopPlusBuyAction)
  })

  it('detects KoopPlus orders on the payment success page', () => {
    expect(isKoopPlusOrderSuccess({ lines: [{ productName: 'KoopPlus Yıllık', quantity: 1, lineTotal: 1 }] })).toBe(true)
    expect(isKoopPlusOrderSuccess({ productName: 'KoopPlus', lines: [] })).toBe(true)
    expect(isKoopPlusOrderSuccess({ lines: [{ productName: 'Bilirkişi Hesap', quantity: 1, lineTotal: 1 }] })).toBe(false)
    expect(isKoopPlusOrderSuccess(null)).toBe(false)
    expect(KOOPPLUS_ORDER_SUCCESS_MESSAGE).toBe(
      'Ödemeniz alındı. KoopPlus giriş bilgileriniz ve lisans anahtarınız e-postanıza gönderildi.',
    )
  })
})
