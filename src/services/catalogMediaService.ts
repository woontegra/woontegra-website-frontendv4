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

const RAILWAY_MEDIA_API = 'https://websitebackend-production-ab6e.up.railway.app/api'

/** Canlı admin Vercel /api rewrite’ı büyük gövdeyi keser. Video aynı upload ucuna doğrudan gider. */
export function catalogVideoUploadUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host === 'woontegra.com' || host === 'www.woontegra.com') {
      return `${RAILWAY_MEDIA_API}/admin/media/upload`
    }
  }
  return `${getApiBaseUrl()}/admin/media/upload`
}

export const catalogMediaService = {
  async list(fileType?: CatalogMediaFileType): Promise<CatalogMedia[]> {
    const res = await adminApi.get<ApiSuccess<CatalogMedia[]>>('/admin/media', {
      params: fileType ? { fileType } : undefined,
    })
    const data = unwrapApiData<CatalogMedia[]>(res.data, 'admin.media.list')
    return normalizeCatalogMediaList(data)
  },

  async upload(file: File, folder = 'general'): Promise<CatalogMedia> {
    return this.postUpload(file, folder, `${getApiBaseUrl()}/admin/media/upload`)
  },

  /**
   * Aynı /admin/media/upload ucu. Canlı sitede dosya Vercel rewrite’ından geçmez;
   * 144 MB video Railway üzerindeki bu uca gider.
   */
  async uploadVideo(file: File, folder = 'hero'): Promise<CatalogMedia> {
    return this.postUpload(file, folder, catalogVideoUploadUrl(), { timeout: 0 })
  },

  async postUpload(
    file: File,
    folder: string,
    url: string,
    extra?: { timeout?: number },
  ): Promise<CatalogMedia> {
    const form = new FormData()
    form.append('file', file)
    const token = useAuthStore.getState().adminToken
    const res = await axios.post<ApiSuccess<CatalogMedia>>(url, form, {
      params: { folder },
      timeout: extra?.timeout,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    const row = normalizeCatalogMedia(unwrapApiData(res.data, 'admin.media.upload'))
    if (!row) throw new Error('Yükleme yanıtı geçersiz')
    return row
  },
}
