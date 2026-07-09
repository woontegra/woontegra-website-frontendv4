import { Suspense, lazy, type ReactNode } from 'react'
import type { BlockRendererProps } from '@/builder/registry/renderRegistry'
import type { LegacySectionBlock } from '@/builder/types/legacySection'
import { PublicLegacySectionRenderer } from '@/builder/parity/PublicLegacySectionRenderer'
import { HomeHero } from '@/components/public/home/HomeHero'
import { HomeIntro } from '@/components/public/home/HomeIntro'
import type { HomePageContent } from '@/types/homePageContent'

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

export function LegacySectionBlockRenderer({ block }: BlockRendererProps) {
  if (block.type !== 'legacy-section') return null
  const legacy = block as LegacySectionBlock
  const { sectionKey, payload } = legacy.settings

  switch (sectionKey) {
    case 'home.hero':
      return <HomeHero hero={payload as HomePageContent['hero']} />
    case 'home.intro':
      return <HomeIntro intro={payload as HomePageContent['intro']} />
    case 'home.services':
      return (
        <BelowFoldSection>
          <HomeServices services={payload as HomePageContent['services']} />
        </BelowFoldSection>
      )
    case 'home.solutions-preview':
      return (
        <BelowFoldSection>
          <HomeSolutionsPreview />
        </BelowFoldSection>
      )
    case 'home.featured-products':
      return (
        <BelowFoldSection>
          <HomeFeaturedProducts />
        </BelowFoldSection>
      )
    case 'home.brands':
      return (
        <BelowFoldSection>
          <HomeBrands brands={payload as HomePageContent['brands']} />
        </BelowFoldSection>
      )
    case 'home.why':
      return (
        <BelowFoldSection>
          <HomeWhy why={payload as HomePageContent['why']} />
        </BelowFoldSection>
      )
    case 'home.process':
      return (
        <BelowFoldSection>
          <HomeProcess process={payload as HomePageContent['process']} />
        </BelowFoldSection>
      )
    case 'home.latest-blog':
      return (
        <BelowFoldSection>
          <HomeLatestBlog />
        </BelowFoldSection>
      )
    case 'home.cta':
      return (
        <BelowFoldSection>
          <HomeCta cta={payload as HomePageContent['cta']} />
        </BelowFoldSection>
      )
    default:
      return <PublicLegacySectionRenderer sectionKey={sectionKey} payload={payload} />
  }
}
