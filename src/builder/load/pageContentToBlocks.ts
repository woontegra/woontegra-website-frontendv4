/**
 * GEÇİŞ ARACI — "Builder'a dönüştür" ile legacy sayfadan düzenlenebilir blok listesi üretir.
 * Canvas yüklemede otomatik kullanılmaz; yalnızca dönüştürme / migration için.
 */
import type { BuilderBlock } from '@/builder/types/blocks'
import type { HeroBlock } from '@/builder/types/hero'
import { createDefaultHeroBlock } from '@/builder/types/hero'
import {
  createDefaultBlogShowcaseBlock,
  createDefaultCardGridBlock,
  createDefaultCtaBlock,
  createDefaultFaqBlock,
  createDefaultProductsShowcaseBlock,
  createDefaultRichTextBlock,
  createDefaultServicesShowcaseBlock,
  type CardGridBlock,
} from '@/builder/types/blockModels'
import type { BuilderPageDefinition } from '@/builder/pages/builderPageRegistry'
import { normalizeAboutContent } from '@/types/aboutPageContent'
import { defaultLegalCookiePage, type LegalPageContent } from '@/data/legalPageDefaults'
import {
  defaultServicesPageContent,
  defaultSolutionsPageContent,
  mergeMarketingPageContent,
  type MarketingPageContent,
} from '@/types/marketingPageContent'
import { defaultContactContent, normalizeContactContent } from '@/types/pageContent'
import { normalizeHomePageContent, type HomePageContent } from '@/types/homePageContent'
import { assignSortOrder } from '@/builder/load/parseBuilderBlocks'

function importedId(prefix: string, order: number): string {
  return `imported-${prefix}-${order}`
}

function buildHeroFromFields(
  order: number,
  fields: {
    title?: string
    description?: string
    image?: string
    button1Text?: string
    button1Href?: string
    button2Text?: string
    button2Href?: string
    gradient?: boolean
  },
): HeroBlock {
  const hero = createDefaultHeroBlock(importedId('hero', order), order)
  hero.title = fields.title ?? ''
  hero.description = fields.description ?? ''

  if (fields.image?.trim()) {
    hero.settings.mode = 'single-image'
    hero.settings.desktopImage = { url: fields.image.trim() }
    hero.settings.mobileImage = { url: fields.image.trim() }
  } else if (fields.gradient) {
    hero.settings.mode = 'gradient'
    hero.settings.gradient = 'linear-gradient(135deg, #1e293b, #065f46)'
  }

  const buttons = []
  if (fields.button1Text?.trim()) {
    buttons.push({
      id: importedId('btn1', order),
      label: fields.button1Text,
      href: fields.button1Href ?? '/',
      visible: true,
      variant: 'primary' as const,
    })
  }
  if (fields.button2Text?.trim()) {
    buttons.push({
      id: importedId('btn2', order),
      label: fields.button2Text,
      href: fields.button2Href ?? '/',
      visible: true,
      variant: 'outline' as const,
    })
  }
  if (buttons.length > 0) hero.settings.buttons = buttons

  return hero
}

function buildCtaFromFields(
  order: number,
  fields: { title?: string; description?: string; buttonText?: string; buttonHref?: string },
): BuilderBlock {
  const cta = createDefaultCtaBlock(order)
  cta.id = importedId('cta', order)
  cta.title = fields.title ?? cta.title
  cta.description = fields.description ?? cta.description
  if (fields.buttonText?.trim()) {
    cta.settings.buttons = [
      {
        id: importedId('cta-btn', order),
        label: fields.buttonText,
        href: fields.buttonHref ?? '/iletisim',
        visible: true,
        variant: 'primary',
      },
      ...cta.settings.buttons.slice(1),
    ]
  }
  return cta
}

function cardGridFromItems(
  order: number,
  title: string,
  description: string,
  items: { title: string; description: string; imageUrl?: string; href?: string; icon?: string; color?: string }[],
): CardGridBlock {
  const grid = createDefaultCardGridBlock(order)
  grid.id = importedId('grid', order)
  grid.title = title
  grid.description = description
  grid.settings.cards = items.map((item, i) => ({
    id: importedId(`card-${i}`, order),
    title: item.title,
    description: item.description,
    imageUrl: item.imageUrl,
    href: item.href,
    icon: item.icon,
    color: item.color,
  }))
  return grid
}

export function homePageContentToBlocks(content: HomePageContent): BuilderBlock[] {
  const blocks: BuilderBlock[] = []
  let order = 0

  if (content.hero.enabled) {
    blocks.push(
      buildHeroFromFields(order++, {
        title: content.hero.title,
        description: content.hero.subtitle,
        image: content.hero.image,
        button1Text: content.hero.button1Text,
        button1Href: content.hero.button1Href,
        button2Text: content.hero.button2Text,
        button2Href: content.hero.button2Href,
        gradient: !content.hero.image?.trim(),
      }),
    )
  }

  if (content.intro.enabled) {
    const intro = createDefaultRichTextBlock(order++)
    intro.id = importedId('intro', order)
    intro.title = content.intro.title
    intro.description = content.intro.eyebrow
    intro.settings.body = [content.intro.text1, content.intro.text2].filter(Boolean).join('\n\n')
    blocks.push(intro)

    const cards = content.intro.cards.filter((c) => c.enabled)
    if (cards.length > 0) {
      blocks.push(
        cardGridFromItems(
          order++,
          content.intro.eyebrow,
          '',
          cards.map((c) => ({ title: c.title, description: c.description, icon: c.icon })),
        ),
      )
    }
  }

  if (content.services.enabled) {
    const showcase = createDefaultServicesShowcaseBlock(order++)
    showcase.id = importedId('services', order)
    showcase.title = content.services.title
    showcase.description = content.services.subtitle
    showcase.settings.source = 'featured'
    showcase.settings.limit = Math.min(6, content.services.cards.filter((c) => c.enabled).length || 3)
    blocks.push(showcase)
  }

  if (content.why.enabled && content.why.cards.some((c) => c.enabled)) {
    blocks.push(
      cardGridFromItems(
        order++,
        content.why.title,
        content.why.subtitle,
        content.why.cards
          .filter((c) => c.enabled)
          .map((c) => ({ title: c.title, description: c.text, icon: c.icon, color: c.color })),
      ),
    )
  }

  if (content.brands.enabled && content.brands.cards.some((c) => c.enabled)) {
    blocks.push(
      cardGridFromItems(
        order++,
        content.brands.title,
        content.brands.subtitle,
        content.brands.cards
          .filter((c) => c.enabled)
          .map((c) => ({
            title: c.name,
            description: c.text,
            imageUrl: c.image,
            href: c.url,
          })),
      ),
    )
  }

  if (content.process.enabled && content.process.steps.some((s) => s.enabled)) {
    blocks.push(
      cardGridFromItems(
        order++,
        content.process.title,
        content.process.subtitle,
        content.process.steps
          .filter((s) => s.enabled)
          .map((s) => ({ title: `${s.step} — ${s.title}`, description: s.text, color: s.color })),
      ),
    )
  }

  const products = createDefaultProductsShowcaseBlock(order++)
  products.id = importedId('products', order)
  products.title = 'Yazılımlarımız'
  products.description = 'Öne çıkan dijital ürünler'
  blocks.push(products)

  const blog = createDefaultBlogShowcaseBlock(order++)
  blog.id = importedId('blog', order)
  blog.title = 'Son blog yazıları'
  blocks.push(blog)

  if (content.cta.enabled) {
    blocks.push(
      buildCtaFromFields(order++, {
        title: content.cta.title,
        description: content.cta.subtitle,
        buttonText: content.cta.buttonText,
        buttonHref: content.cta.buttonHref,
      }),
    )
  }

  return assignSortOrder(blocks)
}

function marketingPageToBlocks(content: MarketingPageContent, variant: 'services' | 'solutions'): BuilderBlock[] {
  const blocks: BuilderBlock[] = []
  let order = 0

  if (content.enabled) {
    blocks.push(
      buildHeroFromFields(order++, {
        title: content.heroTitle,
        description: content.heroDescription,
        image: content.heroImage,
        gradient: !content.heroImage?.trim(),
      }),
    )

    const body = createDefaultRichTextBlock(order++)
    body.id = importedId('section', order)
    body.title = content.sectionTitle
    body.description = content.sectionEyebrow
    body.settings.body = [content.highlight1, content.highlight2, content.sectionDescription]
      .filter(Boolean)
      .join('\n\n')
    blocks.push(body)

    if (variant === 'services') {
      const showcase = createDefaultServicesShowcaseBlock(order++)
      showcase.id = importedId('showcase', order)
      showcase.title = content.sectionTitle
      showcase.description = content.sectionDescription
      blocks.push(showcase)
    } else {
      const showcase = createDefaultProductsShowcaseBlock(order++)
      showcase.id = importedId('showcase', order)
      showcase.title = content.sectionTitle
      showcase.description = content.sectionDescription
      showcase.settings.source = 'featured'
      blocks.push(showcase)
    }

    blocks.push(
      buildCtaFromFields(order++, {
        title: content.ctaTitle,
        description: content.ctaDescription,
        buttonText: content.ctaButtonText,
        buttonHref: content.ctaButtonLink,
      }),
    )
  }

  return assignSortOrder(blocks)
}

function aboutContentToBlocks(content: ReturnType<typeof normalizeAboutContent>): BuilderBlock[] {
  const blocks: BuilderBlock[] = []
  let order = 0

  blocks.push(
    buildHeroFromFields(order++, {
      title: content.hero.title,
      description: content.hero.subtitle,
      image: content.hero.image,
      gradient: !content.hero.image?.trim(),
    }),
  )

  const intro = createDefaultRichTextBlock(order++)
  intro.id = importedId('what-is', order)
  intro.title = content.whatIs.title
  intro.settings.body = [...content.whatIs.paragraphs, content.whatIs.highlight].filter(Boolean).join('\n\n')
  blocks.push(intro)

  if (content.whatIs.cards.length > 0) {
    blocks.push(
      cardGridFromItems(
        order++,
        content.whatIs.title,
        '',
        content.whatIs.cards.map((c) => ({ title: c.title, description: c.text })),
      ),
    )
  }

  if (content.timeline.steps.length > 0) {
    blocks.push(
      cardGridFromItems(
        order++,
        content.timeline.title,
        content.timeline.subtitle,
        content.timeline.steps.map((s) => ({ title: s.title, description: s.text, icon: s.icon, color: s.color })),
      ),
    )
  }

  blocks.push(
    buildCtaFromFields(order++, {
      title: content.cta.title,
      description: content.cta.subtitle,
      buttonText: content.cta.buttonText,
      buttonHref: content.cta.buttonHref,
    }),
  )

  return assignSortOrder(blocks)
}

function contactContentToBlocks(content: ReturnType<typeof normalizeContactContent>): BuilderBlock[] {
  const blocks: BuilderBlock[] = []
  let order = 0

  blocks.push(
    buildHeroFromFields(order++, {
      title: content.heroTitle ?? defaultContactContent.heroTitle,
      description: content.heroSubtitle ?? defaultContactContent.heroSubtitle,
      image: content.heroImage,
      gradient: true,
    }),
  )

  const body = createDefaultRichTextBlock(order++)
  body.id = importedId('contact', order)
  body.title = content.formTitle ?? 'İletişim bilgileri'
  body.settings.body = [
    content.email ? `E-posta: ${content.email}` : '',
    content.phone ? `Telefon: ${content.phone}` : '',
    content.address ? `Adres: ${content.address}` : '',
    content.whatsApp ? `WhatsApp: ${content.whatsApp}` : '',
  ]
    .filter(Boolean)
    .join('\n')
  blocks.push(body)

  return assignSortOrder(blocks)
}

function legalContentToBlocks(content: LegalPageContent): BuilderBlock[] {
  const blocks: BuilderBlock[] = []
  let order = 0

  blocks.push(
    buildHeroFromFields(order++, {
      title: content.title,
      description: content.description,
      gradient: true,
    }),
  )

  const faq = createDefaultFaqBlock(order++)
  faq.id = importedId('legal-faq', order)
  faq.title = content.title
  faq.description = content.updatedAtLabel ? `Güncelleme: ${content.updatedAtLabel}` : ''
  faq.settings.items = content.sections
    .filter((s) => s.active)
    .sort((a, b) => a.order - b.order)
    .map((s) => ({
      id: s.id,
      question: s.title,
      answer: [s.body, ...(s.listItems ?? []).map((li) => `• ${li}`)].filter(Boolean).join('\n'),
    }))
  blocks.push(faq)

  return assignSortOrder(blocks)
}

function emptyTemplateForPage(def: BuilderPageDefinition): BuilderBlock[] {
  const hero = buildHeroFromFields(0, {
    title: def.title,
    description: `${def.title} sayfası — içerik henüz tanımlanmadı. Blok ekleyerek düzenlemeye başlayın.`,
    gradient: true,
  })

  if (def.key === 'software') {
    const products = createDefaultProductsShowcaseBlock(1)
    products.id = importedId('products', 1)
    return assignSortOrder([hero, products])
  }
  if (def.key === 'blog') {
    const blog = createDefaultBlogShowcaseBlock(1)
    blog.id = importedId('blog', 1)
    return assignSortOrder([hero, blog])
  }

  return assignSortOrder([hero])
}

export function pageContentToBlocks(
  def: BuilderPageDefinition,
  raw: Record<string, unknown> | null,
): BuilderBlock[] {
  if (!raw) return emptyTemplateForPage(def)

  switch (def.key) {
    case 'home':
      return homePageContentToBlocks(normalizeHomePageContent(raw))
    case 'about':
      return aboutContentToBlocks(normalizeAboutContent(raw))
    case 'services':
      return marketingPageToBlocks(
        mergeMarketingPageContent(defaultServicesPageContent, raw),
        'services',
      )
    case 'solutions':
      return marketingPageToBlocks(
        mergeMarketingPageContent(defaultSolutionsPageContent, raw),
        'solutions',
      )
    case 'contact':
      return contactContentToBlocks(normalizeContactContent(raw))
    case 'legal': {
      const legal: LegalPageContent = {
        ...defaultLegalCookiePage,
        ...(raw as Partial<LegalPageContent>),
      }
      if (Array.isArray(raw.sections)) {
        legal.sections = raw.sections as LegalPageContent['sections']
      }
      return legalContentToBlocks(legal)
    }
    case 'software':
      if (raw && (raw.heroTitle || raw.hero)) {
        return marketingPageToBlocks(
          mergeMarketingPageContent(defaultServicesPageContent, raw),
          'solutions',
        )
      }
      return emptyTemplateForPage(def)
    case 'blog':
      if (raw && (raw.heroTitle || raw.hero)) {
        return marketingPageToBlocks(
          mergeMarketingPageContent(defaultSolutionsPageContent, raw),
          'solutions',
        )
      }
      return emptyTemplateForPage(def)
    default:
      return emptyTemplateForPage(def)
  }
}
