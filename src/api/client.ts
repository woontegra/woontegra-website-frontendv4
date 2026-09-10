import axios, { type AxiosError, type AxiosInstance } from 'axios'
import { useAuthStore } from '@/store/authStore'
import { getApiBaseUrl } from '@/lib/env'

/** Public GET istekleri — yavaş API'de 30 sn spinner yerine erken timeout + fallback */
export const PUBLIC_API_TIMEOUT_MS = 8_000
const ADMIN_API_TIMEOUT_MS = 30_000

function createClient(withAdminAuth: boolean, timeoutMs: number): AxiosInstance {
  const client = axios.create({
    baseURL: getApiBaseUrl(),
    headers: { 'Content-Type': 'application/json' },
    timeout: timeoutMs,
    withCredentials: true,
  })

  client.interceptors.request.use((config) => {
    if (withAdminAuth) {
      const { adminToken } = useAuthStore.getState()
      if (adminToken) config.headers.Authorization = `Bearer ${adminToken}`
    }
    return config
  })

  client.interceptors.response.use(
    (res) => res,
    (error: AxiosError<{ message?: string }>) => {
      if (withAdminAuth && error.response?.status === 401) {
        useAuthStore.getState().clearAdminSession()
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/giris')) {
          window.location.assign('/admin/giris')
        }
      }
      return Promise.reject(error)
    },
  )

  return client
}

export const publicApi = createClient(false, PUBLIC_API_TIMEOUT_MS)
export const adminApi = createClient(true, ADMIN_API_TIMEOUT_MS)

export function getErrorMessage(error: unknown, fallback = 'İşlem başarısız'): string {
  if (axios.isAxiosError(error)) {
    const apiMessage = error.response?.data?.message
    if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage.trim()
    const status = error.response?.status
    if (status && status >= 500) return 'Sunucuya şu an ulaşılamıyor. Lütfen biraz sonra tekrar deneyin.'
    if (status === 404) return 'İstenen kayıt bulunamadı.'
    if (error.code === 'ECONNABORTED') return 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.'
    if (error.code === 'ERR_NETWORK' || !error.response) {
      return 'Bağlantı kurulamadı. İnternet bağlantınızı veya API erişimini kontrol edin.'
    }
    // "Request failed with status code 500" gibi ham Axios metinlerini gösterme
    if (/^Request failed with status code \d+$/i.test(error.message)) return fallback
    return error.message || fallback
  }
  if (error instanceof Error) return error.message
  return fallback
}

export function isPublicApiTimeout(error: unknown): boolean {
  return axios.isAxiosError(error) && error.code === 'ECONNABORTED'
}
