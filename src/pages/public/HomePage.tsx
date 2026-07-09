import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageBlocksRenderer, prefetchHeroBlockRenderer } from '@/builder/render/PageBlocksRenderer'
import { JsonLd } from '@/components/seo/JsonLd'
import { HomePageHeroSkeleton } from '@/components/public/home/HomePageHeroSkeleton'
import { HomePageView } from '@/components/public/home/HomePageView'
import { useLcpImagePreload } from '@/hooks/useLcpImagePreload'
import { usePageMeta } from '@/hooks/usePageMeta'
import { extractHomeHeroShell, homePlanSeo, resolveHomeRenderPlan } from '@/lib/homePageAdapter'
import { preloadImage } from '@/lib/preloadImage'
import { mergePageSeo, webSiteSchema } from '@/lib/siteSeo'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { pageContentService } from '@/services/pageContentService'
import { HOME_PAGE_KEY } from '@/types/homePageContent'

export function HomePage() {
  useEffect(() => {
    prefetchHeroBlockRenderer()
  }, [])

  const { data: raw, isPending } = useQuery({
    queryKey: ['page-content', HOME_PAGE_KEY, 'raw'],
    queryFn: () => pageContentService.getRawByKey(HOME_PAGE_KEY),
    ...publicQueryOptions,
  })

  const plan = useMemo(
    () => (raw !== undefined ? resolveHomeRenderPlan(raw ?? null) : null),
    [raw],
  )
  const heroShell = useMemo(() => (plan ? extractHomeHeroShell(plan) : null), [plan])

  useLcpImagePreload(heroShell?.preload)

  useEffect(() => {
    const href = heroShell?.preload?.href
    if (!href) return
    void preloadImage(href)
  }, [heroShell?.preload?.href])

  const seo = plan ? homePlanSeo(plan) : {}
  const meta = mergePageSeo('/', seo)
  const websiteSchema = useMemo(() => webSiteSchema(), [])

  usePageMeta({
    title: meta.title,
    description: meta.description,
    canonicalPath: '/',
  })

  const showSkeleton = plan === null && isPending

  const pageBody = showSkeleton ? (
    <HomePageHeroSkeleton layout="split" minHeight="520px" />
  ) : plan?.mode === 'builder' ? (
    <div className="bg-white">
      <PageBlocksRenderer blocks={plan.blocks} mode="public" />
    </div>
  ) : plan ? (
    <div className="bg-white">
      <HomePageView content={plan.content} />
    </div>
  ) : null

  return (
    <>
      <JsonLd id="website" data={websiteSchema} />
      {pageBody}
    </>
  )
}
