import type { ProductBuilderSeed } from '@/builder/data/productBuilderSeeds'
import type { PublicProductDetail } from '@/types/product'

export function productSeedToPublicDetail(seed: ProductBuilderSeed): PublicProductDetail {
  return {
    id: `seed-${seed.slug}`,
    name: seed.name,
    slug: seed.slug,
    productType: seed.productType,
    shortDescription: seed.shortDescription,
    price: seed.price,
    compareAtPrice: seed.compareAtPrice ?? null,
    currency: seed.currency,
    isActive: true,
    isFeatured: false,
    sortOrder: 0,
    version: seed.version,
    purchaseEnabled: true,
    licenseMonths: seed.licenseMonths,
    coverImage: seed.coverImage,
    category: null,
    description: seed.description,
    seoTitle: seed.name,
    seoDescription: seed.shortDescription,
    galleryImages: seed.gallery.map((url, i) => ({
      id: `gal-${i}`,
      url,
      sortOrder: i,
    })),
    featureBullets: seed.featureBullets.join('\n'),
    licenseRequired: seed.productType !== 'DOWNLOAD' || seed.price > 0,
    licenseDays: null,
    licenseMaxDevices: null,
    hasDownload: seed.productType === 'DOWNLOAD',
  }
}

export function blogTemplateToPublicPost(input: {
  slug: string
  title: string
  excerpt: string
  bodyHtml: string
  coverImageUrl?: string
  category?: string
  publishedAt?: string
}): import('@/types/blog').PublicBlogPost {
  return {
    id: `template-${input.slug}`,
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    bodyHtml: input.bodyHtml,
    featuredImage: input.coverImageUrl ?? null,
    status: 'published',
    publishedAt: input.publishedAt ?? new Date().toISOString(),
    createdAt: input.publishedAt ?? new Date().toISOString(),
    updatedAt: input.publishedAt ?? new Date().toISOString(),
    category: input.category
      ? { id: 'cat-1', name: input.category, slug: input.category.toLowerCase().replace(/\s+/g, '-') }
      : null,
  }
}
