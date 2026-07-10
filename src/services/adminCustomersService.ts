import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import { adminApi } from '@/api/client'
import {
  normalizeAdminCustomerDetail,
  normalizeAdminCustomerList,
  normalizeAdminCustomerSummary,
  type AdminCustomerDetail,
  type AdminCustomerListItem,
  type AdminCustomerListParams,
  type AdminCustomerSummary,
  type AdminUpdateCustomerInput,
} from '@/types/adminCustomer'

export const adminCustomersService = {
  async list(params?: AdminCustomerListParams): Promise<AdminCustomerListItem[]> {
    const res = await adminApi.get<ApiSuccess<unknown>>('/admin/customers', { params })
    return normalizeAdminCustomerList(unwrapApiData(res.data, 'adminCustomers.list'))
  },

  async getById(id: string): Promise<AdminCustomerDetail> {
    const res = await adminApi.get<ApiSuccess<unknown>>(`/admin/customers/${encodeURIComponent(id)}`)
    const row = normalizeAdminCustomerDetail(unwrapApiData(res.data, 'adminCustomers.getById'))
    if (!row) throw new Error('Müşteri bulunamadı')
    return row
  },

  async getSummary(): Promise<AdminCustomerSummary> {
    const res = await adminApi.get<ApiSuccess<unknown>>('/admin/customers/summary')
    const row = normalizeAdminCustomerSummary(unwrapApiData(res.data, 'adminCustomers.summary'))
    if (!row) throw new Error('Müşteri özeti yüklenemedi')
    return row
  },

  async update(id: string, input: AdminUpdateCustomerInput): Promise<AdminCustomerDetail> {
    const res = await adminApi.patch<ApiSuccess<unknown>>(`/admin/customers/${encodeURIComponent(id)}`, input)
    const row = normalizeAdminCustomerDetail(unwrapApiData(res.data, 'adminCustomers.update'))
    if (!row) throw new Error('Müşteri güncellenemedi')
    return row
  },

  async patchStatus(id: string, isActive: boolean): Promise<AdminCustomerDetail> {
    const res = await adminApi.patch<ApiSuccess<unknown>>(`/admin/customers/${encodeURIComponent(id)}/status`, {
      isActive,
    })
    const row = normalizeAdminCustomerDetail(unwrapApiData(res.data, 'adminCustomers.patchStatus'))
    if (!row) throw new Error('Müşteri durumu güncellenemedi')
    return row
  },

  async delete(id: string): Promise<{ id: string; deleted: boolean }> {
    const res = await adminApi.delete<ApiSuccess<{ id: string; deleted: boolean }>>(
      `/admin/customers/${encodeURIComponent(id)}`,
    )
    return unwrapApiData(res.data, 'adminCustomers.delete')
  },
}
