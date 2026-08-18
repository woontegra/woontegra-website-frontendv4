export type BuilderPageSource = 'empty' | 'page-content' | 'builder-draft'

export type BuilderPageStateDto = {
  pageKey: string
  hasBuilderRecord: boolean
  source: BuilderPageSource
  draftContent: Record<string, unknown> | null
  draftUpdatedAt: string | null
  publishedContent: Record<string, unknown> | null
  publishedAt: string | null
  publishedRevision: number | null
  pageContentUpdatedAt: string | null
}

export type BuilderPublishResponseDto = {
  state: BuilderPageStateDto
  revisionCreated: boolean
  revision: number | null
}

export type BuilderRevisionListItemDto = {
  id: string
  revision: number
  createdAt: string
  createdByUserId: string | null
  createdByEmail: string | null
}

export type BuilderRevisionDetailDto = BuilderRevisionListItemDto & {
  content: Record<string, unknown>
}

export type BuilderPagesApiError = {
  status: number | null
  message: string
}
