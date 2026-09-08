import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import type {
  AffiliateCommissionsPayload,
  AffiliateCreatePayoutInput,
  AffiliateEarnedForPayoutItem,
  AffiliateLink,
  AffiliateLinksPayload,
  AffiliatePartner,
  AffiliatePartnerFinancialSummary,
  AffiliatePartnerInput,
  AffiliatePayoutRow,
  AffiliatePayoutsPayload,
  PartnerAccessInviteResult,
} from '@/types/affiliatePartner'
import { adminApi, getErrorMessage } from '@/api/client'
import { AFFILIATE_TABLE_PAGE_SIZE } from '@/components/affiliate/AffiliateListPaginationBar'

export type AdminAffiliatePartnerListParams = {
  search?: string
  isActive?: 'true' | 'false'
}

function publicOriginPayload() {
  return { publicOrigin: typeof window !== 'undefined' ? window.location.origin : undefined }
}

export const adminAffiliatePartnersService = {
  async list(params?: AdminAffiliatePartnerListParams): Promise<AffiliatePartner[]> {
    const res = await adminApi.get<ApiSuccess<AffiliatePartner[]>>('/admin/affiliate-partners', { params })
    return unwrapApiData(res.data, 'adminAffiliatePartners.list')
  },

  async getById(id: string): Promise<AffiliatePartner> {
    const res = await adminApi.get<ApiSuccess<AffiliatePartner>>(
      `/admin/affiliate-partners/${encodeURIComponent(id)}`,
      { headers: { 'X-Public-Origin': window.location.origin } },
    )
    return unwrapApiData(res.data, 'adminAffiliatePartners.getById')
  },

  async create(payload: AffiliatePartnerInput): Promise<AffiliatePartner> {
    const res = await adminApi.post<ApiSuccess<AffiliatePartner>>('/admin/affiliate-partners', payload)
    return unwrapApiData(res.data, 'adminAffiliatePartners.create')
  },

  async update(id: string, payload: Partial<AffiliatePartnerInput>): Promise<AffiliatePartner> {
    const res = await adminApi.patch<ApiSuccess<AffiliatePartner>>(
      `/admin/affiliate-partners/${encodeURIComponent(id)}`,
      payload,
    )
    return unwrapApiData(res.data, 'adminAffiliatePartners.update')
  },

  async deactivate(id: string): Promise<AffiliatePartner> {
    const res = await adminApi.post<ApiSuccess<AffiliatePartner>>(
      `/admin/affiliate-partners/${encodeURIComponent(id)}/deactivate`,
    )
    return unwrapApiData(res.data, 'adminAffiliatePartners.deactivate')
  },

  async activate(id: string): Promise<AffiliatePartner> {
    const res = await adminApi.post<ApiSuccess<AffiliatePartner>>(
      `/admin/affiliate-partners/${encodeURIComponent(id)}/activate`,
    )
    return unwrapApiData(res.data, 'adminAffiliatePartners.activate')
  },

  async invitePartnerAccess(id: string): Promise<PartnerAccessInviteResult> {
    const res = await adminApi.post<ApiSuccess<PartnerAccessInviteResult>>(
      `/admin/affiliate-partners/${encodeURIComponent(id)}/partner-access/invite`,
      publicOriginPayload(),
    )
    return unwrapApiData(res.data, 'adminAffiliatePartners.invitePartnerAccess')
  },

  async revokePartnerAccess(id: string): Promise<{ access: PartnerAccessInviteResult['access'] }> {
    const res = await adminApi.post<ApiSuccess<{ access: PartnerAccessInviteResult['access'] }>>(
      `/admin/affiliate-partners/${encodeURIComponent(id)}/partner-access/revoke`,
    )
    return unwrapApiData(res.data, 'adminAffiliatePartners.revokePartnerAccess')
  },

  async createLink(partnerId: string, productId: string): Promise<AffiliateLink> {
    const res = await adminApi.post<ApiSuccess<AffiliateLink>>(
      `/admin/affiliate-partners/${encodeURIComponent(partnerId)}/links`,
      { productId, ...publicOriginPayload() },
    )
    return unwrapApiData(res.data, 'adminAffiliatePartners.createLink')
  },

  async listLinks(
    id: string,
    page = 1,
    limit = AFFILIATE_TABLE_PAGE_SIZE,
  ): Promise<AffiliateLinksPayload> {
    const res = await adminApi.get<ApiSuccess<AffiliateLinksPayload>>(
      `/admin/affiliate-partners/${encodeURIComponent(id)}/links`,
      {
        params: { page, limit, publicOrigin: typeof window !== 'undefined' ? window.location.origin : undefined },
        headers: { 'X-Public-Origin': window.location.origin },
      },
    )
    return unwrapApiData(res.data, 'adminAffiliatePartners.listLinks')
  },

  async deactivateLink(linkId: string): Promise<AffiliateLink> {
    const res = await adminApi.post<ApiSuccess<AffiliateLink>>(
      `/admin/affiliate-partners/links/${encodeURIComponent(linkId)}/deactivate`,
      publicOriginPayload(),
    )
    return unwrapApiData(res.data, 'adminAffiliatePartners.deactivateLink')
  },

  async getSummary(id: string): Promise<AffiliatePartnerFinancialSummary> {
    const res = await adminApi.get<ApiSuccess<AffiliatePartnerFinancialSummary>>(
      `/admin/affiliate-partners/${encodeURIComponent(id)}/summary`,
    )
    return unwrapApiData(res.data, 'adminAffiliatePartners.getSummary')
  },

  async listCommissions(
    id: string,
    page = 1,
    limit = AFFILIATE_TABLE_PAGE_SIZE,
  ): Promise<AffiliateCommissionsPayload> {
    const res = await adminApi.get<ApiSuccess<AffiliateCommissionsPayload>>(
      `/admin/affiliate-partners/${encodeURIComponent(id)}/commissions`,
      { params: { page, limit } },
    )
    return unwrapApiData(res.data, 'adminAffiliatePartners.listCommissions')
  },

  async listPayouts(
    id: string,
    page = 1,
    limit = AFFILIATE_TABLE_PAGE_SIZE,
  ): Promise<AffiliatePayoutsPayload> {
    const res = await adminApi.get<ApiSuccess<AffiliatePayoutsPayload>>(
      `/admin/affiliate-partners/${encodeURIComponent(id)}/payouts`,
      { params: { page, limit } },
    )
    return unwrapApiData(res.data, 'adminAffiliatePartners.listPayouts')
  },

  async listEarnedForPayout(id: string): Promise<{ items: AffiliateEarnedForPayoutItem[] }> {
    const res = await adminApi.get<ApiSuccess<{ items: AffiliateEarnedForPayoutItem[] }>>(
      `/admin/affiliate-partners/${encodeURIComponent(id)}/payouts/earned`,
    )
    return unwrapApiData(res.data, 'adminAffiliatePartners.listEarnedForPayout')
  },

  async createPayout(id: string, payload: AffiliateCreatePayoutInput): Promise<AffiliatePayoutRow> {
    const res = await adminApi.post<ApiSuccess<AffiliatePayoutRow>>(
      `/admin/affiliate-partners/${encodeURIComponent(id)}/payouts`,
      payload,
    )
    return unwrapApiData(res.data, 'adminAffiliatePartners.createPayout')
  },
}

export { getErrorMessage }
