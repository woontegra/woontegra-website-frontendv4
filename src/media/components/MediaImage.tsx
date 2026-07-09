import { useEffect, useState, type CSSProperties } from 'react'
import { resolveMediaUrl } from '@/media/resolveMediaUrl'
import { cn } from '@/lib/cn'

type Props = {
  src?: string | null
  alt?: string
  className?: string
  style?: CSSProperties
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
  sizes?: string
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
  onError,
}: Props) {
  const resolved = resolveMediaUrl(src)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [resolved])

  if (!resolved || failed) return null

  return (
    <img
      src={resolved}
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
