import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import type {
  AdminProduct,
  AdminProductInput,
  AdminProductListParams,
} from '@/types/product'
import { normalizeAdminList, normalizeAdminProduct } from '@/types/product'
import { adminApi, getErrorMessage } from '@/api/client'

export const adminProductsService = {
  async list(params?: AdminProductListParams): Promise<AdminProduct[]> {
    const res = await adminApi.get<ApiSuccess<AdminProduct[]>>('/admin/products', { params })
    return normalizeAdminList(unwrapApiData(res.data, 'adminProducts.list'))
  },

  async getById(id: string): Promise<AdminProduct> {
    const res = await adminApi.get<ApiSuccess<AdminProduct>>(`/admin/products/${encodeURIComponent(id)}`)
    const row = normalizeAdminProduct(unwrapApiData(res.data, 'adminProducts.getById'))
    if (!row) throw new Error('Yazılım bulunamadı')
    return row
  },

  async create(payload: AdminProductInput): Promise<AdminProduct> {
    const res = await adminApi.post<ApiSuccess<AdminProduct>>('/admin/products', payload)
    const row = normalizeAdminProduct(unwrapApiData(res.data, 'adminProducts.create'))
    if (!row) throw new Error('Yazılım oluşturulamadı')
    return row
  },

  async update(id: string, payload: Partial<AdminProductInput>): Promise<AdminProduct> {
    const res = await adminApi.patch<ApiSuccess<AdminProduct>>(
      `/admin/products/${encodeURIComponent(id)}`,
      payload,
    )
    const row = normalizeAdminProduct(unwrapApiData(res.data, 'adminProducts.update'))
    if (!row) throw new Error('Yazılım güncellenemedi')
    return row
  },

  async deactivate(id: string): Promise<void> {
    await adminApi.delete(`/admin/products/${encodeURIComponent(id)}`)
  },

  async activate(id: string): Promise<AdminProduct> {
    return this.update(id, { isActive: true })
  },
}

export { getErrorMessage }
