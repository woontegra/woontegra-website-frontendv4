export type AffiliatePartnerProductAssignment = {
  id?: string
  productId: string
  commissionRatePercent: number
  discountRatePercent: number
  isActive: boolean
  product?: {
    id: string
    name: string
    slug: string
    isActive: boolean
    productType: string
    price: number
    currency: string
  }
}

export type AffiliatePartnerAccess = {
  id: string
  partnerId: string
  email: string
  isRevoked: boolean
  createdAt: string
  updatedAt: string
  revokedAt: string | null
}

export type AffiliateLink = {
  id: string
  partnerId: string
  productId: string
  partnerProductId: string | null
  code: string
  customerDiscountRate: number
  commissionRatePercent: number
  isActive: boolean
  expiresAt: string | null
  createdAt: string
  updatedAt: string
  product: {
    id: string
    name: string
    slug: string
    isActive: boolean
  }
  publicUrl: string
  landingPath: string
}

export type AffiliatePartner = {
  id: string
  name: string
  contactName: string | null
  email: string | null
  phone: string | null
  defaultCommissionRate: number
  isActive: boolean
  internalNotes: string | null
  createdAt: string
  updatedAt: string
  productCount: number
  products?: AffiliatePartnerProductAssignment[]
  partnerAccess?: AffiliatePartnerAccess | null
  links?: AffiliateLink[]
}

export type AffiliatePartnerInput = {
  name: string
  contactName?: string | null
  email?: string | null
  phone?: string | null
  defaultCommissionRate: number
  isActive?: boolean
  internalNotes?: string | null
  products: Array<{
    productId: string
    commissionRatePercent: number
    discountRatePercent: number
    isActive?: boolean
  }>
}

export type PartnerAccessInviteResult = {
  access: AffiliatePartnerAccess
  magicUrl: string
  expiresAt: string
}

export type AffiliatePartnerFinancialSummary = {
  saleCount: number
  totalGrossPaidAmountKurus: number
  totalCommissionBaseAmountKurus: number
  lifetimeEarnedCommissionKurus: number
  paidCommissionKurus: number
  pendingCommissionKurus: number
}

export type AffiliateListPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

/** Satış/komisyon satırı — ödenen/kalan AffiliatePayoutItem defterinden. */
export type AffiliateCommissionRow = {
  id: string
  saleType?: string
  productType?: string | null
  subscriptionPeriod?: number | null
  productName?: string | null
  grossPaidAmountKurus: number
  commissionBaseAmountKurus?: number
  commissionRateSnapshot: number
  effectiveCustomerDiscountRateSnapshot?: number
  commissionAmountKurus: number
  paidAmountKurus?: number
  remainingAmountKurus?: number
  status: string
  createdAt: string
  saleRef?: string
}

export type AffiliateEarnedForPayoutItem = {
  id: string
  orderNo: string
  productName: string
  saleType: string
  commissionAmountKurus: number
  paidAmountKurus: number
  remainingAmountKurus: number
  status: string
  createdAt: string
}

export type AffiliateCreatePayoutInput = {
  allocations: Array<{ commissionId: string; amountKurus: number }>
  paymentMethod: string
  reference?: string
  notes?: string
  paidAt?: string
  idempotencyKey: string
}

export type AffiliatePayoutRow = {
  id: string
  amountKurus: number
  currency?: string
  paymentMethod: string
  reference?: string | null
  notes?: string | null
  status: string
  paidAt: string
  createdAt: string
}

export type AffiliateCommissionsPayload = {
  summary: AffiliatePartnerFinancialSummary
  items: AffiliateCommissionRow[]
  pagination: AffiliateListPagination
}

export type AffiliatePayoutsPayload = {
  items: AffiliatePayoutRow[]
  pagination: AffiliateListPagination
}

export type AffiliateLinksPayload = {
  items: AffiliateLink[]
  pagination: AffiliateListPagination
}
