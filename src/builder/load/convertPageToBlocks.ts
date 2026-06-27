import type { BuilderBlock } from '@/builder/types/blocks'
import type { BuilderPageDefinition } from '@/builder/pages/builderPageRegistry'
import { convertPageToBlocksWithParity } from '@/builder/parity/convertPageParityBlocks'

export type PageConversionResult = {
  blocks: BuilderBlock[]
  report: import('@/builder/load/conversionReport').ConversionReport
}

/** Builder'a dönüştür — public görünüm parity öncelikli. */
export function convertPageToBlocks(
  def: BuilderPageDefinition,
  raw: Record<string, unknown> | null,
): PageConversionResult {
  return convertPageToBlocksWithParity(def, raw)
}
