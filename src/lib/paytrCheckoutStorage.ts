export const PAYTR_PENDING_ORDER_KEY = 'woontegra_paytr_pending_order'
export const PAYTR_PENDING_CART_KEY = 'woontegra_paytr_pending_cart'
export const PAYTR_RETRY_ORDER_KEY = 'woontegra_paytr_retry_order'

export function buildPaytrCartKey(productIds: string[]): string {
  return [...productIds].sort().join(',')
}

export function readPaytrPendingOrder(cartKey: string): string | null {
  try {
    const orderNo = sessionStorage.getItem(PAYTR_PENDING_ORDER_KEY)
    const storedCart = sessionStorage.getItem(PAYTR_PENDING_CART_KEY)
    if (!orderNo?.trim() || storedCart !== cartKey) return null
    return orderNo.trim()
  } catch {
    return null
  }
}

export function savePaytrPendingOrder(orderNo: string, cartKey: string): void {
  try {
    sessionStorage.setItem(PAYTR_PENDING_ORDER_KEY, orderNo.trim())
    sessionStorage.setItem(PAYTR_PENDING_CART_KEY, cartKey)
  } catch {
    /* ignore */
  }
}

export function clearPaytrPendingOrder(): void {
  try {
    sessionStorage.removeItem(PAYTR_PENDING_ORDER_KEY)
    sessionStorage.removeItem(PAYTR_PENDING_CART_KEY)
    sessionStorage.removeItem(PAYTR_RETRY_ORDER_KEY)
  } catch {
    /* ignore */
  }
}

export function savePaytrRetryOrder(orderNo: string): void {
  try {
    sessionStorage.setItem(PAYTR_RETRY_ORDER_KEY, orderNo.trim())
  } catch {
    /* ignore */
  }
}

export function readPaytrRetryOrder(): string | null {
  try {
    return sessionStorage.getItem(PAYTR_RETRY_ORDER_KEY)?.trim() || null
  } catch {
    return null
  }
}
