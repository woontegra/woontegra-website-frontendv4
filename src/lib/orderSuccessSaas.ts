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

export function saasSuccessNotice(kind: SaasSuccessKind, paidConfirmed: boolean): string {
  if (kind === 'renewal') {
    return paidConfirmed
      ? 'Müvekkil Kasa üyelik süreniz ödeme onayı sonrası uzatılacaktır; bilgiler e-posta ile iletilecektir.'
      : 'Havale/EFT onayı sonrası Müvekkil Kasa üyelik süreniz uzatılacaktır.'
  }
  return paidConfirmed
    ? 'Web tabanlı ürün erişiminiz hazırlanıyor veya oluşturuldu; giriş bilgileri e-posta ile iletilecektir.'
    : 'Ödeme onayı sonrası web tabanlı ürün hesabınız oluşturulacak; giriş bilgileri e-posta ile iletilecektir.'
}

export function paidDeliveryNotice(orderData: OrderSuccessData | null): string | null {
  if (!orderData || (orderData.status !== 'PAID' && orderData.status !== 'PROCESSING')) return null
  if ('deliveryMessage' in orderData && orderData.deliveryMessage?.trim()) {
    return orderData.deliveryMessage.trim()
  }
  if ('deliveryState' in orderData && orderData.deliveryState === 'delivered') {
    return 'Lisans ve erişim bilgileriniz e-posta ile gönderildi.'
  }
  return null
}
