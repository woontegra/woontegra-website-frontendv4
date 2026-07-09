import { useEffect } from 'react'

const PRELOAD_LINK_ID = 'lcp-hero-image-preload'

type PreloadBundle = {
  href: string
  imageSrcSet: string
  imageSizes: string
}

/**
 * LCP hero görseli için <link rel="preload" as="image"> enjekte eder.
 */
export function useLcpImagePreload(bundle: PreloadBundle | null | undefined) {
  useEffect(() => {
    const existing = document.getElementById(PRELOAD_LINK_ID)
    if (!bundle?.href) {
      existing?.remove()
      return
    }

    let link = existing as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.id = PRELOAD_LINK_ID
      link.rel = 'preload'
      link.as = 'image'
      document.head.appendChild(link)
    }

    link.href = bundle.href
    link.setAttribute('imagesrcset', bundle.imageSrcSet)
    link.setAttribute('imagesizes', bundle.imageSizes)
    link.setAttribute('fetchpriority', 'high')

    return () => {
      document.getElementById(PRELOAD_LINK_ID)?.remove()
    }
  }, [bundle?.href, bundle?.imageSrcSet, bundle?.imageSizes])
}
