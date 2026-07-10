import { resolveMediaUrl } from '@/media/resolveMediaUrl'
import { extractPublicImageRaw } from '@/media/resolvePublicImage'

export type NormalizedGalleryImage = {
  url: string
  alt?: string
  title?: string
}

const INVALID_SRC = /\[object object\]|^undefined$|^null$/i

function readMetaString(value: unknown): string | undefined {
  if (value == null) return undefined
  const text = String(value).trim()
  return text || undefined
}

function resolveGalleryUrl(raw: unknown): string {
  const extracted = extractPublicImageRaw(raw)
  if (!extracted) return ''
  const resolved = resolveMediaUrl(extracted)
  if (!resolved || INVALID_SRC.test(resolved)) return ''
  return resolved
}

function readGalleryMeta(item: unknown): Pick<NormalizedGalleryImage, 'alt' | 'title'> {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return {}
  const row = item as Record<string, unknown>
  const alt = readMetaString(row.alt ?? row.altText ?? row.caption)
  const title = readMetaString(row.title ?? row.name ?? row.label)
  return { alt, title }
}

function pushUnique(
  out: NormalizedGalleryImage[],
  seen: Set<string>,
  raw: unknown,
  meta?: Pick<NormalizedGalleryImage, 'alt' | 'title'>,
) {
  const url = resolveGalleryUrl(raw)
  if (!url || seen.has(url)) return
  seen.add(url)
  out.push({ url, ...readGalleryMeta(raw), ...meta })
}

function collectFromArray(out: NormalizedGalleryImage[], seen: Set<string>, items: unknown[]) {
  for (const item of items) {
    if (item == null) continue
    if (typeof item === 'string') {
      pushUnique(out, seen, item)
      continue
    }
    pushUnique(out, seen, item)
  }
}

function readArrayField(row: Record<string, unknown>, keys: readonly string[]): unknown[] {
  for (const key of keys) {
    const value = row[key]
    if (Array.isArray(value)) return value
  }
  return []
}

/**
 * Ürün detay galerisi için tek merkezi normalizer.
 * Ana görsel ve thumbnail aynı çıktı dizisini kullanmalıdır.
 */
export function normalizeProductGalleryImages(input: unknown): NormalizedGalleryImage[] {
  const out: NormalizedGalleryImage[] = []
  const seen = new Set<string>()

  if (input == null) return out

  if (typeof input === 'string') {
    pushUnique(out, seen, input)
    return out
  }

  if (Array.isArray(input)) {
    collectFromArray(out, seen, input)
    return out
  }

  if (typeof input !== 'object') return out

  const row = input as Record<string, unknown>

  pushUnique(out, seen, row.coverImage)
  pushUnique(out, seen, row.coverImageUrl)
  pushUnique(out, seen, row.heroImage)
  pushUnique(out, seen, row.imageUrl)
  pushUnique(out, seen, row.image)
  pushUnique(out, seen, row.thumbnailUrl)
  pushUnique(out, seen, row.coverMedia)
  pushUnique(out, seen, row.media)

  const arrays = [
    ...readArrayField(row, ['galleryImages', 'gallery', 'images', 'mediaItems']),
  ]
  collectFromArray(out, seen, arrays)

  return out
}

export function buildProductGalleryEntries(options: {
  coverImage?: unknown
  galleryImages?: unknown
  fallbackAlt?: string
}): NormalizedGalleryImage[] {
  const fallbackAlt = options.fallbackAlt?.trim() || 'Ürün görseli'
  const normalized = normalizeProductGalleryImages({
    coverImage: options.coverImage,
    galleryImages: options.galleryImages,
  })

  return normalized.map((entry) => ({
    url: entry.url,
    alt: entry.alt?.trim() || entry.title?.trim() || fallbackAlt,
    title: entry.title,
  }))
}

export function pickPrimaryGalleryUrl(entries: NormalizedGalleryImage[]): string {
  return entries[0]?.url ?? ''
}

export function isUsableGalleryImageSrc(src: unknown): src is string {
  if (typeof src !== 'string') return false
  const trimmed = src.trim()
  if (!trimmed || INVALID_SRC.test(trimmed)) return false
  return Boolean(resolveGalleryUrl(trimmed))
}
