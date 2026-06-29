import { useEffect, useState } from 'react'
import type { HeroImageSources } from '@/builder/render/heroResponsiveImage'
import { MediaImage } from '@/media/components/MediaImage'
import { cn } from '@/lib/cn'

type Props = {
  sources: HeroImageSources
  alt?: string
  className?: string
  loading?: 'eager' | 'lazy'
  fill?: boolean
}

/**
 * Hero görselleri — <picture> ile mobil/tablet/desktop kaynak seçimi.
 */
export function HeroResponsiveImage({
  sources,
  alt = '',
  className,
  loading = 'eager',
  fill = false,
}: Props) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [sources.desktop, sources.tablet, sources.mobile])

  if (failed) return null

  const { desktop, tablet, mobile } = sources
  const hasDistinctMobile = Boolean(mobile && mobile !== desktop)
  const hasDistinctTablet = Boolean(tablet && tablet !== desktop && tablet !== mobile)

  if (!hasDistinctMobile && !hasDistinctTablet) {
    return <MediaImage src={desktop} alt={alt} className={className} loading={loading} />
  }

  return (
    <picture className={cn(fill && 'absolute inset-0 block h-full w-full', !fill && 'block')}>
      {hasDistinctMobile ? <source media="(max-width: 640px)" srcSet={mobile} /> : null}
      {hasDistinctTablet ? <source media="(max-width: 1024px)" srcSet={tablet} /> : null}
      <img
        src={desktop}
        alt={alt}
        loading={loading}
        decoding="async"
        className={className}
        onError={() => setFailed(true)}
      />
    </picture>
  )
}
