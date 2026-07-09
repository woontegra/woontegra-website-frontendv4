import type { MediaRef } from '@/builder/types/common'
import type { HeroImageFit, HeroSettings, HeroSlide } from '@/builder/types/hero'
import { resolvePublicImage, resolvePublicImageSources } from '@/media/resolvePublicImage'

export type HeroImageSources = {
  desktop: string
  tablet: string
  mobile: string
}

type SlideLike = HeroSlide & Record<string, unknown>

export function resolveHeroMediaUrl(ref?: MediaRef | null): string {
  return resolvePublicImage(ref)
}

function normalizeMediaRef(value: unknown): MediaRef | undefined {
  if (value == null) return undefined
  if (typeof value === 'string') {
    const url = value.trim()
    return url ? { url } : undefined
  }
  if (typeof value === 'object' && value !== null && 'url' in value) {
    const row = value as MediaRef
    const url = row.url?.trim()
    return url ? { url, ...row } : undefined
  }
  return undefined
}

/** Panel + eski kayıtlar: desktopImage, image, desktopImageUrl vb. */
export function getSlideDesktopRef(slide: HeroSlide): MediaRef | undefined {
  const row = slide as SlideLike
  return (
    normalizeMediaRef(slide.desktopImage) ??
    normalizeMediaRef(row.image) ??
    normalizeMediaRef(row.desktopImageUrl) ??
    normalizeMediaRef(row.desktopMediaUrl) ??
    normalizeMediaRef((row.responsiveImages as { desktop?: unknown } | undefined)?.desktop) ??
    normalizeMediaRef((row.media as { desktop?: unknown } | undefined)?.desktop)
  )
}

export function getSlideTabletRef(slide: HeroSlide): MediaRef | undefined {
  const row = slide as SlideLike
  return (
    normalizeMediaRef(slide.tabletImage) ??
    normalizeMediaRef(row.tabletImageUrl) ??
    normalizeMediaRef((row.responsiveImages as { tablet?: unknown } | undefined)?.tablet) ??
    normalizeMediaRef((row.media as { tablet?: unknown } | undefined)?.tablet)
  )
}

export function getSlideMobileRef(slide: HeroSlide): MediaRef | undefined {
  const row = slide as SlideLike
  return (
    normalizeMediaRef(slide.mobileImage) ??
    normalizeMediaRef(row.mobileImageUrl) ??
    normalizeMediaRef(row.mobileMediaUrl) ??
    normalizeMediaRef((row.responsiveImages as { mobile?: unknown } | undefined)?.mobile) ??
    normalizeMediaRef((row.media as { mobile?: unknown } | undefined)?.mobile)
  )
}

/** Panel slide.link + eski href / ctaUrl alanları */
export function getSlideLink(slide: HeroSlide): string {
  const row = slide as SlideLike
  return String(slide.link ?? row.href ?? row.ctaUrl ?? '').trim()
}

export function slideHasRenderableImage(slide: HeroSlide): boolean {
  return getHeroSlideImageSources(slide) !== null
}

/**
 * Desktop → tablet → mobil fallback zinciri.
 * Panel: settings.desktopImage / tabletImage / mobileImage veya slide.* alanları.
 */
export function pickHeroImageSourcesFromRefs(
  desktopRef?: MediaRef | null,
  tabletRef?: MediaRef | null,
  mobileRef?: MediaRef | null,
): HeroImageSources | null {
  const d = resolveHeroMediaUrl(desktopRef)
  const t = resolveHeroMediaUrl(tabletRef)
  const m = resolveHeroMediaUrl(mobileRef)

  if (!d && !t && !m) return null

  return {
    desktop: d || t || m,
    tablet: t || d || m,
    mobile: m || t || d,
  }
}

export function getHeroSlideImageSources(slide: HeroSlide): HeroImageSources | null {
  return pickHeroImageSourcesFromRefs(
    getSlideDesktopRef(slide),
    getSlideTabletRef(slide),
    getSlideMobileRef(slide),
  )
}

export function getSlideResponsiveImageUrl(
  slide: HeroSlide,
  viewport: 'mobile' | 'tablet' | 'desktop',
): string {
  const sources = getHeroSlideImageSources(slide)
  if (!sources) return ''
  if (viewport === 'mobile') return sources.mobile
  if (viewport === 'tablet') return sources.tablet
  return sources.desktop
}

export function slideHasDistinctMobileImage(slide: HeroSlide): boolean {
  const mobileRaw = getSlideMobileRef(slide)?.url?.trim() ?? ''
  if (!mobileRaw) return false
  const desktopRaw = getSlideDesktopRef(slide)?.url?.trim() ?? ''
  if (!desktopRaw) return true
  return resolveHeroMediaUrl({ url: mobileRaw }) !== resolveHeroMediaUrl({ url: desktopRaw })
}

export function carouselHasDistinctMobileImage(settings: HeroSettings): boolean {
  if (settings.mode !== 'carousel') return hasDistinctMobileHeroImage(settings)
  return settings.slides.some(
    (s) => s.enabled !== false && slideHasDistinctMobileImage(s),
  )
}

export function getHeroSettingsImageSources(settings: HeroSettings): HeroImageSources | null {
  if (settings.mode === 'carousel') {
    const slide = settings.slides.find((s) => s.enabled !== false) ?? settings.slides[0]
    if (!slide) return null
    return getHeroSlideImageSources(slide)
  }

  const fromSettings = resolvePublicImageSources(settings)
  if (fromSettings) return fromSettings

  return pickHeroImageSourcesFromRefs(
    settings.desktopImage ?? settings.slides[0]?.desktopImage,
    settings.tabletImage ?? settings.slides[0]?.tabletImage,
    settings.mobileImage ?? settings.slides[0]?.mobileImage,
  )
}

export function heroHasRenderableImage(settings: HeroSettings): boolean {
  if (settings.mode === 'carousel') {
    return settings.slides.some((s) => s.enabled !== false && slideHasRenderableImage(s))
  }
  return getHeroSettingsImageSources(settings) !== null
}

function rawMobileImageUrl(settings: HeroSettings): string {
  if (settings.mode === 'carousel') {
    for (const slide of settings.slides) {
      if (slide.enabled === false) continue
      const url = getSlideMobileRef(slide)?.url?.trim()
      if (url) return url
    }
    return ''
  }
  return settings.mobileImage?.url?.trim() ?? ''
}

function rawDesktopImageUrl(settings: HeroSettings): string {
  if (settings.mode === 'carousel') {
    for (const slide of settings.slides) {
      if (slide.enabled === false) continue
      const url = getSlideDesktopRef(slide)?.url?.trim()
      if (url) return url
    }
    return ''
  }
  return settings.desktopImage?.url?.trim() ?? settings.slides[0]?.desktopImage?.url?.trim() ?? ''
}

/** Mobil görsel ayrıca seçildiyse (desktop ile aynı URL değilse) true */
export function hasDistinctMobileHeroImage(settings: HeroSettings): boolean {
  if (settings.mode === 'carousel') return carouselHasDistinctMobileImage(settings)
  const mobileRaw = rawMobileImageUrl(settings)
  if (!mobileRaw) return false
  const desktopRaw = rawDesktopImageUrl(settings)
  if (!desktopRaw) return true
  return resolveHeroMediaUrl({ url: mobileRaw }) !== resolveHeroMediaUrl({ url: desktopRaw })
}

export function getHeroImageFit(
  settings: HeroSettings,
  viewport: 'mobile' | 'tablet' | 'desktop',
): HeroImageFit {
  const configured =
    settings.imageFit?.[viewport] ??
    (viewport === 'tablet' ? settings.imageFit?.desktop : undefined) ??
    settings.imageFit?.desktop
  if (configured) return configured
  if (viewport === 'mobile' && hasDistinctMobileHeroImage(settings)) return 'contain'
  return 'cover'
}

/** Mobil görsel contain modunda doğal oranla gösterilir */
export function heroUsesMobileNaturalImageLayout(settings: HeroSettings): boolean {
  return hasDistinctMobileHeroImage(settings) && getHeroImageFit(settings, 'mobile') === 'contain'
}

export function slideUsesMobileNaturalLayout(slide: HeroSlide, settings: HeroSettings): boolean {
  return slideHasDistinctMobileImage(slide) && getHeroImageFit(settings, 'mobile') === 'contain'
}
