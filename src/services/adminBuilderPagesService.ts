import axios from 'axios'
import { adminApi, getErrorMessage } from '@/api/client'
import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import type {
  BuilderPageStateDto,
  BuilderPublishResponseDto,
  BuilderRevisionDetailDto,
  BuilderRevisionListItemDto,
} from '@/types/builderPages'

function asObject(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return null
}

function parseState(raw: unknown): BuilderPageStateDto {
  const row = asObject(raw) ?? {}
  const source = row.source
  return {
    pageKey: typeof row.pageKey === 'string' ? row.pageKey : '',
    hasBuilderRecord: row.hasBuilderRecord === true,
    source: source === 'empty' || source === 'page-content' || source === 'builder-draft' ? source : 'empty',
    draftContent: asObject(row.draftContent),
    draftUpdatedAt: typeof row.draftUpdatedAt === 'string' ? row.draftUpdatedAt : null,
    publishedContent: asObject(row.publishedContent),
    publishedAt: typeof row.publishedAt === 'string' ? row.publishedAt : null,
    publishedRevision: typeof row.publishedRevision === 'number' ? row.publishedRevision : null,
    pageContentUpdatedAt: typeof row.pageContentUpdatedAt === 'string' ? row.pageContentUpdatedAt : null,
  }
}

export const adminBuilderPagesService = {
  async getState(pageKey: string): Promise<BuilderPageStateDto> {
    const res = await adminApi.get<ApiSuccess<BuilderPageStateDto>>(`/admin/builder-pages/${pageKey}`)
    return parseState(unwrapApiData(res.data, `builder-pages.${pageKey}`))
  },

  async saveDraft(pageKey: string, content: Record<string, unknown>): Promise<BuilderPageStateDto> {
    const res = await adminApi.put<ApiSuccess<BuilderPageStateDto>>(`/admin/builder-pages/${pageKey}/draft`, {
      content,
    })
    return parseState(unwrapApiData(res.data, `builder-pages.${pageKey}.draft`))
  },

  async publish(pageKey: string): Promise<BuilderPublishResponseDto> {
    const res = await adminApi.post<ApiSuccess<BuilderPublishResponseDto>>(
      `/admin/builder-pages/${pageKey}/publish`,
    )
    const payload = unwrapApiData(res.data, `builder-pages.${pageKey}.publish`)
    const row = asObject(payload) ?? {}
    return {
      state: parseState(row.state),
      revisionCreated: row.revisionCreated === true,
      revision: typeof row.revision === 'number' ? row.revision : null,
    }
  },

  async listRevisions(pageKey: string): Promise<BuilderRevisionListItemDto[]> {
    const res = await adminApi.get<ApiSuccess<BuilderRevisionListItemDto[]>>(
      `/admin/builder-pages/${pageKey}/revisions`,
    )
    const data = unwrapApiData(res.data, `builder-pages.${pageKey}.revisions`)
    if (!Array.isArray(data)) return []
    return data.map((item) => {
      const row = asObject(item) ?? {}
      return {
        id: String(row.id ?? ''),
        revision: typeof row.revision === 'number' ? row.revision : 0,
        createdAt: typeof row.createdAt === 'string' ? row.createdAt : '',
        createdByUserId: typeof row.createdByUserId === 'string' ? row.createdByUserId : null,
        createdByEmail: typeof row.createdByEmail === 'string' ? row.createdByEmail : null,
      }
    })
  },

  async getRevision(pageKey: string, revisionId: string): Promise<BuilderRevisionDetailDto> {
    const res = await adminApi.get<ApiSuccess<BuilderRevisionDetailDto>>(
      `/admin/builder-pages/${pageKey}/revisions/${revisionId}`,
    )
    const row = asObject(unwrapApiData(res.data, `builder-pages.${pageKey}.revision`)) ?? {}
    return {
      id: String(row.id ?? ''),
      revision: typeof row.revision === 'number' ? row.revision : 0,
      createdAt: typeof row.createdAt === 'string' ? row.createdAt : '',
      createdByUserId: typeof row.createdByUserId === 'string' ? row.createdByUserId : null,
      createdByEmail: typeof row.createdByEmail === 'string' ? row.createdByEmail : null,
      content: asObject(row.content) ?? {},
    }
  },
}

export function getBuilderPagesErrorMessage(error: unknown, fallback = 'İşlem başarısız'): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const apiMessage =
      typeof error.response?.data?.message === 'string' ? error.response.data.message : null
    if (status === 409) return apiMessage || 'Taslak bulunamadı'
    if (status === 400) return apiMessage || fallback
  }
  return getErrorMessage(error, fallback)
}
