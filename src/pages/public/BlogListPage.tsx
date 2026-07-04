import { useQuery } from '@tanstack/react-query'
import { BlogCard } from '@/components/public/BlogCard'
import { PageHero } from '@/components/public/PageHero'
import { PublicBuilderBlocksPage } from '@/components/public/PublicBuilderBlocksPage'
import { BlogCardSkeleton } from '@/components/public/BlogCardSkeleton'
import { ErrorState } from '@/components/public/ErrorState'
import { EmptyState } from '@/components/public/EmptyState'
import { usePageMeta } from '@/hooks/usePageMeta'
import { usePublicPageBlocks } from '@/hooks/usePublicPageBlocks'
import { BLOG_PAGE_CONTENT_KEY } from '@/lib/builderPageContentKeys'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { blogService } from '@/services/blogService'
import { getErrorMessage } from '@/api/client'

export function BlogListPage() {
  const { blocks } = usePublicPageBlocks(BLOG_PAGE_CONTENT_KEY)

  usePageMeta({
    title: 'Blog',
    description: 'Woontegra duyuru, güncelleme ve teknik yazıları.',
  })

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['blog', 'list'],
    queryFn: () => blogService.list(),
    ...publicQueryOptions,
  })

  const legacyView = (
    <div>
      <PageHero
        eyebrow="Blog"
        title="Duyurular ve teknik yazılar"
        description="Ürün güncellemeleri, ipuçları ve sektörden notlar."
        breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Blog' }]}
      />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isPending ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <BlogCardSkeleton key={`sk-${i}`} />
              ))}
            </div>
          ) : null}
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
            <EmptyState title="Henüz yazı yok" description="Yakında blog içerikleri eklenecek." />
          ) : null}
          {data && data.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )

  return <PublicBuilderBlocksPage blocks={blocks} fallback={legacyView} />
}
