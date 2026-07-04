import { cn } from '@/lib/cn'
import { coverAspectClass } from '@/components/public/BlogCardCover'

type Props = {
  compact?: boolean
}

export function BlogCardSkeleton({ compact = false }: Props) {
  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white"
      aria-hidden
    >
      <div className={cn('w-full animate-pulse bg-slate-200', coverAspectClass(compact))} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex gap-2">
          <div className="h-5 w-16 animate-pulse rounded-full bg-slate-200" />
          <div className="h-5 w-24 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="space-y-2">
          <div className="h-5 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-5/6 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="space-y-2 pt-1">
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="mt-auto h-4 w-28 animate-pulse rounded bg-slate-200" />
      </div>
    </article>
  )
}
