export type CustomerOrderListItem = {
  orderNo: string
  status: string
  total: number
  currency: string
  createdAt: string
  paymentStatus: string | null
  paymentProvider: string
  productSummary: string
  itemCount: number
  shippingTrackingNumber?: string | null
  lineProductTypes?: string[]
}

export type CustomerOrderItem = {
  productName: string
  productSlug: string | null
  productType: string | null
  quantity: number
  unitPrice: number
  total: number
  downloadUrl: string | null
  downloadKind?: 'setup' | 'portable' | 'generic' | null
  downloadLabel?: string | null
  downloadButtonLabel?: string | null
}

export type CustomerOrderDetail = {
  orderNo: string
  status: string
  total: number
  subtotal: number
  currency: string
  customerName: string
  customerEmail: string
  customerPhone?: string | null
  billingType?: string | null
  companyName?: string | null
  taxOffice?: string | null
  taxNumber?: string | null
  paidAt: string | null
  createdAt: string
  paymentStatus: string | null
  paymentProvider: string
  licenseCodesMasked?: string[]
  items: CustomerOrderItem[]
}
