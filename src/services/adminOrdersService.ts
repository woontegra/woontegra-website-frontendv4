import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import type {
  AdminOrderDetail,
  AdminOrderLegalArchiveFile,
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

  async generateLegalArchive(
    orderId: string,
    force = false,
  ): Promise<{ packageNo: string; files: AdminOrderLegalArchiveFile[] }> {
    const res = await adminApi.post<ApiSuccess<{ packageNo: string; files: AdminOrderLegalArchiveFile[] }>>(
      `/admin/orders/${encodeURIComponent(orderId)}/legal-archive/generate`,
      { force },
    )
    return unwrapApiData(res.data, 'adminOrders.generateLegalArchive')
  },

  async downloadLegalArchiveFile(orderId: string, fileId: string, fileName: string): Promise<void> {
    const res = await adminApi.get<Blob>(
      `/admin/orders/${encodeURIComponent(orderId)}/legal-archive/files/${encodeURIComponent(fileId)}/download`,
      { responseType: 'blob' },
    )
    const blob = res.data instanceof Blob ? res.data : new Blob([res.data as unknown as BlobPart])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  },
}

export type { AdminOrderListParams, AdminOrderListItem, AdminOrderDetail }
