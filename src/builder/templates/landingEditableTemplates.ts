import type { BuilderBlock } from '@/builder/types/blocks'
import type { BuilderPageDefinition } from '@/builder/pages/builderPageRegistry'
import {
  createDefaultBlogShowcaseBlock,
  createDefaultFaqBlock,
  createDefaultProductsShowcaseBlock,
  createDefaultRichTextBlock,
} from '@/builder/types/blockModels'
import { createDefaultHeroBlock } from '@/builder/types/hero'
import { assignSortOrder } from '@/builder/load/parseBuilderBlocks'
import { createAboutEditableTemplate } from '@/builder/templates/aboutEditableTemplate'
import { createServicesLandingEditableTemplate } from '@/builder/templates/servicesLandingEditableTemplate'
import { createSolutionsLandingEditableTemplate } from '@/builder/templates/solutionsLandingEditableTemplate'
import { defaultLegalCookiePage } from '@/data/legalPageDefaults'
import type { LegalPageContent } from '@/data/legalPageDefaults'

function landingHero(id: string, title: string, description: string, order: number) {
  const hero = createDefaultHeroBlock(id, order)
  hero.title = title
  hero.description = description
  hero.settings.layout = 'about'
  hero.settings.mode = 'gradient'
  hero.settings.height = { desktop: '360px', mobile: '280px' }
  hero.style.backgroundGradient = 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
  return hero
}

function readStr(raw: Record<string, unknown> | null, key: string, fallback: string): string {
  if (!raw) return fallback
  const v = raw[key]
  return v != null && String(v).trim() ? String(v) : fallback
}

export { createAboutEditableTemplate, createServicesLandingEditableTemplate, createSolutionsLandingEditableTemplate }

export function createSoftwareLandingEditableTemplate(_raw: Record<string, unknown> | null): BuilderBlock[] {
  const blocks = [
    (() => {
      const hero = createDefaultHeroBlock('sw-landing-hero', 0)
      hero.title = 'Dijital Ürünler ve Yazılımlar'
      hero.description = 'İndirilebilir yazılımlar, SaaS ürünleri ve lisans destekli çözümler.'
      hero.settings.layout = 'about'
      hero.settings.badge = 'Yazılımlar'
      hero.settings.mode = 'gradient'
      hero.settings.showBreadcrumbs = true
      hero.settings.breadcrumbs = [{ label: 'Ana Sayfa', href: '/' }, { label: 'Yazılımlar' }]
      hero.settings.buttons = []
      hero.visibility.showButton = false
      hero.style.backgroundGradient = 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
      return hero
    })(),
    (() => {
      const showcase = createDefaultProductsShowcaseBlock(1)
      showcase.id = 'sw-landing-products'
      showcase.title = 'Yazılım kataloğu'
      showcase.description = 'Woontegra dijital ürünleri'
      showcase.settings.source = 'recent'
      showcase.settings.limit = 12
      showcase.settings.showPrice = true
      showcase.settings.showAddToCart = true
      return showcase
    })(),
  ]
  return assignSortOrder(blocks)
}

export function createBlogLandingEditableTemplate(_raw: Record<string, unknown> | null): BuilderBlock[] {
  const blocks = [
    (() => {
      const hero = createDefaultHeroBlock('blog-landing-hero', 0)
      hero.title = 'Duyurular ve teknik yazılar'
      hero.description = 'Ürün güncellemeleri, ipuçları ve sektörden notlar.'
      hero.settings.layout = 'about'
      hero.settings.badge = 'Blog'
      hero.settings.mode = 'gradient'
      hero.settings.showBreadcrumbs = true
      hero.settings.breadcrumbs = [{ label: 'Ana Sayfa', href: '/' }, { label: 'Blog' }]
      hero.settings.buttons = []
      hero.visibility.showButton = false
      hero.style.backgroundGradient = 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
      return hero
    })(),
    (() => {
      const showcase = createDefaultBlogShowcaseBlock(1)
      showcase.id = 'blog-landing-posts'
      showcase.title = 'Son yazılar'
      showcase.description = 'Güncel blog içerikleri'
      showcase.settings.source = 'recent'
      showcase.settings.limit = 12
      return showcase
    })(),
  ]
  return assignSortOrder(blocks)
}

export function createContactEditableTemplate(raw: Record<string, unknown> | null): BuilderBlock[] {
  const title = readStr(raw, 'heroTitle', 'İletişim')
  const subtitle = readStr(raw, 'heroSubtitle', 'Projeniz veya sorularınız için bize ulaşın.')
  const formTitle = readStr(raw, 'formTitle', 'Mesaj gönderin')
  const blocks = [
    landingHero('contact-hero', title, subtitle, 0),
    (() => {
      const rt = createDefaultRichTextBlock(1)
      rt.id = 'contact-info'
      rt.title = formTitle
      rt.settings.body = [readStr(raw, 'email', ''), readStr(raw, 'phone', ''), readStr(raw, 'address', '')]
        .filter(Boolean)
        .join('\n\n')
      return rt
    })(),
  ]
  return assignSortOrder(blocks)
}

function normalizeLegalContent(raw: Record<string, unknown> | null, fallbackTitle: string): LegalPageContent {
  if (!raw) return { ...defaultLegalCookiePage, title: fallbackTitle }
  const title = readStr(raw, 'title', fallbackTitle)
  const sections = Array.isArray(raw.sections) ? raw.sections : defaultLegalCookiePage.sections
  return {
    ...defaultLegalCookiePage,
    title,
    description: readStr(raw, 'description', ''),
    sections: sections as LegalPageContent['sections'],
  }
}

export function createLegalEditableTemplate(
  def: BuilderPageDefinition,
  raw: Record<string, unknown> | null,
): BuilderBlock[] {
  const content = normalizeLegalContent(raw, def.title)
  const blocks = [
    landingHero(`legal-${def.key}-hero`, content.title, content.description, 0),
    (() => {
      const faq = createDefaultFaqBlock(1)
      faq.id = `legal-${def.key}-sections`
      faq.title = content.title
      faq.settings.items = content.sections
        .filter((s) => s.active)
        .sort((a, b) => a.order - b.order)
        .map((s) => ({
          id: s.id,
          question: s.title,
          answer: s.listItems?.length ? `${s.body}\n${s.listItems.map((l) => `• ${l}`).join('\n')}` : s.body,
        }))
      return faq
    })(),
  ]
  return assignSortOrder(blocks)
}

export function createLandingEditableTemplate(
  def: BuilderPageDefinition,
  raw: Record<string, unknown> | null,
): BuilderBlock[] {
  switch (def.key) {
    case 'about':
      return createAboutEditableTemplate(raw)
    case 'services':
      return createServicesLandingEditableTemplate(raw)
    case 'solutions':
      return createSolutionsLandingEditableTemplate(raw)
    case 'software':
      return createSoftwareLandingEditableTemplate(raw)
    case 'blog':
      return createBlogLandingEditableTemplate(raw)
    case 'contact':
      return createContactEditableTemplate(raw)
    default:
      return []
  }
}
