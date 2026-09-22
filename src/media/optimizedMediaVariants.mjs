export const OPTIMIZED_VARIANT_WIDTHS = [480, 960, 1440, 1920]

export const OPTIMIZED_MEDIA_MARKER = 'opt'

const OPTIMIZED_URL_RE = /\.(optavif|opt)-w(\d+)\.(jpe?g|png|webp|avif)(?:[?#]|$)/i

const OPTIMIZED_FILE_RE = /^(.+)\.(optavif|opt)-w(\d+)\.(jpe?g|png|webp|avif)$/i

function fileNameFromUrl(url) {
  const withoutHash = url.split('#')[0] ?? url
  const withoutQuery = withoutHash.split('?')[0] ?? withoutHash
  return withoutQuery.replace(/\\/g, '/').split('/').pop() || ''
}

export function replaceUrlFileName(url, fileName) {
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

export function parseOptimizedMediaUrl(url) {
  const raw = url?.trim() ?? ''
  if (!raw) return null
  if (!OPTIMIZED_URL_RE.test(raw)) return null
  const fileName = fileNameFromUrl(raw)
  const match = fileName.match(OPTIMIZED_FILE_RE)
  if (!match) return null
  const marker = match[2].toLowerCase()
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

export function isOptimizedMediaUrl(url) {
  return parseOptimizedMediaUrl(url) !== null
}

export function listOptimizedWidths(maxWidth) {
  const smaller = OPTIMIZED_VARIANT_WIDTHS.filter((width) => width < maxWidth)
  return [...smaller, maxWidth]
}

export function pickResponsiveWidth(maxWidth, targetWidth) {
  const widths = listOptimizedWidths(maxWidth)
  const needed = Math.min(Math.max(1, targetWidth), maxWidth)
  return widths.find((width) => width >= needed) ?? maxWidth
}

export function buildOptimizedVariantUrl(canonicalUrl, width, format) {
  const parsed = parseOptimizedMediaUrl(canonicalUrl)
  if (!parsed || width > parsed.maxWidth) return null
  if (format === 'avif' && !parsed.hasAvif) return null
  if (format === 'webp' && !parsed.hasWebp) return null
  const ext = format === 'jpeg' ? 'jpg' : format
  return replaceUrlFileName(canonicalUrl, `${parsed.stem}.${parsed.marker}-w${width}.${ext}`)
}

export function buildOptimizedSrcSet(canonicalUrl, format) {
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

export function pickOptimizedPreloadUrl(url, targetWidth, format = 'webp') {
  const parsed = parseOptimizedMediaUrl(url)
  if (!parsed) return url
  if (format === 'canonical') return url
  if (format === 'avif' && !parsed.hasAvif) return pickOptimizedPreloadUrl(url, targetWidth, 'webp')
  const width = pickResponsiveWidth(parsed.maxWidth, targetWidth)
  return buildOptimizedVariantUrl(url, width, format) || url
}

export function buildResponsivePictureModel(url, options) {
  const parsed = parseOptimizedMediaUrl(url)
  if (!parsed) return null

  const sizes = options?.sizes ?? '100vw'
  const avifSrcSet = buildOptimizedSrcSet(url, 'avif')
  const webpSrcSet = buildOptimizedSrcSet(url, 'webp')
  const sources = []
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

/** Chromium <picture> AVIF-first seçimi ile aynı format. Olmayan AVIF üretilmez. */
export function pickLcpPreloadFormat(url) {
  const parsed = parseOptimizedMediaUrl(url)
  if (!parsed) return 'canonical'
  if (parsed.hasAvif) return 'avif'
  return 'webp'
}

export function mimeForLcpPreloadFormat(format) {
  if (format === 'avif') return 'image/avif'
  if (format === 'webp') return 'image/webp'
  return null
}
