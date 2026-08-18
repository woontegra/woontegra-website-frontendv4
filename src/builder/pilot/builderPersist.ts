import type { BuilderPageDefinition } from '@/builder/pages/builderPageRegistry'
import type { BuilderBlock } from '@/builder/types'
import { buildPageContentPayload } from '@/builder/load/pageContentPersistence'
import { isAboutBuilderPilotPage, resolveBuilderPersistTarget } from '@/builder/pilot/aboutBuilderPilot'
import { adminBuilderPagesService } from '@/services/adminBuilderPagesService'
import { pageContentService } from '@/services/pageContentService'
import type { BuilderPageStateDto } from '@/types/builderPages'

export type BuilderPersistDeps = {
  saveDraft: typeof adminBuilderPagesService.saveDraft
  publish: typeof adminBuilderPagesService.publish
  updatePageContent: typeof pageContentService.updateByKey
}

const defaultDeps: BuilderPersistDeps = {
  saveDraft: (pageKey, content) => adminBuilderPagesService.saveDraft(pageKey, content),
  publish: (pageKey) => adminBuilderPagesService.publish(pageKey),
  updatePageContent: (key, content) => pageContentService.updateByKey(key, content),
}

export function buildCurrentPagePayload(
  def: BuilderPageDefinition,
  blocks: BuilderBlock[],
  existingRaw: Record<string, unknown> | null,
): Record<string, unknown> {
  return buildPageContentPayload(def, blocks, existingRaw)
}

export async function persistBuilderPage(
  pageKey: string,
  def: BuilderPageDefinition,
  blocks: BuilderBlock[],
  existingRaw: Record<string, unknown> | null,
  deps: BuilderPersistDeps = defaultDeps,
): Promise<{ kind: 'persistent-draft'; state: BuilderPageStateDto } | { kind: 'page-content'; saved: Record<string, unknown> }> {
  const content = buildCurrentPagePayload(def, blocks, existingRaw)
  if (resolveBuilderPersistTarget(pageKey) === 'persistent-draft') {
    const state = await deps.saveDraft(pageKey, content)
    return { kind: 'persistent-draft', state }
  }
  const saved = await deps.updatePageContent(def.contentKey, content)
  return { kind: 'page-content', saved }
}

export async function publishBuilderPilotPage(
  pageKey: string,
  deps: Pick<BuilderPersistDeps, 'publish'> = defaultDeps,
) {
  if (!isAboutBuilderPilotPage(pageKey)) {
    throw new Error('Bu sayfa için kalıcı yayın desteklenmiyor')
  }
  return deps.publish(pageKey)
}
