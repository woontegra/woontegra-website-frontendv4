import { useEffect, useState } from 'react'
import { resolveMediaUrl } from '@/media/resolveMediaUrl'
import { cn } from '@/lib/cn'

const PRODUCT_PLACEHOLDER = '/product-placeholder.svg'

type Props = {
  src?: string | null
  alt: string
  className?: string
  loading?: 'eager' | 'lazy'
  productPlaceholder?: boolean
  placeholder?: boolean
}

export function SafeImage({
  src,
  alt,
  className,
  loading = 'lazy',
  productPlaceholder = false,
  placeholder = false,
}: Props) {
  const primary = resolveMediaUrl(src)
  const [activeSrc, setActiveSrc] = useState(primary)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setActiveSrc(primary)
    setFailed(false)
  }, [primary])

  if (failed || !activeSrc) {
    if (!placeholder) return null
    return (
      <div className={cn('flex items-center justify-center rounded-lg bg-slate-100 text-slate-400', className)}>
        <span className="text-xs">—</span>
      </div>
    )
  }

  return (
    <img
      src={activeSrc}
      alt={alt}
      loading={loading}
      className={cn(className)}
      onError={() => {
        if (productPlaceholder && activeSrc !== PRODUCT_PLACEHOLDER) {
          setActiveSrc(PRODUCT_PLACEHOLDER)
          return
        }
        setFailed(true)
      }}
    />
  )
}
