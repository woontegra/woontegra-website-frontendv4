import { publicApi } from '@/api/client'
import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import {
  getPromotionalSoftwareDetail,
  isPromotionalSoftwareSlug,
  mergePublicSoftwareList,
} from '@/lib/publicSoftwareCatalog'
import type { PublicProductDetail, PublicProductListItem } from '@/types/product'
import { normalizePublicDetail, normalizePublicList } from '@/types/product'

export const productsService = {
  async list(): Promise<PublicProductListItem[]> {
    const res = await publicApi.get<ApiSuccess<PublicProductListItem[]>>('/products')
    const apiList = normalizePublicList(unwrapApiData(res.data, 'products.list'))
    return mergePublicSoftwareList(apiList)
  },

  async getBySlug(slug: string): Promise<PublicProductDetail> {
    if (isPromotionalSoftwareSlug(slug)) {
      const promotional = getPromotionalSoftwareDetail(slug)
      if (promotional) return promotional
    }

    const res = await publicApi.get<ApiSuccess<PublicProductDetail>>(`/products/${encodeURIComponent(slug)}`)
    const row = normalizePublicDetail(unwrapApiData(res.data, 'products.getBySlug'))
    if (!row) throw new Error('Yazılım bulunamadı')
    return row
  },
}
