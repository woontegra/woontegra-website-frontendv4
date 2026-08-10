const PRODUCT_CODE_MUVEKKIL_KASA_DESKTOP = 'MUVEKKIL_KASA_DESKTOP'

const MK_DESKTOP_SLUGS = new Set([
  'muvekkil-kasa-defteri-yazilimi',
  'muvekkil-kasa-defteri-desktop',
])

export type MuvekkilKasaDesktopProductRef = {
  slug?: string | null
  licenseAppCode?: string | null
  licenseRequired?: boolean | null
  productType?: string | null
}

export function isMuvekkilKasaDesktopCentralLicenseProduct(
  product: MuvekkilKasaDesktopProductRef | null | undefined,
): boolean {
  if (!product) return false
  if (product.licenseRequired !== true) return false
  const appCode = product.licenseAppCode?.trim()
  if (appCode === PRODUCT_CODE_MUVEKKIL_KASA_DESKTOP) return true
  const slug = product.slug?.trim().toLowerCase()
  return Boolean(slug && MK_DESKTOP_SLUGS.has(slug))
}
