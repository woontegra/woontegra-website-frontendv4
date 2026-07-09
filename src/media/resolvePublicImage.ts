import { resolveMediaUrl } from '@/media/resolveMediaUrl'

const INVALID_LITERALS = new Set([
  'null',
  'undefined',
  'none',
  'false',
  'n/a',
  '[object object]',
])

const BLOCKED_PREFIXES = ['javascript:', 'data:text', 'file://', 'blob:null']

export type PublicImageSources = {
  desktop: string
  tablet: string
  mobile: string
}

export type ResolvePublicImageOptions = {
  viewport?: 'mobile' | 'tablet' | 'desktop'
  debugLabel?: string
}

function isUsableRaw(value: string): boolean {
  const raw = value.trim()
  if (!raw) return false
  const lower = raw.toLowerCase()
  if (INVALID_LITERALS.has(lower)) return false
  if (lower.includes('[object object]')) return false
  if (BLOCKED_PREFIXES.some((prefix) => lower.startsWith(prefix))) return false
  if (import.meta.env.PROD && /localhost(?::\d+)?/i.test(raw)) return false
  return true
}

function readString(value: unknown): string {
  if (typeof value !== 'string') return ''
  return isUsableRaw(value) ? value.trim() : ''
}

function readFromRecord(row: Record<string, unknown>, depth: number): string {
  if (depth > 5) return ''

  const directKeys = [
    'url',
    'imageUrl',
    'image_url',
    'src',
    'mediaUrl',
    'media_url',
    'heroImage',
    'heroImageUrl',
    'coverImage',
    'coverImageUrl',
    'coverUrl',
    'thumbnail',
    'thumbnailUrl',
    'featuredImage',
    'path',
    'href',
    'desktop',
    'mobile',
    'tablet',
  ] as const

  for (const key of directKeys) {
    const raw = readString(row[key])
    if (raw) return raw
  }

  const nestedKeys = [
    'image',
    'media',
    'coverImage',
    'coverMedia',
    'hero',
    'desktopImage',
    'mobileImage',
    'tabletImage',
    'featured',
    'thumbnail',
    'responsiveImages',
    'mediaRef',
  ] as const

  for (const key of nestedKeys) {
    const nested = row[key]
    if (nested == null) continue
    const raw = extractPublicImageRaw(nested, depth + 1)
    if (raw) return raw
  }

  return ''
}

/**
 * Ham görsel path/URL çıkarır — henüz base URL çözümlemesi yapmaz.
 */
export function extractPublicImageRaw(input: unknown, depth = 0): string {
  if (input == null || depth > 5) return ''

  if (typeof input === 'string') return readString(input)

  if (Array.isArray(input)) {
    for (const item of input) {
      const raw = extractPublicImageRaw(item, depth + 1)
      if (raw) return raw
    }
    return ''
  }

  if (typeof input === 'object') {
    const row = input as Record<string, unknown>

    if (row.responsiveImages && typeof row.responsiveImages === 'object') {
      const responsive = row.responsiveImages as Record<string, unknown>
      const fromResponsive = readString(responsive.desktop) || readString(responsive.tablet) || readString(responsive.mobile)
      if (fromResponsive) return fromResponsive
    }

    return readFromRecord(row, depth + 1)
  }

  return ''
}

function resolveRaw(raw: string, debugLabel?: string): string {
  const resolved = resolveMediaUrl(raw)
  if (import.meta.env.DEV && debugLabel && resolved) {
    console.debug(`[resolvePublicImage] ${debugLabel}`, { raw, resolved })
  }
  return resolved
}

/**
 * Public sayfalar için tek merkezi görsel çözümleyici.
 */
export function resolvePublicImage(input: unknown, options?: ResolvePublicImageOptions): string {
  if (options?.viewport) {
    const sources = resolvePublicImageSources(input, options)
    if (!sources) return ''
    const pick =
      options.viewport === 'mobile'
        ? sources.mobile
        : options.viewport === 'tablet'
          ? sources.tablet
          : sources.desktop
    return pick
  }

  const raw = extractPublicImageRaw(input)
  if (!raw) return ''
  return resolveRaw(raw, options?.debugLabel)
}

export function resolvePublicImageSources(
  input: unknown,
  options?: ResolvePublicImageOptions,
): PublicImageSources | null {
  if (input == null) return null

  if (typeof input === 'object' && !Array.isArray(input)) {
    const row = input as Record<string, unknown>

    const desktopRaw =
      extractPublicImageRaw(row.desktopImage) ||
      readString(row.desktopImageUrl) ||
      readString(row.imageUrl) ||
      readString(row.image) ||
      readString(row.heroImage) ||
      readString(row.coverImage) ||
      readString(row.url)

    const tabletRaw = extractPublicImageRaw(row.tabletImage) || readString(row.tabletImageUrl)
    const mobileRaw = extractPublicImageRaw(row.mobileImage) || readString(row.mobileImageUrl)

    const desktop = desktopRaw ? resolveRaw(desktopRaw, options?.debugLabel) : ''
    const tablet = tabletRaw ? resolveRaw(tabletRaw, options?.debugLabel) : ''
    const mobile = mobileRaw ? resolveRaw(mobileRaw, options?.debugLabel) : ''

    if (desktop || tablet || mobile) {
      const fallback = desktop || tablet || mobile
      return {
        desktop: desktop || fallback,
        tablet: tablet || desktop || mobile || fallback,
        mobile: mobile || tablet || desktop || fallback,
      }
    }
  }

  const single = resolvePublicImage(input, options)
  if (!single) return null
  return { desktop: single, tablet: single, mobile: single }
}

export function hasPublicImage(input: unknown): boolean {
  return Boolean(resolvePublicImage(input) || resolvePublicImageSources(input)?.desktop)
}
