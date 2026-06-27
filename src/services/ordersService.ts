import { publicApi } from '@/api/client'
import type { ApiSuccess } from '@/types/api'
import type { CreateOrderBody, CreateOrderResponse } from '@/types/checkout'
import type { OrderSuccessData } from '@/types/orderSuccess'
import { unwrapApiData } from '@/types/api'
import { customerAuthHeaders } from '@/lib/customerAuth'

export const ordersService = {
  async create(body: CreateOrderBody): Promise<CreateOrderResponse> {
    const res = await publicApi.post<ApiSuccess<CreateOrderResponse>>('/orders', body, {
      headers: customerAuthHeaders(),
    })
    return unwrapApiData(res.data, 'orders.create')
  },

  async getSuccess(orderNo: string, customerEmail?: string): Promise<OrderSuccessData> {
    const q = customerEmail ? `?customerEmail=${encodeURIComponent(customerEmail)}` : ''
    const res = await publicApi.get<ApiSuccess<OrderSuccessData>>(
      `/orders/success/${encodeURIComponent(orderNo)}${q}`,
      { headers: customerAuthHeaders() },
    )
    return unwrapApiData(res.data, 'orders.success')
  },
}
