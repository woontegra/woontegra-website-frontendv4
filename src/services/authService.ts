import { publicApi } from '@/api/client'
import type { AuthUser } from '@/types/auth'

type LoginResponse = {
  success: boolean
  token?: string
  user?: AuthUser
  message?: string
}

export const authService = {
  async login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const { data } = await publicApi.post<LoginResponse>('/auth/login', { email, password })
    if (!data.success || !data.token || !data.user) {
      throw new Error(data.message || 'Giriş başarısız')
    }
    return { token: data.token, user: data.user }
  },
}
