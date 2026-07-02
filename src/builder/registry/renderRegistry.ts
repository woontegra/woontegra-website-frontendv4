import { HeroBlockRenderer } from '@/builder/render/blocks/HeroBlockRenderer'
import { RichTextBlockRenderer } from '@/builder/render/blocks/RichTextBlockRenderer'
import { ImageTextBlockRenderer } from '@/builder/render/blocks/ImageTextBlockRenderer'
import { CardGridBlockRenderer } from '@/builder/render/blocks/CardGridBlockRenderer'
import { CtaBlockRenderer } from '@/builder/render/blocks/CtaBlockRenderer'
import { FaqBlockRenderer } from '@/builder/render/blocks/FaqBlockRenderer'
import { BlogShowcaseBlockRenderer } from '@/builder/render/blocks/BlogShowcaseBlockRenderer'
import { ShowcaseBlockRenderer } from '@/builder/render/blocks/ShowcaseBlockRenderer'
import { ProductsShowcaseBlockRenderer } from '@/builder/render/blocks/ProductsShowcaseBlockRenderer'
import { LegacySectionBlockRenderer } from '@/builder/render/blocks/LegacySectionBlockRenderer'
import { ProductDetailBlockRenderer } from '@/builder/render/blocks/ProductDetailBlockRenderer'
import { BlogArticleBlockRenderer } from '@/builder/render/blocks/BlogArticleBlockRenderer'
import type { ComponentType } from 'react'
import type { BuilderBlock, BlockTypeId } from '@/builder/types'
import { PlaceholderBlockRenderer } from '@/builder/render/blocks/PlaceholderBlockRenderer'

export type BlockRendererProps<T extends BuilderBlock = BuilderBlock> = {
  block: T
  mode?: 'public' | 'preview'
}

export type BlockRendererComponent<T extends BuilderBlock = BuilderBlock> = ComponentType<
  BlockRendererProps<T>
>

const registry = new Map<string, BlockRendererComponent>()

export function registerBlockRenderer(type: BlockTypeId | string, component: BlockRendererComponent): void {
  registry.set(type, component)
}

export function getBlockRenderer(type: string): BlockRendererComponent {
  return registry.get(type) ?? PlaceholderBlockRenderer
}

export function initBlockRenderRegistry(): void {
  registerBlockRenderer('hero', HeroBlockRenderer)
  registerBlockRenderer('rich-text', RichTextBlockRenderer)
  registerBlockRenderer('image-text', ImageTextBlockRenderer)
  registerBlockRenderer('card-grid', CardGridBlockRenderer)
  registerBlockRenderer('cta', CtaBlockRenderer)
  registerBlockRenderer('faq', FaqBlockRenderer)
  registerBlockRenderer('services-showcase', ShowcaseBlockRenderer)
  registerBlockRenderer('products-showcase', ProductsShowcaseBlockRenderer)
  registerBlockRenderer('blog-showcase', BlogShowcaseBlockRenderer)
  registerBlockRenderer('legacy-section', LegacySectionBlockRenderer)
  registerBlockRenderer('product-detail', ProductDetailBlockRenderer)
  registerBlockRenderer('blog-article', BlogArticleBlockRenderer)
}
