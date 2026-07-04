import { useMemo } from 'react'
import { Outlet } from 'react-router-dom'
import { JsonLd } from '@/components/seo/JsonLd'
import { organizationSchema } from '@/lib/siteSeo'
import { useQuery } from '@tanstack/react-query'
import { PublicHeader } from '@/components/public/PublicHeader'
import { PublicFooter } from '@/components/public/PublicFooter'
import { CampaignAnnouncementBar } from '@/components/public/CampaignAnnouncementBar'
import { CookieConsentBanner } from '@/components/cookie/CookieConsentBanner'
import { SiteFaviconEffect } from '@/hooks/usePublicSiteSettings'
import { TrackingScripts } from '@/integrations/TrackingScripts'
import { campaignsService } from '@/services/campaignsService'

export function SiteLayout() {
  const orgSchema = useMemo(() => organizationSchema(), [])
  const campaignsQuery = useQuery({
    queryKey: ['campaigns', 'public'],
    queryFn: () => campaignsService.getPublic(),
    staleTime: 60_000,
  })

  const announcement = campaignsQuery.data?.announcement ?? null

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <JsonLd id="organization" data={orgSchema} />
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
