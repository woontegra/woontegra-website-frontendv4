import { DEFAULT_HEADER_LOGO_PATH } from '@/data/siteLogo'
import { resolveMediaUrl } from '@/media/resolveMediaUrl'

export function buildBrandedAssetUrl(path: string, logoUpdatedAt?: string): string {
  const trimmed = path?.trim()
  const basePath = trimmed || DEFAULT_HEADER_LOGO_PATH
  const url = resolveMediaUrl(basePath) || resolveMediaUrl(DEFAULT_HEADER_LOGO_PATH)
  if (!logoUpdatedAt?.trim()) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${encodeURIComponent(logoUpdatedAt.trim())}`
}
