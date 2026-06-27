import type { BlockBase, BlockButton, BlockStyle, BlockVisibility } from './common'
import { createDefaultHeroBlock, type HeroBlock } from './hero'

export type MvpBlockTypeId =
  | 'hero'
  | 'rich-text'
  | 'image-text'
  | 'card-grid'
  | 'cta'
  | 'faq'
  | 'services-showcase'
  | 'products-showcase'
  | 'blog-showcase'

export type CardGridItem = {
  id: string
  title: string
  description: string
  imageUrl?: string
  icon?: string
  href?: string
  buttonLabel?: string
  color?: string
}

export type RichTextVariant = 'default' | 'about-split' | 'about-structure' | 'about-vision'

export type RichTextBlock = BlockBase & {
  type: 'rich-text'
  settings: {
    body?: string
    variant?: RichTextVariant
    paragraphs?: string[]
    highlight?: string
    sideCards?: CardGridItem[]
  }
}

export type ImageTextBlock = BlockBase & {
  type: 'image-text'
  settings: {
    imageUrl?: string
    imageAlt?: string
    imagePosition: 'left' | 'right'
    button?: BlockButton
  }
}

export type CardGridVariant =
  | 'default'
  | 'intro'
  | 'icon-dark'
  | 'logo'
  | 'steps'
  | 'why'
  | 'solutions'
  | 'timeline'
  | 'about-brands'

export type CardGridBlock = BlockBase & {
  type: 'card-grid'
  settings: {
    columns: 2 | 3 | 4
    cards: CardGridItem[]
    variant?: CardGridVariant
    eyebrow?: string
  }
}

export type CtaBlock = BlockBase & {
  type: 'cta'
  settings: {
    backgroundType: 'gradient' | 'solid' | 'image'
    gradient?: string
    imageUrl?: string
    borderRadius?: string
    buttons: BlockButton[]
    variant?: 'default' | 'about'
  }
}

export type FaqItem = {
  id: string
  question: string
  answer: string
}

export type FaqBlock = BlockBase & {
  type: 'faq'
  settings: { items: FaqItem[] }
}

export type ProductShowcaseSource =
  | 'manual'
  | 'category'
  | 'recent'
  | 'campaign'
  | 'bestseller'
  | 'featured'

export type ProductsShowcaseBlock = BlockBase & {
  type: 'products-showcase'
  settings: {
    source: ProductShowcaseSource
    categoryId?: string
    limit: number
    manualProductIds?: string[]
    showPrice?: boolean
    showAddToCart?: boolean
  }
}

export type BlogShowcaseSource = 'recent' | 'category' | 'tag' | 'manual'

export type BlogShowcaseBlock = BlockBase & {
  type: 'blog-showcase'
  settings: {
    source: BlogShowcaseSource
    categoryId?: string
    tag?: string
    limit: number
    manualPostIds?: string[]
  }
}

export type ServicesShowcaseSource = 'manual' | 'category' | 'featured'

export type ServicesShowcaseBlock = BlockBase & {
  type: 'services-showcase'
  settings: {
    source: ServicesShowcaseSource
    categoryId?: string
    limit: number
    manualServiceIds?: string[]
  }
}

export type ShowcaseBlock = ProductsShowcaseBlock | BlogShowcaseBlock | ServicesShowcaseBlock

export type TypedBuilderBlock =
  | HeroBlock
  | RichTextBlock
  | ImageTextBlock
  | CardGridBlock
  | CtaBlock
  | FaqBlock
  | ProductsShowcaseBlock
  | BlogShowcaseBlock
  | ServicesShowcaseBlock

function baseStyle(): BlockStyle {
  return {
    containerWidth: 'default',
    contentAlign: 'left',
    paddingTop: { desktop: '48px', mobile: '32px' },
    paddingBottom: { desktop: '48px', mobile: '32px' },
  }
}

function baseVisibility(): BlockVisibility {
  return {
    enabled: true,
    showTitle: true,
    showDescription: true,
    showImage: true,
    showButton: true,
  }
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function createDefaultRichTextBlock(sortOrder: number): RichTextBlock {
  return {
    id: uid('rich-text'),
    type: 'rich-text',
    sortOrder,
    title: 'Metin bloğu',
    description: 'Kısa açıklama metni buraya gelebilir.',
    visibility: baseVisibility(),
    style: baseStyle(),
    settings: { body: '' },
  }
}

export function createDefaultImageTextBlock(sortOrder: number): ImageTextBlock {
  return {
    id: uid('image-text'),
    type: 'image-text',
    sortOrder,
    title: 'Görsel ve metin',
    description: 'Görselin yanında metin alanı.',
    visibility: baseVisibility(),
    style: baseStyle(),
    settings: {
      imagePosition: 'left',
      button: { id: uid('btn'), label: 'Detay', href: '/', visible: true, variant: 'primary' },
    },
  }
}

export function createDefaultCardGridBlock(sortOrder: number): CardGridBlock {
  return {
    id: uid('card-grid'),
    type: 'card-grid',
    sortOrder,
    title: 'Kart grid',
    description: 'Öne çıkan kartlar',
    visibility: baseVisibility(),
    style: baseStyle(),
    settings: {
      columns: 3,
      cards: [
        { id: uid('card'), title: 'Kart 1', description: 'Kısa açıklama', icon: 'sparkles', color: '#059669' },
        { id: uid('card'), title: 'Kart 2', description: 'Kısa açıklama', icon: 'layers', color: '#0d9488' },
        { id: uid('card'), title: 'Kart 3', description: 'Kısa açıklama', icon: 'zap', color: '#0891b2' },
      ],
    },
  }
}

export function createDefaultCtaBlock(sortOrder: number): CtaBlock {
  return {
    id: uid('cta'),
    type: 'cta',
    sortOrder,
    title: 'Harekete geçin',
    description: 'Projeniz için bizimle iletişime geçin.',
    visibility: { ...baseVisibility(), showImage: false },
    style: { ...baseStyle(), containerWidth: 'default' },
    settings: {
      backgroundType: 'gradient',
      gradient: 'linear-gradient(135deg, #059669, #0d9488)',
      borderRadius: '16px',
      buttons: [
        { id: uid('btn'), label: 'İletişime Geç', href: '/iletisim', visible: true, variant: 'primary' },
        { id: uid('btn'), label: 'Hizmetler', href: '/hizmetler', visible: true, variant: 'outline' },
      ],
    },
  }
}

export function createDefaultFaqBlock(sortOrder: number): FaqBlock {
  return {
    id: uid('faq'),
    type: 'faq',
    sortOrder,
    title: 'Sık sorulan sorular',
    description: '',
    visibility: baseVisibility(),
    style: baseStyle(),
    settings: {
      items: [
        { id: uid('faq'), question: 'Soru 1?', answer: 'Cevap metni buraya yazılır.' },
        { id: uid('faq'), question: 'Soru 2?', answer: 'Cevap metni buraya yazılır.' },
      ],
    },
  }
}

export function createDefaultProductsShowcaseBlock(sortOrder: number): ProductsShowcaseBlock {
  return {
    id: uid('products-showcase'),
    type: 'products-showcase',
    sortOrder,
    title: 'Yazılımlarımız',
    description: 'Öne çıkan ürünler',
    visibility: baseVisibility(),
    style: baseStyle(),
    settings: { source: 'featured', limit: 4, manualProductIds: [], showPrice: true, showAddToCart: true },
  }
}

export function createDefaultBlogShowcaseBlock(sortOrder: number): BlogShowcaseBlock {
  return {
    id: uid('blog-showcase'),
    type: 'blog-showcase',
    sortOrder,
    title: 'Son blog yazıları',
    description: 'Güncel içerikler',
    visibility: baseVisibility(),
    style: baseStyle(),
    settings: { source: 'recent', limit: 3, manualPostIds: [] },
  }
}

export function createDefaultServicesShowcaseBlock(sortOrder: number): ServicesShowcaseBlock {
  return {
    id: uid('services-showcase'),
    type: 'services-showcase',
    sortOrder,
    title: 'Hizmetlerimiz',
    description: 'Sunduğumuz hizmetler',
    visibility: baseVisibility(),
    style: baseStyle(),
    settings: { source: 'featured', limit: 3, manualServiceIds: [] },
  }
}

export function createBlockByType(type: MvpBlockTypeId, sortOrder: number): TypedBuilderBlock | HeroBlock {
  switch (type) {
    case 'hero':
      return createDefaultHeroBlock(uid('hero'), sortOrder)
    case 'rich-text':
      return createDefaultRichTextBlock(sortOrder)
    case 'image-text':
      return createDefaultImageTextBlock(sortOrder)
    case 'card-grid':
      return createDefaultCardGridBlock(sortOrder)
    case 'cta':
      return createDefaultCtaBlock(sortOrder)
    case 'faq':
      return createDefaultFaqBlock(sortOrder)
    case 'services-showcase':
      return createDefaultServicesShowcaseBlock(sortOrder)
    case 'products-showcase':
      return createDefaultProductsShowcaseBlock(sortOrder)
    case 'blog-showcase':
      return createDefaultBlogShowcaseBlock(sortOrder)
    default:
      return createDefaultRichTextBlock(sortOrder)
  }
}

export const BUILDER_MVP_BLOCK_TYPES: MvpBlockTypeId[] = [
  'hero',
  'rich-text',
  'image-text',
  'card-grid',
  'cta',
  'faq',
  'services-showcase',
  'products-showcase',
  'blog-showcase',
]
