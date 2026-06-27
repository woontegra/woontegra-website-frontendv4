import { publicApi } from '@/api/client'
import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import type { CartPreviewRow } from '@/types/checkout'

export const checkoutService = {
  async cartPreview(productIds: string[]): Promise<CartPreviewRow[]> {
    const res = await publicApi.post<ApiSuccess<CartPreviewRow[]>>('/products/cart-preview', {
      productIds,
    })
    return unwrapApiData(res.data, 'products.cartPreview')
  },
}
