import {
  isAutoUpdateDistributionUrl,
  isPublicWindowsSetupInstallerUrl,
} from '@/lib/muvekkilKasaDesktopProduct'

export type BhDesktopInstallerProduct = {
  windowsDownloadUrl?: string | null
  windowsVersion?: string | null
  windowsFileSize?: string | null
  windowsDownloadButtonLabel?: string | null
  macosDownloadUrl?: string | null
  macosVersion?: string | null
  macosFileSize?: string | null
  macosDownloadButtonLabel?: string | null
}

export type BhDesktopInstallerView = {
  url: string
  version: string
  fileSize: string
  buttonLabel: string
}

function text(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function isOptionalBhDesktopInstallerUrl(value: string, platform: 'windows' | 'macos'): boolean {
  const raw = value.trim()
  if (!raw) return true
  if (raw.length > 2000 || isAutoUpdateDistributionUrl(raw)) return false
  if (platform === 'windows') return isPublicWindowsSetupInstallerUrl(raw)
  try {
    return new URL(raw).protocol === 'https:'
  } catch {
    return false
  }
}

export function bhDesktopInstallerFieldError(value: string, platform: 'windows' | 'macos'): string | null {
  if (isOptionalBhDesktopInstallerUrl(value, platform)) return null
  return platform === 'windows'
    ? 'Windows kurulum dosyası boş bırakılabilir veya güncelleme adresi olmayan bir https .exe adresi olmalıdır.'
    : 'macOS kurulum dosyası boş bırakılabilir veya güncelleme adresi olmayan bir https adresi olmalıdır.'
}

/** Seçilen platformun kurulum dosyası. Güncelleme adresi indirme bağlantısı olmaz. */
export function bhDesktopInstallerForPlatform(
  product: BhDesktopInstallerProduct | null | undefined,
  platform: 'windows' | 'macos',
): BhDesktopInstallerView | null {
  if (!product) return null
  const windows = platform === 'windows'
  const url = text(windows ? product.windowsDownloadUrl : product.macosDownloadUrl)
  if (!isOptionalBhDesktopInstallerUrl(url, platform) || !url) return null
  const buttonLabel = text(windows ? product.windowsDownloadButtonLabel : product.macosDownloadButtonLabel)
  return {
    url,
    version: text(windows ? product.windowsVersion : product.macosVersion),
    fileSize: text(windows ? product.windowsFileSize : product.macosFileSize),
    buttonLabel: buttonLabel || 'Kurulumu indir',
  }
}
