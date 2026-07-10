import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import {
  normalizeTestDataCleanupPreview,
  normalizeTestDataCleanupResult,
  type TestDataCleanupOptions,
  type TestDataCleanupPreview,
  type TestDataCleanupResult,
} from '@/types/adminTestDataCleanup'
import { adminApi } from '@/api/client'

export const adminTestDataCleanupService = {
  async preview(email: string): Promise<TestDataCleanupPreview> {
    const res = await adminApi.get<ApiSuccess<unknown>>('/admin/test-data-cleanup/preview', {
      params: { email: email.trim() },
    })
    const row = normalizeTestDataCleanupPreview(unwrapApiData(res.data, 'adminTestDataCleanup.preview'))
    if (!row) throw new Error('Önizleme yüklenemedi')
    return row
  },

  async cleanup(input: {
    email: string
    confirmEmail: string
    options: TestDataCleanupOptions
    forceRealEmailCleanup?: boolean
  }): Promise<TestDataCleanupResult> {
    const res = await adminApi.post<ApiSuccess<unknown>>('/admin/test-data-cleanup', input)
    const row = normalizeTestDataCleanupResult(unwrapApiData(res.data, 'adminTestDataCleanup.cleanup'))
    if (!row) throw new Error('Temizlik sonucu alınamadı')
    return row
  },
}
