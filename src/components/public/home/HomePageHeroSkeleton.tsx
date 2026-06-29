import type { HomeHeroShellLayout } from '@/lib/homePageAdapter'
import { cn } from '@/lib/cn'

type Props = {
  layout?: HomeHeroShellLayout
  minHeight?: string
}

/**
 * Ana sayfa hero alanı — final layout ölçüsünde nötr skeleton.
 * Gradient/text hero fallback değil; veri ve görsel hazır olana kadar gösterilir.
 */
export function HomePageHeroSkeleton({ layout = 'split', minHeight = '520px' }: Props) {
  const sectionStyle = { minHeight, ['--hero-h' as string]: minHeight }

  if (layout === 'fullscreen') {
    return (
      <div className="bg-white">
        <section
          className="relative w-full overflow-hidden bg-slate-100"
          style={sectionStyle}
          aria-busy="true"
          aria-label="Ana sayfa yükleniyor"
        >
          <div className="absolute inset-0 animate-pulse bg-slate-200/80" />
          <div className="relative z-[1] mx-auto flex h-full max-w-7xl flex-col justify-center px-4 py-16">
            <div className="mx-auto w-full max-w-2xl space-y-4 text-center">
              <div className="mx-auto h-10 w-3/4 animate-pulse rounded-lg bg-slate-300/90" />
              <div className="mx-auto h-6 w-full max-w-xl animate-pulse rounded-lg bg-slate-300/80" />
              <div className="mx-auto flex justify-center gap-3 pt-2">
                <div className="h-10 w-36 animate-pulse rounded-lg bg-slate-300/90" />
                <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-300/80" />
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (layout === 'compact') {
    return (
      <div className="bg-white">
        <section
          className="w-full overflow-hidden border-b border-slate-200 bg-slate-50 py-10 sm:py-12"
          style={{ minHeight: minHeight || '280px' }}
          aria-busy="true"
          aria-label="Ana sayfa yükleniyor"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-4">
              <div className="h-8 w-2/3 max-w-lg animate-pulse rounded-lg bg-slate-200" />
              <div className="h-5 w-full max-w-xl animate-pulse rounded-lg bg-slate-200" />
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <section
        className={cn('w-full overflow-hidden py-12 sm:py-16 lg:py-20', layout === 'none' && 'py-8')}
        style={sectionStyle}
        aria-busy="true"
        aria-label="Ana sayfa yükleniyor"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4">
              <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
              <div className="h-10 w-full max-w-lg animate-pulse rounded-lg bg-slate-200" />
              <div className="h-10 w-4/5 max-w-md animate-pulse rounded-lg bg-slate-200" />
              <div className="flex gap-3 pt-2">
                <div className="h-10 w-36 animate-pulse rounded-lg bg-slate-200" />
                <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200" />
              </div>
            </div>
            {layout !== 'none' ? (
              <div className="aspect-[8/5] w-full animate-pulse rounded-xl bg-slate-200" aria-hidden />
            ) : null}
          </div>
        </div>
      </section>
    </div>
  )
}
