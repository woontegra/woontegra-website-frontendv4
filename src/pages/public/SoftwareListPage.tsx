import { useQuery } from '@tanstack/react-query'
import { PageHero } from '@/components/public/PageHero'
import { ProductCard } from '@/components/public/ProductCard'
import { PublicBuilderBlocksPage } from '@/components/public/PublicBuilderBlocksPage'
import { ProductCardSkeletonGrid } from '@/components/public/ProductCardSkeleton'
import { ErrorState } from '@/components/public/ErrorState'
import { EmptyState } from '@/components/public/EmptyState'
import { usePageMeta } from '@/hooks/usePageMeta'
import { usePublicPageBlocks } from '@/hooks/usePublicPageBlocks'
import { SOFTWARE_PAGE_CONTENT_KEY } from '@/lib/builderPageContentKeys'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { productsService } from '@/services/productsService'
import { getErrorMessage } from '@/api/client'

export function SoftwareListPage() {
  const { blocks } = usePublicPageBlocks(SOFTWARE_PAGE_CONTENT_KEY)

  usePageMeta({
    title: 'Yazılımlar',
    description: 'Woontegra yazılım ürünleri ve dijital çözümler.',
  })

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
        description="İndirilebilir yazılımlar, SaaS ürünleri ve lisans destekli çözümler."
        breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Yazılımlar' }]}
      />
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
