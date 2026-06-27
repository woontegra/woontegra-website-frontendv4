import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import type { PublicCampaignBrief } from '@/types/campaign'
import { normalizePublicCampaignBrief } from '@/types/campaign'
import { publicApi } from '@/api/client'

export type PublicCampaignsPayload = {
  announcement: PublicCampaignBrief | null
  banners: PublicCampaignBrief[]
}

export const campaignsService = {
  async getPublic(): Promise<PublicCampaignsPayload> {
    try {
      const res = await publicApi.get<ApiSuccess<PublicCampaignsPayload>>('/campaigns/public')
      const data = unwrapApiData(res.data, 'campaigns.public') as PublicCampaignsPayload
      return {
        announcement: data.announcement ? normalizePublicCampaignBrief(data.announcement) : null,
        banners: Array.isArray(data.banners)
          ? data.banners
              .map((x: unknown) => normalizePublicCampaignBrief(x))
              .filter((x): x is PublicCampaignBrief => x != null)
          : [],
      }
    } catch {
      return { announcement: null, banners: [] }
    }
  },
}
