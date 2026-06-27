import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import type {
  AdminLicenseDetail,
  AdminLicenseListItem,
  AdminLicenseListParams,
} from '@/types/license'
import { normalizeAdminLicenseDetail, normalizeAdminLicenseList } from '@/types/license'
import { adminApi } from '@/api/client'

export const adminLicensesService = {
  async list(params?: AdminLicenseListParams): Promise<AdminLicenseListItem[]> {
    const res = await adminApi.get<ApiSuccess<unknown>>('/admin/licenses', { params })
    return normalizeAdminLicenseList(unwrapApiData(res.data, 'adminLicenses.list'))
  },

  async getById(id: string): Promise<AdminLicenseDetail> {
    const res = await adminApi.get<ApiSuccess<unknown>>(`/admin/licenses/${encodeURIComponent(id)}`)
    const row = normalizeAdminLicenseDetail(unwrapApiData(res.data, 'adminLicenses.getById'))
    if (!row) throw new Error('Lisans bulunamadı')
    return row
  },

  async sendEmail(id: string, activationPassword?: string): Promise<void> {
    await adminApi.post(`/admin/licenses/${encodeURIComponent(id)}/send-email`, {
      activationPassword: activationPassword || undefined,
    })
  },
}

export type { AdminLicenseDetail, AdminLicenseListItem, AdminLicenseListParams }
