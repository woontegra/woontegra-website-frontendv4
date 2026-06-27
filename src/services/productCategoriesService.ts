import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import { adminApi } from '@/api/client'

export type ProductCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
  isActive: boolean
  sortOrder: number
}

function normalizeCategory(raw: unknown): ProductCategory | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const id = String(row.id ?? '')
  if (!id) return null
  return {
    id,
    name: String(row.name ?? ''),
    slug: String(row.slug ?? ''),
    description: row.description == null ? null : String(row.description),
    parentId: row.parentId == null || row.parentId === '' ? null : String(row.parentId),
    isActive: row.isActive !== false,
    sortOrder: Number(row.sortOrder) || 0,
  }
}

export const productCategoriesService = {
  async list(): Promise<ProductCategory[]> {
    const res = await adminApi.get<ApiSuccess<ProductCategory[]>>('/admin/product-categories')
    const data = unwrapApiData(res.data, 'productCategories.list')
    if (!Array.isArray(data)) return []
    return data.map(normalizeCategory).filter((x): x is ProductCategory => x !== null)
  },
}
