import type { BlockBase } from './common'

export type BlogArticleSettings = {
  slug: string
  coverImageUrl: string
  author: string
  publishedAt: string
  category: string
  bodyHtml: string
  showRelatedPosts: boolean
  relatedPostsLimit: number
}

export type BlogArticleBlock = BlockBase & {
  type: 'blog-article'
  settings: BlogArticleSettings
}

export function createDefaultBlogArticleBlock(id: string, sortOrder = 0): BlogArticleBlock {
  return {
    id,
    type: 'blog-article',
    sortOrder,
    title: 'Makale başlığı',
    description: 'Kısa özet metni',
    visibility: {
      enabled: true,
      showTitle: true,
      showDescription: true,
      showImage: true,
      showButton: false,
    },
    style: {
      containerWidth: 'narrow',
      contentAlign: 'left',
      paddingTop: { desktop: '32px', mobile: '24px' },
      paddingBottom: { desktop: '32px', mobile: '24px' },
    },
    settings: {
      slug: '',
      coverImageUrl: '',
      author: 'Woontegra',
      publishedAt: new Date().toISOString().slice(0, 10),
      category: 'Genel',
      bodyHtml: '<p>Makale içeriği buraya gelir.</p>',
      showRelatedPosts: true,
      relatedPostsLimit: 3,
    },
  }
}
