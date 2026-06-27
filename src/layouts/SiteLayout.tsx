import { Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PublicHeader } from '@/components/public/PublicHeader'
import { PublicFooter } from '@/components/public/PublicFooter'
import { CampaignAnnouncementBar } from '@/components/public/CampaignAnnouncementBar'
import { CookieConsentBanner } from '@/components/cookie/CookieConsentBanner'
import { SiteFaviconEffect } from '@/hooks/usePublicSiteSettings'
import { TrackingScripts } from '@/integrations/TrackingScripts'
import { campaignsService } from '@/services/campaignsService'

export function SiteLayout() {
  const campaignsQuery = useQuery({
    queryKey: ['campaigns', 'public'],
    queryFn: () => campaignsService.getPublic(),
    staleTime: 60_000,
  })

  const announcement = campaignsQuery.data?.announcement ?? null

  return (
    <div className="flex min-h-screen flex-col bg-white">
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
