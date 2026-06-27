import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import type {
  AdminOrderDetail,
  AdminOrderLicensePatchBody,
  AdminOrderListItem,
  AdminOrderListParams,
  AdminOrderUpdateBody,
} from '@/types/order'
import { normalizeAdminOrderDetail, normalizeAdminOrderList } from '@/types/order'
import { adminApi } from '@/api/client'

export const adminOrdersService = {
  async list(params?: AdminOrderListParams): Promise<AdminOrderListItem[]> {
    const res = await adminApi.get<ApiSuccess<unknown>>('/admin/orders', { params })
    return normalizeAdminOrderList(unwrapApiData(res.data, 'adminOrders.list'))
  },

  async getById(id: string): Promise<AdminOrderDetail> {
    const res = await adminApi.get<ApiSuccess<unknown>>(`/admin/orders/${encodeURIComponent(id)}`)
    const row = normalizeAdminOrderDetail(unwrapApiData(res.data, 'adminOrders.getById'))
    if (!row) throw new Error('Sipariş bulunamadı')
    return row
  },

  async update(id: string, body: AdminOrderUpdateBody): Promise<void> {
    await adminApi.patch(`/admin/orders/${encodeURIComponent(id)}`, body)
  },

  async confirmBankTransfer(
    id: string,
    body: { paymentDate: string; bankNote: string; reference?: string },
  ): Promise<{ orderNo: string; alreadyPaid: boolean }> {
    const res = await adminApi.patch<ApiSuccess<{ orderNo: string; alreadyPaid: boolean }>>(
      `/admin/orders/${encodeURIComponent(id)}/confirm-bank-transfer`,
      body,
    )
    return unwrapApiData(res.data, 'adminOrders.confirmBankTransfer')
  },

  async patchOrderLicense(
    orderId: string,
    licenseId: string,
    body: AdminOrderLicensePatchBody,
  ): Promise<void> {
    await adminApi.patch(
      `/admin/orders/${encodeURIComponent(orderId)}/licenses/${encodeURIComponent(licenseId)}`,
      body,
    )
  },

  async retryDelivery(id: string): Promise<void> {
    await adminApi.post(`/admin/orders/${encodeURIComponent(id)}/retry-delivery`)
  },
}

export type { AdminOrderListParams, AdminOrderListItem, AdminOrderDetail }
