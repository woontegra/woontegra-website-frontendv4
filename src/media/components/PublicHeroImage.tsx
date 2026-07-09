import { useMemo, useState } from 'react'
import type { HeroImageSources } from '@/builder/render/heroResponsiveImage'
import { HeroResponsiveImage } from '@/media/components/HeroResponsiveImage'
import { PublicImagePlaceholder } from '@/media/components/PublicImagePlaceholder'
import { hasPublicImage, resolvePublicImageSources } from '@/media/resolvePublicImage'
import { cn } from '@/lib/cn'

type Props = {
  input: unknown
  alt?: string
  className?: string
  imageClassName?: string
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
  framed?: boolean
  darkFrame?: boolean
  showPlaceholder?: boolean
}

function toHeroSources(sources: { desktop: string; tablet: string; mobile: string }): HeroImageSources {
  return {
    desktop: sources.desktop,
    tablet: sources.tablet,
    mobile: sources.mobile,
  }
}

/**
 * Hero sağ kolon / çerçeveli görsel — URL yoksa veya yükleme başarısızsa boş çerçeve göstermez.
 */
export function PublicHeroImage({
  input,
  alt = '',
  className,
  imageClassName = 'aspect-[4/3] w-full object-cover',
  loading = 'eager',
  fetchPriority,
  framed = true,
  darkFrame = true,
  showPlaceholder = false,
}: Props) {
  const sources = useMemo(() => resolvePublicImageSources(input), [input])
  const [failed, setFailed] = useState(false)

  const hasImage = Boolean(sources?.desktop) && !failed

  if (!hasImage) {
    if (!showPlaceholder || !hasPublicImage(input)) return null
    return (
      <div className={cn('relative mx-auto w-full max-w-xl lg:max-w-none', className)}>
        {framed ? (
          <>
            <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-blue-500/15 blur-2xl" />
            <div
              className={cn(
                'relative overflow-hidden rounded-2xl border p-2 shadow-2xl',
                darkFrame ? 'border-white/15 bg-slate-900/40' : 'border-slate-200 bg-white',
              )}
            >
              <PublicImagePlaceholder roundedClassName="rounded-xl" />
            </div>
          </>
        ) : (
          <PublicImagePlaceholder />
        )}
      </div>
    )
  }

  const imageNode = (
    <HeroResponsiveImage
      sources={toHeroSources(sources!)}
      alt={alt}
      className={imageClassName}
      loading={loading}
      fetchPriority={fetchPriority}
      onError={() => setFailed(true)}
    />
  )

  if (!framed) {
    return <div className={className}>{imageNode}</div>
  }

  return (
    <div className={cn('relative mx-auto w-full max-w-xl lg:max-w-none', className)}>
      <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-blue-500/15 blur-2xl" />
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border p-2 shadow-2xl',
          darkFrame ? 'border-white/15 bg-slate-900/40' : 'border-slate-200 bg-white',
        )}
      >
        {imageNode}
      </div>
    </div>
  )
}
