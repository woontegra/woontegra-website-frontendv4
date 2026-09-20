import { normalizeProductGalleryImages, type NormalizedGalleryImage } from '@/media/normalizeProductGalleryImages'
import { KOOPPLUS_NAME, KOOPPLUS_SEO_TOPIC } from '@/data/koopplusProduct'

export function wrapGalleryIndex(index: number, length: number): number {
  if (length <= 0) return 0
  return (index + length) % length
}

export function productScreenshotAlt(input: {
  productName: string
  topic?: string
  index: number
  total: number
  customAlt?: string | null
}): string {
  const custom = input.customAlt?.trim()
  if (custom) return custom
  const name = input.productName.trim() || 'Ürün'
  const topic = input.topic?.trim()
  const base = topic ? `${name} ${topic} ekran görüntüsü` : `${name} ekran görüntüsü`
  return input.total > 1 ? `${base} ${input.index + 1}` : base
}

/** Cover image hariç — yalnız Product galleryImages. */
export function screenshotEntriesFromProductGallery(
  galleryImages: unknown,
  options: { productName: string; topic?: string },
): NormalizedGalleryImage[] {
  const list = Array.isArray(galleryImages) ? galleryImages : []
  const normalized = normalizeProductGalleryImages(list)
  return normalized.map((entry, index) => ({
    url: entry.url,
    alt: productScreenshotAlt({
      productName: options.productName,
      topic: options.topic,
      index,
      total: normalized.length,
      customAlt: entry.alt,
    }),
    title: entry.title,
  }))
}

export function koopPlusScreenshotEntries(galleryImages: unknown): NormalizedGalleryImage[] {
  const list = Array.isArray(galleryImages) ? galleryImages : []
  const normalized = normalizeProductGalleryImages(list)
  return normalized.map((entry, index) => ({
    url: entry.url,
    alt: productScreenshotAlt({
      productName: KOOPPLUS_NAME,
      topic: KOOPPLUS_SEO_TOPIC,
      index,
      total: normalized.length,
    }),
    title: entry.title,
  }))
}

export const GALLERY_SWIPE_THRESHOLD_PX = 40

export function galleryIndexFromSwipe(deltaX: number, currentIndex: number, length: number): number | null {
  if (length <= 1 || Math.abs(deltaX) < GALLERY_SWIPE_THRESHOLD_PX) return null
  return wrapGalleryIndex(currentIndex + (deltaX < 0 ? 1 : -1), length)
}
