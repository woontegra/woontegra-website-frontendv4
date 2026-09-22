import { SITE_ORIGIN } from '@/lib/siteSeo'
import { resolveMediaUrl } from '@/media/resolveMediaUrl'
import type { HeroImageSources } from '@/builder/render/heroResponsiveImage'
import {
  buildOptimizedSrcSet,
  mimeForLcpPreloadFormat,
  pickLcpPreloadFormat,
  pickOptimizedPreloadUrl,
} from '@/media/optimizedMediaVariants'

export const HERO_IMAGE_WIDTHS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1920,
} as const

/** Canlı hero banner oranları — her iki mevcut slide aynı. */
export const HOME_BANNER_DESKTOP_ASPECT = '3 / 1'
export const HOME_BANNER_MOBILE_ASPECT = '9 / 16'

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
 * Vite SPA'da `/_vercel/image` Next.js optimizer değildir — Vercel rewrite ile
 * index.html döner. Opt-in olmadan kullanmak LCP'yi bir failed request ile geciktirir.
 */
export function isVercelImageOptimizationEnabled(): boolean {
  return import.meta.env.VITE_VERCEL_IMAGE_OPTIMIZATION === 'true'
}

/**
 * Production görsel URL'si. Optimizer kapalıysa orijinal (Blob/R2) URL döner.
 */
export function buildOptimizedMediaUrl(
  url: string | null | undefined,
  options: OptimizeMediaOptions = {},
): string {
  const resolved = resolveMediaUrl(url ?? '')
  if (!resolved) return ''
  if (!shouldOptimizeMediaUrl(resolved)) return resolved
  if (!import.meta.env.PROD || !isVercelImageOptimizationEnabled()) return resolved

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

export type HeroPreloadBundle = {
  href: string
  mobileHref: string
  desktopHref: string
  imageSrcSet: string
  imageSizes: string
  mobileImageSrcSet?: string
  desktopImageSrcSet?: string
  mobileType?: string
  desktopType?: string
}

function preloadSrcSet(url: string, format: ReturnType<typeof pickLcpPreloadFormat>): string | undefined {
  if (format === 'canonical') return undefined
  return buildOptimizedSrcSet(url, format) || undefined
}

export function buildHeroPreloadBundle(sources: HeroImageSources): HeroPreloadBundle | null {
  const optimized = buildHeroOptimizedSources(sources)
  if (!optimized.desktop) return null

  const mobile = optimized.mobile || optimized.desktop
  const desktop = optimized.desktop
  const mobileFormat = pickLcpPreloadFormat(mobile)
  const desktopFormat = pickLcpPreloadFormat(desktop)
  const mobileHref = pickOptimizedPreloadUrl(mobile, HERO_IMAGE_WIDTHS.mobile, mobileFormat)
  const desktopHref = pickOptimizedPreloadUrl(desktop, HERO_IMAGE_WIDTHS.desktop, desktopFormat)
  const mobileImageSrcSet = preloadSrcSet(mobile, mobileFormat)
  const desktopImageSrcSet = preloadSrcSet(desktop, desktopFormat)

  return {
    href: mobileHref,
    mobileHref,
    desktopHref,
    imageSrcSet:
      desktopImageSrcSet ||
      `${mobile} ${HERO_IMAGE_WIDTHS.mobile}w, ${optimized.tablet} ${HERO_IMAGE_WIDTHS.tablet}w, ${desktop} ${HERO_IMAGE_WIDTHS.desktop}w`,
    imageSizes: '100vw',
    mobileImageSrcSet,
    desktopImageSrcSet,
    mobileType: mimeForLcpPreloadFormat(mobileFormat) || undefined,
    desktopType: mimeForLcpPreloadFormat(desktopFormat) || undefined,
  }
}

export function buildSingleImagePreloadBundle(url: string | null | undefined): HeroPreloadBundle | null {
  const resolved = resolveMediaUrl(url ?? '')
  if (!resolved) return null
  return buildHeroPreloadBundle({
    desktop: resolved,
    tablet: resolved,
    mobile: resolved,
  })
}
