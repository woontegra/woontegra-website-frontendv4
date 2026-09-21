export const OPTIMIZED_VARIANT_WIDTHS = [480, 960, 1440, 1920] as const

export type OptimizedVariantMarker = 'opt' | 'optavif'

export const OPTIMIZED_MEDIA_MARKER = 'opt'

const OPTIMIZED_URL_RE = /\.(optavif|opt)-w(\d+)\.(jpe?g|png|webp|avif)(?:[?#]|$)/i

const OPTIMIZED_FILE_RE = /^(.+)\.(optavif|opt)-w(\d+)\.(jpe?g|png|webp|avif)$/i

export type OptimizedMediaFormat = 'jpeg' | 'png' | 'webp' | 'avif'

export type ParsedOptimizedMedia = {
  url: string
  fileName: string
  stem: string
  marker: OptimizedVariantMarker
  maxWidth: number
  ext: string
  hasAvif: boolean
  hasWebp: boolean
}

export type PictureSource = {
  type?: string
  srcSet: string
  media?: string
  sizes?: string
}

function fileNameFromUrl(url: string): string {
  const withoutHash = url.split('#')[0] ?? url
  const withoutQuery = withoutHash.split('?')[0] ?? withoutHash
  return withoutQuery.replace(/\\/g, '/').split('/').pop() || ''
}

export function replaceUrlFileName(url: string, fileName: string): string {
  const hashIndex = url.indexOf('#')
  const hash = hashIndex >= 0 ? url.slice(hashIndex) : ''
  const withoutHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url
  const queryIndex = withoutHash.indexOf('?')
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex) : ''
  const pathname = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash
  const slash = pathname.lastIndexOf('/')
  if (slash === -1) return `${fileName}${query}${hash}`
  return `${pathname.slice(0, slash + 1)}${fileName}${query}${hash}`
}

export function parseOptimizedMediaUrl(url: string | null | undefined): ParsedOptimizedMedia | null {
  const raw = url?.trim() ?? ''
  if (!raw) return null
  if (!OPTIMIZED_URL_RE.test(raw)) return null
  const fileName = fileNameFromUrl(raw)
  const match = fileName.match(OPTIMIZED_FILE_RE)
  if (!match) return null
  const marker = match[2].toLowerCase() as OptimizedVariantMarker
  return {
    url: raw,
    fileName,
    stem: match[1],
    marker,
    maxWidth: Number(match[3]),
    ext: match[4].toLowerCase(),
    hasAvif: marker === 'optavif',
    hasWebp: true,
  }
}

export function isOptimizedMediaUrl(url: string | null | undefined): boolean {
  return parseOptimizedMediaUrl(url) !== null
}

export function listOptimizedWidths(maxWidth: number): number[] {
  const smaller = OPTIMIZED_VARIANT_WIDTHS.filter((width) => width < maxWidth)
  return [...smaller, maxWidth]
}

export function pickResponsiveWidth(maxWidth: number, targetWidth: number): number {
  const widths = listOptimizedWidths(maxWidth)
  const needed = Math.min(Math.max(1, targetWidth), maxWidth)
  return widths.find((width) => width >= needed) ?? maxWidth
}

export function buildOptimizedVariantUrl(
  canonicalUrl: string,
  width: number,
  format: OptimizedMediaFormat,
): string | null {
  const parsed = parseOptimizedMediaUrl(canonicalUrl)
  if (!parsed || width > parsed.maxWidth) return null
  if (format === 'avif' && !parsed.hasAvif) return null
  if (format === 'webp' && !parsed.hasWebp) return null
  const ext = format === 'jpeg' ? 'jpg' : format
  return replaceUrlFileName(canonicalUrl, `${parsed.stem}.${parsed.marker}-w${width}.${ext}`)
}

export function buildOptimizedSrcSet(
  canonicalUrl: string,
  format: OptimizedMediaFormat,
): string | null {
  const parsed = parseOptimizedMediaUrl(canonicalUrl)
  if (!parsed) return null
  if (format === 'avif' && !parsed.hasAvif) return null
  if (format === 'webp' && !parsed.hasWebp) return null
  const parts = listOptimizedWidths(parsed.maxWidth)
    .map((width) => {
      const href = buildOptimizedVariantUrl(canonicalUrl, width, format)
      return href ? `${href} ${width}w` : ''
    })
    .filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : null
}

export function pickOptimizedPreloadUrl(
  url: string,
  targetWidth: number,
  format: 'webp' | 'avif' | 'canonical' = 'webp',
): string {
  const parsed = parseOptimizedMediaUrl(url)
  if (!parsed) return url
  if (format === 'canonical') return url
  if (format === 'avif' && !parsed.hasAvif) return pickOptimizedPreloadUrl(url, targetWidth, 'webp')
  const width = pickResponsiveWidth(parsed.maxWidth, targetWidth)
  return buildOptimizedVariantUrl(url, width, format) || url
}

export function buildResponsivePictureModel(
  url: string,
  options?: { media?: string; sizes?: string },
): { sources: PictureSource[]; imgSrc: string; imgSrcSet?: string } | null {
  const parsed = parseOptimizedMediaUrl(url)
  if (!parsed) return null

  const sizes = options?.sizes ?? '100vw'
  const avifSrcSet = buildOptimizedSrcSet(url, 'avif')
  const webpSrcSet = buildOptimizedSrcSet(url, 'webp')
  const sources: PictureSource[] = []
  if (avifSrcSet) {
    sources.push({ type: 'image/avif', srcSet: avifSrcSet, media: options?.media, sizes })
  }
  if (webpSrcSet) {
    sources.push({ type: 'image/webp', srcSet: webpSrcSet, media: options?.media, sizes })
  }

  return {
    sources,
    imgSrc: url,
    imgSrcSet: `${url} ${parsed.maxWidth}w`,
  }
}
