export function canResendPaidDeliveryEmail(order: {
  status: string
  paymentConfirmedAt?: string | null
  paymentStatus?: string | null
}): boolean {
  if (order.status === 'PAID') return true
  if (order.status === 'PROCESSING' && (Boolean(order.paymentConfirmedAt) || order.paymentStatus === 'SUCCESS')) {
    return true
  }
  return false
}
