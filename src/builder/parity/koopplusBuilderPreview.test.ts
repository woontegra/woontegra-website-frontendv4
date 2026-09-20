import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { convertPageParityBlocks } from '@/builder/parity/convertPageParityBlocks'
import {
  clearStaleKoopPlusGenericDraft,
  isKoopPlusBuilderPageKey,
  KOOPPLUS_BUILDER_PAGE_KEY,
  resolveProductDetailPreviewKind,
  shouldIgnoreKoopPlusGenericPdp,
} from '@/builder/parity/koopplusBuilderPreview'
import { resolveBuilderPageLoad } from '@/builder/load/resolveBuilderPageLoad'
import { getBuilderPageDefinition } from '@/builder/pages/builderPageRegistry'
import { MK_COMPARE_SLUG } from '@/components/public/muvekkil-kasa/comparePageUtils'
import {
  KOOPPLUS_LEGACY_PATH,
  KOOPPLUS_MACOS_AVAILABLE,
  KOOPPLUS_PATH,
  KOOPPLUS_SEO_SLUG,
  KOOPPLUS_SLUG,
  isKoopPlusMacCheckoutReady,
} from '@/data/koopplusProduct'
import type { BuilderBlock } from '@/builder/types'

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..')

function source(rel: string): string {
  return readFileSync(join(root, rel), 'utf8')
}

function genericPdpBlock(slug: string): BuilderBlock {
  return {
    id: `pdp-${slug}-pdp`,
    type: 'product-detail',
    sortOrder: 0,
    title: 'KoopPlus',
    visibility: { enabled: true, showTitle: true, showDescription: true, showImage: true, showButton: true },
    style: {},
    settings: { slug },
  } as BuilderBlock
}

describe('KoopPlus builder preview parity', () => {
  it('keeps the public canonical route on KoopPlusProductPage', () => {
    const router = source('src/routes/router.tsx')
    expect(router).toContain("path: 'yazilimlar/kooperatif-yonetim-yazilimi'")
    expect(router).toContain('<KoopPlusProductPage />')
    expect(router).toContain("path: 'yazilimlar/koopplus'")
    expect(router).toContain('<KoopPlusLegacyPathRedirect />')
    expect(KOOPPLUS_PATH).toBe(`/yazilimlar/${KOOPPLUS_SEO_SLUG}`)
    expect(KOOPPLUS_LEGACY_PATH).toBe('/yazilimlar/koopplus')
  })

  it('embeds KoopPlusProductPage for builder public/legacy preview', () => {
    expect(resolveProductDetailPreviewKind('koopplus')).toBe('koopplus')
    expect(resolveProductDetailPreviewKind('kooperatif-yonetim-yazilimi')).toBe('koopplus')
    expect(isKoopPlusBuilderPageKey(KOOPPLUS_BUILDER_PAGE_KEY)).toBe(true)
    const embed = source('src/builder/preview/PublicSitePageEmbed.tsx')
    expect(embed).toContain('KoopPlusProductPage')
    expect(embed).toContain("import('@/pages/public/KoopPlusProductPage')")
    expect(embed).toContain("previewKind === 'koopplus'")
  })

  it('does not embed SoftwareDetailPage for KoopPlus', () => {
    expect(resolveProductDetailPreviewKind(KOOPPLUS_SLUG)).not.toBe('software-detail')
    const embed = source('src/builder/preview/PublicSitePageEmbed.tsx')
    expect(embed).toMatch(/previewKind === 'koopplus'\s*\n\s*\? KoopPlusProductPage/)
  })

  it('converts KoopPlus into exactly one koopplus-product block', () => {
    const def = getBuilderPageDefinition(KOOPPLUS_BUILDER_PAGE_KEY)
    expect(def?.slug).toBe(KOOPPLUS_SLUG)
    expect(def?.previewPath).toBe(KOOPPLUS_PATH)
    expect(def?.kind).toBe('product-detail')
    const result = convertPageParityBlocks(def!, null)
    expect(result.blocks).toHaveLength(1)
    expect(result.blocks[0]?.type).toBe('koopplus-product')
    expect(result.report.convertedCount).toBe(1)
    expect(result.report.unmapped).toEqual([])
    expect(result.report.unmapped.join(' ')).not.toContain('özel renderer')
    expect(result.report.sections[0]?.note).toContain('koopplus-product')
    expect(result.report.sections[0]?.note).toContain('mapped')
    expect(result.blocks.some((block) => block.type === 'product-detail')).toBe(false)
  })

  it('keeps generic SoftwareDetail preview conversion for other products', () => {
    expect(resolveProductDetailPreviewKind('sifre-kasasi')).toBe('software-detail')
    expect(resolveProductDetailPreviewKind('bilirkisi-hesap')).toBe('software-detail')
    const def = getBuilderPageDefinition('product-sifre-kasasi')
    expect(def?.slug).toBe('sifre-kasasi')
    const result = convertPageParityBlocks(def!, null)
    expect(result.blocks.length).toBeGreaterThan(0)
    expect(result.blocks.every((block) => block.type === 'product-detail')).toBe(true)
  })

  it('keeps the Müvekkil Kasa compare special-case', () => {
    expect(resolveProductDetailPreviewKind(MK_COMPARE_SLUG)).toBe('mk-compare')
    const def = getBuilderPageDefinition(`product-${MK_COMPARE_SLUG}`)
    const result = convertPageParityBlocks(def!, null)
    expect(result.blocks.some((block) => block.type === 'product-detail')).toBe(false)
    expect(result.blocks.length).toBeGreaterThan(0)
    const embed = source('src/builder/preview/PublicSitePageEmbed.tsx')
    expect(embed).toContain('MuvekkilKasaComparePage')
    expect(embed).toContain("previewKind === 'mk-compare'")
  })

  it('keeps the KoopPlus legacy slug redirect and macOS flag', () => {
    expect(KOOPPLUS_LEGACY_PATH).toBe('/yazilimlar/koopplus')
    expect(KOOPPLUS_MACOS_AVAILABLE).toBe(false)
    expect(isKoopPlusMacCheckoutReady()).toBe(false)
    const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8')) as {
      redirects: Array<{ source: string; destination: string; permanent?: boolean }>
    }
    const hit = vercel.redirects.find((row) => row.source === KOOPPLUS_LEGACY_PATH)
    expect(hit?.destination).toBe(KOOPPLUS_PATH)
    expect(hit?.permanent).toBe(true)
  })

  it('ignores a stale generic KoopPlus product-detail local draft', () => {
    const stale = [genericPdpBlock('koopplus')]
    expect(shouldIgnoreKoopPlusGenericPdp(KOOPPLUS_BUILDER_PAGE_KEY, 'koopplus', stale)).toBe(true)

    const memory = new Map<string, string>()
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      removeItem: (key: string) => {
        memory.delete(key)
      },
    }
    const koopplusKey = 'woontegra_builder_draft_v1:product-koopplus'
    const otherKey = 'woontegra_builder_draft_v1:product-sifre-kasasi'
    memory.set(
      koopplusKey,
      JSON.stringify({ pageKey: KOOPPLUS_BUILDER_PAGE_KEY, blocks: stale, pageMeta: { slug: 'koopplus' } }),
    )
    memory.set(
      otherKey,
      JSON.stringify({ pageKey: 'product-sifre-kasasi', blocks: [genericPdpBlock('sifre-kasasi')] }),
    )

    expect(clearStaleKoopPlusGenericDraft(storage, koopplusKey, KOOPPLUS_BUILDER_PAGE_KEY, 'koopplus')).toBe(true)
    expect(memory.has(koopplusKey)).toBe(false)
    expect(memory.has(otherKey)).toBe(true)
    expect(
      shouldIgnoreKoopPlusGenericPdp('product-sifre-kasasi', 'sifre-kasasi', [genericPdpBlock('sifre-kasasi')]),
    ).toBe(false)
  })

  it('loads KoopPlus as legacy-public when only a stale generic PDP document exists', () => {
    const def = getBuilderPageDefinition(KOOPPLUS_BUILDER_PAGE_KEY)!
    const raw = {
      pages: {
        koopplus: {
          blocks: [genericPdpBlock('koopplus')],
        },
      },
    }
    const resolved = resolveBuilderPageLoad(def, raw)
    expect(resolved.canvasMode).toBe('legacy-public')
    expect(resolved.source).toBe('legacy-public')
    expect(resolved.blocks).toEqual([])
  })

  it('does not treat a koopplus-product draft as a stale generic PDP', () => {
    const block = {
      id: 'koopplus-product-live',
      type: 'koopplus-product',
      sortOrder: 0,
      visibility: { enabled: true },
      style: {},
      settings: { schemaVersion: 1, content: { hero: { title: 'Live' } } },
    } as unknown as BuilderBlock
    expect(shouldIgnoreKoopPlusGenericPdp(KOOPPLUS_BUILDER_PAGE_KEY, 'koopplus', [block])).toBe(false)

    const memory = new Map<string, string>()
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      removeItem: (key: string) => {
        memory.delete(key)
      },
    }
    const key = 'woontegra_builder_draft_v1:product-koopplus'
    memory.set(key, JSON.stringify({ pageKey: KOOPPLUS_BUILDER_PAGE_KEY, blocks: [block] }))
    expect(clearStaleKoopPlusGenericDraft(storage, key, KOOPPLUS_BUILDER_PAGE_KEY, 'koopplus')).toBe(false)
    expect(memory.has(key)).toBe(true)
  })

  it('loads a saved koopplus-product document as builder-blocks', () => {
    const def = getBuilderPageDefinition(KOOPPLUS_BUILDER_PAGE_KEY)!
    const block = {
      id: 'koopplus-product-saved',
      type: 'koopplus-product',
      sortOrder: 0,
      visibility: { enabled: true },
      style: {},
      settings: { schemaVersion: 1, content: { hero: { title: 'Saved' } } },
    }
    const resolved = resolveBuilderPageLoad(def, {
      pages: { koopplus: { blocks: [block] } },
    })
    expect(resolved.canvasMode).toBe('builder-blocks')
    expect(resolved.source).toBe('builder-json')
    expect(resolved.blocks).toHaveLength(1)
    expect(resolved.blocks[0]?.type).toBe('koopplus-product')
  })
})
