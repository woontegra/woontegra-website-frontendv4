import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { buildOptimizedMediaUrl } from '@/media/optimizeMediaUrl'
import { buildResponsivePictureModel } from '@/media/optimizedMediaVariants'
import { resolvePublicImage } from '@/media/resolvePublicImage'
import { cn } from '@/lib/cn'

type Props = {
  src?: string | null
  input?: unknown
  alt?: string
  className?: string
  style?: CSSProperties
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
  sizes?: string
  optimizeWidth?: number
  width?: number
  height?: number
  onError?: () => void
}

/**
 * Public medya — yeni optimize upload'larda picture/srcset;
 * eski URL'lerde orijinal dosya. /_vercel/image yalnızca açık opt-in ile.
 */
export function MediaImage({
  src,
  input,
  alt = '',
  className,
  style,
  loading = 'lazy',
  fetchPriority,
  sizes,
  optimizeWidth,
  width,
  height,
  onError,
}: Props) {
  const resolved = useMemo(
    () => (input != null ? resolvePublicImage(input) : resolvePublicImage(src)),
    [input, src],
  )

  const [preferOptimized, setPreferOptimized] = useState(Boolean(optimizeWidth))
  const [failed, setFailed] = useState(false)

  const picture = useMemo(
    () =>
      buildResponsivePictureModel(resolved, {
        sizes: sizes ?? (optimizeWidth ? `${optimizeWidth}px` : '100vw'),
      }),
    [optimizeWidth, resolved, sizes],
  )

  const displaySrc = useMemo(() => {
    if (!resolved) return ''
    if (picture) return picture.imgSrc
    if (!optimizeWidth || !preferOptimized) return resolved
    return buildOptimizedMediaUrl(resolved, { width: optimizeWidth }) || resolved
  }, [optimizeWidth, picture, preferOptimized, resolved])

  useEffect(() => {
    setFailed(false)
    setPreferOptimized(Boolean(optimizeWidth))
  }, [optimizeWidth, resolved])

  if (!displaySrc || failed) return null

  const img = (
    <img
      src={displaySrc}
      srcSet={picture?.imgSrcSet}
      alt={alt}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      sizes={picture ? (sizes ?? (optimizeWidth ? `${optimizeWidth}px` : '100vw')) : sizes}
      width={width}
      height={height}
      className={cn(className)}
      style={style}
      onError={() => {
        if (optimizeWidth && preferOptimized && !picture) {
          setPreferOptimized(false)
          return
        }
        if (onError) {
          onError()
          return
        }
        setFailed(true)
      }}
    />
  )

  if (!picture || picture.sources.length === 0) return img

  return (
    <picture className={cn(className)}>
      {picture.sources.map((source) => (
        <source
          key={`${source.type}-${source.srcSet}`}
          type={source.type}
          srcSet={source.srcSet}
          sizes={source.sizes}
        />
      ))}
      {img}
    </picture>
  )
}
