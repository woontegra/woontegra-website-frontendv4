import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { convertPageParityBlocks } from '@/builder/parity/convertPageParityBlocks'
import { KOOPPLUS_BUILDER_PAGE_KEY } from '@/builder/parity/koopplusBuilderPreview'
import { getBuilderPageDefinition } from '@/builder/pages/builderPageRegistry'
import { blockRendererLoaders } from '@/builder/registry/renderRegistry'
import {
  createDefaultKoopPlusProductBlock,
  getDefaultKoopPlusProductContent,
  isUnsafeKoopPlusActionInput,
  KOOPPLUS_PRODUCT_BLOCK_TYPE,
  KOOPPLUS_PRODUCT_SCHEMA_VERSION,
  parseKoopPlusProductBlock,
  patchKoopPlusProductContent,
  resolvePublishedKoopPlusProductContent,
  sanitizeKoopPlusCtaAction,
} from '@/builder/types/koopplusProduct'
import {
  KOOPPLUS_FAQ,
  KOOPPLUS_FEATURES,
  KOOPPLUS_HERO,
  KOOPPLUS_LICENSE_POINTS,
  KOOPPLUS_LOCAL_DATA,
  KOOPPLUS_MACOS_AVAILABLE,
  KOOPPLUS_MULTI_COOP,
  KOOPPLUS_TRIAL,
  KOOPPLUS_WHY,
  isKoopPlusMacCheckoutReady,
} from '@/data/koopplusProduct'

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..')

function source(rel: string): string {
  return readFileSync(join(root, rel), 'utf8')
}

describe('koopplus-product schema and conversion', () => {
  it('converts the public source into one versioned koopplus-product block', () => {
    const def = getBuilderPageDefinition(KOOPPLUS_BUILDER_PAGE_KEY)!
    const result = convertPageParityBlocks(def, null)
    expect(result.blocks).toHaveLength(1)
    expect(result.blocks[0]?.type).toBe(KOOPPLUS_PRODUCT_BLOCK_TYPE)
    expect(result.blocks.some((block) => block.type === 'product-detail')).toBe(false)
    expect(result.report.unmapped).toEqual([])
    expect(JSON.stringify(result.report)).not.toContain('generic product-detail dönüşümü kapalı')

    const parsed = parseKoopPlusProductBlock(result.blocks[0])
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.block.settings.schemaVersion).toBe(KOOPPLUS_PRODUCT_SCHEMA_VERSION)
  })

  it('keeps default block content aligned with koopplusProduct.ts', () => {
    const content = getDefaultKoopPlusProductContent()
    expect(content.hero.kicker).toBe(KOOPPLUS_HERO.kicker)
    expect(content.hero.identity).toBe(KOOPPLUS_HERO.identity)
    expect(content.hero.title).toBe(KOOPPLUS_HERO.title)
    expect(content.hero.description).toBe(KOOPPLUS_HERO.description)
    expect(content.hero.primaryCtaLabel).toBe(KOOPPLUS_HERO.primaryCta)
    expect(content.hero.secondaryCtaLabel).toBe(KOOPPLUS_HERO.secondaryCta)
    expect(content.trial.eyebrow).toBe(KOOPPLUS_TRIAL.eyebrow)
    expect(content.trial.title).toBe(KOOPPLUS_TRIAL.title)
    expect(content.trial.intro).toBe(KOOPPLUS_TRIAL.intro)
    expect(content.trial.downloadCtaLabel).toBe(KOOPPLUS_TRIAL.downloadCta)
    expect(content.trial.highlights.map((item) => item.title)).toEqual(KOOPPLUS_TRIAL.highlights.map((item) => item.title))
    expect(content.features.items.map((item) => item.title)).toEqual(KOOPPLUS_FEATURES.map((item) => item.title))
    expect(content.why.items.map((item) => item.title)).toEqual(KOOPPLUS_WHY.map((item) => item.title))
    expect(content.info.multiCoop.title).toBe(KOOPPLUS_MULTI_COOP.title)
    expect(content.info.localData.title).toBe(KOOPPLUS_LOCAL_DATA.title)
    expect(content.license.points).toEqual([...KOOPPLUS_LICENSE_POINTS])
    expect(content.faq.items.map((item) => item.question)).toEqual(KOOPPLUS_FAQ.map((item) => item.question))
    expect(content.gallery.images).toEqual([])
    expect(content.hero.primaryCtaAction).toBe('purchaseWindows')
    expect(content.trial.downloadCtaAction).toBe('downloadTrial')
    expect(content.platforms.mac.purchaseCtaAction).toBe('purchaseMac')
  })

  it('writes builder edits into block state', () => {
    const block = createDefaultKoopPlusProductBlock(0)
    const edited = patchKoopPlusProductContent(block, (content) => ({
      ...content,
      hero: {
        ...content.hero,
        title: 'TEMPORARY',
        description: 'Geçici açıklama',
        primaryCtaLabel: 'Yeni Satın Al',
      },
      trial: { ...content.trial, title: 'Deneme başlığı' },
      gallery: { images: [{ url: '/uploads/koopplus-hero.png', alt: 'KoopPlus ekran' }] },
    }))

    expect(edited.settings.content.hero.title).toBe('TEMPORARY')
    expect(edited.settings.content.hero.description).toBe('Geçici açıklama')
    expect(edited.settings.content.hero.primaryCtaLabel).toBe('Yeni Satın Al')
    expect(edited.settings.content.hero.primaryCtaAction).toBe('purchaseWindows')
    expect(edited.settings.content.trial.title).toBe('Deneme başlığı')
    expect(edited.settings.content.gallery.images[0]).toEqual({
      url: '/uploads/koopplus-hero.png',
      alt: 'KoopPlus ekran',
    })
  })

  it('uses published content, ignores draft-only and invalid documents', () => {
    const empty = resolvePublishedKoopPlusProductContent(null)
    expect(empty.content).toBeNull()
    expect(empty.fallbackReason).toBe('missing')

    const published = createDefaultKoopPlusProductBlock(0)
    published.settings.content.hero.title = 'Yayınlanan başlık'
    const valid = resolvePublishedKoopPlusProductContent([published])
    expect(valid.content?.hero.title).toBe('Yayınlanan başlık')
    expect(valid.fallbackReason).toBeNull()

    const draftOnlyGeneric = resolvePublishedKoopPlusProductContent([
      { type: 'product-detail', id: 'pdp', sortOrder: 0, visibility: { enabled: true }, settings: { slug: 'koopplus' } },
    ])
    expect(draftOnlyGeneric.content).toBeNull()
    expect(draftOnlyGeneric.fallbackReason).toBe('missing')

    const disabled = createDefaultKoopPlusProductBlock(0)
    disabled.visibility.enabled = false
    expect(resolvePublishedKoopPlusProductContent([disabled]).fallbackReason).toBe('disabled')

    const invalidVersion = {
      ...createDefaultKoopPlusProductBlock(0),
      settings: { schemaVersion: 99, content: { hero: { title: 'x' } } },
    }
    const unsupported = resolvePublishedKoopPlusProductContent([invalidVersion])
    expect(unsupported.content).toBeNull()
    expect(unsupported.fallbackReason).toBe('unsupported-version')

    const broken = resolvePublishedKoopPlusProductContent([
      { type: 'koopplus-product', id: 'broken', sortOrder: 0, visibility: { enabled: true }, settings: { schemaVersion: 1, content: null } },
    ])
    expect(broken.content).toBeNull()
    expect(broken.fallbackReason).toBe('invalid-structure')
  })

  it('locks CTA actions and rejects arbitrary JS/URL payloads', () => {
    const parsed = parseKoopPlusProductBlock({
      id: 'koopplus-product-tamper',
      type: 'koopplus-product',
      sortOrder: 0,
      visibility: { enabled: true },
      settings: {
        schemaVersion: 1,
        content: {
          hero: {
            title: 'Başlık',
            primaryCtaAction: 'javascript:alert(1)',
            secondaryCtaAction: 'https://evil.example',
          },
        },
      },
    })
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.content.hero.primaryCtaAction).toBe('purchaseWindows')
    expect(parsed.content.hero.secondaryCtaAction).toBe('startTrial')
    expect(parsed.content.platforms.mac.purchaseCtaAction).toBe('purchaseMac')
    expect(parsed.content.trial.downloadCtaAction).toBe('downloadTrial')
    expect(sanitizeKoopPlusCtaAction('javascript:alert(1)', 'purchaseWindows')).toBe('purchaseWindows')
    expect(isUnsafeKoopPlusActionInput('javascript:alert(1)')).toBe(true)
    expect(isUnsafeKoopPlusActionInput('purchaseWindows')).toBe(false)
    expect(KOOPPLUS_MACOS_AVAILABLE).toBe(false)
    expect(isKoopPlusMacCheckoutReady()).toBe(false)
  })

  it('uses the shared KoopPlus layout instead of SoftwareDetailView', () => {
    expect(blockRendererLoaders['koopplus-product']).toBeTypeOf('function')
    const renderer = source('src/builder/render/blocks/KoopPlusProductBlockRenderer.tsx')
    expect(renderer).toContain('KoopPlusProductLayout')
    expect(renderer).not.toContain('SoftwareDetailView')
    const view = source('src/components/public/koopplus/KoopPlusProductView.tsx')
    expect(view).toContain('KoopPlusProductLayout')
    const page = source('src/pages/public/KoopPlusProductPage.tsx')
    expect(page).toContain('resolvePublishedKoopPlusProductContent')
    expect(page).toContain('KOOPPLUS_SEO')
    expect(page).toContain('canonicalPath: KOOPPLUS_PATH')
    const settings = source('src/builder/admin/settings/KoopPlusProductSettingsPanel.tsx')
    expect(settings).toContain('Hero')
    expect(settings).toContain('Windows')
    expect(settings).toContain('Mac')
    expect(settings).toContain('Deneme')
    expect(settings).toContain('Galeri')
  })
})
