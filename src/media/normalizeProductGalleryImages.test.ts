import { describe, expect, it } from 'vitest'
import {
  buildProductGalleryEntries,
  isUsableGalleryImageSrc,
  normalizeProductGalleryImages,
  pickPrimaryGalleryUrl,
} from '@/media/normalizeProductGalleryImages'

describe('normalizeProductGalleryImages', () => {
  it('reads galleryImages.imageUrl field', () => {
    const result = normalizeProductGalleryImages({
      galleryImages: [{ imageUrl: '/uploads/products/bilirkisi-1.jpg', alt: 'Ekran 1' }],
    })
    expect(result).toHaveLength(1)
    expect(result[0]?.url).toContain('/uploads/products/bilirkisi-1.jpg')
    expect(result[0]?.alt).toBe('Ekran 1')
  })

  it('reads gallery url/src fields', () => {
    const result = normalizeProductGalleryImages({
      gallery: [{ url: '/images/products/a.png' }, { src: '/images/products/b.png' }],
    })
    expect(result.map((item) => item.url)).toEqual([
      '/images/products/a.png',
      '/images/products/b.png',
    ])
  })

  it('converts single imageUrl into gallery', () => {
    const result = normalizeProductGalleryImages({ imageUrl: '/uploads/products/cover.jpg' })
    expect(result).toHaveLength(1)
    expect(result[0]?.url).toContain('/uploads/products/cover.jpg')
  })

  it('reads nested media.url objects', () => {
    const result = normalizeProductGalleryImages({
      galleryImages: [{ media: { url: 'https://cdn.example.com/product.webp' } }],
    })
    expect(result[0]?.url).toBe('https://cdn.example.com/product.webp')
  })

  it('dedupes cover and gallery entries', () => {
    const entries = buildProductGalleryEntries({
      coverImage: '/images/products/mk-desktop.png',
      galleryImages: [
        { url: '/images/products/mk-desktop.png' },
        { url: '/images/products/mk-desktop-2.png' },
      ],
      fallbackAlt: 'MK Desktop',
    })
    expect(entries).toHaveLength(2)
    expect(entries[0]?.url).toContain('/images/products/mk-desktop.png')
  })

  it('uses the same primary url for main and thumbnail sources', () => {
    const entries = buildProductGalleryEntries({
      coverImage: null,
      galleryImages: [{ imageUrl: '/uploads/products/screen-1.jpg' }, { url: '/uploads/products/screen-2.jpg' }],
      fallbackAlt: 'Ürün',
    })
    const mainUrl = pickPrimaryGalleryUrl(entries)
    const thumbUrls = entries.map((entry) => entry.url)
    expect(mainUrl).toBeTruthy()
    expect(thumbUrls).toContain(mainUrl)
  })

  it('never treats invalid values as usable src', () => {
    expect(isUsableGalleryImageSrc(undefined)).toBe(false)
    expect(isUsableGalleryImageSrc(null)).toBe(false)
    expect(isUsableGalleryImageSrc('')).toBe(false)
    expect(isUsableGalleryImageSrc('[object Object]')).toBe(false)
    expect(isUsableGalleryImageSrc('/uploads/products/valid.jpg')).toBe(true)
  })

  it('falls back to first valid thumbnail when cover is empty', () => {
    const entries = buildProductGalleryEntries({
      coverImage: '',
      galleryImages: [{ imageUrl: '/uploads/products/first.jpg' }],
      fallbackAlt: 'Test',
    })
    expect(pickPrimaryGalleryUrl(entries)).toContain('/uploads/products/first.jpg')
  })
})

describe('product gallery regression fixtures', () => {
  const fixtures = [
    {
      slug: 'bilirkisi-hesap',
      coverImage: null,
      galleryImages: [
        { id: '1', imageUrl: '/uploads/products/bilirkisi-screen-1.jpg', sortOrder: 0 },
        { id: '2', url: '/uploads/products/bilirkisi-screen-2.jpg', sortOrder: 1 },
      ],
      minImages: 2,
    },
    {
      slug: 'muvekkil-kasa-defteri-yazilimi',
      coverImage: '/images/products/mk-desktop.png',
      galleryImages: [],
      minImages: 1,
    },
    {
      slug: 'muvekkil-kasa-defteri-web-tabanli',
      coverImage: '/images/products/mk-web.png',
      galleryImages: [{ url: '/images/products/mk-web-2.png', sortOrder: 1 }],
      minImages: 2,
    },
    {
      slug: 'sifre-kasasi',
      coverImage: '/images/products/sifre-kasasi.png',
      galleryImages: [{ media: { url: '/uploads/products/sifre-kasasi-1.jpg' } }],
      minImages: 2,
    },
  ] as const

  for (const fixture of fixtures) {
    it(`keeps primary gallery url for ${fixture.slug}`, () => {
      const entries = buildProductGalleryEntries({
        coverImage: fixture.coverImage,
        galleryImages: fixture.galleryImages,
        fallbackAlt: fixture.slug,
      })
      const primary = pickPrimaryGalleryUrl(entries)
      expect(entries.length).toBeGreaterThanOrEqual(fixture.minImages)
      expect(primary).toBeTruthy()
      expect(entries.some((entry) => entry.url === primary)).toBe(true)
    })
  }
})
