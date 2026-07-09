import { useEffect, useMemo, useState } from 'react'
import type { HeroImageSources } from '@/builder/render/heroResponsiveImage'
import { MediaImage } from '@/media/components/MediaImage'
import { cn } from '@/lib/cn'

type Props = {
  sources: HeroImageSources
  alt?: string
  className?: string
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
  fill?: boolean
}

function useNarrowViewport(maxWidth: number): boolean {
  const [narrow, setNarrow] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${maxWidth}px)`).matches : false,
  )

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`)
    const onChange = () => setNarrow(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [maxWidth])

  return narrow
}

function pickSrcForViewport(sources: HeroImageSources, isMobile: boolean, isTablet: boolean): string {
  if (isMobile) return sources.mobile
  if (isTablet) return sources.tablet
  return sources.desktop
}

/**
 * Hero görselleri — viewport’a göre kaynak seçer; hata olursa desktop’a düşer.
 */
export function HeroResponsiveImage({
  sources,
  alt = '',
  className,
  loading = 'eager',
  fetchPriority,
  fill = false,
}: Props) {
  const isMobile = useNarrowViewport(640)
  const isTablet = useNarrowViewport(1024) && !isMobile

  const preferredSrc = useMemo(
    () => pickSrcForViewport(sources, isMobile, isTablet),
    [sources, isMobile, isTablet],
  )

  const [activeSrc, setActiveSrc] = useState(preferredSrc)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setActiveSrc(preferredSrc)
    setFailed(false)
  }, [preferredSrc, sources.desktop, sources.tablet, sources.mobile])

  const handleError = () => {
    const fallbacks = [sources.desktop, sources.tablet, sources.mobile].filter(
      (url, index, arr) => Boolean(url) && arr.indexOf(url) === index,
    )
    const currentIndex = fallbacks.indexOf(activeSrc)
    const next = fallbacks[currentIndex + 1]
    if (next && next !== activeSrc) {
      setActiveSrc(next)
      return
    }
    setFailed(true)
  }

  if (failed || !activeSrc) return null

  const hasDistinctMobile = Boolean(sources.mobile && sources.mobile !== sources.desktop)
  const hasDistinctTablet = Boolean(
    sources.tablet && sources.tablet !== sources.desktop && sources.tablet !== sources.mobile,
  )

  const usePicture = hasDistinctMobile || hasDistinctTablet

  if (usePicture) {
    return (
      <picture className={cn(fill && 'absolute inset-0 block h-full w-full', !fill && 'block w-full')}>
        {hasDistinctMobile ? <source media="(max-width: 640px)" srcSet={sources.mobile} /> : null}
        {hasDistinctTablet ? (
          <source media="(max-width: 1024px)" srcSet={sources.tablet} />
        ) : null}
        <img
          src={sources.desktop}
          alt={alt}
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority ?? (loading === 'eager' ? 'high' : undefined)}
          className={className}
          onError={handleError}
        />
      </picture>
    )
  }

  return (
    <MediaImage
      src={activeSrc}
      alt={alt}
      className={className}
      loading={loading}
      fetchPriority={fetchPriority ?? (loading === 'eager' ? 'high' : undefined)}
      onError={handleError}
    />
  )
}
