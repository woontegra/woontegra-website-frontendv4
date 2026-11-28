import { useQuery } from '@tanstack/react-query'
import { Boxes, LayoutDashboard, Workflow } from 'lucide-react'
import { PublicBuilderBlocksPage } from '@/components/public/PublicBuilderBlocksPage'
import { PageHero } from '@/components/public/PageHero'
import { SolutionCard } from '@/components/public/SolutionCard'
import { SiteCtaSection } from '@/components/public/SiteCtaSection'
import { usePublicPageBlocks } from '@/hooks/usePublicPageBlocks'
import { usePageMeta } from '@/hooks/usePageMeta'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { resolveIcon } from '@/lib/iconRegistry'
import { pageContentService } from '@/services/pageContentService'
import {
  defaultSolutionBenefitCardsBundle,
  defaultSolutionCardsBundle,
  getActiveSolutionBenefitCards,
  getActiveSolutionCards,
  mergeSolutionBenefitCards,
  mergeSolutionCards,
  SOLUTION_BENEFIT_CARDS_KEY,
  SOLUTION_CARDS_KEY,
} from '@/data/solutionCardsContent'
import { defaultSolutionsPageContent, MARKETING_PAGE_KEYS } from '@/types/marketingPageContent'

export function SolutionsPage() {
  const { blocks } = usePublicPageBlocks(MARKETING_PAGE_KEYS.solutions)
  const pageQuery = useQuery({
    queryKey: ['page-content', MARKETING_PAGE_KEYS.solutions],
    queryFn: () => pageContentService.getMarketingPage(MARKETING_PAGE_KEYS.solutions, defaultSolutionsPageContent),
    placeholderData: defaultSolutionsPageContent,
    ...publicQueryOptions,
  })
  const cardsQuery = useQuery({
    queryKey: ['page-content', SOLUTION_CARDS_KEY],
    queryFn: async () => {
      const raw = await pageContentService.getRawByKey(SOLUTION_CARDS_KEY)
      return mergeSolutionCards(defaultSolutionCardsBundle, raw as Partial<typeof defaultSolutionCardsBundle>)
    },
    placeholderData: defaultSolutionCardsBundle,
    ...publicQueryOptions,
  })
  const benefitsQuery = useQuery({
    queryKey: ['page-content', SOLUTION_BENEFIT_CARDS_KEY],
    queryFn: async () => {
      const raw = await pageContentService.getRawByKey(SOLUTION_BENEFIT_CARDS_KEY)
      return mergeSolutionBenefitCards(
        defaultSolutionBenefitCardsBundle,
        raw as Partial<typeof defaultSolutionBenefitCardsBundle>,
      )
    },
    placeholderData: defaultSolutionBenefitCardsBundle,
    ...publicQueryOptions,
  })

  const page = pageQuery.data ?? defaultSolutionsPageContent
  const solutionCards = getActiveSolutionCards(cardsQuery.data ?? defaultSolutionCardsBundle)
  const benefits = getActiveSolutionBenefitCards(benefitsQuery.data ?? defaultSolutionBenefitCardsBundle)

  usePageMeta({
    title: page.seoTitle,
    description: page.seoDescription,
    canonicalPath: '/cozumler',
  })

  if (!page.enabled) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Sayfa şu an yayında değil</h1>
      </div>
    )
  }

  return (
    <PublicBuilderBlocksPage
      blocks={blocks}
      fallback={
        <div className="bg-white">
          <PageHero
        eyebrow={page.heroEyebrow}
        title={page.heroTitle}
        description={page.heroDescription}
        image={page.heroImage}
        imageAlt="Woontegra dijital çözümler"
        breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Çözümler' }]}
        highlights={[{ title: page.highlight1 }, { title: page.highlight2 }]}
      />

      <section className="bg-gradient-to-b from-slate-50 to-white py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">{page.sectionEyebrow}</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">{page.sectionTitle}</h2>
            <p className="mt-4 text-base text-slate-600">{page.sectionDescription}</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {solutionCards.map((item) => (
              <SolutionCard key={item.id} card={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Değer</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">İşletmeye Ne Kazandırır?</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {benefits.map((item) => {
              const Icon = resolveIcon(item.icon)
              return (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <Icon className="mb-4 h-8 w-8 text-emerald-600" aria-hidden />
                  <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">Merkezi Yönetim</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">Tek Merkezden Yönetim</h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                Entegre e-ticaret, pazaryeri ve operasyon katmanlarını birbirine bağlı, yönetilebilir bir dijital sistem olarak kuruyoruz.
              </p>
            </div>
            <div className="grid gap-4">
              {[
                { icon: LayoutDashboard, title: 'Tek panel mantığı', desc: 'Farklı kanallar ve süreçler tek bakışta izlenebilir.' },
                { icon: Workflow, title: 'Entegre iş akışı', desc: 'Satış, operasyon ve raporlama birbirini besler.' },
                { icon: Boxes, title: 'Modüler büyüme', desc: 'İhtiyaç arttıkça sisteme yeni modüller eklenir.' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-6">
                  <item.icon className="h-6 w-6 shrink-0 text-emerald-600" aria-hidden />
                  <span className="flex flex-col gap-1">
                  <h3 className="text-[17px] font-extrabold text-slate-950">{item.title}</h3>
                  <p className="text-[15px] leading-relaxed text-slate-600">{item.desc}</p>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteCtaSection
        title={page.ctaTitle}
        description={page.ctaDescription}
        buttonText={page.ctaButtonText}
        buttonLink={page.ctaButtonLink}
        secondaryButtonText={page.ctaSecondaryButtonText}
        secondaryButtonLink={page.ctaSecondaryButtonLink}
      />
        </div>
      }
    />
  )
}
