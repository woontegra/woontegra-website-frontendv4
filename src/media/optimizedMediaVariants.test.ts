import { describe, expect, it } from 'vitest'
import {
  buildOptimizedSrcSet,
  buildOptimizedVariantUrl,
  buildResponsivePictureModel,
  isOptimizedMediaUrl,
  listOptimizedWidths,
  parseOptimizedMediaUrl,
  pickOptimizedPreloadUrl,
} from './optimizedMediaVariants'
import { buildHeroPreloadBundle } from './optimizeMediaUrl'

const LEGACY_BLOB =
  'https://fm1lntc3pwasdljl.public.blob.vercel-storage.com/website-media/hero/woontegra-slider-1-mobil-jpg-1787414087442-13a511870b.jpeg'

const WEBP_ONLY =
  'https://fm1lntc3pwasdljl.public.blob.vercel-storage.com/website-media/hero/home-banner-123.opt-w1920.jpg'

const WITH_AVIF =
  'https://fm1lntc3pwasdljl.public.blob.vercel-storage.com/website-media/hero/home-banner-123.optavif-w1920.jpg'

describe('optimizedMediaVariants', () => {
  it('does not invent variants for legacy CMS urls', () => {
    expect(parseOptimizedMediaUrl(LEGACY_BLOB)).toBeNull()
    expect(isOptimizedMediaUrl(LEGACY_BLOB)).toBe(false)
    expect(buildOptimizedVariantUrl(LEGACY_BLOB, 960, 'webp')).toBeNull()
    expect(buildOptimizedSrcSet(LEGACY_BLOB, 'webp')).toBeNull()
    expect(buildResponsivePictureModel(LEGACY_BLOB)).toBeNull()
    expect(pickOptimizedPreloadUrl(LEGACY_BLOB, 768)).toBe(LEGACY_BLOB)
  })

  it('emits AVIF sources only when the URL marker guarantees AVIF', () => {
    const withoutAvif = buildResponsivePictureModel(WEBP_ONLY)
    expect(withoutAvif?.imgSrc).toBe(WEBP_ONLY)
    expect(withoutAvif?.sources.some((source) => source.type === 'image/avif')).toBe(false)
    expect(withoutAvif?.sources.some((source) => source.type === 'image/webp')).toBe(true)
    expect(buildOptimizedSrcSet(WEBP_ONLY, 'avif')).toBeNull()
    expect(buildOptimizedVariantUrl(WEBP_ONLY, 960, 'avif')).toBeNull()

    const withAvif = buildResponsivePictureModel(WITH_AVIF)
    expect(withAvif?.sources.some((source) => source.type === 'image/avif')).toBe(true)
    expect(withAvif?.sources[0]?.srcSet).toContain('optavif-w480.avif')
    expect(withAvif?.sources[0]?.srcSet).toContain('optavif-w1920.avif')
    expect(withAvif?.sources.find((source) => source.type === 'image/webp')?.srcSet).toContain(
      'optavif-w960.webp',
    )
  })

  it('builds webp srcset from guaranteed widths only', () => {
    expect(parseOptimizedMediaUrl(WEBP_ONLY)?.hasWebp).toBe(true)
    expect(buildOptimizedVariantUrl(WEBP_ONLY, 960, 'webp')).toContain('home-banner-123.opt-w960.webp')
    expect(buildOptimizedVariantUrl(WEBP_ONLY, 2560, 'webp')).toBeNull()
    expect(buildOptimizedSrcSet(WEBP_ONLY, 'webp')).toContain('opt-w480.webp')
    expect(buildOptimizedSrcSet(WEBP_ONLY, 'webp')).toContain('opt-w1920.webp')
  })

  it('recognizes backfilled static canonical URLs as responsive', () => {
    const backfilled = '/images/web-tasarim-hero.opt-w1536.jpg'
    expect(isOptimizedMediaUrl(backfilled)).toBe(true)
    expect(parseOptimizedMediaUrl(backfilled)?.hasWebp).toBe(true)
    expect(buildOptimizedSrcSet(backfilled, 'webp')).toContain('web-tasarim-hero.opt-w480.webp')
    expect(buildOptimizedSrcSet(backfilled, 'webp')).toContain('web-tasarim-hero.opt-w1536.webp')
    expect(buildOptimizedSrcSet(backfilled, 'webp')).not.toContain('opt-w1920')
    expect(buildResponsivePictureModel(backfilled)?.imgSrc).toBe(backfilled)
  })

  it('does not upscale srcset widths past the canonical max', () => {
    const small = 'https://cdn.example.com/website-media/blog/cover-1.opt-w800.jpg'
    expect(listOptimizedWidths(800)).toEqual([480, 800])
    expect(buildOptimizedSrcSet(small, 'webp')).toBe(
      'https://cdn.example.com/website-media/blog/cover-1.opt-w480.webp 480w, https://cdn.example.com/website-media/blog/cover-1.opt-w800.webp 800w',
    )
    expect(buildOptimizedSrcSet(small, 'webp')).not.toContain('opt-w960')
    expect(buildOptimizedSrcSet(small, 'avif')).toBeNull()
  })

  it('preloads optimized AVIF for optavif heroes and keeps legacy hrefs', () => {
    const legacy = buildHeroPreloadBundle({
      desktop: LEGACY_BLOB,
      tablet: LEGACY_BLOB,
      mobile: LEGACY_BLOB,
    })
    expect(legacy?.desktopHref).toBe(LEGACY_BLOB)
    expect(legacy?.href).not.toContain('/_vercel/image')

    const next = buildHeroPreloadBundle({
      desktop: WITH_AVIF,
      tablet: WITH_AVIF,
      mobile: WITH_AVIF,
    })
    expect(next?.desktopHref).toContain('home-banner-123.optavif-w1920.avif')
    expect(next?.mobileHref).toContain('home-banner-123.optavif-w960.avif')
    expect(next?.desktopType).toBe('image/avif')
    expect(next?.mobileType).toBe('image/avif')
    expect(next?.desktopImageSrcSet).toContain('optavif-w480.avif')
    expect(next?.desktopImageSrcSet).not.toContain('.webp')

    const webpOnly = buildHeroPreloadBundle({
      desktop: WEBP_ONLY,
      tablet: WEBP_ONLY,
      mobile: WEBP_ONLY,
    })
    expect(webpOnly?.desktopType).toBe('image/webp')
    expect(webpOnly?.desktopHref).toContain('.opt-w1920.webp')
    expect(webpOnly?.desktopImageSrcSet).not.toContain('.avif')
  })
})
