import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageBlocksRenderer } from '@/builder/render/PageBlocksRenderer'
import { JsonLd } from '@/components/seo/JsonLd'
import { HomePageView } from '@/components/public/home/HomePageView'
import { usePageMeta } from '@/hooks/usePageMeta'
import { homePlanSeo, resolveHomeRenderPlan } from '@/lib/homePageAdapter'
import { mergePageSeo, webSiteSchema } from '@/lib/siteSeo'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { pageContentService } from '@/services/pageContentService'
import { HOME_PAGE_KEY } from '@/types/homePageContent'

export function HomePage() {
  const { data: raw } = useQuery({
    queryKey: ['page-content', HOME_PAGE_KEY, 'raw'],
    queryFn: () => pageContentService.getRawByKey(HOME_PAGE_KEY),
    ...publicQueryOptions,
  })

  const plan = useMemo(() => resolveHomeRenderPlan(raw ?? null), [raw])
  const seo = homePlanSeo(plan)
  const meta = mergePageSeo('/', seo)
  const websiteSchema = useMemo(() => webSiteSchema(), [])

  usePageMeta({
    title: meta.title,
    description: meta.description,
    canonicalPath: '/',
  })

  const pageBody =
    plan.mode === 'builder' ? (
      <div className="bg-white">
        <PageBlocksRenderer blocks={plan.blocks} mode="public" />
      </div>
    ) : (
      <div className="bg-white">
        <HomePageView content={plan.content} />
      </div>
    )

  return (
    <>
      <JsonLd id="website" data={websiteSchema} />
      {pageBody}
    </>
  )
}
