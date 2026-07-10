import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import { adminApi } from '@/api/client'
import type {
  AdminCreateSaasMembershipInput,
  AdminSaasMembershipDetail,
  AdminSaasMembershipListItem,
  AdminSaasMembershipListParams,
  AdminUpdateSaasMembershipInput,
} from '@/types/adminSaasMembership'
import {
  normalizeAdminSaasMembershipDetail,
  normalizeAdminSaasMembershipList,
} from '@/types/adminSaasMembership'

export const adminSaasMembershipsService = {
  async list(params?: AdminSaasMembershipListParams): Promise<AdminSaasMembershipListItem[]> {
    const res = await adminApi.get<ApiSuccess<unknown>>('/admin/saas-memberships', { params })
    return normalizeAdminSaasMembershipList(unwrapApiData(res.data, 'adminSaasMemberships.list'))
  },

  async getById(id: string): Promise<AdminSaasMembershipDetail> {
    const res = await adminApi.get<ApiSuccess<unknown>>(`/admin/saas-memberships/${encodeURIComponent(id)}`)
    const row = normalizeAdminSaasMembershipDetail(unwrapApiData(res.data, 'adminSaasMemberships.getById'))
    if (!row) throw new Error('SaaS aboneliği bulunamadı')
    return row
  },

  async patchStatus(id: string, status: string): Promise<AdminSaasMembershipDetail> {
    const res = await adminApi.patch<ApiSuccess<unknown>>(`/admin/saas-memberships/${encodeURIComponent(id)}/status`, {
      status,
    })
    const row = normalizeAdminSaasMembershipDetail(unwrapApiData(res.data, 'adminSaasMemberships.patchStatus'))
    if (!row) throw new Error('SaaS aboneliği güncellenemedi')
    return row
  },

  async create(payload: AdminCreateSaasMembershipInput): Promise<AdminSaasMembershipDetail> {
    const res = await adminApi.post<ApiSuccess<unknown>>('/admin/saas-memberships', payload)
    const row = normalizeAdminSaasMembershipDetail(unwrapApiData(res.data, 'adminSaasMemberships.create'))
    if (!row) throw new Error('SaaS aboneliği oluşturulamadı')
    return row
  },

  async update(id: string, payload: AdminUpdateSaasMembershipInput): Promise<AdminSaasMembershipDetail> {
    const res = await adminApi.patch<ApiSuccess<unknown>>(`/admin/saas-memberships/${encodeURIComponent(id)}`, payload)
    const row = normalizeAdminSaasMembershipDetail(unwrapApiData(res.data, 'adminSaasMemberships.update'))
    if (!row) throw new Error('SaaS aboneliği güncellenemedi')
    return row
  },

  async extend(id: string, days: number): Promise<AdminSaasMembershipDetail> {
    const res = await adminApi.patch<ApiSuccess<unknown>>(`/admin/saas-memberships/${encodeURIComponent(id)}/extend`, {
      days,
    })
    const row = normalizeAdminSaasMembershipDetail(unwrapApiData(res.data, 'adminSaasMemberships.extend'))
    if (!row) throw new Error('SaaS aboneliği uzatılamadı')
    return row
  },
}
