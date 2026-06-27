import { resolveMediaUrl } from '@/media/resolveMediaUrl'

function extractMediaUrl(media: unknown): string {
  if (!media) return ''
  if (typeof media === 'string') return media.trim()
  if (typeof media === 'object' && media !== null) {
    const row = media as Record<string, unknown>
    const url = row.url ?? row.src ?? row.path
    if (typeof url === 'string') return url.trim()
  }
  return ''
}

export function pickBlogCoverUrl(post: {
  featuredImage?: string | null
  coverImageUrl?: string | null
  coverMedia?: { url?: string | null } | null
}): string {
  const raw =
    post.featuredImage?.trim() ||
    post.coverMedia?.url?.trim() ||
    post.coverImageUrl?.trim() ||
    ''
  return raw ? resolveMediaUrl(raw) : ''
}

export function pickProductCoverUrl(product: {
  coverImage?: string | null
  coverUrl?: string | null
  image?: string | null
  coverMedia?: { url?: string | null } | null
}): string {
  const raw =
    product.coverMedia?.url?.trim() ||
    product.coverImage?.trim() ||
    product.coverUrl?.trim() ||
    product.image?.trim() ||
    ''
  return raw ? resolveMediaUrl(raw) : ''
}

export function pickBrandImageUrl(brand: { image?: string | null }): string {
  const raw = brand.image?.trim() ?? ''
  return raw ? resolveMediaUrl(raw) : ''
}

export function pickPageHeroImage(content: {
  heroImage?: string | null
  hero?: { image?: string | null; media?: unknown } | null
  media?: unknown
}): string {
  const fromHeroImage = content.heroImage?.trim()
  if (fromHeroImage) return resolveMediaUrl(fromHeroImage)

  const fromHero = content.hero?.image?.trim()
  if (fromHero) return resolveMediaUrl(fromHero)

  const fromMedia = extractMediaUrl(content.hero?.media ?? content.media)
  return fromMedia ? resolveMediaUrl(fromMedia) : ''
}
