import { SOFTWARE_SHOWCASE_ITEMS, type SoftwareShowcaseItem } from '@/data/softwareShowcase'
import { cn } from '@/lib/cn'

type MarkSize = 'sm' | 'md'

export function SoftwareShowcaseMark({
  item,
  size = 'md',
}: {
  item: SoftwareShowcaseItem
  size?: MarkSize
}) {
  const Icon = item.icon
  const box = size === 'sm' ? 'h-9 w-9' : 'h-10 w-10'
  const glyph = size === 'sm' ? 'h-[26px] w-[26px]' : 'h-[30px] w-[30px]'

  if (item.logoSrc) {
    return (
      <span
        className={cn(
          'flex shrink-0 items-center justify-center overflow-hidden rounded-lg',
          box,
          item.logoFlush ? '' : 'border border-slate-200 bg-slate-50 p-1',
        )}
      >
        <img
          src={item.logoSrc}
          alt=""
          className={cn('object-contain', item.logoFlush ? 'h-full w-full' : glyph)}
        />
      </span>
    )
  }

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-emerald-700',
        box,
      )}
    >
      <Icon className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden />
    </span>
  )
}

export function showcaseItemByPath(path: string): SoftwareShowcaseItem | undefined {
  const clean = path.split('?')[0]?.split('#')[0] ?? path
  return SOFTWARE_SHOWCASE_ITEMS.find((item) => item.href === clean)
}
