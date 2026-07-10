export type OrderSuccessLine = {
  productName: string
  quantity: number
  lineTotal: number
}

export type OrderSuccessPending = {
  status: 'PENDING'
  message: string
  orderNo: string
  customerEmail: string
  paymentStatusLabel: string
  paymentProvider?: string
  lines: OrderSuccessLine[]
  orderTotal: number
  currency: string
}

export type OrderSuccessFailed = {
  status: 'FAILED' | 'CANCELLED'
  message: string
  orderNo: string
  customerEmail: string
  paymentStatusLabel: string
  lines: OrderSuccessLine[]
  orderTotal: number
  currency: string
}

export type OrderSuccessPaidItem = {
  productName: string
  quantity: number
  lineTotal: number
  downloadUrl: string | null
}

export type OrderDeliveryState = 'pending' | 'delivered' | 'blocked' | 'not_applicable'

export type OrderSuccessPaid = {
  status: 'PAID' | 'PROCESSING'
  orderNo: string
  customerEmail: string
  productName: string
  paymentStatusLabel: string
  lines: OrderSuccessLine[]
  orderTotal: number
  currency: string
  items: OrderSuccessPaidItem[]
  paidAt: string | null
  requiresEmail?: boolean
  message?: string
  paymentProvider?: string
  deliveryState?: OrderDeliveryState
  deliveryMessage?: string
  downloadEmailSentAt?: string | null
}

export type OrderSuccessData = OrderSuccessPending | OrderSuccessFailed | OrderSuccessPaid

export const LAST_ORDER_EMAIL_KEY = 'woontegra_last_order_email'
export const SAAS_RENEW_ORDER_KEY = 'woontegra_saas_renew_order'
export const MK_SAAS_CHECKOUT_ORDER_KEY = 'woontegra_mk_saas_checkout_order'

export type PaymentResultLocationState = {
  orderNo?: string
  email?: string
  productName?: string
  amount?: number
  currency?: string
}
