import type { BlockBase } from './common'
import type { HeroBlock } from './hero'
import type {
  CardGridBlock,
  CtaBlock,
  FaqBlock,
  ImageTextBlock,
  RichTextBlock,
  ProductsShowcaseBlock,
  BlogShowcaseBlock,
  ServicesShowcaseBlock,
} from './blockModels'
import type { LegacySectionBlock } from './legacySection'
import type { ProductDetailBlock } from './productDetail'
import type { BlogArticleBlock } from './blogArticle'

export type BuilderBlock =
  | HeroBlock
  | RichTextBlock
  | ImageTextBlock
  | CardGridBlock
  | CtaBlock
  | FaqBlock
  | ProductsShowcaseBlock
  | BlogShowcaseBlock
  | ServicesShowcaseBlock
  | ProductDetailBlock
  | BlogArticleBlock
  | LegacySectionBlock
  | GenericBlockPlaceholder

export type GenericBlockPlaceholder = BlockBase & {
  type: string
  settings?: Record<string, unknown>
  items?: unknown[]
}

export type BlockTypeId =
  | 'hero'
  | 'rich-text'
  | 'image-text'
  | 'card-grid'
  | 'services-showcase'
  | 'products-showcase'
  | 'blog-showcase'
  | 'cta'
  | 'faq'
  | 'gallery'
  | 'process-steps'
  | 'stats'
  | 'testimonials'
  | 'logo-strip'
  | 'contact'
  | 'form'
  | 'legacy-section'
  | 'legacy-html'
  | 'product-detail'
  | 'blog-article'

export const BLOCK_TYPE_LABELS: Record<BlockTypeId, string> = {
  hero: 'Hero',
  'rich-text': 'Metin',
  'image-text': 'Görsel + Metin',
  'card-grid': 'Kart Grid',
  'services-showcase': 'Hizmet Vitrini',
  'products-showcase': 'Ürün Vitrini',
  'blog-showcase': 'Blog Vitrini',
  cta: 'CTA',
  faq: 'SSS',
  gallery: 'Galeri',
  'process-steps': 'Süreç Adımları',
  stats: 'İstatistik',
  testimonials: 'Referans / Yorum',
  'logo-strip': 'Logo / Marka',
  contact: 'İletişim',
  form: 'Form',
  'legacy-section': 'Legacy Bölüm',
  'legacy-html': 'Eski HTML',
  'product-detail': 'Ürün Detay (PDP)',
  'blog-article': 'Blog Makalesi',
}
