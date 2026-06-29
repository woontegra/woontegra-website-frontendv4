import type { MediaRef } from '@/builder/types/common'
import type { HeroImageFit, HeroSettings, HeroSlide } from '@/builder/types/hero'
import { resolveMediaUrl } from '@/media/resolveMediaUrl'

export type HeroImageSources = {
  desktop: string
  tablet: string
  mobile: string
}

export function resolveHeroMediaUrl(ref?: MediaRef | null): string {
  return resolveMediaUrl(ref?.url) || ''
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
  return pickHeroImageSourcesFromRefs(slide.desktopImage, slide.tabletImage, slide.mobileImage)
}

export function getHeroSettingsImageSources(settings: HeroSettings): HeroImageSources | null {
  if (settings.mode === 'carousel') {
    const slide = settings.slides.find((s) => s.enabled !== false) ?? settings.slides[0]
    if (!slide) return null
    return getHeroSlideImageSources(slide)
  }

  return pickHeroImageSourcesFromRefs(
    settings.desktopImage ?? settings.slides[0]?.desktopImage,
    settings.tabletImage ?? settings.slides[0]?.tabletImage,
    settings.mobileImage ?? settings.slides[0]?.mobileImage,
  )
}

export function heroHasRenderableImage(settings: HeroSettings): boolean {
  return getHeroSettingsImageSources(settings) !== null
}

function rawMobileImageUrl(settings: HeroSettings): string {
  if (settings.mode === 'carousel') {
    const slide = settings.slides.find((s) => s.enabled !== false) ?? settings.slides[0]
    return slide?.mobileImage?.url?.trim() ?? ''
  }
  return settings.mobileImage?.url?.trim() ?? ''
}

function rawDesktopImageUrl(settings: HeroSettings): string {
  if (settings.mode === 'carousel') {
    const slide = settings.slides.find((s) => s.enabled !== false) ?? settings.slides[0]
    return slide?.desktopImage?.url?.trim() ?? ''
  }
  return settings.desktopImage?.url?.trim() ?? settings.slides[0]?.desktopImage?.url?.trim() ?? ''
}

/** Mobil görsel ayrıca seçildiyse (desktop ile aynı URL değilse) true */
export function hasDistinctMobileHeroImage(settings: HeroSettings): boolean {
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
