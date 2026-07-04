/** Lazy route ve detay sayfaları için bölüm iskeleti — full-page spinner yerine */
export function PublicRouteSkeleton() {
  return (
    <div className="bg-white" aria-busy aria-label="Sayfa yükleniyor">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
          <div className="h-10 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-5 w-5/6 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function PublicDetailSkeleton() {
  return (
    <article className="bg-white" aria-busy aria-label="İçerik yükleniyor">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex gap-2">
          <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="mt-6 space-y-3 border-b border-slate-200 pb-6">
          <div className="h-6 w-24 animate-pulse rounded-full bg-slate-100" />
          <div className="h-10 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-4/5 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="mt-8 aspect-video animate-pulse rounded-xl bg-slate-100" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 w-full animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      </div>
    </article>
  )
}
