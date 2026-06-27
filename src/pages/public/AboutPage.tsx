import { useQuery } from '@tanstack/react-query'
import { PublicBuilderBlocksPage } from '@/components/public/PublicBuilderBlocksPage'
import { PageHero } from '@/components/public/PageHero'
import {
  AboutBrands,
  AboutCta,
  AboutDifferentiators,
  AboutHeroSection,
  AboutStructure,
  AboutTimeline,
  AboutVision,
  AboutWhatIs,
  AboutWorkApproach,
} from '@/components/public/about/AboutSections'
import { usePublicPageBlocks } from '@/hooks/usePublicPageBlocks'
import { usePageMeta } from '@/hooks/usePageMeta'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { pageContentService } from '@/services/pageContentService'
import { defaultAboutPageContent } from '@/types/aboutPageContent'
import { PAGE_CONTENT_KEYS } from '@/types/pageContent'

export function AboutPage() {
  const { blocks } = usePublicPageBlocks(PAGE_CONTENT_KEYS.about)
  const { data: content = defaultAboutPageContent } = useQuery({
    queryKey: ['page-content', 'about'],
    queryFn: () => pageContentService.getAbout(),
    placeholderData: defaultAboutPageContent,
    ...publicQueryOptions,
  })

  usePageMeta({
    title: content.hero.title || 'Hakkımızda',
    description: content.metaDescription || content.hero.subtitle,
  })

  return (
    <PublicBuilderBlocksPage
      blocks={blocks}
      fallback={
        <div className="bg-white">
          <PageHero
            eyebrow={content.hero.eyebrow}
            title={content.hero.title}
            description={content.hero.subtitle}
            image={content.hero.image}
            breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Hakkımızda' }]}
          >
            <AboutHeroSection hero={content.hero} />
          </PageHero>
          <AboutWhatIs whatIs={content.whatIs} />
          <AboutStructure section={content.structure} />
          <AboutTimeline timeline={content.timeline} />
          <AboutDifferentiators section={content.differentiators} />
          <AboutBrands brands={content.brands} />
          <AboutWorkApproach section={content.workApproach} />
          <AboutVision vision={content.vision} />
          <AboutCta cta={content.cta} />
        </div>
      }
    />
  )
}
