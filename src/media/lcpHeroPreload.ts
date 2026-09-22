export type LcpImagePreloadLink = {
  href: string
  media: string
  type?: string | null
  imageSrcSet?: string | null
  imageSizes?: string | null
}

export type HomeLcpUrls = {
  mobile: string
  desktop: string
}

export {
  LCP_PRELOAD_DESKTOP_MEDIA,
  LCP_PRELOAD_MOBILE_MEDIA,
  LCP_PRELOAD_SIZES,
  LCP_PRELOAD_TARGET_WIDTHS,
  buildHomeLcpPreloadLinks,
  buildLcpImagePreloadLink,
  collectDocumentImagePreloads,
  extractHomeLcp,
  firstEnabledHeroSlide,
  hasMatchingImagePreload,
  serializeLcpPreloadLink,
} from './lcpHeroPreload.mjs'
