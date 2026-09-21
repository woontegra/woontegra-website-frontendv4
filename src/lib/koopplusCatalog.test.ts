import { describe, expect, it } from 'vitest'
import { normalizePublicDetail } from '@/types/product'
import {
  formatKoopPlusPriceLabel,
  mapKoopPlusCatalogOffer,
  resolveKoopPlusWindowsBuyAction,
} from '@/lib/koopplusCatalog'
import { KOOPPLUS_PRICE_AMOUNT, KOOPPLUS_WINDOWS_CHECKOUT_PATH } from '@/data/koopplusProduct'

const KOOPPLUS_API_FIXTURE = {
  id: '075ce900-d6d9-4076-8bba-37478c49fd60',
  name: 'KoopPlus',
  slug: 'koopplus',
  productType: 'DOWNLOAD',
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

describe('KoopPlus catalog from Product API', () => {
  it('maps slug=koopplus 3000 TRY from a public product fixture', () => {
    const product = normalizePublicDetail(KOOPPLUS_API_FIXTURE)
    expect(product?.slug).toBe('koopplus')
    expect(product?.price).toBe(3000)
    expect(product?.currency).toBe('TRY')
    const offer = mapKoopPlusCatalogOffer(product)
    expect(offer.priceAmount).toBe(3000)
    expect(offer.priceLabel).toBe('3.000 TL')
    expect(formatKoopPlusPriceLabel(3000)).toBe('3.000 TL')
  })

  it('reads licenseDays and licenseMaxDevices from the product fixture', () => {
    const product = normalizePublicDetail(KOOPPLUS_API_FIXTURE)
    const offer = mapKoopPlusCatalogOffer(product)
    expect(offer.licenseDays).toBe(365)
    expect(offer.licenseDaysLabel).toBe('365 gün')
    expect(offer.licenseMaxDevices).toBe(1)
    expect(offer.devicesLabel).toBe('1 bilgisayar')
  })

  it('does not hardcode the catalog price in website config', () => {
    expect(KOOPPLUS_PRICE_AMOUNT).toBeNull()
    expect(KOOPPLUS_WINDOWS_CHECKOUT_PATH).toBeNull()
  })

  it('does not expose an installer URL on the public product fixture mapping', () => {
    const product = normalizePublicDetail({ ...KOOPPLUS_API_FIXTURE, purchaseEnabled: true })
    expect(product && 'downloadUrl' in product).toBe(false)
    expect(JSON.stringify(mapKoopPlusCatalogOffer(product))).not.toContain('KoopPlus-Setup')
    expect(JSON.stringify(mapKoopPlusCatalogOffer(product))).not.toContain('r2.dev')
  })

  it('blocks Windows checkout when purchaseEnabled=false', () => {
    const product = normalizePublicDetail(KOOPPLUS_API_FIXTURE)
    expect(resolveKoopPlusWindowsBuyAction(product)).toEqual({
      type: 'disabled',
      reason: 'purchase_disabled',
    })
  })

  it('prepares generic addToCart(productId) when purchaseEnabled=true', () => {
    const product = normalizePublicDetail({ ...KOOPPLUS_API_FIXTURE, purchaseEnabled: true })
    expect(resolveKoopPlusWindowsBuyAction(product)).toEqual({
      type: 'addToCart',
      productId: '075ce900-d6d9-4076-8bba-37478c49fd60',
      nextPath: '/sepet',
    })
  })
})
