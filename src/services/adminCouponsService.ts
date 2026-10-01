import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import { adminApi, getErrorMessage } from '@/api/client'

export type AdminCoupon = {
  id: string
  name: string
  code: string
  description: string | null
  adminNote: string | null
  isActive: boolean
  discountType: 'percent' | 'fixed_amount'
  discountValue: number
  startsAt: string | null
  endsAt: string | null
  usageLimit: number | null
  perCustomerLimit: number | null
  firstPurchaseOnly: boolean
  minimumCartTotal: number | null
  archivedAt: string | null
  createdAt: string
  updatedAt: string
  productIds: string[]
  products: { id: string; name: string }[]
}

export type CouponInput = {
  name: string
  code: string
  description?: string | null
  adminNote?: string | null
  isActive: boolean
  discountType: 'percent' | 'fixed_amount'
  discountValue: number
  startsAt?: string | null
  endsAt?: string | null
  usageLimit?: number | null
  perCustomerLimit?: number | null
  firstPurchaseOnly: boolean
  minimumCartTotal?: number | null
  productIds: string[]
}

function normalize(raw: unknown): AdminCoupon | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const id = String(row.id ?? '')
  if (!id) return null
  return {
    id,
    name: String(row.name ?? ''),
    code: String(row.code ?? ''),
    description: row.description == null ? null : String(row.description),
    adminNote: row.adminNote == null ? null : String(row.adminNote),
    isActive: row.isActive === true,
    discountType: row.discountType === 'fixed_amount' ? 'fixed_amount' : 'percent',
    discountValue: Number(row.discountValue ?? 0),
    startsAt: row.startsAt == null ? null : String(row.startsAt),
    endsAt: row.endsAt == null ? null : String(row.endsAt),
    usageLimit: row.usageLimit == null ? null : Number(row.usageLimit),
    perCustomerLimit: row.perCustomerLimit == null ? null : Number(row.perCustomerLimit),
    firstPurchaseOnly: row.firstPurchaseOnly === true,
    minimumCartTotal: row.minimumCartTotal == null ? null : Number(row.minimumCartTotal),
    archivedAt: row.archivedAt == null ? null : String(row.archivedAt),
    createdAt: String(row.createdAt ?? ''),
    updatedAt: String(row.updatedAt ?? ''),
    productIds: Array.isArray(row.productIds) ? row.productIds.map((id) => String(id)) : [],
    products: Array.isArray(row.products)
      ? row.products.map((item) => {
          const product = item as Record<string, unknown>
          return { id: String(product.id ?? ''), name: String(product.name ?? '') }
        })
      : [],
  }
}

export const adminCouponsService = {
  async list(includeArchived = false): Promise<AdminCoupon[]> {
    const res = await adminApi.get<ApiSuccess<unknown[]>>('/admin/coupons', {
      params: includeArchived ? { includeArchived: 'true' } : undefined,
    })
    const data = unwrapApiData(res.data, 'adminCoupons.list')
    return (Array.isArray(data) ? data : []).map(normalize).filter((row): row is AdminCoupon => row != null)
  },

  async getById(id: string): Promise<AdminCoupon> {
    const res = await adminApi.get<ApiSuccess<unknown>>(`/admin/coupons/${encodeURIComponent(id)}`)
    const row = normalize(unwrapApiData(res.data, 'adminCoupons.getById'))
    if (!row) throw new Error('Kupon bulunamadı')
    return row
  },

  async create(payload: CouponInput): Promise<AdminCoupon> {
    const res = await adminApi.post<ApiSuccess<unknown>>('/admin/coupons', payload)
    const row = normalize(unwrapApiData(res.data, 'adminCoupons.create'))
    if (!row) throw new Error('Kupon oluşturulamadı')
    return row
  },

  async update(id: string, payload: CouponInput): Promise<AdminCoupon> {
    const res = await adminApi.patch<ApiSuccess<unknown>>(`/admin/coupons/${encodeURIComponent(id)}`, payload)
    const row = normalize(unwrapApiData(res.data, 'adminCoupons.update'))
    if (!row) throw new Error('Kupon güncellenemedi')
    return row
  },

  async archive(id: string): Promise<void> {
    await adminApi.post(`/admin/coupons/${encodeURIComponent(id)}/archive`)
  },
}

export { getErrorMessage }
