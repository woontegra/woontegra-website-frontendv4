import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { buildOptimizedMediaUrl } from '@/media/optimizeMediaUrl'
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
  onError?: () => void
}

/**
 * Public medya — boş/kırık görselde null döner; optimize URL başarısızsa orijinale düşer.
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
  onError,
}: Props) {
  const resolved = useMemo(
    () => (input != null ? resolvePublicImage(input) : resolvePublicImage(src)),
    [input, src],
  )

  const [useOptimized, setUseOptimized] = useState(Boolean(optimizeWidth))
  const [failed, setFailed] = useState(false)

  const displaySrc = useMemo(() => {
    if (!resolved) return ''
    if (!optimizeWidth || !useOptimized) return resolved
    return buildOptimizedMediaUrl(resolved, { width: optimizeWidth }) || resolved
  }, [optimizeWidth, resolved, useOptimized])

  useEffect(() => {
    setFailed(false)
    setUseOptimized(Boolean(optimizeWidth))
  }, [displaySrc, optimizeWidth, resolved])

  if (!displaySrc || failed) return null

  return (
    <img
      src={displaySrc}
      alt={alt}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      sizes={sizes}
      className={cn(className)}
      style={style}
      onError={() => {
        if (optimizeWidth && useOptimized) {
          setUseOptimized(false)
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
}
