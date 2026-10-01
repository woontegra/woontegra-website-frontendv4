import { useEffect, useLayoutEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageBlocksRenderer, prefetchHeroBlockRenderer } from '@/builder/render/PageBlocksRenderer'
import type { BuilderBlock, HeroBlock } from '@/builder/types'
import { renderIfText, shouldShowField } from '@/builder/render/renderRules'
import { JsonLd } from '@/components/seo/JsonLd'
import { HomePageHeroSkeleton } from '@/components/public/home/HomePageHeroSkeleton'
import { HomePageView } from '@/components/public/home/HomePageView'
import { HomeSoftwarePicker } from '@/components/public/home/HomeSoftwarePicker'
import { useLcpImagePreload } from '@/hooks/useLcpImagePreload'
import { usePageMeta } from '@/hooks/usePageMeta'
import { extractHomeHeroShell, homePlanSeo, resolveHomeRenderPlan } from '@/lib/homePageAdapter'
import { mergePageSeo, webSiteSchema } from '@/lib/siteSeo'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { pageContentService } from '@/services/pageContentService'
import { HOME_PAGE_KEY } from '@/types/homePageContent'
import { releasePrerenderHold } from '@/lib/prerenderHold'

function isHomeHeroBlock(block: BuilderBlock): boolean {
  if (block.type === 'hero') return true
  if (block.type !== 'legacy-section') return false
  const settings = (block as { settings?: { sectionKey?: string } }).settings
  return settings?.sectionKey === 'home.hero'
}

function heroBlockHasPageTitle(block: BuilderBlock): boolean {
  if (block.type === 'legacy-section') return isHomeHeroBlock(block)
  if (block.type !== 'hero') return false
  const hero = block as HeroBlock
  const slides = hero.settings?.slides ?? []
  const enabled = slides.filter((slide) => slide.enabled !== false)
  const candidates = enabled.length > 0 ? enabled : slides
  return candidates.some((slide) => {
    const title = renderIfText(slide.title) ?? renderIfText(hero.title)
    const showTitle = slide.visibility?.showTitle ?? hero.visibility?.showTitle
    return shouldShowField(showTitle, title)
  }) || shouldShowField(hero.visibility?.showTitle, renderIfText(hero.title))
}

function HomeBuilderBody({ blocks }: { blocks: BuilderBlock[] }) {
  const sorted = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder)
  const heroIndex = sorted.findIndex(isHomeHeroBlock)
  if (heroIndex < 0) {
    return (
      <div className="bg-white">
        <HomeSoftwarePicker followsPageTitle={false} />
        <PageBlocksRenderer blocks={sorted} mode="public" />
      </div>
    )
  }

  const throughHero = sorted.slice(0, heroIndex + 1)
  const afterHero = sorted.slice(heroIndex + 1)
  const followsPageTitle = throughHero.some(heroBlockHasPageTitle)
  return (
    <div className="bg-white">
      <PageBlocksRenderer blocks={throughHero} mode="public" deferBelowFold={false} />
      <HomeSoftwarePicker followsPageTitle={followsPageTitle} />
      {afterHero.length > 0 ? <PageBlocksRenderer blocks={afterHero} mode="public" /> : null}
    </div>
  )
}

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
    () => (!isPending ? resolveHomeRenderPlan(raw ?? null) : null),
    [raw, isPending],
  )
  const heroShell = useMemo(() => (plan ? extractHomeHeroShell(plan) : null), [plan])

  useLcpImagePreload(heroShell?.preload)

  useLayoutEffect(() => {
    if (plan !== null || !isPending) releasePrerenderHold()
  }, [plan, isPending])

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
    <HomePageHeroSkeleton layout="banner" />
  ) : plan?.mode === 'builder' ? (
    <HomeBuilderBody blocks={plan.blocks} />
  ) : plan ? (
    <div className="bg-white">
      <HomePageView content={plan.content} />
    </div>
  ) : (
    // Avoid blank white <main> if CMS is empty/error — keep site surface visible
    <div className="min-h-[520px] bg-white" aria-hidden />
  )

  return (
    <>
      <JsonLd id="website" data={websiteSchema} />
      {pageBody}
    </>
  )
}
