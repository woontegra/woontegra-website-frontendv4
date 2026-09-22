import { useEffect } from 'react'
import {
  LCP_PRELOAD_DESKTOP_MEDIA,
  LCP_PRELOAD_MOBILE_MEDIA,
  collectDocumentImagePreloads,
  hasMatchingImagePreload,
} from '@/media/lcpHeroPreload'

const PRELOAD_MOBILE_ID = 'lcp-hero-image-preload-mobile'
const PRELOAD_DESKTOP_ID = 'lcp-hero-image-preload-desktop'

type PreloadBundle = {
  href: string
  mobileHref?: string
  desktopHref?: string
  imageSrcSet: string
  imageSizes: string
  mobileImageSrcSet?: string
  desktopImageSrcSet?: string
  mobileType?: string
  desktopType?: string
}

export function hasPrerenderedLcpImagePreload(root: ParentNode | null | undefined, media: string): boolean {
  if (!root) return false
  const links = collectDocumentImagePreloads(root).filter(
    (link) => link.id !== PRELOAD_MOBILE_ID && link.id !== PRELOAD_DESKTOP_ID,
  )
  return hasMatchingImagePreload(links, media)
}

function upsertPreload(
  id: string,
  href: string,
  media: string,
  srcSet?: string,
  sizes?: string,
  type?: string,
): HTMLLinkElement {
  let link = document.getElementById(id) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.id = id
    link.rel = 'preload'
    link.as = 'image'
    document.head.appendChild(link)
  }
  link.href = href
  link.media = media
  link.setAttribute('fetchpriority', 'high')
  if (type) link.type = type
  else link.removeAttribute('type')
  if (srcSet) link.setAttribute('imagesrcset', srcSet)
  else link.removeAttribute('imagesrcset')
  if (sizes) link.setAttribute('imagesizes', sizes)
  else link.removeAttribute('imagesizes')
  return link
}

/**
 * LCP hero — viewport başına ayrı preload (mobil cihaz desktop asset indirmez).
 * Prerender head'de aynı media için image preload varsa duplicate eklenmez.
 */
export function useLcpImagePreload(bundle: PreloadBundle | null | undefined) {
  useEffect(() => {
    const mobile = bundle?.mobileHref || bundle?.href
    const desktop = bundle?.desktopHref || bundle?.href
    if (!mobile && !desktop) {
      document.getElementById(PRELOAD_MOBILE_ID)?.remove()
      document.getElementById(PRELOAD_DESKTOP_ID)?.remove()
      return
    }

    if (mobile && !hasPrerenderedLcpImagePreload(document.head, LCP_PRELOAD_MOBILE_MEDIA)) {
      upsertPreload(
        PRELOAD_MOBILE_ID,
        mobile,
        LCP_PRELOAD_MOBILE_MEDIA,
        bundle?.mobileImageSrcSet,
        bundle?.mobileImageSrcSet ? bundle.imageSizes : undefined,
        bundle?.mobileType,
      )
    }
    if (desktop && !hasPrerenderedLcpImagePreload(document.head, LCP_PRELOAD_DESKTOP_MEDIA)) {
      upsertPreload(
        PRELOAD_DESKTOP_ID,
        desktop,
        LCP_PRELOAD_DESKTOP_MEDIA,
        bundle?.desktopImageSrcSet,
        bundle?.desktopImageSrcSet ? bundle.imageSizes : undefined,
        bundle?.desktopType,
      )
    }

    return () => {
      document.getElementById(PRELOAD_MOBILE_ID)?.remove()
      document.getElementById(PRELOAD_DESKTOP_ID)?.remove()
    }
  }, [
    bundle?.href,
    bundle?.mobileHref,
    bundle?.desktopHref,
    bundle?.imageSizes,
    bundle?.mobileImageSrcSet,
    bundle?.desktopImageSrcSet,
    bundle?.mobileType,
    bundle?.desktopType,
  ])
}
