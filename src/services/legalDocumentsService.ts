import { publicApi } from '@/api/client'
import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import {
  legalCheckoutPreviewVariables,
  normalizePublicLegalDocument,
  type LegalDocType,
  type PublicLegalDocument,
} from '@/types/legalDocuments'

export const legalDocumentsService = {
  async getByType(type: LegalDocType): Promise<PublicLegalDocument | null> {
    const res = await publicApi.get<ApiSuccess<unknown>>(`/legal-documents/${encodeURIComponent(type)}`)
    return normalizePublicLegalDocument(unwrapApiData(res.data, `legal-documents.${type}`))
  },

  async preview(
    type: LegalDocType,
    variant?: 'DOWNLOAD' | 'SAAS',
    variables?: Record<string, string>,
  ): Promise<PublicLegalDocument | null> {
    const res = await publicApi.post<ApiSuccess<unknown>>('/legal-documents/preview', {
      type,
      variables: variables ?? legalCheckoutPreviewVariables(),
      ...(variant ? { variant } : {}),
    })
    return normalizePublicLegalDocument(unwrapApiData(res.data, 'legal-documents.preview'))
  },
}
