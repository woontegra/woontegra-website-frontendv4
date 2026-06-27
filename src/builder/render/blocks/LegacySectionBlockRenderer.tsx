import type { BlockRendererProps } from '@/builder/registry/renderRegistry'
import type { LegacySectionBlock } from '@/builder/types/legacySection'
import { PublicLegacySectionRenderer } from '@/builder/parity/PublicLegacySectionRenderer'
import { HomeHero } from '@/components/public/home/HomeHero'
import { HomeIntro } from '@/components/public/home/HomeIntro'
import { HomeServices } from '@/components/public/home/HomeServices'
import { HomeBrands } from '@/components/public/home/HomeBrands'
import { HomeWhy } from '@/components/public/home/HomeWhy'
import { HomeProcess } from '@/components/public/home/HomeProcess'
import { HomeSolutionsPreview } from '@/components/public/home/HomeSolutionsPreview'
import { HomeFeaturedProducts } from '@/components/public/home/HomeFeaturedProducts'
import { HomeLatestBlog } from '@/components/public/home/HomeLatestBlog'
import { HomeCta } from '@/components/public/home/HomeCta'
import type { HomePageContent } from '@/types/homePageContent'

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
      return <HomeServices services={payload as HomePageContent['services']} />
    case 'home.solutions-preview':
      return <HomeSolutionsPreview />
    case 'home.featured-products':
      return <HomeFeaturedProducts />
    case 'home.brands':
      return <HomeBrands brands={payload as HomePageContent['brands']} />
    case 'home.why':
      return <HomeWhy why={payload as HomePageContent['why']} />
    case 'home.process':
      return <HomeProcess process={payload as HomePageContent['process']} />
    case 'home.latest-blog':
      return <HomeLatestBlog />
    case 'home.cta':
      return <HomeCta cta={payload as HomePageContent['cta']} />
    default:
      return <PublicLegacySectionRenderer sectionKey={sectionKey} payload={payload} />
  }
}
