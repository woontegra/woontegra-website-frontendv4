import { useMemo, useState } from 'react'
import type { HeroImageSources } from '@/builder/render/heroResponsiveImage'
import { buildHeroOptimizedSources } from '@/media/optimizeMediaUrl'
import { resolveMediaUrl } from '@/media/resolveMediaUrl'
import { cn } from '@/lib/cn'

type Props = {
  sources: HeroImageSources
  alt?: string
  className?: string
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
  fill?: boolean
  onError?: () => void
}

function rawSourcesFrom(sources: HeroImageSources): HeroImageSources {
  return {
    desktop: resolveMediaUrl(sources.desktop),
    tablet: resolveMediaUrl(sources.tablet),
    mobile: resolveMediaUrl(sources.mobile),
  }
}

/**
 * Hero görselleri — CSS media query ile viewport kaynağı seçer (hydration gecikmesi yok).
 * Production'da Vercel Image Optimization ile mobilde küçük varyant indirilir.
 * Optimize URL başarısız olursa orijinal URL'ye düşer.
 */
export function HeroResponsiveImage({
  sources,
  alt = '',
  className,
  loading = 'eager',
  fetchPriority,
  fill = false,
  onError,
}: Props) {
  const raw = useMemo(() => rawSourcesFrom(sources), [sources])
  const [useOptimized, setUseOptimized] = useState(true)
  const [fallbackIndex, setFallbackIndex] = useState(0)

  const fallbacks = useMemo(() => {
    const list = [raw.desktop, raw.tablet, raw.mobile].filter(
      (url, index, arr) => Boolean(url) && arr.indexOf(url) === index,
    )
    return list
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

  return (
    <picture className={cn(fill && 'absolute inset-0 block h-full w-full', !fill && 'block w-full')}>
      <source media="(max-width: 640px)" srcSet={activeSources.mobile} />
      <source media="(max-width: 1024px)" srcSet={activeSources.tablet} />
      <img
        src={activeSources.desktop}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={priority}
        className={className}
        onError={handleError}
      />
    </picture>
  )
}
