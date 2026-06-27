import type { BuilderBlock } from '@/builder/types/blocks'
import { createLegacySectionBlock } from '@/builder/types/legacySection'
import { assignSortOrder } from '@/builder/load/parseBuilderBlocks'
import {
  createEmptyReport,
  type ConversionReport,
  type ConversionSectionEntry,
} from '@/builder/load/conversionReport'

export function parityBlockId(sectionKey: string, order: number): string {
  return `legacy-${sectionKey.replace(/\./g, '-')}-${order}`
}

export function pushParityLegacy(
  blocks: BuilderBlock[],
  report: ConversionReport,
  order: number,
  sectionKey: string,
  title: string,
  payload?: unknown,
  source = 'public-parity',
  note?: string,
): number {
  blocks.push(
    createLegacySectionBlock(parityBlockId(sectionKey, order), order, sectionKey, title, payload, source),
  )
  const entry: ConversionSectionEntry = {
    key: sectionKey,
    title,
    mode: 'legacy-section',
    note: note ?? 'Public component — görünüm korundu',
  }
  report.sections.push(entry)
  report.legacyCount += 1
  report.convertedCount += 1
  return order + 1
}

export function emptyParityReport(pageKey: string): ConversionReport {
  return createEmptyReport(pageKey)
}

export function assignParityBlocks(blocks: BuilderBlock[], report: ConversionReport): {
  blocks: BuilderBlock[]
  report: ConversionReport
} {
  return { blocks: assignSortOrder(blocks), report }
}
