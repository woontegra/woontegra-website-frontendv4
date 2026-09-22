import {
  buildOptimizedSrcSet,
  mimeForLcpPreloadFormat,
  pickLcpPreloadFormat,
  pickOptimizedPreloadUrl,
} from './optimizedMediaVariants.mjs'

export const LCP_PRELOAD_MOBILE_MEDIA = '(max-width: 640px)'
export const LCP_PRELOAD_DESKTOP_MEDIA = '(min-width: 641px)'
export const LCP_PRELOAD_SIZES = '100vw'

/** HERO_IMAGE_WIDTHS.mobile / desktop ile aynı — yalnızca href fallback; srcset asıl seçici. */
export const LCP_PRELOAD_TARGET_WIDTHS = {
  mobile: 768,
  desktop: 1920,
}

export function firstEnabledHeroSlide(slides) {
  if (!Array.isArray(slides)) return null
  return (
    [...slides]
      .filter((slide) => slide && slide.enabled !== false)
      .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))[0] ?? null
  )
}

/**
 * Homepage CMS JSON — ilk enabled carousel slide. URL hardcode yok.
 */
export function extractHomeLcp(home) {
  if (!home || typeof home !== 'object') return null
  const blocks = Array.isArray(home.blocks) ? home.blocks : []
  const hero = blocks.find((block) => block?.type === 'hero' && block.visibility?.enabled !== false)
  if (hero?.settings?.mode === 'carousel') {
    const slide = firstEnabledHeroSlide(hero.settings.slides)
    const desktop = String(slide?.desktopImage?.url || slide?.image?.url || '').trim()
    const mobile = String(slide?.mobileImage?.url || desktop).trim()
    if (desktop || mobile) return { desktop: desktop || mobile, mobile: mobile || desktop }
  }
  const fallback = String(home.hero?.image || '').trim()
  return fallback ? { desktop: fallback, mobile: fallback } : null
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildLcpImagePreloadLink(url, media, targetWidth) {
  const trimmed = String(url || '').trim()
  if (!trimmed) return null
  const format = pickLcpPreloadFormat(trimmed)
  const href = pickOptimizedPreloadUrl(trimmed, targetWidth, format)
  const imageSrcSet = format === 'canonical' ? null : buildOptimizedSrcSet(trimmed, format)
  return {
    href,
    media,
    type: mimeForLcpPreloadFormat(format),
    imageSrcSet,
    imageSizes: imageSrcSet ? LCP_PRELOAD_SIZES : null,
  }
}

export function buildHomeLcpPreloadLinks(lcp) {
  if (!lcp) return []
  const links = []
  const mobile = buildLcpImagePreloadLink(
    lcp.mobile,
    LCP_PRELOAD_MOBILE_MEDIA,
    LCP_PRELOAD_TARGET_WIDTHS.mobile,
  )
  const desktop = buildLcpImagePreloadLink(
    lcp.desktop,
    LCP_PRELOAD_DESKTOP_MEDIA,
    LCP_PRELOAD_TARGET_WIDTHS.desktop,
  )
  if (mobile) links.push(mobile)
  if (desktop) links.push(desktop)
  return links
}

export function serializeLcpPreloadLink(link) {
  if (!link?.href) return ''
  const attrs = [
    'rel="preload"',
    'as="image"',
    link.type ? `type="${escapeHtml(link.type)}"` : '',
    `href="${escapeHtml(link.href)}"`,
    `media="${escapeHtml(link.media)}"`,
    link.imageSrcSet ? `imagesrcset="${escapeHtml(link.imageSrcSet)}"` : '',
    link.imageSrcSet && link.imageSizes ? `imagesizes="${escapeHtml(link.imageSizes)}"` : '',
    'fetchpriority="high"',
  ].filter(Boolean)
  return `<link ${attrs.join(' ')} />`
}

export function hasMatchingImagePreload(links, media) {
  return (links ?? []).some(
    (link) =>
      String(link?.rel || '').toLowerCase() === 'preload' &&
      String(link?.as || '').toLowerCase() === 'image' &&
      String(link?.media || '') === media,
  )
}

export function collectDocumentImagePreloads(root) {
  if (!root?.querySelectorAll) return []
  return [...root.querySelectorAll('link[rel="preload"][as="image"]')].map((node) => ({
    rel: node.getAttribute('rel') || '',
    as: node.getAttribute('as') || '',
    media: node.getAttribute('media') || '',
    href: node.getAttribute('href') || '',
    id: node.id || '',
  }))
}
