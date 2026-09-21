import { useMemo, useState } from 'react'
import type { HeroImageSources } from '@/builder/render/heroResponsiveImage'
import { buildHeroOptimizedSources } from '@/media/optimizeMediaUrl'
import { buildResponsivePictureModel } from '@/media/optimizedMediaVariants'
import { resolveMediaUrl } from '@/media/resolveMediaUrl'
import { cn } from '@/lib/cn'

type Props = {
  sources: HeroImageSources
  alt?: string
  className?: string
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
  fill?: boolean
  /** Centered home banner: sabit 3:1 / mobil 9:16 kutu — görsel h-auto ile sayfayı itmez. */
  lockAspect?: 'banner'
  width?: number
  height?: number
  onError?: () => void
}

function rawSourcesFrom(sources: HeroImageSources): HeroImageSources {
  return {
    desktop: resolveMediaUrl(sources.desktop),
    tablet: resolveMediaUrl(sources.tablet),
    mobile: resolveMediaUrl(sources.mobile),
  }
}

function heroSizes(lockAspect?: 'banner'): string {
  return lockAspect === 'banner' ? '100vw' : '(max-width: 1024px) 100vw, 50vw'
}

/**
 * Hero görselleri — CSS media query ile viewport kaynağı seçer.
 * Yeni opt-w upload'larda AVIF/WebP srcset; eski URL'lerde orijinal dosya.
 */
export function HeroResponsiveImage({
  sources,
  alt = '',
  className,
  loading = 'eager',
  fetchPriority,
  fill = false,
  lockAspect,
  width,
  height,
  onError,
}: Props) {
  const raw = useMemo(() => rawSourcesFrom(sources), [sources])
  const [useOptimized, setUseOptimized] = useState(true)
  const [fallbackIndex, setFallbackIndex] = useState(0)

  const fallbacks = useMemo(() => {
    return [raw.desktop, raw.tablet, raw.mobile].filter(
      (url, index, arr) => Boolean(url) && arr.indexOf(url) === index,
    )
  }, [raw.desktop, raw.mobile, raw.tablet])

  const activeSources = useMemo(() => {
    const base = fallbacks[fallbackIndex]
    if (!base) return null
    if (useOptimized) {
      return buildHeroOptimizedSources({
        desktop: raw.desktop || base,
        tablet: raw.tablet || raw.desktop || base,
        mobile: raw.mobile || raw.tablet || raw.desktop || base,
      })
    }
    return {
      desktop: raw.desktop || base,
      tablet: raw.tablet || raw.desktop || base,
      mobile: raw.mobile || raw.tablet || raw.desktop || base,
    }
  }, [fallbackIndex, fallbacks, raw, useOptimized])

  const handleError = () => {
    if (useOptimized) {
      setUseOptimized(false)
      return
    }
    const next = fallbackIndex + 1
    if (next < fallbacks.length) {
      setFallbackIndex(next)
      return
    }
    onError?.()
  }

  if (!activeSources?.desktop) {
    onError?.()
    return null
  }

  const priority = fetchPriority ?? (loading === 'eager' ? 'high' : undefined)
  const bannerLock = lockAspect === 'banner'
  const imgClass = bannerLock
    ? cn('absolute inset-0 h-full w-full object-contain object-center', className)
    : className
  const sizes = heroSizes(lockAspect)

  const mobileModel = buildResponsivePictureModel(activeSources.mobile, {
    media: '(max-width: 640px)',
    sizes,
  })
  const tabletModel = buildResponsivePictureModel(activeSources.tablet, {
    media: '(max-width: 1024px)',
    sizes,
  })
  const desktopModel = buildResponsivePictureModel(activeSources.desktop, { sizes })

  return (
    <picture
      className={cn(
        fill && !bannerLock && 'absolute inset-0 block h-full w-full',
        !fill && !bannerLock && 'block w-full',
        bannerLock &&
          'relative block w-full overflow-hidden bg-slate-900 aspect-[3/1] max-[640px]:aspect-[9/16]',
      )}
    >
      {mobileModel
        ? mobileModel.sources.map((source) => (
            <source
              key={`m-${source.type}-${source.srcSet}`}
              media={source.media}
              type={source.type}
              srcSet={source.srcSet}
              sizes={source.sizes}
            />
          ))
        : null}
      {activeSources.mobile ? (
        <source media="(max-width: 640px)" srcSet={activeSources.mobile} />
      ) : null}
      {tabletModel
        ? tabletModel.sources.map((source) => (
            <source
              key={`t-${source.type}-${source.srcSet}`}
              media={source.media}
              type={source.type}
              srcSet={source.srcSet}
              sizes={source.sizes}
            />
          ))
        : null}
      {activeSources.tablet ? (
        <source media="(max-width: 1024px)" srcSet={activeSources.tablet} />
      ) : null}
      {desktopModel
        ? desktopModel.sources.map((source) => (
            <source
              key={`d-${source.type}-${source.srcSet}`}
              type={source.type}
              srcSet={source.srcSet}
              sizes={source.sizes}
            />
          ))
        : null}
      <img
        src={activeSources.desktop}
        srcSet={desktopModel?.imgSrcSet}
        alt={alt}
        width={width ?? (bannerLock ? 2172 : undefined)}
        height={height ?? (bannerLock ? 724 : undefined)}
        sizes={desktopModel ? sizes : undefined}
        loading={loading}
        decoding={priority === 'high' ? 'sync' : 'async'}
        fetchPriority={priority}
        className={imgClass}
        onError={handleError}
      />
    </picture>
  )
}
