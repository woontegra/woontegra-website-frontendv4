import { isSaasOrderDeliveryUrl } from '@/lib/accountHelpers'
import type { OrderSuccessData } from '@/types/orderSuccess'
import {
  MK_SAAS_CHECKOUT_ORDER_KEY,
  MK_SAAS_LICENSE_PURCHASE_ORDER_KEY,
  SAAS_RENEW_ORDER_KEY,
} from '@/types/orderSuccess'

function readMkLicensePurchaseMeta(orderData: OrderSuccessData | null) {
  if (!orderData || (orderData.status !== 'PAID' && orderData.status !== 'PROCESSING')) return null
  return orderData.mkSaasLicensePurchase ?? null
}

export type SaasSuccessKind = 'renewal' | 'first_purchase' | 'existing_account_license' | 'license_renewal'

export function resolveSaasSuccessKind(
  orderNo: string,
  orderData: OrderSuccessData | null,
): SaasSuccessKind | null {
  if (orderNo) {
    try {
      if (sessionStorage.getItem(SAAS_RENEW_ORDER_KEY) === orderNo) return 'renewal'
      if (sessionStorage.getItem(MK_SAAS_LICENSE_PURCHASE_ORDER_KEY) === orderNo) {
        const mk = readMkLicensePurchaseMeta(orderData)
        if (mk?.purpose === 'LICENSE_RENEWAL' || mk?.purchaseContext === 'LICENSE_RENEWAL') {
          return 'license_renewal'
        }
        return 'existing_account_license'
      }
      if (sessionStorage.getItem(MK_SAAS_CHECKOUT_ORDER_KEY) === orderNo) return 'first_purchase'
    } catch {
      /* ignore */
    }
  }

  if (orderData?.status === 'PAID' || orderData?.status === 'PROCESSING') {
    const mk = readMkLicensePurchaseMeta(orderData)
    if (mk?.purpose === 'LICENSE_RENEWAL' || mk?.purchaseContext === 'LICENSE_RENEWAL') {
      return 'license_renewal'
    }
    if (
      mk?.purchaseContext === 'DEMO_CONVERSION' ||
      mk?.purchaseContext === 'EXISTING_ACCOUNT_LICENSE' ||
      mk?.purpose === 'DEMO_CONVERSION' ||
      mk?.purpose === 'LICENSE_PURCHASE'
    ) {
      return 'existing_account_license'
    }
    const hasSaasDelivery = orderData.items.some((item) => isSaasOrderDeliveryUrl(item.downloadUrl))
    if (hasSaasDelivery) return 'first_purchase'
  }

  return null
}

export function saasSuccessNotice(kind: SaasSuccessKind, paidConfirmed: boolean): string {
  if (kind === 'license_renewal') {
    return paidConfirmed
      ? 'Lisansınız başarıyla yenilendi.'
      : 'Ödeme onayı sonrası lisansınız mevcut hesabınıza tanımlanacaktır.'
  }
  if (kind === 'existing_account_license') {
    return paidConfirmed
      ? 'Lisansınız başarıyla mevcut hesabınıza tanımlandı. Mevcut verileriniz korunmuştur.'
      : 'Ödeme onayı sonrası lisansınız mevcut Müvekkil Kasa hesabınıza tanımlanacaktır.'
  }
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
  if (orderData.mkSaasLicensePurchase?.message?.trim()) {
    return orderData.mkSaasLicensePurchase.message.trim()
  }
  if ('deliveryMessage' in orderData && orderData.deliveryMessage?.trim()) {
    return orderData.deliveryMessage.trim()
  }
  if ('deliveryState' in orderData && orderData.deliveryState === 'blocked') {
    return null
  }
  if ('deliveryState' in orderData && orderData.deliveryState === 'delivered') {
    return 'Lisans ve erişim bilgileriniz e-posta ile gönderildi.'
  }
  return null
}
