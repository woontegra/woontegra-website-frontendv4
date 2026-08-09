export const MK_SAAS_RENEWAL_TOKEN_KEY = 'woontegra_mk_saas_renewal_token'
export const MK_SAAS_LICENSE_PURCHASE_ORDER_KEY = 'woontegra_mk_saas_license_purchase_order'

export type MkSaasLicensePurchaseView = {
  purchaseContext: 'DEMO_CONVERSION' | 'LICENSE_RENEWAL' | 'EXISTING_ACCOUNT_LICENSE'
  sessionId: string
  productCode: 'MUVEKKIL_KASA_SAAS'
  purpose: 'DEMO_CONVERSION' | 'LICENSE_RENEWAL' | 'LICENSE_PURCHASE'
  musteriNo: string
  buroAdi: string
  demoMu: boolean
  lisansDurumu: string
  kalanGun: number | null
  lisansBitisTarihi: string | null
  lisansBaslangicTarihi: string | null
  extensionBaseDate: string
  ownerName: string | null
  ownerEmail: string | null
  ownerPhone: string | null
  tenantAdres: string | null
  tenantVergiNo: string | null
  tenantVergiDairesi: string | null
  expiresAt: string
  status: string
  boundExternalOrderId: string | null
}

export type MkSaasLicenseRenewalPreview = {
  currentLicenseEndDate: string | null
  extensionBaseDate: string
  estimatedNewEndDate: string
  renewalDays: number
}

export function isMkSaasLicenseRenewalContext(data: MkSaasLicensePurchaseView): boolean {
  return data.purpose === 'LICENSE_RENEWAL' || data.purchaseContext === 'LICENSE_RENEWAL'
}

export function isMkSaasDemoConversionContext(data: MkSaasLicensePurchaseView): boolean {
  return (
    data.purpose === 'DEMO_CONVERSION' ||
    data.purpose === 'LICENSE_PURCHASE' ||
    data.purchaseContext === 'DEMO_CONVERSION' ||
    data.purchaseContext === 'EXISTING_ACCOUNT_LICENSE'
  )
}

export function saveMkSaasRenewalToken(token: string): void {
  try {
    sessionStorage.setItem(MK_SAAS_RENEWAL_TOKEN_KEY, token.trim())
  } catch {
    /* ignore */
  }
}

export function readMkSaasRenewalToken(): string | null {
  try {
    const v = sessionStorage.getItem(MK_SAAS_RENEWAL_TOKEN_KEY)
    return v?.trim() || null
  } catch {
    return null
  }
}

export function clearMkSaasRenewalToken(): void {
  try {
    sessionStorage.removeItem(MK_SAAS_RENEWAL_TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export const MUVEKKIL_KASA_APP_LOGIN_URL = 'https://muvekkil.woontegra.com/login'

export function isMkSaasExistingAccountCheckoutContext(data: MkSaasLicensePurchaseView): boolean {
  return isMkSaasLicenseRenewalContext(data) || isMkSaasDemoConversionContext(data)
}

export type MkSaasCheckoutPrefillFields = {
  customerName: string
  customerEmail: string
  customerPhone: string
  billingType: '' | 'Bireysel' | 'Kurumsal'
  companyName: string
  taxOffice: string
  taxNumber: string
  identityNumber: string
  deliveryLine: string
}

export function mergeMkSaasCheckoutPrefill<T extends MkSaasCheckoutPrefillFields>(
  base: T,
  data: MkSaasLicensePurchaseView,
): T {
  const hasVergi = Boolean(data.tenantVergiNo?.trim())
  return {
    ...base,
    customerName: data.ownerName?.trim() || base.customerName,
    customerEmail: data.ownerEmail?.trim() || base.customerEmail,
    customerPhone: data.ownerPhone?.trim() || base.customerPhone,
    deliveryLine: data.tenantAdres?.trim() || base.deliveryLine,
    ...(hasVergi
      ? {
          billingType: base.billingType || ('Kurumsal' as const),
          companyName: base.companyName.trim() || data.buroAdi,
          taxOffice: base.taxOffice.trim() || data.tenantVergiDairesi?.trim() || '',
          taxNumber: base.taxNumber.trim() || data.tenantVergiNo?.trim() || '',
        }
      : {}),
  }
}

export function formatLicenseDateTr(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}
