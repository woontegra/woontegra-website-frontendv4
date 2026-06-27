import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BlogCard } from '@/components/public/BlogCard'
import { SectionHeader } from '@/components/public/SectionHeader'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { blogService } from '@/services/blogService'

export function HomeLatestBlog() {
  const { data } = useQuery({
    queryKey: ['blog', 'home-latest'],
    queryFn: () => blogService.list(),
    ...publicQueryOptions,
  })

  const posts = (data ?? []).slice(0, 3)
  if (!posts.length) return null

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Blog"
          title="Son Yazılar"
          description="Dijital dönüşüm, yazılım ve e-ticaret üzerine güncel içerikler."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/blog"
            className="inline-flex rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Tüm Yazıları Gör
          </Link>
        </div>
      </div>
    </section>
  )
}
