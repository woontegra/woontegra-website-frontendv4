import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import { adminApi, getErrorMessage } from '@/api/client'
import { getApiBaseUrl } from '@/lib/env'
import { useAuthStore } from '@/store/authStore'

export type BhProduct = {
  id: string
  name: string
  price: number
  originalPrice?: number | null
  priceMonthly?: number | null
  monthlyPrice?: number | null
  price2Year?: number | null
  originalPrice2Year?: number | null
  price3Year?: number | null
  originalPrice3Year?: number | null
  price2YearActive?: boolean
  price3YearActive?: boolean
  imageUrl?: string
  shortDescription?: string
  longDescription?: string
  features?: string
  targetAudience?: string
  trustInfo?: string
  isActive?: boolean
}

export type BhCampaign = {
  id: string
  name: string
  slug?: string
  publicCode?: string
  discountRate?: number
  isActive?: boolean
  usageLimit?: number | null
  usageCount?: number
  reservedCount?: number
  startsAt?: string | null
  expiresAt?: string | null
  campaignType?: string | null
  barAssociationKey?: string | null
  barAssociationNameSnapshot?: string | null
  appliesToNewPurchase?: boolean
  appliesToRenewal?: boolean
  eligibleProductTypes?: string[] | null
  eligiblePeriods?: number[] | null
  createdAt?: string
  updatedAt?: string
  /** Production BH row loaded via remote read-only opt-in. */
  liveData?: boolean
  readOnly?: boolean
  [key: string]: unknown
}

export type BhBarAssociation = {
  key?: string
  id?: string
  name?: string
  [key: string]: unknown
}

export type BhDemoExpertiseAreaStored = {
  code: string
  name: string
}

export type BhDemoRequest = {
  id: string | number
  email: string
  name: string | null
  phone: string | null
  company: string | null
  professionGroup?: string | null
  isExpertWitness?: boolean | null
  expertiseAreas?: BhDemoExpertiseAreaStored[] | null
  city?: string | null
  country?: string | null
  createdAt: string
}

export type BhBillingSnapshot = {
  invoiceType?: string | null
  fullName?: string | null
  email?: string | null
  phone?: string | null
  identityNumber?: string | null
  city?: string | null
  district?: string | null
  address?: string | null
  companyName?: string | null
  taxOffice?: string | null
  taxNumber?: string | null
}

export type BhOrderListItem = {
  merchantOid: string
  email: string
  name?: string | null
  paymentMethod: string
  status: string
  amount?: number | null
  finalPriceKurus?: number | null
  normalPriceKurus?: number | null
  discountRate?: number | null
  discountAmountKurus?: number | null
  campaignNameSnapshot?: string | null
  campaignPublicCode?: string | null
  productType?: string | null
  subscriptionPeriod?: number | null
  productName?: string | null
  bankTransferReference?: string | null
  createdAt: string
  updatedAt?: string
}

export type BhOrderDetail = BhOrderListItem & {
  id?: number
  billingSnapshot?: BhBillingSnapshot | null
  campaignId?: string | null
  barAssociationKey?: string | null
  barAssociationNameSnapshot?: string | null
  fulfillmentStatus?: string | null
  fulfillmentError?: string | null
  fulfillmentFulfilledAt?: string | null
  panelLicenseId?: string | null
  panelUserId?: string | null
  customerNote?: string | null
  bankTransferRejectionNote?: string | null
  product?: { id?: number; name?: string | null } | null
  legalPackage?: {
    id?: number
    packageNo?: string | null
    orderNo?: string | null
    status?: string | null
    productName?: string | null
    planName?: string | null
    billingCycle?: string | null
    amount?: number | null
    acceptedAt?: string | null
    customerName?: string | null
    customerEmail?: string | null
    customerPhone?: string | null
    customerAddress?: string | null
    customerIdentityNo?: string | null
    customerTaxNo?: string | null
    hasArchive?: boolean
  } | null
  userProduct?: {
    id?: number
    purchasedAt?: string
    expiresAt?: string
    duration?: number
    isExpired?: boolean
  } | null
}

export type BhBankTransferItem = BhOrderListItem & {
  name?: string | null
  customerName?: string | null
}

export type BhLegalArchiveItem = {
  id: number
  packageNo?: string | null
  orderNo?: string | null
  customerName?: string | null
  customerEmail?: string | null
  productName?: string | null
  planName?: string | null
  amount?: number | null
  currency?: string | null
  acceptedAt?: string | null
  status?: string | null
}

export type BhLegalDocument = {
  id: number
  documentType: string
  documentTitle: string
  documentVersion: string
  approvalCode?: string
  pdfPath?: string | null
  sha256Hash?: string | null
}

export type BhLegalArchiveDetail = BhLegalArchiveItem & {
  customerPhone?: string | null
  customerAddress?: string | null
  customerIdentityNo?: string | null
  customerTaxNo?: string | null
  billingCycle?: string | null
  acceptedVersionsJson?: string | null
  documents?: BhLegalDocument[]
}

export type BhOverview = {
  analytics: {
    total?: {
      pageViews?: number
      demoRequests?: number
      users?: number
      payments?: number
      revenue?: number
    }
    today?: {
      pageViews?: number
      demoRequests?: number
      users?: number
      payments?: number
      revenue?: number
    }
    yesterday?: {
      pageViews?: number
      demoRequests?: number
      users?: number
      payments?: number
      revenue?: number
    }
    daily?: Array<{
      date: string
      pageViews?: number
      demoRequests?: number
      users?: number
      payments?: number
      revenue?: number
    }>
    activeLast5Min?: number
    activeLast5MinNote?: string | null
  } | null
  campaignStats?: {
    summary: {
      totalCount?: number
      activeCount?: number
      totalUsage?: number
    } | null
    rows: Array<{
      id: string
      name: string
      usageCount?: number
      usageLimit?: number | null
      isActive?: boolean
    }>
  }
  upstreamErrors?: Record<string, string | null>
}

export type BhBarPerformanceRow = {
  barAssociationKey: string
  barAssociationName: string
  uniqueUserCount: number
  firstPurchaseCount: number
  renewalCount: number
  totalAmountKurus: number
  lastTransactionAt: string | null
}

export type BhBarPerformanceUser = {
  key: string
  name: string
  email: string | null
  firstPurchaseCount: number
  renewalCount: number
  totalAmountKurus: number
  lastTransactionAt: string | null
}

export type BhBarPerformanceTransaction = {
  merchantOid: string
  name: string
  email: string | null
  orderPurpose: string | null
  amountKurus: number
  paymentMethod: string | null
  campaignPublicCode: string | null
  campaignName: string | null
  transactionAt: string | null
}

export type BhBarPerformanceDetails = {
  barAssociationKey: string
  barAssociationName: string
  users: BhBarPerformanceUser[]
  transactions: BhBarPerformanceTransaction[]
}

export type BhPaged<T> = {
  items: T[]
  page?: number
  limit?: number
  total?: number
  totalPages?: number
  pagination?: { page: number; limit: number; total: number; pages: number }
}

function asPagedItems<T>(data: unknown): BhPaged<T> {
  if (!data || typeof data !== 'object') return { items: [] }
  const d = data as BhPaged<T> & { data?: BhPaged<T> }
  const root = Array.isArray((d as { items?: T[] }).items)
    ? (d as BhPaged<T>)
    : d.data && Array.isArray(d.data.items)
      ? d.data
      : { items: [] as T[] }
  const total =
    root.total ?? root.pagination?.total ?? (Array.isArray(root.items) ? root.items.length : 0)
  return { ...root, items: root.items ?? [], total }
}

export const adminBhService = {
  async overview(): Promise<BhOverview> {
    const res = await adminApi.get<ApiSuccess<BhOverview>>('/admin/bh/overview')
    return unwrapApiData(res.data, 'adminBh.overview')
  },

  async getProduct(): Promise<BhProduct> {
    const res = await adminApi.get<ApiSuccess<BhProduct>>('/admin/bh/product')
    return unwrapApiData(res.data, 'adminBh.getProduct')
  },

  async updateProduct(payload: Record<string, unknown>): Promise<BhProduct> {
    const res = await adminApi.post<ApiSuccess<BhProduct>>('/admin/bh/product', payload)
    return unwrapApiData(res.data, 'adminBh.updateProduct')
  },

  async listCampaigns(): Promise<BhCampaign[]> {
    const res = await adminApi.get<ApiSuccess<BhCampaign[] | { items?: BhCampaign[]; campaigns?: BhCampaign[] }>>(
      '/admin/bh/campaigns',
    )
    const data = unwrapApiData(res.data, 'adminBh.listCampaigns')
    if (Array.isArray(data)) return data
    if (data && typeof data === 'object') {
      const nested = data as { items?: unknown; campaigns?: unknown }
      if (Array.isArray(nested.items)) return nested.items as BhCampaign[]
      if (Array.isArray(nested.campaigns)) return nested.campaigns as BhCampaign[]
    }
    return []
  },

  async getCampaign(id: string): Promise<BhCampaign> {
    const res = await adminApi.get<ApiSuccess<BhCampaign>>(
      `/admin/bh/campaigns/${encodeURIComponent(id)}`,
    )
    return unwrapApiData(res.data, 'adminBh.getCampaign')
  },

  async createCampaign(payload: Record<string, unknown>): Promise<BhCampaign> {
    const res = await adminApi.post<
      ApiSuccess<BhCampaign | { campaign: BhCampaign; link?: string }>
    >('/admin/bh/campaigns', payload)
    const data = unwrapApiData(res.data, 'adminBh.createCampaign')
    if (data && typeof data === 'object' && 'campaign' in data && (data as { campaign?: BhCampaign }).campaign) {
      return (data as { campaign: BhCampaign }).campaign
    }
    if (data && typeof data === 'object' && 'id' in data) return data as BhCampaign
    throw new Error('Kampanya oluşturulamadı')
  },

  async updateCampaign(id: string, payload: Record<string, unknown>): Promise<BhCampaign> {
    const res = await adminApi.put<ApiSuccess<BhCampaign>>(
      `/admin/bh/campaigns/${encodeURIComponent(id)}`,
      payload,
    )
    return unwrapApiData(res.data, 'adminBh.updateCampaign')
  },

  async deleteCampaign(id: string): Promise<void> {
    await adminApi.delete(`/admin/bh/campaigns/${encodeURIComponent(id)}`)
  },

  async listBarAssociations(): Promise<BhBarAssociation[]> {
    const res = await adminApi.get<ApiSuccess<BhBarAssociation[]>>('/admin/bh/bar-associations')
    const data = unwrapApiData(res.data, 'adminBh.listBarAssociations')
    return Array.isArray(data) ? data : []
  },

  async listBarPerformance(): Promise<BhBarPerformanceRow[]> {
    const res = await adminApi.get<ApiSuccess<BhBarPerformanceRow[]>>('/admin/bh/bar-performance')
    const data = unwrapApiData(res.data, 'adminBh.listBarPerformance')
    return Array.isArray(data) ? data : []
  },

  async getBarPerformanceDetails(barAssociationKey: string): Promise<BhBarPerformanceDetails> {
    const res = await adminApi.get<ApiSuccess<BhBarPerformanceDetails>>(
      `/admin/bh/bar-performance/${encodeURIComponent(barAssociationKey)}`,
    )
    return unwrapApiData(res.data, 'adminBh.getBarPerformanceDetails')
  },

  async listDemoRequests(params?: {
    page?: number
    limit?: number
    q?: string
  }): Promise<BhPaged<BhDemoRequest>> {
    const res = await adminApi.get<ApiSuccess<BhPaged<BhDemoRequest>>>('/admin/bh/demo-requests', {
      params,
    })
    return asPagedItems(unwrapApiData(res.data, 'adminBh.listDemoRequests'))
  },

  async listOrders(params?: {
    page?: number
    limit?: number
    q?: string
    status?: string
  }): Promise<BhPaged<BhOrderListItem>> {
    const res = await adminApi.get<ApiSuccess<BhPaged<BhOrderListItem>>>('/admin/bh/orders', {
      params,
    })
    return asPagedItems(unwrapApiData(res.data, 'adminBh.listOrders'))
  },

  async getOrder(merchantOid: string): Promise<BhOrderDetail> {
    const res = await adminApi.get<ApiSuccess<BhOrderDetail>>(
      `/admin/bh/orders/${encodeURIComponent(merchantOid)}`,
    )
    return unwrapApiData(res.data, 'adminBh.getOrder')
  },

  async listBankTransfers(params?: {
    page?: number
    limit?: number
    q?: string
    status?: string
  }): Promise<BhPaged<BhBankTransferItem>> {
    const res = await adminApi.get<ApiSuccess<BhPaged<BhBankTransferItem>>>('/admin/bh/bank-transfers', {
      params,
    })
    return asPagedItems(unwrapApiData(res.data, 'adminBh.listBankTransfers'))
  },

  async getBankTransfer(merchantOid: string): Promise<BhBankTransferItem & { legalPackage?: unknown; billingInfo?: unknown }> {
    const res = await adminApi.get<ApiSuccess<BhBankTransferItem & { legalPackage?: unknown; billingInfo?: unknown }>>(
      `/admin/bh/bank-transfers/${encodeURIComponent(merchantOid)}`,
    )
    return unwrapApiData(res.data, 'adminBh.getBankTransfer')
  },

  async approveBankTransfer(merchantOid: string, body?: Record<string, unknown>): Promise<unknown> {
    const res = await adminApi.post<ApiSuccess<unknown>>(
      `/admin/bh/bank-transfers/${encodeURIComponent(merchantOid)}/approve`,
      body ?? {},
    )
    return unwrapApiData(res.data, 'adminBh.approveBankTransfer')
  },

  async rejectBankTransfer(
    merchantOid: string,
    body?: { rejectionNote?: string },
  ): Promise<unknown> {
    const res = await adminApi.post<ApiSuccess<unknown>>(
      `/admin/bh/bank-transfers/${encodeURIComponent(merchantOid)}/reject`,
      body ?? {},
    )
    return unwrapApiData(res.data, 'adminBh.rejectBankTransfer')
  },

  async listLegalArchives(params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<BhPaged<BhLegalArchiveItem>> {
    const res = await adminApi.get<ApiSuccess<BhPaged<BhLegalArchiveItem>>>('/admin/bh/legal-archives', {
      params,
    })
    return asPagedItems(unwrapApiData(res.data, 'adminBh.listLegalArchives'))
  },

  async getLegalArchive(id: string | number): Promise<BhLegalArchiveDetail> {
    const res = await adminApi.get<ApiSuccess<BhLegalArchiveDetail>>(
      `/admin/bh/legal-archives/${encodeURIComponent(String(id))}`,
    )
    return unwrapApiData(res.data, 'adminBh.getLegalArchive')
  },

  /** Fetch archived PDF snapshot (admin auth). Returns blob URL — revoke when done. */
  async fetchLegalDocumentPdfBlobUrl(docId: number): Promise<string> {
    const token = useAuthStore.getState().adminToken
    const base = getApiBaseUrl().replace(/\/$/, '')
    const res = await fetch(
      `${base}/admin/bh/legal-archives/documents/${encodeURIComponent(String(docId))}/download`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      },
    )
    if (!res.ok) {
      let message = 'Arşiv belgesi indirilemedi'
      try {
        const j = (await res.json()) as { message?: string }
        if (j.message) message = j.message
      } catch {
        /* ignore */
      }
      throw new Error(message)
    }
    const blob = await res.blob()
    return URL.createObjectURL(blob)
  },
}

export function kurusToTl(kurus: number | null | undefined): number {
  if (kurus == null || Number.isNaN(Number(kurus))) return 0
  return Number(kurus) / 100
}

export function formatTlInput(kurus: number | null | undefined): string {
  const tl = kurusToTl(kurus)
  return Number.isInteger(tl) ? String(tl) : tl.toFixed(2)
}

export { getErrorMessage }
