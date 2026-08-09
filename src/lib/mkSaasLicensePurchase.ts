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
  ownerEmail: string | null
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

export function formatLicenseDateTr(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}
