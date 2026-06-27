import type { BuilderBlock } from '@/builder/types/blocks'
import { createLegacySectionBlock } from '@/builder/types/legacySection'
import { assignSortOrder } from '@/builder/load/parseBuilderBlocks'
import {
  createEmptyReport,
  type ConversionReport,
  type ConversionSectionEntry,
} from '@/builder/load/conversionReport'
import type { HomePageContent } from '@/types/homePageContent'

function importedId(key: string, order: number): string {
  return `legacy-${key.replace(/\./g, '-')}-${order}`
}

function pushLegacy(
  blocks: BuilderBlock[],
  report: ConversionReport,
  order: number,
  sectionKey: string,
  title: string,
  payload?: unknown,
  note?: string,
): number {
  blocks.push(createLegacySectionBlock(importedId(sectionKey, order), order, sectionKey, title, payload))
  const entry: ConversionSectionEntry = {
    key: sectionKey,
    title,
    mode: 'legacy-section',
    note,
  }
  report.sections.push(entry)
  report.legacyCount += 1
  return order + 1
}

/**
 * HomePageView ile aynı sıra — her bölüm gerçek public component ile legacy-section olarak korunur.
 * Tahmini hero/card-grid/showcase blokları üretilmez (görünüm bozulmasını önler).
 */
export function convertHomePageToBlocks(content: HomePageContent): {
  blocks: BuilderBlock[]
  report: ConversionReport
} {
  const report = createEmptyReport('home')
  const blocks: BuilderBlock[] = []
  let order = 0

  if (content.hero.enabled) {
    order = pushLegacy(
      blocks,
      report,
      order,
      'home.hero',
      'Hero',
      content.hero,
      'HomeHero — public layout korundu',
    )
  }

  if (content.intro.enabled) {
    order = pushLegacy(
      blocks,
      report,
      order,
      'home.intro',
      'Intro / 3 adımlı kartlar',
      content.intro,
      'HomeIntro — metin + kart grid birlikte',
    )
  }

  if (content.services.enabled) {
    order = pushLegacy(
      blocks,
      report,
      order,
      'home.services',
      'Hizmetler vitrini',
      content.services,
      'HomeServices — CMS kartları',
    )
  }

  order = pushLegacy(
    blocks,
    report,
    order,
    'home.solutions-preview',
    'Çözümler vitrini',
    undefined,
    'HomeSolutionsPreview — API vitrin',
  )

  order = pushLegacy(
    blocks,
    report,
    order,
    'home.featured-products',
    'Ürünler vitrini',
    undefined,
    'HomeFeaturedProducts — API vitrin',
  )

  if (content.brands.enabled) {
    order = pushLegacy(
      blocks,
      report,
      order,
      'home.brands',
      'Markalar',
      content.brands,
      'HomeBrands',
    )
  }

  if (content.why.enabled) {
    order = pushLegacy(
      blocks,
      report,
      order,
      'home.why',
      'Neden Woontegra',
      content.why,
      'HomeWhy',
    )
  }

  if (content.process.enabled) {
    order = pushLegacy(
      blocks,
      report,
      order,
      'home.process',
      'Süreç',
      content.process,
      'HomeProcess — adım görünümü',
    )
  }

  order = pushLegacy(
    blocks,
    report,
    order,
    'home.latest-blog',
    'Blog vitrini',
    undefined,
    'HomeLatestBlog — API vitrin',
  )

  if (content.cta.enabled) {
    order = pushLegacy(
      blocks,
      report,
      order,
      'home.cta',
      'CTA',
      content.cta,
      'HomeCta — gradient CTA',
    )
  }

  report.unmapped.push(
    'Ana sayfa bölümleri birebir builder bloklarına map edilmedi; public component render korundu.',
  )

  return { blocks: assignSortOrder(blocks), report }
}
