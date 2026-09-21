import { useEffect } from 'react'

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
}

function upsertPreload(
  id: string,
  href: string,
  media: string,
  srcSet?: string,
  sizes?: string,
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
  if (srcSet) link.setAttribute('imagesrcset', srcSet)
  else link.removeAttribute('imagesrcset')
  if (sizes) link.setAttribute('imagesizes', sizes)
  else link.removeAttribute('imagesizes')
  return link
}

/**
 * LCP hero — viewport başına ayrı preload (mobil cihaz desktop asset indirmez).
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

    if (mobile) {
      upsertPreload(
        PRELOAD_MOBILE_ID,
        mobile,
        '(max-width: 640px)',
        bundle?.mobileImageSrcSet,
        bundle?.mobileImageSrcSet ? bundle.imageSizes : undefined,
      )
    }
    if (desktop) {
      upsertPreload(
        PRELOAD_DESKTOP_ID,
        desktop,
        '(min-width: 641px)',
        bundle?.desktopImageSrcSet,
        bundle?.desktopImageSrcSet ? bundle.imageSizes : undefined,
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
  ])
}
