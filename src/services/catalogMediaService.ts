import axios from 'axios'
import { adminApi, getErrorMessage } from '@/api/client'
import { getApiBaseUrl } from '@/lib/env'
import { useAuthStore } from '@/store/authStore'
import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import {
  normalizeCatalogMedia,
  normalizeCatalogMediaList,
  type CatalogMedia,
  type CatalogMediaFileType,
} from '@/types/catalogMedia'

export { getErrorMessage }

export const catalogMediaService = {
  async list(fileType?: CatalogMediaFileType): Promise<CatalogMedia[]> {
    const res = await adminApi.get<ApiSuccess<CatalogMedia[]>>('/admin/media', {
      params: fileType ? { fileType } : undefined,
    })
    const data = unwrapApiData<CatalogMedia[]>(res.data, 'admin.media.list')
    return normalizeCatalogMediaList(data)
  },

  async upload(file: File, folder = 'general'): Promise<CatalogMedia> {
    const form = new FormData()
    form.append('file', file)
    const token = useAuthStore.getState().adminToken
    const res = await axios.post<ApiSuccess<CatalogMedia>>(
      `${getApiBaseUrl()}/admin/media/upload`,
      form,
      {
        params: { folder },
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    )
    const row = normalizeCatalogMedia(unwrapApiData(res.data, 'admin.media.upload'))
    if (!row) throw new Error('Yükleme yanıtı geçersiz')
    return row
  },
}
