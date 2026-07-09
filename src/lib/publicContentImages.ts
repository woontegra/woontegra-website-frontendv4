import { resolvePublicImage } from '@/media/resolvePublicImage'

export function pickBlogCoverUrl(post: unknown): string {
  return resolvePublicImage(post, { debugLabel: 'blog-cover' })
}

export function pickProductCoverUrl(product: unknown): string {
  return resolvePublicImage(product, { debugLabel: 'product-cover' })
}

export function pickBrandImageUrl(brand: unknown): string {
  return resolvePublicImage(brand, { debugLabel: 'brand-image' })
}

export function pickPageHeroImage(content: unknown): string {
  return resolvePublicImage(content, { debugLabel: 'page-hero' })
}
