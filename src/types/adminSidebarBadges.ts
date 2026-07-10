export type AdminSidebarBadges = {
  ordersPending: number
  paymentsPending: number
  saasExpiringSoon: number
  /** İleride İletişim/Talepler modülü sidebar rozeti için ayrıldı */
  unreadRequests: number
}

export type AdminSidebarBadgeKey = keyof AdminSidebarBadges

export const ADMIN_SIDEBAR_BADGES_QUERY_KEY = ['admin', 'sidebar-badges'] as const

function toCount(value: unknown): number {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.floor(n)
}

export function normalizeAdminSidebarBadges(raw: unknown): AdminSidebarBadges {
  const row = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    ordersPending: toCount(row.ordersPending),
    paymentsPending: toCount(row.paymentsPending),
    saasExpiringSoon: toCount(row.saasExpiringSoon),
    unreadRequests: toCount(row.unreadRequests),
  }
}

/** 0 → gizle, 99+ üst sınır */
export function formatSidebarBadgeCount(count: number): string | null {
  if (count <= 0) return null
  return count > 99 ? '99+' : String(count)
}

export function getSidebarBadgeCount(
  badges: AdminSidebarBadges | undefined,
  key: AdminSidebarBadgeKey,
): number {
  if (!badges) return 0
  return badges[key] ?? 0
}
