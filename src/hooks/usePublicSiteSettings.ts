import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { DEFAULT_NAVBAR_LOGO_WIDTH } from '@/lib/logoSize'
import {
  buildPublicLogoUrl,
  isUsablePublicLogoUrl,
  mergePublicLogoFields,
  readPublicBootState,
} from '@/lib/publicBootState'
import { siteSettingsService } from '@/services/siteSettingsService'
import { resolveMediaUrl } from '@/media/resolveMediaUrl'

export type PublicSiteSettings = {
  siteName: string
  contactEmail: string
  contactPhone: string
  contactAddress: string
  logo: string
  logoUpdatedAt: string
  favicon: string
  navbarLogoWidth: number
}

export const DEFAULT_PUBLIC_SITE_SETTINGS: PublicSiteSettings = {
  siteName: 'Woontegra',
  contactEmail: 'info@woontegra.com',
  contactPhone: '',
  contactAddress: '',
  logo: '',
  logoUpdatedAt: '',
  favicon: '/favicon.svg',
  navbarLogoWidth: DEFAULT_NAVBAR_LOGO_WIDTH,
}

function settingsFromPublicBoot(): PublicSiteSettings {
  const boot = readPublicBootState()
  if (!boot?.logo) {
    return { ...DEFAULT_PUBLIC_SITE_SETTINGS, logo: '' }
  }
  return {
    ...DEFAULT_PUBLIC_SITE_SETTINGS,
    siteName: boot.siteName || DEFAULT_PUBLIC_SITE_SETTINGS.siteName,
    logo: boot.logo,
    logoUpdatedAt: boot.logoUpdatedAt,
    navbarLogoWidth: boot.navbarLogoWidth,
  }
}

export const PUBLIC_SITE_SETTINGS_QUERY_KEY = ['public', 'siteSettings'] as const

export function usePublicSiteSettings() {
  const seeded = settingsFromPublicBoot()
  return useQuery({
    queryKey: PUBLIC_SITE_SETTINGS_QUERY_KEY,
    queryFn: () => siteSettingsService.getPublic(),
    ...publicQueryOptions,
    initialData: seeded.logo ? seeded : undefined,
    initialDataUpdatedAt: seeded.logo ? 0 : undefined,
    placeholderData: (prev) => prev ?? (seeded.logo ? seeded : { ...DEFAULT_PUBLIC_SITE_SETTINGS, logo: '' }),
    refetchOnMount: 'always',
  })
}

export function siteLogoUrl(settings?: { logo?: string; logoUpdatedAt?: string }): string {
  const raw = settings?.logo?.trim() || ''
  if (!isUsablePublicLogoUrl(raw)) return ''
  const resolved = resolveMediaUrl(raw)
  if (!resolved || !isUsablePublicLogoUrl(resolved)) return ''
  return buildPublicLogoUrl(resolved, settings?.logoUpdatedAt)
}

/** İlk React frame: query cache boş olsa bile prerender boot URL'sini kullan. */
export function firstPaintLogoUrl(settings?: { logo?: string; logoUpdatedAt?: string }): string {
  const merged = mergePublicLogoFields(settings, readPublicBootState())
  return siteLogoUrl(merged)
}

export function SiteFaviconEffect() {
  const { data } = usePublicSiteSettings()
  useEffect(() => {
    const resolved = resolveMediaUrl(data?.favicon || DEFAULT_PUBLIC_SITE_SETTINGS.favicon)
    if (!resolved) return
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = resolved
  }, [data?.favicon])
  return null
}
