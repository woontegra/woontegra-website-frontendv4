export const DESKTOP_RENEWAL_TOKEN_KEY = 'woontegra_desktop_license_renewal_token'

export type DesktopLicenseRenewalView = {
  purchaseContext: 'DESKTOP_LICENSE_RENEWAL'
  sessionId: string
  productCode: 'MUVEKKIL_KASA_DESKTOP'
  purpose: 'DESKTOP_LICENSE_RENEWAL'
  licenseId: string | null
  licenseKeyMasked: string
  customerNumber: string | null
  customerName: string | null
  licenseExpiresAt: string | null
  extensionBaseDate: string
  expiresAt: string
  status: string
  boundExternalOrderId: string | null
}

export type DesktopLicenseRenewalPreview = {
  currentLicenseEndDate: string | null
  extensionBaseDate: string
  estimatedNewEndDate: string
  renewalDays: number
}

export function isDesktopLicenseRenewalContext(data: DesktopLicenseRenewalView): boolean {
  return data.purpose === 'DESKTOP_LICENSE_RENEWAL' || data.purchaseContext === 'DESKTOP_LICENSE_RENEWAL'
}

export function isDesktopLicenseRenewalCheckoutContext(data: DesktopLicenseRenewalView): boolean {
  return isDesktopLicenseRenewalContext(data)
}

export type DesktopCheckoutPrefillFields = {
  customerName: string
  customerEmail: string
  customerPhone: string
}

/** Yalnız session'da mevcut gerçek alanları doldurur; uydurma yapılmaz. */
export function mergeDesktopRenewalCheckoutPrefill<T extends DesktopCheckoutPrefillFields>(
  base: T,
  data: DesktopLicenseRenewalView,
): T {
  return {
    ...base,
    customerName: data.customerName?.trim() || base.customerName,
  }
}

export function saveDesktopRenewalToken(token: string): void {
  try {
    sessionStorage.setItem(DESKTOP_RENEWAL_TOKEN_KEY, token.trim())
  } catch {
    /* ignore */
  }
}

export function readDesktopRenewalToken(): string | null {
  try {
    const v = sessionStorage.getItem(DESKTOP_RENEWAL_TOKEN_KEY)
    return v?.trim() || null
  } catch {
    return null
  }
}

export function clearDesktopRenewalToken(): void {
  try {
    sessionStorage.removeItem(DESKTOP_RENEWAL_TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export function formatLicenseDateTr(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
