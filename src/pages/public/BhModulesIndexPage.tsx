import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { usePageMeta } from '@/hooks/usePageMeta'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { pageContentService } from '@/services/pageContentService'
import {
  BH_MODULE_PAGES_CONTENT_KEY,
  BH_MODULES_INDEX_PATH,
  bhModuleDetailPath,
  collectBhModuleCategories,
  filterBhModules,
  listBhProductPageModules,
  listPublishedBhModules,
  type BhModuleCatalogFields,
} from '@/builder/types/bhModule'
import { resolveIcon } from '@/lib/iconRegistry'
import { cn } from '@/lib/cn'

function useBhModuleCatalogRaw() {
  return useQuery({
    queryKey: ['page-content', BH_MODULE_PAGES_CONTENT_KEY, 'catalog'],
    queryFn: () => pageContentService.getRawByKey(BH_MODULE_PAGES_CONTENT_KEY),
    ...publicQueryOptions,
  })
}

/**
 * Katalog — yalnızca CMS (bhModulePages).
 * Fixture/DEV fallback public katalog kaynağı değildir.
 */
export function useBhModuleCatalog(scope: 'all' | 'product-page' = 'all') {
  const { data: raw, isPending } = useBhModuleCatalogRaw()

  const modules = useMemo(() => {
    return scope === 'product-page' ? listBhProductPageModules(raw) : listPublishedBhModules(raw)
  }, [raw, scope])

  return { modules, isPending, raw }
}

function ModuleCard({ module }: { module: BhModuleCatalogFields }) {
  const Icon = resolveIcon(module.iconName || 'layers')
  return (
    <Link
      to={bhModuleDetailPath(module.slug)}
      className="group flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
    >
      {module.cardImage ? (
        <img
          src={module.cardImage}
          alt=""
          className="mb-4 h-28 w-full rounded-xl object-cover"
          loading="lazy"
        />
      ) : (
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-100">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      )}
      <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
        {module.category}
      </p>
      <h3 className="mt-1 text-lg font-semibold text-slate-900">{module.title}</h3>
      {module.shortDescription ? (
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{module.shortDescription}</p>
      ) : null}
    </Link>
  )
}

function ModuleFilterPanel({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  categories,
  resultCount,
}: {
  query: string
  onQueryChange: (v: string) => void
  category: string | null
  onCategoryChange: (v: string | null) => void
  categories: string[]
  resultCount: number
}) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
      <h3 className="text-sm font-semibold text-slate-900">Modül Bul / Filtrele</h3>
      <p className="mt-1 text-xs text-slate-500">{resultCount} sonuç</p>

      <label className="mt-4 block">
        <span className="sr-only">Modül ara</span>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Modül ara…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </label>

      <div className="mt-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Kategori</p>
        <ul className="mt-2 space-y-1">
          <li>
            <button
              type="button"
              onClick={() => onCategoryChange(null)}
              className={cn(
                'w-full rounded-lg px-3 py-2 text-left text-sm transition',
                category === null
                  ? 'bg-emerald-50 font-semibold text-emerald-800'
                  : 'text-slate-600 hover:bg-slate-50',
              )}
            >
              Tümü
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat}>
              <button
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={cn(
                  'w-full rounded-lg px-3 py-2 text-left text-sm transition',
                  category === cat
                    ? 'bg-emerald-50 font-semibold text-emerald-800'
                    : 'text-slate-600 hover:bg-slate-50',
                )}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

type CatalogLayoutProps = {
  scope: 'all' | 'product-page'
  heading?: string
  showIndexLink?: boolean
  className?: string
  /** Ürün sayfası iç gömme — dış kart/çerçeve ProductContentSections stiline uyumlu */
  embedded?: boolean
}

export function BhModuleCatalogLayout({
  scope,
  heading = 'Hesaplama Modülleri',
  showIndexLink = true,
  className = '',
  embedded = false,
}: CatalogLayoutProps) {
  const { modules, isPending } = useBhModuleCatalog(scope)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)

  const categories = useMemo(() => collectBhModuleCategories(modules), [modules])
  const filtered = useMemo(
    () => filterBhModules(modules, { query, category }),
    [modules, query, category],
  )

  if (isPending && modules.length === 0) {
    return (
      <div className={cn('py-8', className)}>
        <div className="h-8 w-56 animate-pulse rounded bg-slate-100" />
        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
          </div>
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    )
  }

  if (modules.length === 0) return null

  const filterPanel = (
    <ModuleFilterPanel
      query={query}
      onQueryChange={setQuery}
      category={category}
      onCategoryChange={setCategory}
      categories={categories}
      resultCount={filtered.length}
    />
  )

  return (
    <div className={className}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          {!embedded ? (
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{heading}</h2>
          ) : null}
          {embedded ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Modüller</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{heading}</h2>
            </>
          ) : null}
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Bilirkişi Hesap hesaplama modülleri — içerikler Page Builder ile yönetilir.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)] lg:items-start lg:gap-8">
        {/* Mobilde filtre üstte */}
        <div className="order-1 lg:order-2">{filterPanel}</div>

        <div className="order-2 space-y-5 lg:order-1">
          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
              Bu filtreye uyan modül bulunamadı.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((m) => (
                <ModuleCard key={m.slug} module={m} />
              ))}
            </div>
          )}

          {showIndexLink ? (
            <div className="pt-1">
              <Link
                to={BH_MODULES_INDEX_PATH}
                className="text-sm font-semibold text-emerald-700 hover:underline"
              >
                Tüm Hesaplama Modüllerini Gör →
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/** BH ürün sayfası sağ sütun — yayınlı ürün sayfası modüllerinin tamamı (filtre/kart yok) */
export function BhProductPageModulesSidebar() {
  const { modules, isPending } = useBhModuleCatalog('product-page')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.hash !== '#hesaplama-modulleri') return
    if (isPending && modules.length === 0) return
    const el = document.getElementById('hesaplama-modulleri')
    if (!el) return
    const t = window.setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
    return () => window.clearTimeout(t)
  }, [isPending, modules.length])

  if (isPending && modules.length === 0) {
    return (
      <section
        id="hesaplama-modulleri"
        className="scroll-mt-28 rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.18)] ring-1 ring-slate-900/5 sm:p-6"
      >
        <div className="h-5 w-40 animate-pulse rounded bg-slate-100" />
        <div className="mt-4 space-y-2">
          <div className="h-9 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-9 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-9 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </section>
    )
  }

  if (modules.length === 0) return null

  return (
    <section
      id="hesaplama-modulleri"
      className="scroll-mt-28 rounded-[2rem] border border-sky-100/90 bg-[linear-gradient(180deg,rgba(240,249,255,0.98),rgba(255,255,255,0.98))] p-5 shadow-[0_28px_70px_-42px_rgba(14,165,233,0.16)] ring-1 ring-sky-900/5 sm:p-6"
    >
      <h2 className="text-lg font-bold tracking-tight text-slate-950">Hesaplama Modülleri</h2>
      <ul className="mt-3 max-h-[min(28rem,55vh)] divide-y divide-slate-100 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin]">
        {modules.map((m) => (
          <li key={m.slug}>
            <Link
              to={bhModuleDetailPath(m.slug)}
              className="flex items-center justify-between gap-2 py-2.5 text-sm font-medium text-slate-800 transition hover:text-emerald-700"
            >
              <span className="min-w-0 truncate">{m.title}</span>
              <span className="shrink-0 text-slate-400" aria-hidden>
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function BhModulesIndexPage() {
  usePageMeta({
    title: 'Bilirkişi Hesap Modülleri | Woontegra',
    description:
      'İşçilik alacağı hesaplama modülleri: fazla mesai, kıdem, ihbar ve diğer Bilirkişi Hesap detay sayfaları.',
    canonicalPath: BH_MODULES_INDEX_PATH,
  })

  return (
    <div className="bg-white">
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/yazilimlar/bilirkisi-hesap"
            className="text-sm font-semibold text-slate-500 hover:text-slate-800"
          >
            ← Bilirkişi Hesap
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Hesaplama modülleri
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600">
            Modül detay içerikleri Woontegra Page Builder üzerinden yönetilir.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <BhModuleCatalogLayout scope="all" heading="Tüm modüller" showIndexLink={false} />
      </section>
    </div>
  )
}
