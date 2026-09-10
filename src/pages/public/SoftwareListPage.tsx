import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { PageHero } from '@/components/public/PageHero'
import { ProductCard } from '@/components/public/ProductCard'
import { PublicBuilderBlocksPage } from '@/components/public/PublicBuilderBlocksPage'
import { ProductCardSkeletonGrid } from '@/components/public/ProductCardSkeleton'
import { ErrorState } from '@/components/public/ErrorState'
import { EmptyState } from '@/components/public/EmptyState'
import { usePageMeta } from '@/hooks/usePageMeta'
import { mergePageSeo, SOFTWARE_ENTITY_HUB } from '@/lib/siteSeo'
import { usePublicPageBlocks } from '@/hooks/usePublicPageBlocks'
import { SOFTWARE_PAGE_CONTENT_KEY } from '@/lib/builderPageContentKeys'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { productsService } from '@/services/productsService'
import { getErrorMessage } from '@/api/client'

export function SoftwareListPage() {
  const { blocks } = usePublicPageBlocks(SOFTWARE_PAGE_CONTENT_KEY)

  usePageMeta({ ...mergePageSeo('/yazilimlar'), canonicalPath: '/yazilimlar' })

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['products', 'list'],
    queryFn: () => productsService.list(),
    ...publicQueryOptions,
  })

  const legacyView = (
    <div>
      <PageHero
        eyebrow="Yazılımlar"
        title="Dijital Ürünler ve Yazılımlar"
        description="Woontegra’nın geliştirdiği Bilirkişi Hesap, Müvekkil Kasa Defteri ve Şifre Kasası yazılımlarına buradan ulaşın."
        breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Yazılımlar' }]}
      />
      <section className="border-b border-slate-200 bg-slate-50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Woontegra ürünleri</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-3">
            {SOFTWARE_ENTITY_HUB.map((product) => (
              <li key={product.path}>
                <Link
                  to={product.path}
                  className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm"
                >
                  <p className="text-base font-semibold text-slate-900">{product.name}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{product.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isPending ? <ProductCardSkeletonGrid count={6} /> : null}
          {isError ? (
            <ErrorState
              message={getErrorMessage(error)}
              action={
                <button type="button" onClick={() => refetch()} className="text-sm font-semibold text-emerald-700">
                  Tekrar dene
                </button>
              }
            />
          ) : null}
          {!isPending && !isError && data?.length === 0 ? (
            <EmptyState title="Henüz yazılım yok" description="Yakında yeni ürünler eklenecek." />
          ) : null}
          {data && data.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )

  return <PublicBuilderBlocksPage blocks={blocks} fallback={legacyView} />
}
