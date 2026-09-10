import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { AuthUser } from '@/types/auth'

type AuthState = {
  adminToken: string | null
  adminUser: AuthUser | null
  setAdminSession: (token: string, user: AuthUser) => void
  clearAdminSession: () => void
}

const noopStorage: Storage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
  clear: () => undefined,
  key: () => null,
  length: 0,
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      adminToken: null,
      adminUser: null,
      setAdminSession: (token, user) => set({ adminToken: token, adminUser: user }),
      clearAdminSession: () => set({ adminToken: null, adminUser: null }),
    }),
    {
      name: 'woontegra-v4-admin-auth',
      storage: createJSONStorage(() => (typeof window === 'undefined' ? noopStorage : localStorage)),
      partialize: (s) => ({
        adminToken: s.adminToken,
        adminUser: s.adminUser,
      }),
    },
  ),
)
