import type { HomePageContent } from '@/types/homePageContent'
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

type Props = { content: HomePageContent }

export function HomePageView({ content }: Props) {
  return (
    <>
      <HomeHero hero={content.hero} />
      <HomeIntro intro={content.intro} />
      <HomeServices services={content.services} />
      <HomeSolutionsPreview />
      <HomeFeaturedProducts />
      <HomeBrands brands={content.brands} />
      <HomeWhy why={content.why} />
      <HomeProcess process={content.process} />
      <HomeLatestBlog />
      <HomeCta cta={content.cta} />
    </>
  )
}
