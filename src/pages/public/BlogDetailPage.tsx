import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { BlogDetailView } from '@/components/public/blog/BlogDetailView'
import { PublicBuilderBlocksPage } from '@/components/public/PublicBuilderBlocksPage'
import { LoadingState } from '@/components/public/LoadingState'
import { ErrorState } from '@/components/public/ErrorState'
import { usePageMeta } from '@/hooks/usePageMeta'
import { usePublicPageBlocks } from '@/hooks/usePublicPageBlocks'
import { usePreviewOrParamSlug } from '@/lib/previewRouteParams'
import { BLOG_PAGES_CONTENT_KEY } from '@/lib/builderPageContentKeys'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { blogService } from '@/services/blogService'
import { getErrorMessage } from '@/api/client'

export function BlogDetailPage() {
  const { slug: paramSlug = '' } = useParams()
  const slug = usePreviewOrParamSlug(paramSlug)
  const { blocks } = usePublicPageBlocks(BLOG_PAGES_CONTENT_KEY, slug)

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['blog', slug],
    queryFn: () => blogService.getBySlug(slug),
    enabled: Boolean(slug),
    ...publicQueryOptions,
  })

  usePageMeta({
    title: data?.title || 'Blog',
    description: data?.excerpt,
  })

  const legacyView =
    isPending ? (
      <LoadingState />
    ) : isError || !data ? (
      <div className="mx-auto max-w-3xl px-6 py-24">
        <ErrorState message={getErrorMessage(error, 'Yazı bulunamadı')} />
        <Link to="/blog" className="mt-6 inline-block text-emerald-700 hover:underline">
          Bloga dön
        </Link>
      </div>
    ) : (
      <BlogDetailView post={data} />
    )

  return <PublicBuilderBlocksPage blocks={blocks} fallback={legacyView} />
}
