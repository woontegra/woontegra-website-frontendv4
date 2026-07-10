import { useQuery } from '@tanstack/react-query'
import {
  adminSidebarBadgesService,
  ADMIN_SIDEBAR_BADGES_QUERY_KEY,
} from '@/services/adminSidebarBadgesService'

const SIDEBAR_BADGES_STALE_MS = 30_000

export function useAdminSidebarBadges() {
  return useQuery({
    queryKey: ADMIN_SIDEBAR_BADGES_QUERY_KEY,
    queryFn: () => adminSidebarBadgesService.get(),
    staleTime: SIDEBAR_BADGES_STALE_MS,
  })
}
