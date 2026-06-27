import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { DEFAULT_NAVBAR_LOGO_WIDTH } from '@/lib/logoSize'
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
  logo: '/logo.png',
  logoUpdatedAt: '',
  favicon: '/favicon.svg',
  navbarLogoWidth: DEFAULT_NAVBAR_LOGO_WIDTH,
}

export function usePublicSiteSettings() {
  return useQuery({
    queryKey: ['public', 'siteSettings'],
    queryFn: () => siteSettingsService.getPublic(),
    ...publicQueryOptions,
    placeholderData: (prev) => prev ?? DEFAULT_PUBLIC_SITE_SETTINGS,
  })
}

export function siteLogoUrl(settings?: { logo?: string; logoUpdatedAt?: string }): string {
  const raw = settings?.logo?.trim() || DEFAULT_PUBLIC_SITE_SETTINGS.logo
  const url = resolveMediaUrl(raw)
  if (!settings?.logoUpdatedAt?.trim()) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${encodeURIComponent(settings.logoUpdatedAt.trim())}`
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
