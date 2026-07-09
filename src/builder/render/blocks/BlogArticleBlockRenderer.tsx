import type { BlockRendererProps } from '@/builder/registry/renderRegistry'
import { BuilderField } from '@/builder/edit/BuilderField'
import { MediaImage } from '@/media/components/MediaImage'
import { hasPublicImage } from '@/media/resolvePublicImage'
import type { BlogArticleBlock } from '@/builder/types/blogArticle'

export function BlogArticleBlockRenderer({ block }: BlockRendererProps) {
  if (block.type !== 'blog-article') return null
  const b = block as BlogArticleBlock
  if (!b.visibility.enabled) return null

  const s = b.settings

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-4 flex flex-wrap gap-3 text-xs text-slate-500">
        <BuilderField path="category" label="Kategori" type="text">
          <span className="rounded-full bg-slate-100 px-2 py-1">{s.category}</span>
        </BuilderField>
        <BuilderField path="publishedAt" label="Tarih" type="text">
          <time>{s.publishedAt}</time>
        </BuilderField>
        <BuilderField path="author" label="Yazar" type="text">
          <span>{s.author}</span>
        </BuilderField>
      </div>

      <BuilderField path="title" label="Makale başlığı" type="text" className="w-fit max-w-full">
        <h1 className="text-3xl font-bold text-slate-900">{b.title}</h1>
      </BuilderField>

      <BuilderField path="description" label="Özet" type="text" className="mt-3 w-fit max-w-full">
        <p className="text-lg text-slate-600">{b.description}</p>
      </BuilderField>

      {hasPublicImage(s) ? (
        <BuilderField path="coverImage" label="Kapak görseli" type="media" className="mt-6">
          <MediaImage
            input={s}
            alt={b.title ?? ''}
            className="w-full rounded-xl object-cover"
            loading="eager"
            optimizeWidth={1200}
          />
        </BuilderField>
      ) : null}

      <BuilderField path="bodyHtml" label="İçerik" type="text" className="mt-8">
        <div
          className="prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: s.bodyHtml }}
        />
      </BuilderField>
    </article>
  )
}
