import type { BuilderBlock } from '@/builder/types/blocks'
import type { BuilderPageDefinition } from '@/builder/pages/builderPageRegistry'
import type { ConversionReport } from '@/builder/load/conversionReport'
import { logConversionReport } from '@/builder/load/conversionReport'
import { createHomeEditableTemplate } from '@/builder/templates/homeEditableTemplate'
import { createAboutEditableTemplate } from '@/builder/templates/aboutEditableTemplate'
import { createServicesLandingEditableTemplate } from '@/builder/templates/servicesLandingEditableTemplate'
import { createSolutionsLandingEditableTemplate } from '@/builder/templates/solutionsLandingEditableTemplate'
import {
  createBlogLandingEditableTemplate,
  createContactEditableTemplate,
  createLegalEditableTemplate,
  createSoftwareLandingEditableTemplate,
} from '@/builder/templates/landingEditableTemplates'
import { createServiceDetailEditableTemplate } from '@/builder/templates/serviceDetailEditableTemplate'
import { createSolutionDetailEditableTemplate } from '@/builder/templates/solutionDetailEditableTemplate'
import { createProductDetailEditableTemplate } from '@/builder/templates/productDetailEditableTemplate'
import { createBlogDetailEditableTemplate } from '@/builder/templates/blogDetailEditableTemplate'
import { emptyParityReport } from '@/builder/parity/pushLegacy'

function editableResult(pageKey: string, blocks: BuilderBlock[]): { blocks: BuilderBlock[]; report: ConversionReport } {
  const report: ConversionReport = {
    ...emptyParityReport(pageKey),
    convertedCount: blocks.length,
    legacyCount: 0,
    sections: blocks.map((b) => ({
      key: b.id,
      title: b.title ?? b.type,
      mode: 'builder-block' as const,
      note: `${b.type} — editable`,
    })),
    unmapped: [],
  }
  return { blocks, report }
}

export function convertPageParityBlocks(
  def: BuilderPageDefinition,
  raw: Record<string, unknown> | null,
): { blocks: BuilderBlock[]; report: ConversionReport } {
  switch (def.kind) {
    case 'landing':
      if (def.key === 'home') return editableResult(def.key, createHomeEditableTemplate(raw))
      if (def.key === 'about') return editableResult(def.key, createAboutEditableTemplate(raw))
      if (def.key === 'services') return editableResult(def.key, createServicesLandingEditableTemplate(raw))
      if (def.key === 'solutions') return editableResult(def.key, createSolutionsLandingEditableTemplate(raw))
      if (def.key === 'software') return editableResult(def.key, createSoftwareLandingEditableTemplate(raw))
      if (def.key === 'blog') return editableResult(def.key, createBlogLandingEditableTemplate(raw))
      if (def.key === 'contact') return editableResult(def.key, createContactEditableTemplate(raw))
      break
    case 'service-detail':
      return editableResult(
        def.key,
        createServiceDetailEditableTemplate(def.slug ?? '', def.title, raw),
      )
    case 'solution-detail':
      return editableResult(
        def.key,
        createSolutionDetailEditableTemplate(def.slug ?? '', def.title, raw),
      )
    case 'product-detail':
      return editableResult(def.key, createProductDetailEditableTemplate(def.slug ?? '', raw))
    case 'blog-detail':
      return editableResult(def.key, createBlogDetailEditableTemplate(def.slug ?? '', def.title, raw))
    case 'legal':
      return editableResult(def.key, createLegalEditableTemplate(def, raw))
    default:
      break
  }

  const report = emptyParityReport(def.key)
  report.unmapped.push('Dönüşüm tanımlı değil')
  return { blocks: [], report }
}

export function convertPageToBlocksWithParity(
  def: BuilderPageDefinition,
  raw: Record<string, unknown> | null,
): { blocks: BuilderBlock[]; report: ConversionReport } {
  const result = convertPageParityBlocks(def, raw)
  logConversionReport(result.report)
  return result
}
