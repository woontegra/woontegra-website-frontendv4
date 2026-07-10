function toString(value: unknown, fallback = ''): string {
  return value == null ? fallback : String(value)
}

function toNullableString(value: unknown): string | null {
  const s = toString(value)
  return s || null
}

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function toBool(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

export type AdminCustomerListParams = {
  q?: string
  filter?: string
}

export type AdminCustomerListItem = {
  id: string
  name: string
  email: string
  phone: string | null
  companyName: string | null
  isActive: boolean
  isCorporate: boolean
  orderCount: number
  paidOrderCount: number
  pendingOrderCount: number
  paymentCount: number
  totalPaidAmount: number
  currency: string
  activeSaasMembershipCount: number
  saasMembershipCount: number
  licenseCount: number
  canDelete: boolean
  deleteBlockReason: string | null
  lastOrderDate: string | null
  lastActivityAt: string | null
  createdAt: string
  updatedAt: string
}

export type AdminUpdateCustomerInput = {
  name?: string
  phone?: string | null
  isActive?: boolean
  defaultAddress?: {
    fullName?: string
    phone?: string | null
    city?: string
    district?: string | null
    addressLine?: string
    postalCode?: string | null
    companyName?: string | null
    taxOffice?: string | null
    taxNumber?: string | null
  }
}

export type AdminCustomerSummary = {
  totalCustomers: number
  activeSaasCustomers: number
}

export type AdminCustomerAddress = {
  id: string
  title: string
  fullName: string
  phone: string | null
  city: string
  district: string | null
  addressLine: string
  postalCode: string | null
  taxOffice: string | null
  taxNumber: string | null
  companyName: string | null
  isDefault: boolean
}

export type AdminCustomerOrderRow = {
  id: string
  orderNo: string
  productSummary: string
  total: number
  currency: string
  paymentProvider: string
  paymentStatus: string | null
  status: string
  createdAt: string
}

export type AdminCustomerPaymentRow = {
  id: string
  orderId: string
  orderNo: string
  provider: string
  amount: number
  currency: string
  status: string
  createdAt: string
}

export type AdminCustomerSaasRow = {
  id: string
  productName: string
  licenseStartDate: string
  licenseEndDate: string
  kalanGun: number | null
  status: string
  effectiveStatus: string
  tenantSlug: string
  tenantId: string
}

export type AdminCustomerLicenseRow = {
  id: string
  licenseKey: string
  productName: string
  productCode: string | null
  status: string
  source: string
  orderNo: string | null
  expiresAt: string | null
  createdAt: string
}

export type AdminCustomerDetail = {
  customer: {
    id: string
    name: string
    email: string
    phone: string | null
    isActive: boolean
    companyName: string | null
    taxOffice: string | null
    taxNumber: string | null
    billingType: string | null
    isCorporate: boolean
    createdAt: string
    updatedAt: string
  }
  summary: {
    orderCount: number
    paidOrderCount: number
    pendingOrderCount: number
    totalPaidAmount: number
    currency: string
    activeSaasMembershipCount: number
    expiredSaasMembershipCount: number
    nearestSaasEndDate: string | null
    licenseCount: number
    lastOrderDate: string | null
    lastPaymentDate: string | null
    lastSaasActivityAt: string | null
    lastActivityAt: string | null
  }
  addresses: AdminCustomerAddress[]
  orders: AdminCustomerOrderRow[]
  payments: AdminCustomerPaymentRow[]
  saasMemberships: AdminCustomerSaasRow[]
  licenses: AdminCustomerLicenseRow[]
}

export function normalizeAdminCustomerListItem(raw: unknown): AdminCustomerListItem | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const id = toString(row.id)
  if (!id) return null
  return {
    id,
    name: toString(row.name),
    email: toString(row.email),
    phone: toNullableString(row.phone),
    companyName: toNullableString(row.companyName),
    isActive: toBool(row.isActive, true),
    isCorporate: toBool(row.isCorporate, false),
    orderCount: toNumber(row.orderCount),
    paidOrderCount: toNumber(row.paidOrderCount),
    pendingOrderCount: toNumber(row.pendingOrderCount),
    paymentCount: toNumber(row.paymentCount),
    totalPaidAmount: toNumber(row.totalPaidAmount),
    currency: toString(row.currency, 'TRY'),
    activeSaasMembershipCount: toNumber(row.activeSaasMembershipCount),
    saasMembershipCount: toNumber(row.saasMembershipCount),
    licenseCount: toNumber(row.licenseCount),
    canDelete: toBool(row.canDelete, false),
    deleteBlockReason: toNullableString(row.deleteBlockReason),
    lastOrderDate: toNullableString(row.lastOrderDate),
    lastActivityAt: toNullableString(row.lastActivityAt),
    createdAt: toString(row.createdAt),
    updatedAt: toString(row.updatedAt),
  }
}

export function normalizeAdminCustomerList(raw: unknown): AdminCustomerListItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map(normalizeAdminCustomerListItem).filter((row): row is AdminCustomerListItem => row !== null)
}

export function normalizeAdminCustomerSummary(raw: unknown): AdminCustomerSummary | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  return {
    totalCustomers: toNumber(row.totalCustomers),
    activeSaasCustomers: toNumber(row.activeSaasCustomers),
  }
}

function normalizeAddress(raw: unknown): AdminCustomerAddress | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const id = toString(row.id)
  if (!id) return null
  return {
    id,
    title: toString(row.title),
    fullName: toString(row.fullName),
    phone: toNullableString(row.phone),
    city: toString(row.city),
    district: toNullableString(row.district),
    addressLine: toString(row.addressLine),
    postalCode: toNullableString(row.postalCode),
    taxOffice: toNullableString(row.taxOffice),
    taxNumber: toNullableString(row.taxNumber),
    companyName: toNullableString(row.companyName),
    isDefault: toBool(row.isDefault, false),
  }
}

export function normalizeAdminCustomerDetail(raw: unknown): AdminCustomerDetail | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const customerRaw = row.customer as Record<string, unknown> | undefined
  const summaryRaw = row.summary as Record<string, unknown> | undefined
  if (!customerRaw || !summaryRaw) return null
  const id = toString(customerRaw.id)
  if (!id) return null

  return {
    customer: {
      id,
      name: toString(customerRaw.name),
      email: toString(customerRaw.email),
      phone: toNullableString(customerRaw.phone),
      isActive: toBool(customerRaw.isActive, true),
      companyName: toNullableString(customerRaw.companyName),
      taxOffice: toNullableString(customerRaw.taxOffice),
      taxNumber: toNullableString(customerRaw.taxNumber),
      billingType: toNullableString(customerRaw.billingType),
      isCorporate: toBool(customerRaw.isCorporate, false),
      createdAt: toString(customerRaw.createdAt),
      updatedAt: toString(customerRaw.updatedAt),
    },
    summary: {
      orderCount: toNumber(summaryRaw.orderCount),
      paidOrderCount: toNumber(summaryRaw.paidOrderCount),
      pendingOrderCount: toNumber(summaryRaw.pendingOrderCount),
      totalPaidAmount: toNumber(summaryRaw.totalPaidAmount),
      currency: toString(summaryRaw.currency, 'TRY'),
      activeSaasMembershipCount: toNumber(summaryRaw.activeSaasMembershipCount),
      expiredSaasMembershipCount: toNumber(summaryRaw.expiredSaasMembershipCount),
      nearestSaasEndDate: toNullableString(summaryRaw.nearestSaasEndDate),
      licenseCount: toNumber(summaryRaw.licenseCount),
      lastOrderDate: toNullableString(summaryRaw.lastOrderDate),
      lastPaymentDate: toNullableString(summaryRaw.lastPaymentDate),
      lastSaasActivityAt: toNullableString(summaryRaw.lastSaasActivityAt),
      lastActivityAt: toNullableString(summaryRaw.lastActivityAt),
    },
    addresses: Array.isArray(row.addresses)
      ? row.addresses.map(normalizeAddress).filter((a): a is AdminCustomerAddress => a !== null)
      : [],
    orders: Array.isArray(row.orders) ? (row.orders as AdminCustomerOrderRow[]) : [],
    payments: Array.isArray(row.payments) ? (row.payments as AdminCustomerPaymentRow[]) : [],
    saasMemberships: Array.isArray(row.saasMemberships) ? (row.saasMemberships as AdminCustomerSaasRow[]) : [],
    licenses: Array.isArray(row.licenses) ? (row.licenses as AdminCustomerLicenseRow[]) : [],
  }
}
