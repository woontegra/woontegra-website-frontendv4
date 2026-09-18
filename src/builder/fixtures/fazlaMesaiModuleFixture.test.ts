import { describe, expect, it } from 'vitest'
import {
  FAZLA_MESAI_ACCEPTANCE,
  FAZLA_MESAI_FIXTURE_SEO,
  FAZLA_MESAI_FIXTURE_SLUG,
  buildFazlaMesaiBuilderBlocks,
  buildFazlaMesaiFixtureDocument,
  buildFazlaMesaiModulePageContent,
} from '@/builder/fixtures/fazlaMesaiModuleFixture'
import { extractYoutubeVideoId, looksLikeHtml, sanitizeRichHtml } from '@/builder/lib/richTextHtml'
import { BUILDER_MVP_BLOCK_TYPES, createBlockByType } from '@/builder/types/blockModels'
import { blockRendererLoaders } from '@/builder/registry/renderRegistry'
import { listBlockDefinitions } from '@/builder/registry/blockRegistry'
import { buildPageContentPayload } from '@/builder/load/pageContentPersistence'
import { getBuilderPageDefinition } from '@/builder/pages/builderPageRegistry'
import { bhModuleBuilderPageKey, listPublishedBhModules } from '@/builder/types/bhModule'
import { extractSeoFromRaw } from '@/builder/load/parseBuilderBlocks'
import { resolvePublicPageBlocks } from '@/lib/pageBlocksAdapter'

describe('rich text HTML helpers', () => {
  it('detects HTML vs plain text (backward compatible)', () => {
    expect(looksLikeHtml('Düz paragraf')).toBe(false)
    expect(looksLikeHtml('<p>Merhaba</p>')).toBe(true)
  })

  it('sanitizes allowlisted tags and strips scripts', () => {
    const html = sanitizeRichHtml(
      '<h2>Başlık</h2><p>Metin <strong>kalın</strong> <a href="https://example.com">link</a></p><ul><li>Madde</li></ul><script>alert(1)</script>',
    )
    expect(html).toContain('<h2>')
    expect(html).toContain('<strong>')
    expect(html).toContain('https://example.com')
    expect(html).toContain('<ul>')
    expect(html.toLowerCase()).not.toContain('<script')
  })

  it('extracts YouTube ids from common URL shapes', () => {
    expect(extractYoutubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(extractYoutubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(extractYoutubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(extractYoutubeVideoId('not-a-url')).toBeNull()
  })
})

describe('builder block registration regression', () => {
  it('keeps existing MVP block factories working', () => {
    const legacy = ['hero', 'rich-text', 'image-text', 'card-grid', 'cta', 'faq'] as const
    for (const type of legacy) {
      const block = createBlockByType(type, 0)
      expect(block.type).toBe(type)
      expect(block.id).toBeTruthy()
    }
  })

  it('registers new content blocks in factory + renderer + library defs', () => {
    for (const type of ['video-embed', 'callout', 'gallery'] as const) {
      expect(BUILDER_MVP_BLOCK_TYPES).toContain(type)
      expect(createBlockByType(type, 1).type).toBe(type)
      expect(blockRendererLoaders[type]).toBeTypeOf('function')
      expect(listBlockDefinitions().some((d) => d.type === type)).toBe(true)
    }
  })
})

describe('Fazla Mesai fixture acceptance (local only)', () => {
  const blocks = buildFazlaMesaiBuilderBlocks()
  const page = buildFazlaMesaiModulePageContent()
  const doc = buildFazlaMesaiFixtureDocument()

  it('includes hero + intro + CTA', () => {
    const hero = blocks.find((b) => b.type === 'hero')
    const cta = blocks.filter((b) => b.type === 'cta')
    expect(hero?.title).toContain('Fazla Mesai')
    expect(hero?.description).toBeTruthy()
    expect((hero as { settings?: { buttons?: unknown[] } })?.settings?.buttons?.length).toBeGreaterThan(0)
    expect(cta.length).toBeGreaterThanOrEqual(1)
  })

  it('carries all long-form article headings and list items in rich-text HTML', () => {
    const article = blocks.find((b) => b.type === 'rich-text')
    const body = String((article as { settings?: { body?: string } })?.settings?.body || '')
    expect(looksLikeHtml(body)).toBe(true)
    for (const heading of FAZLA_MESAI_ACCEPTANCE.articleHeadings) {
      expect(body).toContain(heading)
    }
    for (const item of FAZLA_MESAI_ACCEPTANCE.listItemsSample) {
      expect(body).toContain(item)
    }
    expect(body).toContain('<ul>')
    expect(body).toContain('<li>')
  })

  it('includes 12 calculation type cards', () => {
    const grid = blocks.find((b) => b.id.includes('types'))
    expect(grid?.type).toBe('card-grid')
    const cards = (grid as { settings?: { cards?: unknown[] } })?.settings?.cards || []
    expect(cards.length).toBe(12)
    expect(cards.length).toBe(FAZLA_MESAI_ACCEPTANCE.moduleTypeCount)
  })

  it('includes Programın Özellikleri and Nasıl Çalışır steps', () => {
    const features = blocks.find((b) => b.title === 'Programın Özellikleri')
    const steps = blocks.find((b) => b.title === 'Nasıl Çalışır')
    expect((features as { settings?: { cards?: unknown[] } })?.settings?.cards?.length).toBe(
      FAZLA_MESAI_ACCEPTANCE.programBenefitCount,
    )
    expect((steps as { settings?: { cards?: unknown[] } })?.settings?.cards?.length).toBe(
      FAZLA_MESAI_ACCEPTANCE.processStepCount,
    )
  })

  it('includes optional YouTube embed block', () => {
    const video = blocks.find((b) => b.type === 'video-embed')
    expect(video).toBeTruthy()
    const url = String((video as { settings?: { youtubeUrl?: string } })?.settings?.youtubeUrl || '')
    expect(extractYoutubeVideoId(url)).toBeTruthy()
  })

  it('exposes SEO metadata for public document meta', () => {
    expect(page.seoTitle).toBe(FAZLA_MESAI_FIXTURE_SEO.seoTitle)
    expect(page.seoDescription).toBe(FAZLA_MESAI_FIXTURE_SEO.seoDescription)
    const seo = extractSeoFromRaw(doc as unknown as Record<string, unknown>, FAZLA_MESAI_FIXTURE_SLUG)
    expect(seo.seoTitle).toBe(FAZLA_MESAI_FIXTURE_SEO.seoTitle)
    expect(seo.seoDescription).toBe(FAZLA_MESAI_FIXTURE_SEO.seoDescription)
  })

  it('resolves public blocks from fixture document via page adapter', () => {
    const resolved = resolvePublicPageBlocks(doc as unknown as Record<string, unknown>, FAZLA_MESAI_FIXTURE_SLUG)
    expect(resolved?.length).toBe(blocks.length)
  })

  it('lists fixture in published BH catalog', () => {
    const listed = listPublishedBhModules(doc)
    expect(listed.some((m) => m.slug === FAZLA_MESAI_FIXTURE_SLUG)).toBe(true)
  })
})

describe('builder SEO persistence payload', () => {
  it('writes seoTitle/seoDescription onto nested page rows', () => {
    const def = getBuilderPageDefinition(bhModuleBuilderPageKey('fazla-mesai-nasil-hesaplanir'))
    expect(def).toBeTruthy()
    const blocks = buildFazlaMesaiBuilderBlocks()
    const payload = buildPageContentPayload(def!, blocks, null, {
      seoTitle: 'SEO Title',
      seoDescription: 'SEO Desc',
      pageMeta: {
        title: 'Fazla Mesai Alacağı',
        slug: 'fazla-mesai-nasil-hesaplanir',
        shortDescription: 'Kısa',
        category: 'İşçilik alacağı',
        sortOrder: 3,
        published: true,
      },
    })
    const page = (payload.pages as Record<string, Record<string, unknown>>)['fazla-mesai-nasil-hesaplanir']
    expect(page.seoTitle).toBe('SEO Title')
    expect(page.seoDescription).toBe('SEO Desc')
    expect(page.title).toBe('Fazla Mesai Alacağı')
    expect(Array.isArray(page.blocks)).toBe(true)
  })
})
