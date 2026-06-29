import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageBlocksRenderer } from '@/builder/render/PageBlocksRenderer'
import { HomePageHeroSkeleton } from '@/components/public/home/HomePageHeroSkeleton'
import { HomePageView } from '@/components/public/home/HomePageView'
import { usePageMeta } from '@/hooks/usePageMeta'
import { usePreloadedImage } from '@/hooks/usePreloadedImage'
import { usePublicSiteSettings } from '@/hooks/usePublicSiteSettings'
import {
  extractHomeHeroShell,
  homePlanSeo,
  resolveHomeRenderPlan,
} from '@/lib/homePageAdapter'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { pageContentService } from '@/services/pageContentService'
import { HOME_PAGE_KEY } from '@/types/homePageContent'

export function HomePage() {
  const { data: settings } = usePublicSiteSettings()
  const { data: raw, isPending } = useQuery({
    queryKey: ['page-content', HOME_PAGE_KEY, 'raw'],
    queryFn: () => pageContentService.getRawByKey(HOME_PAGE_KEY),
    ...publicQueryOptions,
  })

  const plan = useMemo(
    () => (isPending ? null : resolveHomeRenderPlan(raw ?? null)),
    [isPending, raw],
  )

  const heroShell = useMemo(() => (plan ? extractHomeHeroShell(plan) : null), [plan])
  const { ready: heroImageReady } = usePreloadedImage(heroShell?.imageUrl)

  const seo = plan ? homePlanSeo(plan) : {}

  usePageMeta({
    title: seo.title || (settings?.siteName ? `${settings.siteName} | Dijital Çözümler` : undefined),
    description: seo.description || 'Woontegra — dijital çözümler, yazılım ve teknoloji hizmetleri.',
  })

  const waitingForContent = isPending || !plan
  const waitingForHeroImage = Boolean(heroShell?.imageUrl) && !heroImageReady

  if (waitingForContent || waitingForHeroImage) {
    return (
      <HomePageHeroSkeleton
        layout={heroShell?.layout ?? 'split'}
        minHeight={heroShell?.minHeight ?? '520px'}
      />
    )
  }

  if (plan.mode === 'builder') {
    return (
      <div className="bg-white">
        <PageBlocksRenderer blocks={plan.blocks} mode="public" />
      </div>
    )
  }

  return (
    <div className="bg-white">
      <HomePageView content={plan.content} />
    </div>
  )
}
