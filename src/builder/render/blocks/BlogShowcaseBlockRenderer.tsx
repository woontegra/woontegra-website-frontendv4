import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { BlockRendererProps } from '@/builder/registry/renderRegistry'
import { BlockSectionHeader, SectionBlockShell } from '@/builder/render/SectionBlockShell'
import { renderIfText } from '@/builder/render/renderRules'
import type { BlogShowcaseBlock } from '@/builder/types'
import { BlogCard } from '@/components/public/BlogCard'
import { pickBlogShowcasePosts } from '@/lib/blogShowcasePosts'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { blogService } from '@/services/blogService'

export function BlogShowcaseBlockRenderer({ block, mode = 'public' }: BlockRendererProps) {
  if (block.type !== 'blog-showcase') return null
  const b = block as BlogShowcaseBlock
  if (!b.visibility.enabled) return null

  const hasHeader =
    (b.visibility.showTitle !== false && renderIfText(b.title)) ||
    (b.visibility.showDescription !== false && renderIfText(b.description))

  const { data, isLoading, isError } = useQuery({
    queryKey: ['blog', 'showcase', b.id, b.settings.source, b.settings.limit],
    queryFn: () => blogService.list(),
    ...publicQueryOptions,
  })

  const posts = pickBlogShowcasePosts(data ?? [], b.settings)
  const isPreview = mode === 'preview'

  if (!isPreview && !hasHeader && posts.length === 0) return null
  if (!isPreview && !isLoading && posts.length === 0) return null

  const gridCols =
    posts.length <= 1 ? 'grid-cols-1' : posts.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'

  return (
    <SectionBlockShell style={b.style}>
      <BlockSectionHeader
        title={b.title}
        description={b.description}
        showTitle={b.visibility.showTitle}
        showDescription={b.visibility.showDescription}
      />

      {isLoading ? (
        <div className={`mt-8 grid gap-6 ${gridCols}`}>
          {Array.from({ length: Math.min(b.settings.limit ?? 3, 3) }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : null}

      {!isLoading && isError ? (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Blog yazıları yüklenemedi. Bağlantıyı kontrol edin.
        </p>
      ) : null}

      {!isLoading && !isError && posts.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          {b.settings.source === 'manual'
            ? 'Manuel seçimde gösterilecek yayınlanmış blog yazısı yok. Sağ panelden yazı ekleyin.'
            : 'Gösterilecek yayınlanmış blog yazısı bulunamadı.'}
        </p>
      ) : null}

      {posts.length > 0 ? (
        <>
          <div className={`mt-8 grid gap-6 ${gridCols}`}>
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
        </>
      ) : null}
    </SectionBlockShell>
  )
}
