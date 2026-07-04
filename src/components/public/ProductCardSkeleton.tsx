import { cn } from '@/lib/cn'

export function ProductCardSkeleton() {
  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white"
      aria-hidden
    >
      <div className="aspect-[4/3] w-full animate-pulse bg-slate-200" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
        <div className="space-y-2">
          <div className="h-5 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="space-y-2 pt-1">
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-9 w-28 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </div>
    </article>
  )
}

export function ProductCardSkeletonGrid({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={`product-sk-${i}`} />
      ))}
    </div>
  )
}
