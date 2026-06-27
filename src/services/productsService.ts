import { publicApi } from '@/api/client'
import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import type { PublicProductDetail, PublicProductListItem } from '@/types/product'
import { normalizePublicDetail, normalizePublicList } from '@/types/product'

export const productsService = {
  async list(): Promise<PublicProductListItem[]> {
    const res = await publicApi.get<ApiSuccess<PublicProductListItem[]>>('/products')
    return normalizePublicList(unwrapApiData(res.data, 'products.list'))
  },

  async getBySlug(slug: string): Promise<PublicProductDetail> {
    const res = await publicApi.get<ApiSuccess<PublicProductDetail>>(`/products/${encodeURIComponent(slug)}`)
    const row = normalizePublicDetail(unwrapApiData(res.data, 'products.getBySlug'))
    if (!row) throw new Error('Yazılım bulunamadı')
    return row
  },
}
