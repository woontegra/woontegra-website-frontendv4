export type ConversionSectionEntry = {
  key: string
  title: string
  mode: 'builder-block' | 'legacy-section'
  note?: string
}

export type ConversionReport = {
  pageKey: string
  convertedCount: number
  legacyCount: number
  sections: ConversionSectionEntry[]
  unmapped: string[]
}

export function createEmptyReport(pageKey: string): ConversionReport {
  return {
    pageKey,
    convertedCount: 0,
    legacyCount: 0,
    sections: [],
    unmapped: [],
  }
}

export function logConversionReport(report: ConversionReport): void {
  console.group(`[Builder] Dönüştürme raporu — ${report.pageKey}`)
  console.info(`Builder blok: ${report.convertedCount}, Legacy section: ${report.legacyCount}`)
  report.sections.forEach((s) => {
    console.info(`  · ${s.title} (${s.key}) → ${s.mode}${s.note ? ` — ${s.note}` : ''}`)
  })
  if (report.unmapped.length > 0) {
    console.warn('Map edilemeyen alanlar:', report.unmapped)
  }
  console.groupEnd()
}
