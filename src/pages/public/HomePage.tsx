import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageBlocksRenderer } from '@/builder/render/PageBlocksRenderer'
import { JsonLd } from '@/components/seo/JsonLd'
import { HomePageHeroSkeleton } from '@/components/public/home/HomePageHeroSkeleton'
import { HomePageView } from '@/components/public/home/HomePageView'
import { usePageMeta } from '@/hooks/usePageMeta'
import { homePlanSeo, resolveHomeRenderPlan } from '@/lib/homePageAdapter'
import { mergePageSeo, webSiteSchema } from '@/lib/siteSeo'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { pageContentService } from '@/services/pageContentService'
import { HOME_PAGE_KEY } from '@/types/homePageContent'

export function HomePage() {
  const { data: raw, isPending } = useQuery({
    queryKey: ['page-content', HOME_PAGE_KEY, 'raw'],
    queryFn: () => pageContentService.getRawByKey(HOME_PAGE_KEY),
    ...publicQueryOptions,
  })

  const plan = useMemo(
    () => (isPending ? null : resolveHomeRenderPlan(raw ?? null)),
    [raw, isPending],
  )
  const seo = plan ? homePlanSeo(plan) : {}
  const meta = mergePageSeo('/', seo)
  const websiteSchema = useMemo(() => webSiteSchema(), [])

  usePageMeta({
    title: meta.title,
    description: meta.description,
    canonicalPath: '/',
  })

  const pageBody = isPending ? (
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
