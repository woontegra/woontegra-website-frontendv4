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
    return error.response?.data?.message || error.message || fallback
  }
  if (error instanceof Error) return error.message
  return fallback
}

export function isPublicApiTimeout(error: unknown): boolean {
  return axios.isAxiosError(error) && error.code === 'ECONNABORTED'
}
