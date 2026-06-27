import { Breadcrumbs } from '@/components/public/Breadcrumbs'
import { MediaImage } from '@/media/components/MediaImage'
import { pickBlogCoverUrl } from '@/lib/publicContentImages'
import { formatBlogDate, type PublicBlogPost } from '@/types/blog'

type Props = {
  post: PublicBlogPost
}

export function BlogDetailView({ post: data }: Props) {
  const coverUrl = pickBlogCoverUrl(data)

  return (
    <article className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <Breadcrumbs
          items={[
            { label: 'Ana Sayfa', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: data.title },
          ]}
        />

        <header className="mt-6 border-b border-slate-200 pb-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            {data.category?.name ? (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-medium text-emerald-700">
                {data.category.name}
              </span>
            ) : null}
            <time dateTime={data.publishedAt || data.createdAt}>
              {formatBlogDate(data.publishedAt || data.createdAt)}
            </time>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{data.title}</h1>
          {data.excerpt ? <p className="mt-4 text-lg leading-relaxed text-slate-600">{data.excerpt}</p> : null}
        </header>

        {coverUrl ? (
          <div className="mt-8 overflow-hidden rounded-xl border border-slate-200">
            <MediaImage src={coverUrl} alt={data.title} loading="eager" className="aspect-[16/9] w-full object-cover" />
          </div>
        ) : null}

        <div className="prose prose-slate mt-8 max-w-none" dangerouslySetInnerHTML={{ __html: data.bodyHtml }} />
      </div>
    </article>
  )
}
