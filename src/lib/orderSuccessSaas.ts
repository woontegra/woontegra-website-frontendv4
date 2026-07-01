import { isSaasOrderDeliveryUrl } from '@/lib/accountHelpers'
import type { OrderSuccessData } from '@/types/orderSuccess'
import { MK_SAAS_CHECKOUT_ORDER_KEY, SAAS_RENEW_ORDER_KEY } from '@/types/orderSuccess'

export type SaasSuccessKind = 'renewal' | 'first_purchase'

export function resolveSaasSuccessKind(
  orderNo: string,
  orderData: OrderSuccessData | null,
): SaasSuccessKind | null {
  if (orderNo) {
    try {
      if (sessionStorage.getItem(SAAS_RENEW_ORDER_KEY) === orderNo) return 'renewal'
      if (sessionStorage.getItem(MK_SAAS_CHECKOUT_ORDER_KEY) === orderNo) return 'first_purchase'
    } catch {
      /* ignore */
    }
  }

  if (orderData?.status === 'PAID' || orderData?.status === 'PROCESSING') {
    const hasSaasDelivery = orderData.items.some((item) => isSaasOrderDeliveryUrl(item.downloadUrl))
    if (hasSaasDelivery) return 'first_purchase'
  }

  return null
}

export function saasSuccessNotice(kind: SaasSuccessKind): string {
  if (kind === 'renewal') {
    return 'Ödeme onaylandıktan sonra Müvekkil Kasa üyelik süreniz 1 yıl uzatılacaktır.'
  }
  return 'Ödeme onaylandıktan sonra yazılım hesabınız oluşturulacaktır.'
}
