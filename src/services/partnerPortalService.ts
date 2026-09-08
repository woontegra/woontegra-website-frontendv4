import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import type {
  AffiliateCommissionsPayload,
  AffiliateLinksPayload,
  AffiliatePartnerFinancialSummary,
  AffiliatePayoutsPayload,
} from '@/types/affiliatePartner'
import { publicApi } from '@/api/client'
import { AFFILIATE_TABLE_PAGE_SIZE } from '@/components/affiliate/AffiliateListPaginationBar'

export type PartnerMe = {
  id: string
  name: string
  email: string | null
}

const partnerCredentials = { withCredentials: true as const }

/** StrictMode çift mount'ta tek kullanımlık magic link'i iki kez yakmasın (Bilirkişi partnerConsumeMagicOnce). */
const partnerMagicConsumeInflight = new Map<string, Promise<{ partner: PartnerMe; expiresAt: string }>>()

export const partnerPortalService = {
  async consume(token: string): Promise<{ partner: PartnerMe; expiresAt: string }> {
    const res = await publicApi.post<ApiSuccess<{ partner: PartnerMe; expiresAt: string }>>(
      '/partner/auth/consume',
      { token },
      partnerCredentials,
    )
    return unwrapApiData(res.data, 'partnerPortal.consume')
  },

  /**
   * Aynı token için eşzamanlı consume'u tek isteğe indirger.
   * İkinci çağrı 401 olsa bile birinci isteğin kurduğu oturum çereziyle /me dener.
   */
  consumeOnce(token: string): Promise<{ partner: PartnerMe; expiresAt: string }> {
    const key = String(token || '').trim()
    const existing = partnerMagicConsumeInflight.get(key)
    if (existing) return existing

    const promise = (async () => {
      try {
        return await partnerPortalService.consume(key)
      } catch (err) {
        try {
          const partner = await partnerPortalService.me()
          return { partner, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }
        } catch {
          throw err
        }
      }
    })()

    partnerMagicConsumeInflight.set(key, promise)
    return promise
  },

  async logout(): Promise<void> {
    await publicApi.post('/partner/auth/logout', {}, partnerCredentials)
  },

  async me(): Promise<PartnerMe> {
    const res = await publicApi.get<ApiSuccess<PartnerMe>>('/partner/me', partnerCredentials)
    return unwrapApiData(res.data, 'partnerPortal.me')
  },

  async links(page = 1, limit = AFFILIATE_TABLE_PAGE_SIZE): Promise<AffiliateLinksPayload> {
    const res = await publicApi.get<ApiSuccess<AffiliateLinksPayload>>('/partner/links', {
      ...partnerCredentials,
      params: { publicOrigin: window.location.origin, page, limit },
    })
    return unwrapApiData(res.data, 'partnerPortal.links')
  },

  async summary(): Promise<AffiliatePartnerFinancialSummary> {
    const res = await publicApi.get<ApiSuccess<AffiliatePartnerFinancialSummary>>('/partner/summary', {
      ...partnerCredentials,
    })
    return unwrapApiData(res.data, 'partnerPortal.summary')
  },

  async commissions(page = 1, limit = AFFILIATE_TABLE_PAGE_SIZE): Promise<AffiliateCommissionsPayload> {
    const res = await publicApi.get<ApiSuccess<AffiliateCommissionsPayload>>('/partner/commissions', {
      ...partnerCredentials,
      params: { page, limit },
    })
    return unwrapApiData(res.data, 'partnerPortal.commissions')
  },

  async payouts(page = 1, limit = AFFILIATE_TABLE_PAGE_SIZE): Promise<AffiliatePayoutsPayload> {
    const res = await publicApi.get<ApiSuccess<AffiliatePayoutsPayload>>('/partner/payouts', {
      ...partnerCredentials,
      params: { page, limit },
    })
    return unwrapApiData(res.data, 'partnerPortal.payouts')
  },
}
