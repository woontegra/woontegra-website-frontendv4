import { getPublicProductDownloadFiles } from '@/lib/freeProductDownload'
import type { PublicProductDetail } from '@/types/product'

const PRODUCT_CODE_MUVEKKIL_KASA_DESKTOP = 'MUVEKKIL_KASA_DESKTOP'

const MK_DESKTOP_SLUGS = new Set([
  'muvekkil-kasa-defteri-yazilimi',
  'muvekkil-kasa-defteri-desktop',
])

export function isMuvekkilKasaDesktopSalesSlug(slug?: string | null): boolean {
  const value = slug?.trim().toLowerCase()
  return Boolean(value && MK_DESKTOP_SLUGS.has(value))
}

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

/**
 * Intentionally empty. Public installer comes from product.publicDownloadFiles
 * (admin Kurulum sürümü R2 URL). Never hard-code KoopPlus, updater, or R2 URLs here.
 */
export const MUVEKKIL_KASA_DESKTOP_WINDOWS_DOWNLOAD_URL = ''

export type MuvekkilKasaDesktopTrialDownload = {
  href: string
  filename?: string
}

function filenameFromHref(url: string): string {
  try {
    return decodeURIComponent(new URL(url.trim()).pathname.split('/').pop() || '').trim()
  } catch {
    return ''
  }
}

export function isAutoUpdateDistributionUrl(url: string | null | undefined): boolean {
  const raw = (url ?? '').trim()
  if (!raw) return false
  const lower = raw.toLowerCase()
  if (lower.includes('/updates/')) return true
  const name = filenameFromHref(raw).toLowerCase()
  if (name === 'latest.yml' || name === 'latest-mac.yml' || name === 'latest-linux.yml') return true
  if (name.endsWith('.blockmap')) return true
  return false
}

export function isPublicWindowsSetupInstallerUrl(url: string | null | undefined): boolean {
  const raw = (url ?? '').trim()
  if (!raw) return false
  if (isAutoUpdateDistributionUrl(raw)) return false
  try {
    const parsed = new URL(raw)
    if (parsed.protocol !== 'https:') return false
    return filenameFromHref(raw).toLowerCase().endsWith('.exe')
  } catch {
    return false
  }
}

/**
 * Desktop trial CTA installer: admin-panel public Kurulum sürümü only.
 * Source: PublicProductDetail.publicDownloadFiles[].downloadPath (type=setup).
 * Website does not call /trial; updater feeds are never a fallback.
 */
export function getMuvekkilKasaDesktopTrialDownload(
  product?: Pick<PublicProductDetail, 'publicDownloadFiles'> | null,
): MuvekkilKasaDesktopTrialDownload | null {
  const files = getPublicProductDownloadFiles(product ?? { publicDownloadFiles: [] })
  const setup = files.find((file) => file.type === 'setup')
  const href = setup?.downloadPath?.trim() ?? ''
  if (!isPublicWindowsSetupInstallerUrl(href)) return null
  const filename = setup?.filename?.trim() || filenameFromHref(href) || undefined
  return filename ? { href, filename } : { href }
}

export function isMuvekkilKasaDesktopTrialDownloadReady(
  product?: Pick<PublicProductDetail, 'publicDownloadFiles'> | null,
): boolean {
  return getMuvekkilKasaDesktopTrialDownload(product) != null
}
