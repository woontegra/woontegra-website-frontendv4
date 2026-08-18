export const ABOUT_BUILDER_PILOT_PAGE_KEY = 'about'

export function isAboutBuilderPilotPage(pageKey: string | null | undefined): boolean {
  return pageKey === ABOUT_BUILDER_PILOT_PAGE_KEY
}

export type BuilderPersistTarget = 'persistent-draft' | 'page-content'
export type BuilderPreviewDataSource = 'admin-builder-draft' | 'public-page-content'

export function resolveBuilderPersistTarget(pageKey: string): BuilderPersistTarget {
  return isAboutBuilderPilotPage(pageKey) ? 'persistent-draft' : 'page-content'
}

export function resolveBuilderPreviewDataSource(pageKey: string): BuilderPreviewDataSource {
  return isAboutBuilderPilotPage(pageKey) ? 'admin-builder-draft' : 'public-page-content'
}
