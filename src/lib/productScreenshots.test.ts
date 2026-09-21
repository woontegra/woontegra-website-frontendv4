import { describe, expect, it } from 'vitest'
import {
  galleryIndexFromSwipe,
  koopPlusScreenshotEntries,
  productScreenshotAlt,
  wrapGalleryIndex,
} from '@/lib/productScreenshots'
import { collectGalleryMediaIdsForSave, moveGalleryRow, PRODUCT_GALLERY_MAX_IMAGES } from '@/types/product'

describe('product screenshots', () => {
  it('builds numbered KoopPlus alts from galleryImages only', () => {
    const images = koopPlusScreenshotEntries([
      { url: '/uploads/products/koopplus-1.png', sortOrder: 0 },
      { url: '/uploads/products/koopplus-2.png', sortOrder: 1 },
    ])
    expect(images).toHaveLength(2)
    expect(images[0].url).toContain('koopplus-1')
    expect(images[0].alt).toBe('KoopPlus Kooperatif Yönetim Yazılımı ekran görüntüsü 1')
    expect(images[1].alt).toBe('KoopPlus Kooperatif Yönetim Yazılımı ekran görüntüsü 2')
  })

  it('does not invent screenshots from an empty gallery', () => {
    expect(koopPlusScreenshotEntries([])).toEqual([])
    expect(koopPlusScreenshotEntries(undefined)).toEqual([])
  })

  it('ignores cover-shaped objects unless they are gallery url rows', () => {
    expect(
      koopPlusScreenshotEntries({
        coverImage: '/images/products/koopplus-icon.optavif-w512.webp',
        galleryImages: [],
      }),
    ).toEqual([])
  })

  it('keeps a single-image alt unnumbered', () => {
    expect(
      productScreenshotAlt({
        productName: 'KoopPlus',
        topic: 'Kooperatif Yönetim Yazılımı',
        index: 0,
        total: 1,
      }),
    ).toBe('KoopPlus Kooperatif Yönetim Yazılımı ekran görüntüsü')
  })

  it('wraps carousel indexes and maps swipe direction', () => {
    expect(wrapGalleryIndex(-1, 3)).toBe(2)
    expect(wrapGalleryIndex(3, 3)).toBe(0)
    expect(galleryIndexFromSwipe(-50, 0, 3)).toBe(1)
    expect(galleryIndexFromSwipe(50, 0, 3)).toBe(2)
    expect(galleryIndexFromSwipe(-10, 0, 3)).toBeNull()
  })
})

describe('admin product gallery save helpers', () => {
  it('caps unique media ids at 10 and reorders rows', () => {
    expect(PRODUCT_GALLERY_MAX_IMAGES).toBe(10)
    const rows = Array.from({ length: 12 }, (_, i) => ({ mediaId: `m${i}` }))
    expect(collectGalleryMediaIdsForSave(rows)).toEqual(
      Array.from({ length: 10 }, (_, i) => `m${i}`),
    )
    expect(moveGalleryRow(['a', 'b', 'c'], 2, -1)).toEqual(['a', 'c', 'b'])
    expect(moveGalleryRow(['a', 'b', 'c'], 0, -1)).toEqual(['a', 'b', 'c'])
  })
})
