import type { BuilderPageDefinition } from '@/builder/pages/builderPageRegistry'
import { extractBlocksForPage } from '@/builder/load/pageContentPersistence'
import { convertPageToBlocks } from '@/builder/load/convertPageToBlocks'
import { sanitizeAboutBuilderBlocks } from '@/builder/templates/aboutEditableTemplate'
import type { BuilderBlock } from '@/builder/types'
import type { BuilderPageStateDto } from '@/types/builderPages'
import { payloadsDiffer } from '@/builder/pilot/stablePayload'

export function resolveAboutPilotBlocks(
  def: BuilderPageDefinition,
  state: BuilderPageStateDto,
): { blocks: BuilderBlock[]; raw: Record<string, unknown> | null } {
  const raw = state.draftContent
  if (!raw) return { blocks: [], raw: null }

  const extracted = extractBlocksForPage(raw, def)
  if (extracted?.length) {
    return { blocks: sanitizeAboutBuilderBlocks(extracted), raw }
  }

  const converted = convertPageToBlocks(def, raw)
  return { blocks: converted.blocks, raw }
}

export function hasUnpublishedAboutChanges(state: BuilderPageStateDto): boolean {
  if (!state.publishedContent) return Boolean(state.draftContent)
  if (!state.draftContent) return false
  return payloadsDiffer(state.draftContent, state.publishedContent)
}

export function canOpenAboutDraftPreview(state: Pick<BuilderPageStateDto, 'hasBuilderRecord'>): boolean {
  return state.hasBuilderRecord === true
}

export function shouldKeepAboutEditorOnLoadError(input: {
  previousPageKey: string
  nextPageKey: string
  blockCount: number
  status: string
}): boolean {
  return (
    input.previousPageKey === input.nextPageKey &&
    input.blockCount > 0 &&
    input.status === 'ready'
  )
}
