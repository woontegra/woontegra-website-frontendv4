import { cn } from '@/lib/cn'
import { formatSidebarBadgeCount } from '@/types/adminSidebarBadges'

type Props = {
  count: number
  variant?: 'warning' | 'danger'
}

export function AdminSidebarBadge({ count, variant = 'warning' }: Props) {
  const label = formatSidebarBadgeCount(count)
  if (!label) return null

  return (
    <span
      className={cn(
        'inline-flex min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none tabular-nums',
        variant === 'danger' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white',
      )}
      aria-label={`${count} bekleyen`}
    >
      {label}
    </span>
  )
}
