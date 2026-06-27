import { clampNavbarLogoWidth, DEFAULT_NAVBAR_LOGO_WIDTH } from '@/lib/logoSize'

function str(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback
  return String(value)
}

function bool(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

function keywords(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((k) => String(k)).filter(Boolean)
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown
      if (Array.isArray(parsed)) return parsed.map((k) => String(k)).filter(Boolean)
    } catch {
      return value
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)
    }
  }
  return []
}

export type AdminSiteSettings = {
  siteName: string
  siteDescription: string
  logo: string
  favicon: string
  navbarLogoWidth: number
  contactEmail: string
  contactPhone: string
  contactWhatsApp: string
  contactAddress: string
  googleMapsEmbed: string
  defaultTitle: string
  defaultDescription: string
  defaultKeywords: string[]
  maintenanceMode: boolean
  maintenanceMessage: string
  logoUpdatedAt: string
  faviconUpdatedAt: string
}

export const DEFAULT_ADMIN_SITE_SETTINGS: AdminSiteSettings = {
  siteName: 'Woontegra',
  siteDescription: '',
  logo: '/logo.png',
  favicon: '/favicon.svg',
  navbarLogoWidth: DEFAULT_NAVBAR_LOGO_WIDTH,
  contactEmail: '',
  contactPhone: '',
  contactWhatsApp: '',
  contactAddress: '',
  googleMapsEmbed: '',
  defaultTitle: '',
  defaultDescription: '',
  defaultKeywords: [],
  maintenanceMode: false,
  maintenanceMessage: 'Site bakımda. Kısa süre sonra geri döneceğiz.',
  logoUpdatedAt: '',
  faviconUpdatedAt: '',
}

export function normalizeAdminSiteSettings(raw: unknown): AdminSiteSettings {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    siteName: str(o.siteName, DEFAULT_ADMIN_SITE_SETTINGS.siteName),
    siteDescription: str(o.siteDescription),
    logo: str(o.logo, DEFAULT_ADMIN_SITE_SETTINGS.logo) || DEFAULT_ADMIN_SITE_SETTINGS.logo,
    favicon: str(o.favicon, DEFAULT_ADMIN_SITE_SETTINGS.favicon) || DEFAULT_ADMIN_SITE_SETTINGS.favicon,
    navbarLogoWidth: clampNavbarLogoWidth(o.navbarLogoWidth, DEFAULT_ADMIN_SITE_SETTINGS.navbarLogoWidth),
    contactEmail: str(o.contactEmail),
    contactPhone: str(o.contactPhone),
    contactWhatsApp: str(o.contactWhatsApp),
    contactAddress: str(o.contactAddress),
    googleMapsEmbed: str(o.googleMapsEmbed),
    defaultTitle: str(o.defaultTitle),
    defaultDescription: str(o.defaultDescription),
    defaultKeywords: keywords(o.defaultKeywords),
    maintenanceMode: bool(o.maintenanceMode),
    maintenanceMessage: str(o.maintenanceMessage, DEFAULT_ADMIN_SITE_SETTINGS.maintenanceMessage),
    logoUpdatedAt: str(o.logoUpdatedAt),
    faviconUpdatedAt: str(o.faviconUpdatedAt),
  }
}

export type SiteSettingsPatch = Partial<Omit<AdminSiteSettings, 'logoUpdatedAt'>>
