import { describe, expect, it } from 'vitest'
import type { AdminProductInput } from '@/types/product'
import { buildAdminProductSavePayload } from '@/lib/buildAdminProductSavePayload'

function form(overrides: Partial<AdminProductInput> = {}): AdminProductInput {
  return {
    name: 'KoopPlus',
    slug: 'koopplus',
    productType: 'DOWNLOAD',
    shortDescription: '',
    description: '',
    price: 3000,
    compareAtPrice: null,
    currency: 'TRY',
    isActive: true,
    purchaseEnabled: false,
    licenseMonths: 12,
    licenseRequired: true,
    licenseAppCode: 'KOOPPLUS_DESKTOP',
    licenseDays: 365,
    licenseMaxDevices: 1,
    featureBullets: '',
    isFeatured: false,
    sortOrder: 0,
    version: '',
    categoryId: null,
    seoTitle: '',
    seoDescription: '',
    coverImageMediaId: null,
    downloadMediaId: null,
    coverImage: '/images/products/koopplus-icon.optavif-w512.webp',
    downloadUrl: '',
    ...overrides,
  }
}

describe('buildAdminProductSavePayload cover', () => {
  it('URL-only kapakta mediaId null ve coverImage URL gönderir', () => {
    const payload = buildAdminProductSavePayload({
      form: form(),
      presetId: 'DOWNLOADABLE',
      useCoverUrl: true,
      galleryMediaIds: [],
      isNew: false,
      existingDownloadFiles: null,
    })
    expect(payload.coverImageMediaId).toBeNull()
    expect(payload.coverImage).toBe('/images/products/koopplus-icon.optavif-w512.webp')
  })

  it('media kapağında mediaId gönderir, coverImage göndermez', () => {
    const payload = buildAdminProductSavePayload({
      form: form({ coverImageMediaId: 'media-1', coverImage: '' }),
      presetId: 'DOWNLOADABLE',
      useCoverUrl: false,
      galleryMediaIds: [],
      isNew: false,
      existingDownloadFiles: null,
    })
    expect(payload.coverImageMediaId).toBe('media-1')
    expect(payload.coverImage).toBeUndefined()
  })
})
