export type AdminDownloadStatsStatus = 'active' | 'inactive' | 'unknown'

export type AdminDownloadStatsItem = {
  productKey: string
  name: string
  slug: string
  publicPath: string
  freeSetupPath: string
  freePortablePath: string
  total: number
  setup: number
  portable: number
  lastUpdatedAt: string | null
  downloadsToday: number | null
  downloadsThisMonth: number | null
  status: AdminDownloadStatsStatus
}

export type PublicDownloadStats = {
  total: number
  setup: number
  portable: number
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const parsed = Number.parseInt(String(value ?? ''), 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const parsed = Number.parseInt(String(value), 10)
  return Number.isFinite(parsed) ? parsed : null
}

function toString(value: unknown, fallback = ''): string {
  return value == null ? fallback : String(value)
}

function normalizeStatus(value: unknown): AdminDownloadStatsStatus {
  if (value === 'active' || value === 'inactive' || value === 'unknown') return value
  return 'unknown'
}

export function normalizeAdminDownloadStatsItem(raw: unknown): AdminDownloadStatsItem | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const productKey = toString(row.productKey)
  if (!productKey) return null

  return {
    productKey,
    name: toString(row.name, productKey),
    slug: toString(row.slug, productKey),
    publicPath: toString(row.publicPath, `/yazilimlar/${productKey}`),
    freeSetupPath: toString(row.freeSetupPath, `/api/downloads/free/${productKey}/setup`),
    freePortablePath: toString(row.freePortablePath, `/api/downloads/free/${productKey}/portable`),
    total: toNumber(row.total),
    setup: toNumber(row.setup),
    portable: toNumber(row.portable),
    lastUpdatedAt: row.lastUpdatedAt == null ? null : toString(row.lastUpdatedAt),
    downloadsToday: toNullableNumber(row.downloadsToday),
    downloadsThisMonth: toNullableNumber(row.downloadsThisMonth),
    status: normalizeStatus(row.status),
  }
}

export function normalizeAdminDownloadStatsList(raw: unknown): AdminDownloadStatsItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map(normalizeAdminDownloadStatsItem).filter((row): row is AdminDownloadStatsItem => row !== null)
}

export function normalizePublicDownloadStats(raw: unknown): PublicDownloadStats | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  return {
    total: toNumber(row.total),
    setup: toNumber(row.setup),
    portable: toNumber(row.portable),
  }
}

export function adminDownloadStatsStatusLabel(status: AdminDownloadStatsStatus): string {
  if (status === 'active') return 'Aktif'
  if (status === 'inactive') return 'Pasif'
  return 'Bilinmiyor'
}
