import type { QueryClient } from '@tanstack/react-query'
import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import {
  ADMIN_SIDEBAR_BADGES_QUERY_KEY,
  normalizeAdminSidebarBadges,
  type AdminSidebarBadges,
} from '@/types/adminSidebarBadges'
import { adminApi } from '@/api/client'

export const adminSidebarBadgesService = {
  async get(): Promise<AdminSidebarBadges> {
    const res = await adminApi.get<ApiSuccess<unknown>>('/admin/sidebar-badges')
    return normalizeAdminSidebarBadges(unwrapApiData(res.data, 'adminSidebarBadges.get'))
  },
}

export function invalidateAdminSidebarBadges(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: ADMIN_SIDEBAR_BADGES_QUERY_KEY })
}

export { ADMIN_SIDEBAR_BADGES_QUERY_KEY }
