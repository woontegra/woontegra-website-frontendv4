import type { BuilderBlock } from '@/builder/types/blocks'
import type { ConversionReport } from '@/builder/load/conversionReport'
import { emptyParityReport } from '@/builder/parity/pushLegacy'
import {
  createDefaultKoopPlusProductBlock,
  KOOPPLUS_PRODUCT_BLOCK_TYPE,
} from '@/builder/types/koopplusProduct'

export function createKoopPlusProductBuilderTemplate(): BuilderBlock[] {
  return [createDefaultKoopPlusProductBlock(0)]
}

export function convertKoopPlusPublicSourceToBuilder(pageKey: string): {
  blocks: BuilderBlock[]
  report: ConversionReport
} {
  const blocks = createKoopPlusProductBuilderTemplate()
  const block = blocks[0]
  const report: ConversionReport = {
    ...emptyParityReport(pageKey),
    convertedCount: 1,
    legacyCount: 0,
    sections: [
      {
        key: block.id,
        title: block.title ?? KOOPPLUS_PRODUCT_BLOCK_TYPE,
        mode: 'builder-block',
        note: `${KOOPPLUS_PRODUCT_BLOCK_TYPE} — mapped from public KoopPlus source`,
      },
    ],
    unmapped: [],
  }
  return { blocks, report }
}
