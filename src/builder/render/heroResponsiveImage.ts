import type { MediaRef } from '@/builder/types/common'
import type { HeroSettings, HeroSlide } from '@/builder/types/hero'
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
  const desktopResolved = resolveHeroMediaUrl(desktopRef)
  const tabletResolved = resolveHeroMediaUrl(tabletRef)
  const mobileResolved = resolveHeroMediaUrl(mobileRef)

  const anchor = desktopResolved || tabletResolved || mobileResolved
  if (!anchor) return null

  const tablet = tabletResolved || desktopResolved || mobileResolved
  const mobile = mobileResolved || tablet || desktopResolved
  const desktop = desktopResolved || tablet || mobileResolved

  return { desktop, tablet, mobile }
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
