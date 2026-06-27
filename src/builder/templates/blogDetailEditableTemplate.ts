import type { BuilderBlock } from '@/builder/types/blocks'
import type { BlogArticleBlock } from '@/builder/types/blogArticle'
import { createDefaultBlogArticleBlock } from '@/builder/types/blogArticle'
import { createDefaultBlogShowcaseBlock, createDefaultCtaBlock } from '@/builder/types/blockModels'
import { assignSortOrder } from '@/builder/load/parseBuilderBlocks'

function blockId(slug: string, part: string): string {
  return `blog-${slug}-${part}`
}

function extractBlogOverride(raw: Record<string, unknown> | null, slug: string): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object') return null
  const pages = raw.pages as Record<string, unknown> | undefined
  const page = pages?.[slug]
  return page && typeof page === 'object' ? (page as Record<string, unknown>) : null
}

export function createBlogDetailEditableTemplate(
  slug: string,
  title: string,
  raw: Record<string, unknown> | null,
): BuilderBlock[] {
  const override = extractBlogOverride(raw, slug)
  const article = createDefaultBlogArticleBlock(blockId(slug, 'article'), 0)
  article.title = String(override?.title ?? title)
  article.description = String(override?.excerpt ?? 'Blog yazısı özeti')
  article.settings.slug = slug
  article.settings.coverImageUrl = String(override?.coverImageUrl ?? override?.featuredImage ?? '')
  article.settings.author = String(override?.author ?? 'Woontegra')
  article.settings.category = String(override?.category ?? 'Genel')
  article.settings.bodyHtml = String(override?.bodyHtml ?? '<p>Makale içeriği buraya gelir.</p>')
  article.settings.publishedAt = String(override?.publishedAt ?? new Date().toISOString().slice(0, 10))

  const related = createDefaultBlogShowcaseBlock(1)
  related.id = blockId(slug, 'related')
  related.title = 'İlgili yazılar'
  related.description = 'Benzer içerikler'
  related.settings.limit = 3

  const cta = createDefaultCtaBlock(2)
  cta.id = blockId(slug, 'cta')
  cta.title = 'Daha fazla içerik'
  cta.description = 'Blog arşivimizi keşfedin'
  cta.settings.buttons = [
    { id: `${slug}-cta-blog`, label: 'Tüm Yazılar', href: '/blog', visible: true, variant: 'primary' },
    { id: `${slug}-cta-contact`, label: 'İletişim', href: '/iletisim', visible: true, variant: 'outline' },
  ]

  const blocks: BuilderBlock[] = [article as BlogArticleBlock, related, cta]
  return assignSortOrder(blocks)
}
