import { useMemo, useState } from 'react'
import type { HeroImageSources } from '@/builder/render/heroResponsiveImage'
import { buildHeroOptimizedSources } from '@/media/optimizeMediaUrl'
import { cn } from '@/lib/cn'

type Props = {
  sources: HeroImageSources
  alt?: string
  className?: string
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
  fill?: boolean
}

/**
 * Hero görselleri — CSS media query ile viewport kaynağı seçer (hydration gecikmesi yok).
 * Production'da Vercel Image Optimization ile mobilde küçük varyant indirilir.
 */
export function HeroResponsiveImage({
  sources,
  alt = '',
  className,
  loading = 'eager',
  fetchPriority,
  fill = false,
}: Props) {
  const optimized = useMemo(() => buildHeroOptimizedSources(sources), [sources])
  const [failed, setFailed] = useState(false)

  const fallbacks = useMemo(() => {
    const raw = [sources.desktop, sources.tablet, sources.mobile].filter(
      (url, index, arr) => Boolean(url) && arr.indexOf(url) === index,
    )
    return raw
  }, [sources.desktop, sources.mobile, sources.tablet])

  const [fallbackIndex, setFallbackIndex] = useState(0)

  const activeOptimized = useMemo(() => {
    if (fallbackIndex === 0) return optimized
    const url = fallbacks[fallbackIndex]
    if (!url) return optimized
    return buildHeroOptimizedSources({ desktop: url, tablet: url, mobile: url })
  }, [optimized, fallbacks, fallbackIndex])

  const handleError = () => {
    const next = fallbackIndex + 1
    if (next < fallbacks.length) {
      setFallbackIndex(next)
      return
    }
    setFailed(true)
  }

  if (failed || !activeOptimized.desktop) return null

  const priority = fetchPriority ?? (loading === 'eager' ? 'high' : undefined)

  return (
    <picture className={cn(fill && 'absolute inset-0 block h-full w-full', !fill && 'block w-full')}>
      <source media="(max-width: 640px)" srcSet={activeOptimized.mobile} />
      <source media="(max-width: 1024px)" srcSet={activeOptimized.tablet} />
      <img
        src={activeOptimized.desktop}
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
