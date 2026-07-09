import { Suspense, lazy, type ReactNode } from 'react'
import type { HomePageContent } from '@/types/homePageContent'
import { HomeHero } from '@/components/public/home/HomeHero'
import { HomeIntro } from '@/components/public/home/HomeIntro'

const HomeServices = lazy(() =>
  import('@/components/public/home/HomeServices').then((m) => ({ default: m.HomeServices })),
)
const HomeBrands = lazy(() =>
  import('@/components/public/home/HomeBrands').then((m) => ({ default: m.HomeBrands })),
)
const HomeWhy = lazy(() => import('@/components/public/home/HomeWhy').then((m) => ({ default: m.HomeWhy })))
const HomeProcess = lazy(() =>
  import('@/components/public/home/HomeProcess').then((m) => ({ default: m.HomeProcess })),
)
const HomeSolutionsPreview = lazy(() =>
  import('@/components/public/home/HomeSolutionsPreview').then((m) => ({ default: m.HomeSolutionsPreview })),
)
const HomeFeaturedProducts = lazy(() =>
  import('@/components/public/home/HomeFeaturedProducts').then((m) => ({ default: m.HomeFeaturedProducts })),
)
const HomeLatestBlog = lazy(() =>
  import('@/components/public/home/HomeLatestBlog').then((m) => ({ default: m.HomeLatestBlog })),
)
const HomeCta = lazy(() => import('@/components/public/home/HomeCta').then((m) => ({ default: m.HomeCta })))

function BelowFoldSection({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="min-h-[120px] w-full" aria-hidden />}>{children}</Suspense>
}

type Props = { content: HomePageContent }

export function HomePageView({ content }: Props) {
  return (
    <>
      <HomeHero hero={content.hero} />
      <HomeIntro intro={content.intro} />
      <BelowFoldSection>
        <HomeServices services={content.services} />
      </BelowFoldSection>
      <BelowFoldSection>
        <HomeSolutionsPreview />
      </BelowFoldSection>
      <BelowFoldSection>
        <HomeFeaturedProducts />
      </BelowFoldSection>
      <BelowFoldSection>
        <HomeBrands brands={content.brands} />
      </BelowFoldSection>
      <BelowFoldSection>
        <HomeWhy why={content.why} />
      </BelowFoldSection>
      <BelowFoldSection>
        <HomeProcess process={content.process} />
      </BelowFoldSection>
      <BelowFoldSection>
        <HomeLatestBlog />
      </BelowFoldSection>
      <BelowFoldSection>
        <HomeCta cta={content.cta} />
      </BelowFoldSection>
    </>
  )
}
