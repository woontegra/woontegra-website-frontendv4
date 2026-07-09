import { cn } from '@/lib/cn'

type Props = {
  className?: string
  aspectClassName?: string
  roundedClassName?: string
}

/**
 * Görsel yokken veya yüklenemezken — ince çizgi/boş kutu yerine Woontegra gradient yüzey.
 */
export function PublicImagePlaceholder({
  className,
  aspectClassName = 'aspect-[4/3]',
  roundedClassName = 'rounded-2xl',
}: Props) {
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        aspectClassName,
        roundedClassName,
        'bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.22),transparent_42%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.18),transparent_44%),linear-gradient(135deg,#0f172a,#14532d)]',
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_55%)]" />
    </div>
  )
}
