export type TestDataCleanupOptions = {
  deleteOrders: boolean
  deletePayments: boolean
  deleteSaasMemberships: boolean
  deleteWebsiteLicenses: boolean
  deleteCustomer: boolean
  deleteUserAccount: boolean
  deleteContactMessages: boolean
}

export const EMPTY_CLEANUP_OPTIONS: TestDataCleanupOptions = {
  deleteOrders: false,
  deletePayments: false,
  deleteSaasMemberships: false,
  deleteWebsiteLicenses: false,
  deleteCustomer: false,
  deleteUserAccount: false,
  deleteContactMessages: false,
}

export type MkSaasEmailLookupRecord = {
  userId: string
  kullaniciAdi: string
  ownerEmail: string
  role: string
  userActive: boolean
  tenant: {
    tenantId: string
    tenantSlug: string
    tenantName: string
    tenantActive: boolean
    licenseStatus: string
    licenseKey: string | null
    externalOrderId: string | null
    externalCustomerId: string | null
    licenseStartDate: string | null
    licenseEndDate: string | null
    createdAt: string
  } | null
}

export type MkSaasEmailLookupView = {
  configured: boolean
  reachable: boolean
  found: boolean
  email: string
  records: MkSaasEmailLookupRecord[]
  error: string | null
  manualCleanupHint: string | null
}

export type TestDataCleanupPreview = {
  email: string
  normalizedEmail: string
  isLikelyTestEmail: boolean
  requiresExtraConfirmation: boolean
  hasProtectedPaytrPayments: boolean
  customer: {
    id: string
    name: string
    email: string
    createdAt: string
    isActive: boolean
  } | null
  userAccount: {
    id: string
    email: string
    role: string
    createdAt: string
  } | null
  counts: {
    orders: number
    archivedOrders: number
    paymentTransactions: number
    saasMemberships: number
    websiteLicenses: number
    contactMessages: number
    downloadLogs: number
    customerAddresses: number
  }
  paymentMethodBreakdown: {
    bankTransfer: number
    paytr: number
  }
  protectedPaytrOrderCount: number
  totals: {
    lastOrderDate: string | null
    totalPaidAmount: number
    currency: string
  }
  previewOrders: Array<{
    id: string
    orderNo: string
    status: string
    paymentProvider: string
    total: number
    currency: string
    createdAt: string
    archivedAt: string | null
    isProtected: boolean
  }>
  previewSaasMemberships: Array<{
    id: string
    productCode: string
    tenantSlug: string
    status: string
    licenseEndDate: string
  }>
  previewLicenses: Array<{
    id: string
    licenseKey: string
    productName: string
    status: string
    source: string
  }>
  mkSaasLookup?: MkSaasEmailLookupView
  warnings: string[]
}

export type TestDataCleanupResult = {
  email: string
  deleted: {
    orders: number
    paymentTransactions: number
    saasMemberships: number
    websiteLicenses: number
    contactMessages: number
    downloadLogs: number
    customers: number
    userAccounts: number
  }
  skipped: {
    protectedPaytrOrders: number
  }
  mkSaasLookupAfterCleanup?: MkSaasEmailLookupView | null
  mkSaasStillRegistered?: boolean
  warnings: string[]
}

function toBool(v: unknown): boolean {
  return v === true
}

function toCount(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0
}

function toNullableString(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim()
  return s || null
}

function normalizeMkSaasLookup(raw: unknown): MkSaasEmailLookupView | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const row = raw as Record<string, unknown>
  const recordsRaw = Array.isArray(row.records) ? row.records : []
  return {
    configured: row.configured === true,
    reachable: row.reachable === true,
    found: row.found === true,
    email: String(row.email ?? ''),
    records: recordsRaw.map((item) => {
      const r = item as Record<string, unknown>
      const tenantRaw = r.tenant
      const tenant =
        tenantRaw && typeof tenantRaw === 'object'
          ? {
              tenantId: String((tenantRaw as Record<string, unknown>).tenantId ?? ''),
              tenantSlug: String((tenantRaw as Record<string, unknown>).tenantSlug ?? ''),
              tenantName: String((tenantRaw as Record<string, unknown>).tenantName ?? ''),
              tenantActive: (tenantRaw as Record<string, unknown>).tenantActive === true,
              licenseStatus: String((tenantRaw as Record<string, unknown>).licenseStatus ?? ''),
              licenseKey: toNullableString((tenantRaw as Record<string, unknown>).licenseKey),
              externalOrderId: toNullableString((tenantRaw as Record<string, unknown>).externalOrderId),
              externalCustomerId: toNullableString((tenantRaw as Record<string, unknown>).externalCustomerId),
              licenseStartDate: toNullableString((tenantRaw as Record<string, unknown>).licenseStartDate),
              licenseEndDate: toNullableString((tenantRaw as Record<string, unknown>).licenseEndDate),
              createdAt: String((tenantRaw as Record<string, unknown>).createdAt ?? ''),
            }
          : null
      return {
        userId: String(r.userId ?? ''),
        kullaniciAdi: String(r.kullaniciAdi ?? ''),
        ownerEmail: String(r.ownerEmail ?? ''),
        role: String(r.role ?? ''),
        userActive: r.userActive === true,
        tenant,
      }
    }),
    error: toNullableString(row.error),
    manualCleanupHint: toNullableString(row.manualCleanupHint),
  }
}

export function normalizeTestDataCleanupPreview(raw: unknown): TestDataCleanupPreview | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const counts = row.counts && typeof row.counts === 'object' ? (row.counts as Record<string, unknown>) : {}
  const breakdown =
    row.paymentMethodBreakdown && typeof row.paymentMethodBreakdown === 'object'
      ? (row.paymentMethodBreakdown as Record<string, unknown>)
      : {}
  const totals = row.totals && typeof row.totals === 'object' ? (row.totals as Record<string, unknown>) : {}

  const customerRaw = row.customer
  const customer =
    customerRaw && typeof customerRaw === 'object'
      ? {
          id: String((customerRaw as Record<string, unknown>).id ?? ''),
          name: String((customerRaw as Record<string, unknown>).name ?? ''),
          email: String((customerRaw as Record<string, unknown>).email ?? ''),
          createdAt: String((customerRaw as Record<string, unknown>).createdAt ?? ''),
          isActive: (customerRaw as Record<string, unknown>).isActive !== false,
        }
      : null

  const userRaw = row.userAccount
  const userAccount =
    userRaw && typeof userRaw === 'object'
      ? {
          id: String((userRaw as Record<string, unknown>).id ?? ''),
          email: String((userRaw as Record<string, unknown>).email ?? ''),
          role: String((userRaw as Record<string, unknown>).role ?? ''),
          createdAt: String((userRaw as Record<string, unknown>).createdAt ?? ''),
        }
      : null

  return {
    email: String(row.email ?? ''),
    normalizedEmail: String(row.normalizedEmail ?? ''),
    isLikelyTestEmail: toBool(row.isLikelyTestEmail),
    requiresExtraConfirmation: toBool(row.requiresExtraConfirmation),
    hasProtectedPaytrPayments: toBool(row.hasProtectedPaytrPayments),
    customer: customer?.id ? customer : null,
    userAccount: userAccount?.id ? userAccount : null,
    counts: {
      orders: toCount(counts.orders),
      archivedOrders: toCount(counts.archivedOrders),
      paymentTransactions: toCount(counts.paymentTransactions),
      saasMemberships: toCount(counts.saasMemberships),
      websiteLicenses: toCount(counts.websiteLicenses),
      contactMessages: toCount(counts.contactMessages),
      downloadLogs: toCount(counts.downloadLogs),
      customerAddresses: toCount(counts.customerAddresses),
    },
    paymentMethodBreakdown: {
      bankTransfer: toCount(breakdown.bankTransfer),
      paytr: toCount(breakdown.paytr),
    },
    protectedPaytrOrderCount: toCount(row.protectedPaytrOrderCount),
    totals: {
      lastOrderDate: toNullableString(totals.lastOrderDate),
      totalPaidAmount: Number(totals.totalPaidAmount) || 0,
      currency: String(totals.currency ?? 'TRY'),
    },
    previewOrders: Array.isArray(row.previewOrders)
      ? row.previewOrders.map((item) => {
          const o = item as Record<string, unknown>
          return {
            id: String(o.id ?? ''),
            orderNo: String(o.orderNo ?? ''),
            status: String(o.status ?? ''),
            paymentProvider: String(o.paymentProvider ?? ''),
            total: Number(o.total) || 0,
            currency: String(o.currency ?? 'TRY'),
            createdAt: String(o.createdAt ?? ''),
            archivedAt: toNullableString(o.archivedAt),
            isProtected: toBool(o.isProtected),
          }
        })
      : [],
    previewSaasMemberships: Array.isArray(row.previewSaasMemberships)
      ? row.previewSaasMemberships.map((item) => {
          const m = item as Record<string, unknown>
          return {
            id: String(m.id ?? ''),
            productCode: String(m.productCode ?? ''),
            tenantSlug: String(m.tenantSlug ?? ''),
            status: String(m.status ?? ''),
            licenseEndDate: String(m.licenseEndDate ?? ''),
          }
        })
      : [],
    previewLicenses: Array.isArray(row.previewLicenses)
      ? row.previewLicenses.map((item) => {
          const l = item as Record<string, unknown>
          return {
            id: String(l.id ?? ''),
            licenseKey: String(l.licenseKey ?? ''),
            productName: String(l.productName ?? ''),
            status: String(l.status ?? ''),
            source: String(l.source ?? ''),
          }
        })
      : [],
    warnings: Array.isArray(row.warnings) ? row.warnings.map(String) : [],
    mkSaasLookup: normalizeMkSaasLookup(row.mkSaasLookup),
  }
}

export function normalizeTestDataCleanupResult(raw: unknown): TestDataCleanupResult | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const deleted = row.deleted && typeof row.deleted === 'object' ? (row.deleted as Record<string, unknown>) : {}
  const skipped = row.skipped && typeof row.skipped === 'object' ? (row.skipped as Record<string, unknown>) : {}
  return {
    email: String(row.email ?? ''),
    deleted: {
      orders: toCount(deleted.orders),
      paymentTransactions: toCount(deleted.paymentTransactions),
      saasMemberships: toCount(deleted.saasMemberships),
      websiteLicenses: toCount(deleted.websiteLicenses),
      contactMessages: toCount(deleted.contactMessages),
      downloadLogs: toCount(deleted.downloadLogs),
      customers: toCount(deleted.customers),
      userAccounts: toCount(deleted.userAccounts),
    },
    skipped: {
      protectedPaytrOrders: toCount(skipped.protectedPaytrOrders),
    },
    warnings: Array.isArray(row.warnings) ? row.warnings.map(String) : [],
    mkSaasLookupAfterCleanup: normalizeMkSaasLookup(row.mkSaasLookupAfterCleanup) ?? null,
    mkSaasStillRegistered: row.mkSaasStillRegistered === true,
  }
}
