import type { BuilderBlock } from '@/builder/types'
import { parseBuilderBlocksFromRaw } from '@/builder/load/parseBuilderBlocks'

/** Public sayfalar — kaydedilmiş builder JSON'unu okur */
export function resolvePublicPageBlocks(
  raw: Record<string, unknown> | null | undefined,
  slug?: string,
): BuilderBlock[] | null {
  if (!raw || typeof raw !== 'object') return null

  const top = parseBuilderBlocksFromRaw(raw)
  if (top?.length) return top

  if (slug && raw.pages && typeof raw.pages === 'object') {
    const page = (raw.pages as Record<string, unknown>)[slug]
    if (page && typeof page === 'object') {
      const nested = parseBuilderBlocksFromRaw(page as Record<string, unknown>)
      if (nested?.length) return nested
    }
  }

  return null
}
