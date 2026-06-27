import type { BuilderBlock } from '@/builder/types'

export type PageLoadSource = 'builder-json' | 'page-content' | 'empty-template' | 'legacy-public'

export function isBuilderBlock(value: unknown): value is BuilderBlock {
  if (!value || typeof value !== 'object') return false
  const row = value as Record<string, unknown>
  return typeof row.type === 'string' && typeof row.id === 'string'
}

/** page-content veya builder export içindeki blocks dizisini çıkarır */
export function parseBuilderBlocksFromRaw(raw: Record<string, unknown> | null): BuilderBlock[] | null {
  if (!raw) return null

  const candidates = [
    raw.blocks,
    (raw.page as Record<string, unknown> | undefined)?.blocks,
    (raw.builder as Record<string, unknown> | undefined)?.blocks,
  ]

  for (const candidate of candidates) {
    if (!Array.isArray(candidate) || candidate.length === 0) continue
    const blocks = candidate.filter(isBuilderBlock)
    if (blocks.length > 0) {
      return blocks.map((block, index) => ({ ...block, sortOrder: index }))
    }
  }

  return null
}

export function extractSeoFromRaw(raw: Record<string, unknown> | null): {
  seoTitle?: string
  seoDescription?: string
} {
  if (!raw) return {}
  const title = String(raw.seoTitle ?? '').trim()
  const description = String(raw.seoDescription ?? '').trim()
  return {
    seoTitle: title || undefined,
    seoDescription: description || undefined,
  }
}

export function assignSortOrder(blocks: BuilderBlock[]): BuilderBlock[] {
  return blocks.map((block, index) => ({ ...block, sortOrder: index }))
}
