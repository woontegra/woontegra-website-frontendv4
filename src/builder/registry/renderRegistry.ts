import type { ComponentType } from 'react'
import type { BuilderBlock } from '@/builder/types'

export type BlockRendererProps<T extends BuilderBlock = BuilderBlock> = {
  block: T
  mode?: 'public' | 'preview'
}

export type BlockRendererComponent<T extends BuilderBlock = BuilderBlock> = ComponentType<
  BlockRendererProps<T>
>

type BlockLoader = () => Promise<{ default: BlockRendererComponent }>

/** Public sayfada blok renderer'ları route bazında lazy yüklenir — ana bundle şişmez. */
export const blockRendererLoaders: Record<string, BlockLoader> = {
  hero: () =>
    import('@/builder/render/blocks/HeroBlockRenderer').then((m) => ({ default: m.HeroBlockRenderer })),
  'rich-text': () =>
    import('@/builder/render/blocks/RichTextBlockRenderer').then((m) => ({ default: m.RichTextBlockRenderer })),
  'image-text': () =>
    import('@/builder/render/blocks/ImageTextBlockRenderer').then((m) => ({ default: m.ImageTextBlockRenderer })),
  'card-grid': () =>
    import('@/builder/render/blocks/CardGridBlockRenderer').then((m) => ({ default: m.CardGridBlockRenderer })),
  cta: () => import('@/builder/render/blocks/CtaBlockRenderer').then((m) => ({ default: m.CtaBlockRenderer })),
  faq: () => import('@/builder/render/blocks/FaqBlockRenderer').then((m) => ({ default: m.FaqBlockRenderer })),
  'services-showcase': () =>
    import('@/builder/render/blocks/ShowcaseBlockRenderer').then((m) => ({ default: m.ShowcaseBlockRenderer })),
  'products-showcase': () =>
    import('@/builder/render/blocks/ProductsShowcaseBlockRenderer').then((m) => ({
      default: m.ProductsShowcaseBlockRenderer,
    })),
  'blog-showcase': () =>
    import('@/builder/render/blocks/BlogShowcaseBlockRenderer').then((m) => ({
      default: m.BlogShowcaseBlockRenderer,
    })),
  'legacy-section': () =>
    import('@/builder/render/blocks/LegacySectionBlockRenderer').then((m) => ({
      default: m.LegacySectionBlockRenderer,
    })),
  'product-detail': () =>
    import('@/builder/render/blocks/ProductDetailBlockRenderer').then((m) => ({
      default: m.ProductDetailBlockRenderer,
    })),
  'blog-article': () =>
    import('@/builder/render/blocks/BlogArticleBlockRenderer').then((m) => ({
      default: m.BlogArticleBlockRenderer,
    })),
}

export function getBlockRendererLoader(type: string): BlockLoader {
  return (
    blockRendererLoaders[type] ??
    (() =>
      import('@/builder/render/blocks/PlaceholderBlockRenderer').then((m) => ({
        default: m.PlaceholderBlockRenderer,
      })))
  )
}
