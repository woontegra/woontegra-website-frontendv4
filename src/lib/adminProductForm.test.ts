import { describe, expect, it } from 'vitest'
import type { AdminProductInput } from '@/types/product'
import {
  hasAdminCoverImage,
  isReadyForSale,
  PUBLISH_IMAGE_REQUIRED_MESSAGE,
  tabForValidationError,
  validateAdminProductForm,
} from '@/lib/adminProductForm'

function baseForm(overrides: Partial<AdminProductInput> = {}): AdminProductInput {
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
    purchaseEnabled: true,
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
    coverImage: '',
    downloadUrl: 'https://cdn.example.com/setup.exe',
    ...overrides,
  }
}

describe('admin product cover publish validation', () => {
  it('URL-only kapak yayın validasyonunu geçer', () => {
    const form = baseForm({ coverImage: '/images/products/koopplus-icon.optavif-w512.webp' })
    expect(hasAdminCoverImage(form)).toBe(true)
    expect(validateAdminProductForm(form, 'DOWNLOADABLE')).toBeNull()
    expect(isReadyForSale(form, 'DOWNLOADABLE')).toBe(true)
  })

  it('mediaId veya preview kapak sayılır', () => {
    expect(hasAdminCoverImage(baseForm({ coverImageMediaId: 'media-1' }))).toBe(true)
    expect(hasAdminCoverImage(baseForm(), 'https://cdn.example.com/cover.png')).toBe(true)
    expect(validateAdminProductForm(baseForm({ coverImageMediaId: 'media-1' }), 'DOWNLOADABLE')).toBeNull()
  })

  it('kapak yokken yayındaki ürünü engeller', () => {
    const form = baseForm()
    expect(hasAdminCoverImage(form)).toBe(false)
    expect(validateAdminProductForm(form, 'DOWNLOADABLE')).toBe(PUBLISH_IMAGE_REQUIRED_MESSAGE)
    expect(isReadyForSale(form, 'DOWNLOADABLE')).toBe(false)
    expect(tabForValidationError(PUBLISH_IMAGE_REQUIRED_MESSAGE)).toBe('media')
  })

  it('taslak üründe kapak zorunlu değildir', () => {
    const form = baseForm({ isActive: false })
    expect(validateAdminProductForm(form, 'DOWNLOADABLE')).toBeNull()
    expect(isReadyForSale(form, 'DOWNLOADABLE')).toBe(false)
  })

  it('media seçilince (preview) hata kalkar', () => {
    const form = baseForm()
    expect(validateAdminProductForm(form, 'DOWNLOADABLE', null)).toBe(PUBLISH_IMAGE_REQUIRED_MESSAGE)
    expect(validateAdminProductForm(form, 'DOWNLOADABLE', '/uploads/new-cover.png')).toBeNull()
    expect(isReadyForSale(form, 'DOWNLOADABLE', '/uploads/new-cover.png')).toBe(true)
  })
})
