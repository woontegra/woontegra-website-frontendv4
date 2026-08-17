import type {
  BuilderBlock,
  CardGridBlock,
  CtaBlock,
  FaqBlock,
  HeroBlock,
  ImageTextBlock,
  RichTextBlock,
  WhatsAppGuideBlock,
} from '@/builder/types'
import { heroRequiresImage } from '@/builder/types'
import {
  whatsAppGuidePlatformStepsComplete,
  whatsAppGuideStepHasImage,
} from '@/builder/types/whatsappGuide'
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
    case 'mk-saas-purchase':
    case 'whatsapp-guide':
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

  const purchaseBlocks = blocks.filter((b) => b.type === 'mk-saas-purchase' && b.visibility.enabled)
  if (purchaseBlocks.length > 1) {
    issues.push({
      field: 'mk-saas-purchase',
      message: 'Sayfada yalnızca bir Ürün Satın Alma bloğu olabilir.',
    })
  }

  for (const block of blocks) {
    if (!block.visibility.enabled || block.type !== 'whatsapp-guide') continue
    const guide = block as WhatsAppGuideBlock
    const { settings } = guide

    if (settings.androidEnabled) {
      const visible = settings.androidSteps.filter((s) => s.visible)
      for (const step of visible) {
        if (!step.title.trim() || !step.imageAlt.trim() || !whatsAppGuideStepHasImage(step)) {
          issues.push({
            blockId: block.id,
            field: `whatsapp.android.step.${step.stepNumber}`,
            message: `Android adım ${step.stepNumber}: başlık, görsel ve alt metin zorunlu.`,
          })
        }
      }
    }

    if (settings.iphoneEnabled) {
      if (!whatsAppGuidePlatformStepsComplete(settings.iphoneSteps)) {
        issues.push({
          blockId: block.id,
          field: 'whatsapp.iphone',
          message: 'iPhone etkin; tüm görünür iPhone adımlarında görsel ve alt metin zorunlu.',
        })
      }
    }

    if (settings.connectionStep.visible) {
      const step = settings.connectionStep
      if (!step.title.trim() || !step.imageAlt.trim() || !whatsAppGuideStepHasImage(step)) {
        issues.push({
          blockId: block.id,
          field: 'whatsapp.connection',
          message: 'MK Meta bağlantı adımı: başlık, görsel ve alt metin zorunlu.',
        })
      }
    }
  }

  return { ok: issues.length === 0, issues }
}
