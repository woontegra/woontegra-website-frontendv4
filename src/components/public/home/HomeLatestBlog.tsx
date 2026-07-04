import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BlogCard } from '@/components/public/BlogCard'
import { BlogCardSkeleton } from '@/components/public/BlogCardSkeleton'
import { SectionHeader } from '@/components/public/SectionHeader'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { blogService } from '@/services/blogService'

const SKELETON_COUNT = 3

export function HomeLatestBlog() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['blog', 'home-latest'],
    queryFn: () => blogService.list(),
    ...publicQueryOptions,
  })

  const posts = (data ?? []).slice(0, 3)

  if (isError) return null

  if (!isLoading && posts.length === 0) return null

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Blog"
          title="Son Yazılar"
          description="Dijital dönüşüm, yazılım ve e-ticaret üzerine güncel içerikler."
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: SKELETON_COUNT }).map((_, i) => <BlogCardSkeleton key={`sk-${i}`} />)
            : posts.map((post) => <BlogCard key={post.id} post={post} />)}
        </div>

        {!isLoading && posts.length > 0 ? (
          <div className="mt-10 text-center">
            <Link
              to="/blog"
              className="inline-flex rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Tüm Yazıları Gör
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  )
}
