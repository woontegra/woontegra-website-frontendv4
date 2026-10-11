import { readMkSaasRenewalToken } from '@/lib/mkSaasLicensePurchase'
import { isMuvekkilKasaSaasProduct, type MuvekkilKasaSaasProductRef } from '@/lib/muvekkilKasaSaasProduct'

/**
 * Yeni Müvekkil Kasa SaaS satın alması tek yıllıktır.
 * Lisans yenileme bağlantısıyla gelinen oturumda mevcut çok yıllık yenileme davranışı korunur.
 */
export function isMkSaasSingleYearPurchase(product: MuvekkilKasaSaasProductRef | null | undefined): boolean {
  if (!isMuvekkilKasaSaasProduct(product)) return false
  return !readMkSaasRenewalToken()
}
