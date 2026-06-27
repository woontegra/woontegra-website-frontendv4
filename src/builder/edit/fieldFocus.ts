import type { BlockButton, BuilderBlock, CtaBlock, HeroBlock } from '@/builder/types'

export type FieldFocusTarget = {
  sectionId: string
  settingsFieldId?: string
  collapsibleId?: string
}

const CONTENT_SECTION: Record<string, string> = {
  hero: 'content',
  cta: 'content',
  'card-grid': 'grid',
  'rich-text': 'content',
  faq: 'header',
  'services-showcase': 'content',
  'products-showcase': 'content',
  'blog-showcase': 'content',
}

function buttonIndex(block: BuilderBlock, btnId: string): number {
  if (block.type === 'hero') {
    const buttons = (block as HeroBlock).settings.buttons ?? []
    const idx = buttons.findIndex((b: BlockButton) => b.id === btnId)
    return idx >= 0 ? idx : 0
  }
  if (block.type === 'cta') {
    const buttons = (block as CtaBlock).settings.buttons ?? []
    const idx = buttons.findIndex((b: BlockButton) => b.id === btnId)
    return idx >= 0 ? idx : 0
  }
  return 0
}

export function resolveFieldFocus(
  block: BuilderBlock | null,
  fieldPath: string | null,
): FieldFocusTarget | null {
  if (!block || !fieldPath) return null

  const contentSection = CONTENT_SECTION[block.type] ?? 'content'

  if (fieldPath === 'title') {
    return { sectionId: contentSection, settingsFieldId: 'title' }
  }
  if (fieldPath === 'description') {
    return { sectionId: contentSection, settingsFieldId: 'description' }
  }
  if (fieldPath === 'badge') {
    return { sectionId: 'content', settingsFieldId: 'badge' }
  }
  if (fieldPath === 'eyebrow') {
    return { sectionId: 'grid', settingsFieldId: 'eyebrow' }
  }
  if (fieldPath === 'image') {
    return { sectionId: block.type === 'hero' ? 'media' : 'design', settingsFieldId: 'desktop-image' }
  }
  if (fieldPath === 'highlight-text') {
    return { sectionId: 'paragraphs', settingsFieldId: 'highlight-text' }
  }

  const paragraphMatch = fieldPath.match(/^paragraph\.(\d+)$/)
  if (paragraphMatch) {
    return {
      sectionId: 'paragraphs',
      settingsFieldId: `paragraph-${paragraphMatch[1]}`,
    }
  }

  const highlightMatch = fieldPath.match(/^highlight\.([^.]+)\.title$/)
  if (highlightMatch) {
    return {
      sectionId: 'highlights',
      collapsibleId: highlightMatch[1],
      settingsFieldId: `highlight-${highlightMatch[1]}-title`,
    }
  }

  const buttonMatch = fieldPath.match(/^button\.(.+)$/)
  if (buttonMatch) {
    const idx = buttonIndex(block, buttonMatch[1])
    return { sectionId: 'buttons', settingsFieldId: `button-${idx}` }
  }

  const cardTitleMatch = fieldPath.match(/^card\.([^.]+)\.title$/)
  if (cardTitleMatch) {
    const sectionId =
      block.type === 'rich-text' && (block.settings as { variant?: string }).variant?.startsWith('about')
        ? 'side-cards'
        : 'cards'
    return {
      sectionId,
      collapsibleId: cardTitleMatch[1],
      settingsFieldId: `card-${cardTitleMatch[1]}-title`,
    }
  }

  const cardDescMatch = fieldPath.match(/^card\.([^.]+)\.description$/)
  if (cardDescMatch) {
    const sectionId =
      block.type === 'rich-text' && (block.settings as { variant?: string }).variant?.startsWith('about')
        ? 'side-cards'
        : 'cards'
    return {
      sectionId,
      collapsibleId: cardDescMatch[1],
      settingsFieldId: `card-${cardDescMatch[1]}-description`,
    }
  }

  const cardImageMatch = fieldPath.match(/^card\.([^.]+)\.image$/)
  if (cardImageMatch) {
    return {
      sectionId: 'cards',
      collapsibleId: cardImageMatch[1],
      settingsFieldId: `card-${cardImageMatch[1]}-image`,
    }
  }

  const cardHrefMatch = fieldPath.match(/^card\.([^.]+)\.href$/)
  if (cardHrefMatch) {
    return {
      sectionId: 'cards',
      collapsibleId: cardHrefMatch[1],
      settingsFieldId: `card-${cardHrefMatch[1]}-href`,
    }
  }

  const faqQuestionMatch = fieldPath.match(/^item\.([^.]+)\.question$/)
  if (faqQuestionMatch) {
    return {
      sectionId: 'questions',
      collapsibleId: faqQuestionMatch[1],
      settingsFieldId: `faq-${faqQuestionMatch[1]}-question`,
    }
  }

  const faqAnswerMatch = fieldPath.match(/^item\.([^.]+)\.answer$/)
  if (faqAnswerMatch) {
    return {
      sectionId: 'questions',
      collapsibleId: faqAnswerMatch[1],
      settingsFieldId: `faq-${faqAnswerMatch[1]}-answer`,
    }
  }

  return null
}

export function resolveFieldLabel(fieldPath: string): string {
  if (fieldPath === 'title') return 'Başlık'
  if (fieldPath === 'description') return 'Açıklama'
  if (fieldPath === 'badge') return 'Badge'
  if (fieldPath === 'eyebrow') return 'Üst başlık'
  if (fieldPath === 'image') return 'Görsel'
  if (fieldPath === 'highlight-text') return 'Vurgu metni'

  const paragraphMatch = fieldPath.match(/^paragraph\.(\d+)$/)
  if (paragraphMatch) return `Paragraf ${Number(paragraphMatch[1]) + 1}`

  const highlightMatch = fieldPath.match(/^highlight\.([^.]+)\.title$/)
  if (highlightMatch) return 'Hero kartı'

  const buttonMatch = fieldPath.match(/^button\.(.+)$/)
  if (buttonMatch) return 'Buton'

  const cardTitleMatch = fieldPath.match(/^card\.([^.]+)\.title$/)
  if (cardTitleMatch) return 'Kart Başlığı'

  const cardDescMatch = fieldPath.match(/^card\.([^.]+)\.description$/)
  if (cardDescMatch) return 'Kart Açıklaması'

  const cardImageMatch = fieldPath.match(/^card\.([^.]+)\.image$/)
  if (cardImageMatch) return 'Marka görseli'

  const cardHrefMatch = fieldPath.match(/^card\.([^.]+)\.href$/)
  if (cardHrefMatch) return 'Marka linki'

  const faqQ = fieldPath.match(/^item\.([^.]+)\.question$/)
  if (faqQ) return 'Soru'

  const faqA = fieldPath.match(/^item\.([^.]+)\.answer$/)
  if (faqA) return 'Cevap'

  return fieldPath
}
