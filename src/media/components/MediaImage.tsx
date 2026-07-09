import { useEffect, useState, type CSSProperties } from 'react'
import { resolveMediaUrl } from '@/media/resolveMediaUrl'
import { buildOptimizedMediaUrl } from '@/media/optimizeMediaUrl'
import { cn } from '@/lib/cn'

type Props = {
  src?: string | null
  alt?: string
  className?: string
  style?: CSSProperties
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
  sizes?: string
  /** Production'da Vercel Image Optimization ile genişlik sınırı uygular */
  optimizeWidth?: number
  onError?: () => void
}

/**
 * Public medya — boş/kırık görselde gri kutu veya broken icon yok; null döner.
 */
export function MediaImage({
  src,
  alt = '',
  className,
  style,
  loading = 'lazy',
  fetchPriority,
  sizes,
  optimizeWidth,
  onError,
}: Props) {
  const resolved = resolveMediaUrl(src)
  const displaySrc = optimizeWidth
    ? buildOptimizedMediaUrl(resolved, { width: optimizeWidth }) || resolved
    : resolved
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [displaySrc])

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
        if (onError) {
          onError()
          return
        }
        setFailed(true)
      }}
    />
  )
}
