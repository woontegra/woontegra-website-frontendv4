import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageBlocksRenderer } from '@/builder/render/PageBlocksRenderer'
import { HomePageView } from '@/components/public/home/HomePageView'
import { usePageMeta } from '@/hooks/usePageMeta'
import { usePublicSiteSettings } from '@/hooks/usePublicSiteSettings'
import { homePlanSeo, resolveHomeRenderPlan } from '@/lib/homePageAdapter'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { pageContentService } from '@/services/pageContentService'
import { HOME_PAGE_KEY } from '@/types/homePageContent'

export function HomePage() {
  const { data: settings } = usePublicSiteSettings()
  const { data: raw } = useQuery({
    queryKey: ['page-content', HOME_PAGE_KEY, 'raw'],
    queryFn: () => pageContentService.getRawByKey(HOME_PAGE_KEY),
    ...publicQueryOptions,
  })

  const plan = useMemo(() => resolveHomeRenderPlan(raw ?? null), [raw])
  const seo = homePlanSeo(plan)

  usePageMeta({
    title: seo.title || (settings?.siteName ? `${settings.siteName} | Dijital Çözümler` : undefined),
    description: seo.description || 'Woontegra — dijital çözümler, yazılım ve teknoloji hizmetleri.',
  })

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
