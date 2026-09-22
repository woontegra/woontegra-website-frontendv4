export type PublicLogoBootState = {
  siteName: string
  logo: string
  logoUpdatedAt: string
  navbarLogoWidth: number
}

export {
  BOOT_LOGO_HEIGHT,
  BOOT_LOGO_WIDTH_DEFAULT,
  BOOT_LOGO_WIDTH_MAX,
  BOOT_LOGO_WIDTH_MIN,
  PUBLIC_BOOT_GLOBAL_KEY,
  buildPublicLogoUrl,
  clampBootLogoWidth,
  extractPublicLogoBoot,
  isUsablePublicLogoUrl,
  mergePublicLogoFields,
  readPublicBootState,
  serializePublicBootScript,
} from './publicBootState.mjs'

declare global {
  interface Window {
    __WOONTEGRA_PUBLIC_BOOTSTRAP__?: PublicLogoBootState
  }
}
