import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import { adminApi } from '@/api/client'
import { getApiRootUrl } from '@/lib/env'
import {
  normalizeAdminDownloadStatsList,
  normalizePublicDownloadStats,
  type AdminDownloadStatsItem,
  type PublicDownloadStats,
} from '@/types/adminDownloadStats'

export const adminDownloadStatsService = {
  async list(): Promise<AdminDownloadStatsItem[]> {
    const res = await adminApi.get<ApiSuccess<unknown>>('/admin/download-stats')
    return normalizeAdminDownloadStatsList(unwrapApiData(res.data, 'adminDownloadStats.list'))
  },
}

export async function fetchSifreKasasiPublicDownloadStats(): Promise<PublicDownloadStats | null> {
  try {
    const apiRoot = getApiRootUrl()
    const base =
      apiRoot.startsWith('http://') || apiRoot.startsWith('https://')
        ? apiRoot
        : typeof window !== 'undefined'
          ? window.location.origin
          : ''
    const res = await fetch(`${base}/api/public/downloads/sifre-kasasi/stats`, {
      credentials: 'same-origin',
    })
    if (!res.ok) return null
    const json = (await res.json()) as { success?: boolean; data?: unknown }
    if (!json.success) return null
    return normalizePublicDownloadStats(json.data)
  } catch {
    return null
  }
}
