import { useLayoutEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { releasePrerenderHold } from '@/lib/prerenderHold'
import { OrganizationJsonLd } from '@/components/seo/OrganizationJsonLd'
import { useQuery } from '@tanstack/react-query'
import { PublicHeader } from '@/components/public/PublicHeader'
import { PublicFooter } from '@/components/public/PublicFooter'
import { CampaignAnnouncementBar } from '@/components/public/CampaignAnnouncementBar'
import { CookieConsentBanner } from '@/components/cookie/CookieConsentBanner'
import { SiteFaviconEffect } from '@/hooks/usePublicSiteSettings'
import { TrackingScripts } from '@/integrations/TrackingScripts'
import { campaignsService } from '@/services/campaignsService'
import { PRERENDER_SHELL_CLASS_INVENTORY } from '@/prerender/shellClassInventory'

/** Keep prerender shell utilities referenced so public CSS retains them. */
const _prerenderShellCssAnchor = PRERENDER_SHELL_CLASS_INVENTORY
void _prerenderShellCssAnchor

export function SiteLayout() {
  const location = useLocation()
  useLayoutEffect(() => {
    if (location.pathname !== '/') releasePrerenderHold()
  }, [location.pathname])

  const campaignsQuery = useQuery({
    queryKey: ['campaigns', 'public'],
    queryFn: () => campaignsService.getPublic(),
    staleTime: 60_000,
  })

  const announcement = campaignsQuery.data?.announcement ?? null

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <OrganizationJsonLd />
      <SiteFaviconEffect />
      <TrackingScripts />
      {announcement ? <CampaignAnnouncementBar campaign={announcement} /> : null}
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
      <CookieConsentBanner />
    </div>
  )
}
