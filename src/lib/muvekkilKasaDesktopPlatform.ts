import { getPublicProductDownloadFiles } from '@/lib/freeProductDownload'
import {
  isAutoUpdateDistributionUrl,
  type MuvekkilKasaDesktopTrialDownload,
} from '@/lib/muvekkilKasaDesktopProduct'
import type { PublicProductDetail } from '@/types/product'

export const MK_MACOS_PRODUCT_SLUG = 'muvekkil-kasa-defteri-macos'

export function isMuvekkilKasaMacosSalesSlug(slug?: string | null): boolean {
  return slug?.trim().toLowerCase() === MK_MACOS_PRODUCT_SLUG
}

function filenameFromHref(url: string): string {
  try {
    return decodeURIComponent(new URL(url.trim()).pathname.split('/').pop() || '').trim()
  } catch {
    return ''
  }
}

/** macOS Kurulum sürümü: yalnızca public https .dmg (güncelleme beslemesi değil). */
export function isPublicMacosSetupInstallerUrl(url: string | null | undefined): boolean {
  const raw = (url ?? '').trim()
  if (!raw) return false
  if (isAutoUpdateDistributionUrl(raw)) return false
  try {
    const parsed = new URL(raw)
    if (parsed.protocol !== 'https:') return false
    return filenameFromHref(raw).toLowerCase().endsWith('.dmg')
  } catch {
    return false
  }
}

/** Admin ürün kaydındaki public DMG; tanımlı değilse null (bağlantı üretilmez). */
export function getMuvekkilKasaMacosTrialDownload(
  product?: Pick<PublicProductDetail, 'publicDownloadFiles'> | null,
): MuvekkilKasaDesktopTrialDownload | null {
  const files = getPublicProductDownloadFiles(product ?? { publicDownloadFiles: [] })
  const setup = files.find((file) => file.type === 'setup')
  const href = setup?.downloadPath?.trim() ?? ''
  if (!isPublicMacosSetupInstallerUrl(href)) return null
  const filename = setup?.filename?.trim() || filenameFromHref(href) || undefined
  return filename ? { href, filename } : { href }
}
