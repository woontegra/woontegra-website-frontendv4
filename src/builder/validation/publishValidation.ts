import type {
  BuilderBlock,
  CardGridBlock,
  CtaBlock,
  FaqBlock,
  HeroBlock,
  ImageTextBlock,
  RichTextBlock,
} from '@/builder/types'
import { heroRequiresImage } from '@/builder/types'
import { renderIfMediaUrl, renderIfText } from '@/builder/render/renderRules'

export type PublishIssue = {
  blockId?: string
  field: string
  message: string
}

export type PublishValidationResult = {
  ok: boolean
  issues: PublishIssue[]
}

function hasVisibleContent(block: BuilderBlock): boolean {
  if (!block.visibility.enabled) return false
  if (renderIfText(block.title) || renderIfText(block.description)) return true

  switch (block.type) {
    case 'rich-text':
      return Boolean(renderIfText((block as RichTextBlock).settings.body))
    case 'image-text': {
      const b = block as ImageTextBlock
      return Boolean(
        (b.visibility.showImage !== false && renderIfMediaUrl(b.settings.imageUrl)) ||
          (b.settings.button?.visible !== false && renderIfText(b.settings.button?.label)),
      )
    }
    case 'card-grid':
      return (block as CardGridBlock).settings.cards.some(
        (c) => renderIfText(c.title) || renderIfText(c.description),
      )
    case 'cta':
      return (block as CtaBlock).settings.buttons.some(
        (btn) => btn.visible !== false && renderIfText(btn.label) && renderIfText(btn.href),
      )
    case 'faq':
      return (block as FaqBlock).settings.items.some(
        (item) => renderIfText(item.question) && renderIfText(item.answer),
      )
    case 'hero':
    case 'services-showcase':
    case 'products-showcase':
    case 'blog-showcase':
      return true
    default:
      return false
  }
}

/**
 * Admin yayın kontrolü — boş sayfa engellenir; zorunlu görsel kuralları uygulanır.
 */
export function validateBlocksForPublish(blocks: BuilderBlock[]): PublishValidationResult {
  const issues: PublishIssue[] = []
  const enabled = blocks.filter((b) => b.visibility.enabled)

  if (enabled.length === 0 || !enabled.some(hasVisibleContent)) {
    issues.push({
      field: 'page',
      message: 'Boş sayfa yayınlanamaz. En az bir aktif blok ekleyin.',
    })
  }

  for (const block of blocks) {
    if (!block.visibility.enabled) continue

    if (block.type === 'hero') {
      const hero = block as HeroBlock
      const { settings, visibility } = hero
      const needsImage = settings.mode !== 'gradient' && visibility.showImage !== false
      if (needsImage && !heroRequiresImage(settings)) {
        issues.push({
          blockId: block.id,
          field: 'hero.image',
          message: 'Hero görseli zorunlu (gradient modunda değil ve görsel göster açık).',
        })
      }
    }

    if (block.type === 'image-text') {
      const b = block as ImageTextBlock
      const needsImage = b.visibility.showImage !== false
      if (needsImage && !renderIfMediaUrl(b.settings.imageUrl)) {
        issues.push({
          blockId: block.id,
          field: 'image-text.image',
          message: 'Görsel + Metin bloğunda görsel eksik (görsel göster açık).',
        })
      }
    }
  }

  return { ok: issues.length === 0, issues }
}
