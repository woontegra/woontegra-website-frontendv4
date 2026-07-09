import { SITE_ORIGIN } from '@/lib/siteSeo'
import { resolveMediaUrl } from '@/media/resolveMediaUrl'
import type { HeroImageSources } from '@/builder/render/heroResponsiveImage'

export const HERO_IMAGE_WIDTHS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1920,
} as const

const DEFAULT_QUALITY = 85

export type OptimizeMediaOptions = {
  width?: number
  quality?: number
}

function toAbsoluteMediaUrl(resolved: string): string {
  if (/^https?:\/\//i.test(resolved)) return resolved
  const origin =
    import.meta.env.VITE_SITE_URL?.trim()?.replace(/\/+$/, '') ||
    (typeof window !== 'undefined' ? window.location.origin : SITE_ORIGIN)
  return `${origin}${resolved.startsWith('/') ? resolved : `/${resolved}`}`
}

export function shouldOptimizeMediaUrl(url: string): boolean {
  if (!url) return false
  if (url.startsWith('data:')) return false
  const lower = url.toLowerCase()
  if (lower.endsWith('.svg') || lower.endsWith('.gif')) return false
  return true
}

/**
 * Vercel Image Optimization — production'da mobil/desktop için boyut sınırlı URL üretir.
 * Dev ortamında orijinal URL döner.
 */
export function buildOptimizedMediaUrl(
  url: string | null | undefined,
  options: OptimizeMediaOptions = {},
): string {
  const resolved = resolveMediaUrl(url ?? '')
  if (!resolved) return ''
  if (!shouldOptimizeMediaUrl(resolved)) return resolved
  if (!import.meta.env.PROD) return resolved

  const width = options.width ?? HERO_IMAGE_WIDTHS.desktop
  const quality = options.quality ?? DEFAULT_QUALITY
  const absolute = toAbsoluteMediaUrl(resolved)

  return `/_vercel/image?url=${encodeURIComponent(absolute)}&w=${width}&q=${quality}`
}

export function buildHeroOptimizedSources(sources: HeroImageSources): HeroImageSources {
  const fallback = sources.desktop || sources.tablet || sources.mobile
  if (!fallback) {
    return sources
  }

  return {
    mobile: buildOptimizedMediaUrl(sources.mobile || fallback, { width: HERO_IMAGE_WIDTHS.mobile }),
    tablet: buildOptimizedMediaUrl(sources.tablet || sources.desktop || fallback, {
      width: HERO_IMAGE_WIDTHS.tablet,
    }),
    desktop: buildOptimizedMediaUrl(sources.desktop || fallback, { width: HERO_IMAGE_WIDTHS.desktop }),
  }
}

export function buildHeroPreloadBundle(sources: HeroImageSources): {
  href: string
  imageSrcSet: string
  imageSizes: string
} | null {
  const optimized = buildHeroOptimizedSources(sources)
  if (!optimized.desktop) return null

  return {
    href: optimized.mobile || optimized.desktop,
    imageSrcSet: `${optimized.mobile} ${HERO_IMAGE_WIDTHS.mobile}w, ${optimized.tablet} ${HERO_IMAGE_WIDTHS.tablet}w, ${optimized.desktop} ${HERO_IMAGE_WIDTHS.desktop}w`,
    imageSizes: '100vw',
  }
}

export function buildSingleImagePreloadBundle(url: string | null | undefined): {
  href: string
  imageSrcSet: string
  imageSizes: string
} | null {
  const resolved = resolveMediaUrl(url ?? '')
  if (!resolved) return null
  return buildHeroPreloadBundle({
    desktop: resolved,
    tablet: resolved,
    mobile: resolved,
  })
}
