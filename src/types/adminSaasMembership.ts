function toString(v: unknown, fallback = ''): string {
  if (v == null) return fallback
  return String(v).trim() || fallback
}

function toNullableString(v: unknown): string | null {
  const text = toString(v)
  return text || null
}

function toNumber(v: unknown, fallback = 0): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export type AdminSaasMembershipStatus = 'ACTIVE' | 'EXPIRED' | 'SUSPENDED'

export type AdminSaasMembershipListItem = {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  ownerEmail: string
  productId: string | null
  productName: string
  productCode: string
  firstOrderRef: string | null
  firstOrderNo: string | null
  lastOrderRef: string | null
  lastOrderNo: string | null
  lastOrderStatus: string | null
  licenseStartDate: string
  licenseEndDate: string
  kalanGun: number | null
  status: AdminSaasMembershipStatus
  effectiveStatus: AdminSaasMembershipStatus
  tenantId: string
  tenantSlug: string
  licenseKey: string
  lastProvisionError: string | null
  createdAt: string
  updatedAt: string
}

export type AdminSaasMembershipOrderSummary = {
  orderId: string
  orderNo: string
  orderStatus: string
  createdAt: string
  total: number
  currency: string
  productName: string
  provisionError: string | null
}

export type AdminSaasMembershipDetail = AdminSaasMembershipListItem & {
  firstOrder: AdminSaasMembershipOrderSummary | null
  lastOrder: AdminSaasMembershipOrderSummary | null
  orderHistory: AdminSaasMembershipOrderSummary[]
}

export type AdminSaasMembershipListParams = {
  q?: string
  status?: string
  productId?: string
  expiringSoon?: boolean
}

export type AdminCreateSaasMembershipInput = {
  customerEmail: string
  productId: string
  licenseStartDate: string
  licenseEndDate: string
  status: AdminSaasMembershipStatus
  tenantId: string
  tenantSlug: string
  licenseKey: string
  orderRef?: string | null
}

export type AdminUpdateSaasMembershipInput = {
  licenseStartDate?: string
  licenseEndDate?: string
  status?: AdminSaasMembershipStatus
  tenantId?: string
  tenantSlug?: string
  licenseKey?: string
}

function normalizeStatus(value: unknown): AdminSaasMembershipStatus {
  const raw = toString(value, 'ACTIVE').toUpperCase()
  if (raw === 'SUSPENDED') return 'SUSPENDED'
  if (raw === 'EXPIRED') return 'EXPIRED'
  return 'ACTIVE'
}

function normalizeOrderSummary(raw: unknown): AdminSaasMembershipOrderSummary | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const orderId = toString(row.orderId)
  if (!orderId) return null
  return {
    orderId,
    orderNo: toString(row.orderNo),
    orderStatus: toString(row.orderStatus),
    createdAt: toString(row.createdAt),
    total: toNumber(row.total),
    currency: toString(row.currency, 'TRY'),
    productName: toString(row.productName),
    provisionError: toNullableString(row.provisionError),
  }
}

export function normalizeAdminSaasMembershipListItem(raw: unknown): AdminSaasMembershipListItem | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const id = toString(row.id)
  if (!id) return null
  return {
    id,
    customerId: toString(row.customerId),
    customerName: toString(row.customerName),
    customerEmail: toString(row.customerEmail),
    ownerEmail: toString(row.ownerEmail),
    productId: toNullableString(row.productId),
    productName: toString(row.productName),
    productCode: toString(row.productCode),
    firstOrderRef: toNullableString(row.firstOrderRef),
    firstOrderNo: toNullableString(row.firstOrderNo),
    lastOrderRef: toNullableString(row.lastOrderRef),
    lastOrderNo: toNullableString(row.lastOrderNo),
    lastOrderStatus: toNullableString(row.lastOrderStatus),
    licenseStartDate: toString(row.licenseStartDate),
    licenseEndDate: toString(row.licenseEndDate),
    kalanGun: row.kalanGun == null ? null : toNumber(row.kalanGun),
    status: normalizeStatus(row.status),
    effectiveStatus: normalizeStatus(row.effectiveStatus),
    tenantId: toString(row.tenantId),
    tenantSlug: toString(row.tenantSlug),
    licenseKey: toString(row.licenseKey),
    lastProvisionError: toNullableString(row.lastProvisionError),
    createdAt: toString(row.createdAt),
    updatedAt: toString(row.updatedAt),
  }
}

export function normalizeAdminSaasMembershipList(raw: unknown): AdminSaasMembershipListItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map(normalizeAdminSaasMembershipListItem).filter((item): item is AdminSaasMembershipListItem => item !== null)
}

export function normalizeAdminSaasMembershipDetail(raw: unknown): AdminSaasMembershipDetail | null {
  const base = normalizeAdminSaasMembershipListItem(raw)
  if (!base || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  return {
    ...base,
    firstOrder: normalizeOrderSummary(row.firstOrder),
    lastOrder: normalizeOrderSummary(row.lastOrder),
    orderHistory: Array.isArray(row.orderHistory)
      ? row.orderHistory.map(normalizeOrderSummary).filter((item): item is AdminSaasMembershipOrderSummary => item !== null)
      : [],
  }
}

export function adminSaasMembershipStatusLabel(status: AdminSaasMembershipStatus): string {
  if (status === 'ACTIVE') return 'Aktif'
  if (status === 'SUSPENDED') return 'Askıda'
  return 'Süresi doldu'
}

export function adminSaasMembershipStatusTone(
  status: AdminSaasMembershipStatus,
): 'success' | 'warning' | 'danger' | 'default' {
  if (status === 'ACTIVE') return 'success'
  if (status === 'SUSPENDED') return 'danger'
  return 'warning'
}
