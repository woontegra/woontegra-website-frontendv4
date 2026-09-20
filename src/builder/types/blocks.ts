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
import type { MkSaasPurchaseBlock } from './mkSaasPurchase'
import type { WhatsAppGuideBlock } from './whatsappGuide'
import type { MkCompareTableBlock } from './mkCompareTable'
import type { MkCompareDetailsBlock } from './mkCompareDetails'
import type { KoopPlusProductBlock } from './koopplusProduct'
import type { CalloutBlock, GalleryBlock, VideoEmbedBlock } from './contentBlocks'

export type BuilderBlock =
  | HeroBlock
  | RichTextBlock
  | ImageTextBlock
  | CardGridBlock
  | CtaBlock
  | FaqBlock
  | VideoEmbedBlock
  | CalloutBlock
  | GalleryBlock
  | ProductsShowcaseBlock
  | BlogShowcaseBlock
  | ServicesShowcaseBlock
  | ProductDetailBlock
  | BlogArticleBlock
  | MkSaasPurchaseBlock
  | WhatsAppGuideBlock
  | MkCompareTableBlock
  | MkCompareDetailsBlock
  | KoopPlusProductBlock
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
  | 'video-embed'
  | 'callout'
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
  | 'mk-saas-purchase'
  | 'whatsapp-guide'
  | 'mk-compare-table'
  | 'mk-compare-details'
  | 'koopplus-product'

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
  'video-embed': 'Video Embed',
  callout: 'Callout',
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
  'mk-saas-purchase': 'Ürün Satın Alma',
  'whatsapp-guide': 'WhatsApp Geçiş Rehberi',
  'mk-compare-table': 'Sürüm Karşılaştırması',
  'mk-compare-details': 'Sürüm Detay Sekmeleri',
  'koopplus-product': 'KoopPlus Satış Sayfası',
}
