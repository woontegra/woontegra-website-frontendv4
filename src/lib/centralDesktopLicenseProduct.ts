import { isMuvekkilKasaDesktopCentralLicenseProduct } from '@/lib/muvekkilKasaDesktopProduct'
import { isMuvekkilKasaSaasProduct } from '@/lib/muvekkilKasaSaasProduct'

export type CentralDesktopLicenseProductRef = {
  slug?: string | null
  licenseAppCode?: string | null
  licenseRequired?: boolean | null
  productType?: string | null
}

const LICENSE_APP_CODE_PATTERN = /^[A-Z][A-Z0-9_]*$/
const KNOWN_SAAS_APP_CODES = new Set(['MUVEKKIL_KASA_SAAS'])

export function normalizeLicenseAppCode(raw: string | null | undefined): string {
  return (raw ?? '').trim().toUpperCase()
}

export function isValidLicenseAppCodeFormat(code: string | null | undefined): boolean {
  const normalized = normalizeLicenseAppCode(code)
  return normalized.length >= 3 && normalized.length <= 64 && LICENSE_APP_CODE_PATTERN.test(normalized)
}

export function isCentralDesktopLicenseProduct(
  product: CentralDesktopLicenseProductRef | null | undefined,
): boolean {
  if (!product) return false
  if (isMuvekkilKasaSaasProduct({ slug: product.slug, licenseAppCode: product.licenseAppCode })) {
    return false
  }
  if (product.productType != null && product.productType !== 'DOWNLOAD') return false
  if (product.licenseRequired !== true) return false

  const appCode = normalizeLicenseAppCode(product.licenseAppCode)
  if (appCode) {
    if (KNOWN_SAAS_APP_CODES.has(appCode)) return false
    return isValidLicenseAppCodeFormat(appCode)
  }

  if (isMuvekkilKasaDesktopCentralLicenseProduct({
    slug: product.slug,
    licenseRequired: true,
    productType: product.productType ?? 'DOWNLOAD',
  })) {
    return true
  }

  return product.productType === 'DOWNLOAD'
}
