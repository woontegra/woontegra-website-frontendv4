import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { BlogDetailView } from '@/components/public/blog/BlogDetailView'
import { LoadingState } from '@/components/public/LoadingState'
import { ErrorState } from '@/components/public/ErrorState'
import { usePageMeta } from '@/hooks/usePageMeta'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { blogService } from '@/services/blogService'
import { getErrorMessage } from '@/api/client'

export function BlogDetailPage() {
  const { slug = '' } = useParams()

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

  if (isPending) return <LoadingState />
  if (isError || !data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24">
        <ErrorState message={getErrorMessage(error, 'Yazı bulunamadı')} />
        <Link to="/blog" className="mt-6 inline-block text-emerald-700 hover:underline">
          Bloga dön
        </Link>
      </div>
    )
  }

  return <BlogDetailView post={data} />
}
