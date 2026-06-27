import { adminApi, publicApi } from '@/api/client'
import type { PublicSiteSettings } from '@/hooks/usePublicSiteSettings'
import { DEFAULT_PUBLIC_SITE_SETTINGS } from '@/hooks/usePublicSiteSettings'
import { clampNavbarLogoWidth } from '@/lib/logoSize'
import { unwrapApiData } from '@/types/api'
import {
  normalizeAdminSiteSettings,
  type AdminSiteSettings,
  type SiteSettingsPatch,
} from '@/types/siteSettings'

function normalizePublicSiteSettings(raw: unknown): PublicSiteSettings {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const str = (key: keyof PublicSiteSettings, fallback: string) => {
    const v = o[key]
    if (v == null || v === '') return fallback
    return String(v)
  }
  const logoWidthRaw =
    o.navbarLogoWidth ?? o.logoWidth ?? o.logoSize ?? o.headerLogoWidth ?? o.siteLogoWidth
  return {
    siteName: str('siteName', DEFAULT_PUBLIC_SITE_SETTINGS.siteName),
    contactEmail: str('contactEmail', DEFAULT_PUBLIC_SITE_SETTINGS.contactEmail),
    contactPhone: str('contactPhone', DEFAULT_PUBLIC_SITE_SETTINGS.contactPhone),
    contactAddress: str('contactAddress', DEFAULT_PUBLIC_SITE_SETTINGS.contactAddress),
    logo: str('logo', DEFAULT_PUBLIC_SITE_SETTINGS.logo),
    logoUpdatedAt: str('logoUpdatedAt', DEFAULT_PUBLIC_SITE_SETTINGS.logoUpdatedAt),
    favicon: str('favicon', DEFAULT_PUBLIC_SITE_SETTINGS.favicon),
    navbarLogoWidth: clampNavbarLogoWidth(
      logoWidthRaw,
      DEFAULT_PUBLIC_SITE_SETTINGS.navbarLogoWidth,
    ),
  }
}

function unwrapSettingsPayload(raw: unknown, label: string): unknown {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    return unwrapApiData(raw, label)
  }
  return raw
}

export const siteSettingsService = {
  async getPublic(): Promise<PublicSiteSettings> {
    const res = await publicApi.get('/settings')
    return normalizePublicSiteSettings(unwrapSettingsPayload(res.data, 'settings.public'))
  },

  async getAdmin(): Promise<AdminSiteSettings> {
    const res = await adminApi.get<unknown>('/settings/admin')
    return normalizeAdminSiteSettings(unwrapSettingsPayload(res.data, 'settings.admin'))
  },

  async update(patch: SiteSettingsPatch): Promise<AdminSiteSettings> {
    const res = await adminApi.patch<unknown>('/settings', patch)
    return normalizeAdminSiteSettings(unwrapSettingsPayload(res.data, 'settings.update'))
  },
}
