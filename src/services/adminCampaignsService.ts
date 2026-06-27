import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import type { Campaign, CampaignType } from '@/types/campaign'
import { normalizeCampaign, normalizeCampaignList } from '@/types/campaign'
import { adminApi, getErrorMessage } from '@/api/client'

export type AdminCampaignListParams = {
  search?: string
  type?: CampaignType
  active?: 'true' | 'false'
  schedule?: 'scheduled' | 'expired' | 'product_discount' | 'coupon'
}

export type CampaignInput = Partial<Campaign> & Pick<Campaign, 'name' | 'type'>

export const adminCampaignsService = {
  async list(params?: AdminCampaignListParams): Promise<Campaign[]> {
    const res = await adminApi.get<ApiSuccess<Campaign[]>>('/admin/campaigns', { params })
    return normalizeCampaignList(unwrapApiData(res.data, 'adminCampaigns.list'))
  },

  async getById(id: string): Promise<Campaign> {
    const res = await adminApi.get<ApiSuccess<Campaign>>(`/admin/campaigns/${encodeURIComponent(id)}`)
    const row = normalizeCampaign(unwrapApiData(res.data, 'adminCampaigns.getById'))
    if (!row) throw new Error('Kampanya bulunamadı')
    return row
  },

  async create(payload: CampaignInput): Promise<Campaign> {
    const res = await adminApi.post<ApiSuccess<Campaign>>('/admin/campaigns', payload)
    const row = normalizeCampaign(unwrapApiData(res.data, 'adminCampaigns.create'))
    if (!row) throw new Error('Kampanya oluşturulamadı')
    return row
  },

  async update(id: string, payload: Partial<CampaignInput>): Promise<Campaign> {
    const res = await adminApi.patch<ApiSuccess<Campaign>>(`/admin/campaigns/${encodeURIComponent(id)}`, payload)
    const row = normalizeCampaign(unwrapApiData(res.data, 'adminCampaigns.update'))
    if (!row) throw new Error('Kampanya güncellenemedi')
    return row
  },

  async remove(id: string): Promise<void> {
    await adminApi.delete(`/admin/campaigns/${encodeURIComponent(id)}`)
  },
}

export { getErrorMessage }
