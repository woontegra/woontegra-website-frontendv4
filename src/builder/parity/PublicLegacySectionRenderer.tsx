import { Suspense, lazy } from 'react'
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
import { BarChart3, Boxes, Code2, LayoutDashboard, Target, Workflow, Zap } from 'lucide-react'
import { MarketingFeatureCard } from '@/components/public/MarketingFeatureCard'
import { SiteCtaSection } from '@/components/public/SiteCtaSection'
import { SolutionCard } from '@/components/public/SolutionCard'
import { ServiceDetailLayout } from '@/components/public/services/ServiceDetailLayout'
import { SolutionDetailLayout } from '@/components/public/solutions/SolutionDetailLayout'
import { SoftwareDetailView } from '@/components/public/product/SoftwareDetailView'
import { BlogDetailView } from '@/components/public/blog/BlogDetailView'
import { LegalCookieView } from '@/components/public/legal/LegalCookieView'
import type { AboutPageContent } from '@/types/aboutPageContent'
import type { MarketingPageContent } from '@/types/marketingPageContent'
import type { ServiceCardConfig } from '@/data/serviceCardsContent'
import type { SolutionCardConfig, SolutionBenefitCardConfig } from '@/data/solutionCardsContent'
import type { ServiceDetailContent } from '@/data/serviceDetailContent'
import type { SolutionDetailContent } from '@/data/solutionCatalog'
import type { PublicProductDetail } from '@/types/product'
import type { PublicBlogPost } from '@/types/blog'
import type { LegalPageContent } from '@/data/legalPageDefaults'
import { resolveIcon } from '@/lib/iconRegistry'

const SoftwareListPageLazy = lazy(() =>
  import('@/pages/public/SoftwareListPage').then((m) => ({ default: m.SoftwareListPage })),
)
const BlogListPageLazy = lazy(() =>
  import('@/pages/public/BlogListPage').then((m) => ({ default: m.BlogListPage })),
)
const ContactPageLazy = lazy(() =>
  import('@/pages/public/ContactPage').then((m) => ({ default: m.ContactPage })),
)

function LegacyPageFallback() {
  return <div className="min-h-[240px] w-full" aria-hidden />
}

const SERVICES_PROCESS = [
  { step: '01', title: 'Analiz', desc: 'İhtiyaçları ve hedefleri netleştiririz.', color: 'from-blue-500 to-cyan-500' },
  { step: '02', title: 'Planlama', desc: 'Yol haritası ve sistem mimarisini oluştururuz.', color: 'from-purple-500 to-pink-500' },
  { step: '03', title: 'Geliştirme', desc: 'Modern teknolojilerle üretime geçeriz.', color: 'from-emerald-500 to-teal-500' },
  { step: '04', title: 'Yayın & Destek', desc: 'Canlıya alır ve sürdürülebilir hale getiririz.', color: 'from-orange-500 to-red-500' },
] as const

const SERVICES_WHY = [
  { icon: Target, title: 'Ürün Deneyimi', desc: 'Kendi markalarımızdan gelen gerçek operasyon tecrübesi.' },
  { icon: Workflow, title: 'Tek Yapı', desc: 'Yazılım, satış ve operasyonu entegre yönetiyoruz.' },
  { icon: Zap, title: 'Performans', desc: 'Hızlı, stabil ve büyümeye hazır sistemler kuruyoruz.' },
] as const

type ServicesCardsPayload = {
  page: MarketingPageContent
  serviceCards: ServiceCardConfig[]
}

type SolutionsCardsPayload = {
  page: MarketingPageContent
  solutionCards: SolutionCardConfig[]
  benefits: SolutionBenefitCardConfig[]
}

type Props = {
  sectionKey: string
  payload?: unknown
}

export function PublicLegacySectionRenderer({ sectionKey, payload }: Props) {
  switch (sectionKey) {
    case 'about.hero': {
      const content = payload as AboutPageContent
      return (
        <PageHero
          eyebrow={content.hero.eyebrow}
          title={content.hero.title}
          description={content.hero.subtitle}
          image={content.hero.image}
          breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Hakkımızda' }]}
        >
          <AboutHeroSection hero={content.hero} />
        </PageHero>
      )
    }
    case 'about.what-is':
      return <AboutWhatIs whatIs={(payload as AboutPageContent).whatIs} />
    case 'about.structure':
      return <AboutStructure section={(payload as AboutPageContent).structure} />
    case 'about.timeline':
      return <AboutTimeline timeline={(payload as AboutPageContent).timeline} />
    case 'about.differentiators':
      return <AboutDifferentiators section={(payload as AboutPageContent).differentiators} />
    case 'about.brands':
      return <AboutBrands brands={(payload as AboutPageContent).brands} />
    case 'about.work-approach':
      return <AboutWorkApproach section={(payload as AboutPageContent).workApproach} />
    case 'about.vision':
      return <AboutVision vision={(payload as AboutPageContent).vision} />
    case 'about.cta':
      return <AboutCta cta={(payload as AboutPageContent).cta} />

    case 'services.hero': {
      const page = payload as MarketingPageContent
      return (
        <PageHero
          eyebrow={page.heroEyebrow}
          title={page.heroTitle}
          description={page.heroDescription}
          image={page.heroImage}
          imageAlt="Woontegra dijital hizmetler"
          breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Hizmetler' }]}
          highlights={[
            { icon: Code2, title: page.highlight1 },
            { icon: BarChart3, title: page.highlight2 },
          ]}
        />
      )
    }
    case 'services.cards': {
      const { page, serviceCards } = payload as ServicesCardsPayload
      return (
        <section className="bg-gradient-to-b from-slate-50 to-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">{page.sectionEyebrow}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{page.sectionTitle}</h2>
              <p className="mt-4 text-base text-slate-600">{page.sectionDescription}</p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {serviceCards.map((service) => (
                <MarketingFeatureCard
                  key={service.id}
                  icon={service.icon}
                  title={service.title}
                  description={service.description}
                  href={service.href}
                  gradient={service.gradient}
                  tag={service.tag}
                />
              ))}
            </div>
          </div>
        </section>
      )
    }
    case 'services.process':
      return (
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">Süreç</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">Nasıl Çalışıyoruz?</h2>
              <p className="mt-4 text-base text-slate-400">
                Şeffaf, planlı ve sonuç odaklı bir iş akışı ile projelerinizi hayata geçiriyoruz.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {SERVICES_PROCESS.map((item) => (
                <div key={item.step} className="text-center">
                  <div
                    className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-lg font-bold text-white shadow-lg`}
                  >
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    case 'services.why':
      return (
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Farkımız</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Neden Woontegra?</h2>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {SERVICES_WHY.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-7 transition-all hover:border-emerald-200 hover:shadow-md"
                >
                  <item.icon className="mb-4 h-8 w-8 text-emerald-600" aria-hidden />
                  <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    case 'services.cta': {
      const page = payload as MarketingPageContent
      return (
        <SiteCtaSection
          title={page.ctaTitle}
          description={page.ctaDescription}
          buttonText={page.ctaButtonText}
          buttonLink={page.ctaButtonLink}
          secondaryButtonText={page.ctaSecondaryButtonText}
          secondaryButtonLink={page.ctaSecondaryButtonLink}
        />
      )
    }

    case 'solutions.hero': {
      const page = payload as MarketingPageContent
      return (
        <PageHero
          eyebrow={page.heroEyebrow}
          title={page.heroTitle}
          description={page.heroDescription}
          image={page.heroImage}
          imageAlt="Woontegra dijital çözümler"
          breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Çözümler' }]}
          highlights={[{ title: page.highlight1 }, { title: page.highlight2 }]}
        />
      )
    }
    case 'solutions.cards': {
      const { page, solutionCards } = payload as SolutionsCardsPayload
      return (
        <section className="bg-gradient-to-b from-slate-50 to-white py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">{page.sectionEyebrow}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{page.sectionTitle}</h2>
              <p className="mt-4 text-base text-slate-600">{page.sectionDescription}</p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {solutionCards.map((item) => (
                <SolutionCard key={item.id} card={item} />
              ))}
            </div>
          </div>
        </section>
      )
    }
    case 'solutions.benefits': {
      const { benefits } = payload as SolutionsCardsPayload
      return (
        <section className="py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Değer</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">İşletmeye Ne Kazandırır?</h2>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {benefits.map((item) => {
                const Icon = resolveIcon(item.icon)
                return (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <Icon className="mb-4 h-8 w-8 text-emerald-600" aria-hidden />
                    <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )
    }
    case 'solutions.central':
      return (
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">Merkezi Yönetim</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">Tek Merkezden Yönetim</h2>
                <p className="mt-4 text-base leading-relaxed text-slate-400">
                  Kendi markalarımızda kullandığımız operasyon deneyimini müşteri projelerine aktararak; e-ticaret,
                  entegrasyon ve özel yazılım katmanlarını birbirine bağlı bir sistem olarak kuruyoruz.
                </p>
              </div>
              <div className="grid gap-4">
                {[
                  { icon: LayoutDashboard, title: 'Tek panel mantığı', desc: 'Farklı kanallar ve süreçler tek bakışta izlenebilir.' },
                  { icon: Workflow, title: 'Entegre iş akışı', desc: 'Satış, operasyon ve raporlama birbirini besler.' },
                  { icon: Boxes, title: 'Modüler büyüme', desc: 'İhtiyaç arttıkça sisteme yeni modüller eklenir.' },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-700 bg-slate-800/80 p-5">
                    <item.icon className="mb-3 h-6 w-6 text-emerald-400" aria-hidden />
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )
    case 'solutions.cta': {
      const page = payload as MarketingPageContent
      return (
        <SiteCtaSection
          title={page.ctaTitle}
          description={page.ctaDescription}
          buttonText={page.ctaButtonText}
          buttonLink={page.ctaButtonLink}
          secondaryButtonText={page.ctaSecondaryButtonText}
          secondaryButtonLink={page.ctaSecondaryButtonLink}
        />
      )
    }

    case 'service-detail.page':
      return <ServiceDetailLayout content={payload as ServiceDetailContent} />
    case 'solution-detail.page':
      return <SolutionDetailLayout content={payload as SolutionDetailContent} />
    case 'software-list.page':
      return (
        <Suspense fallback={<LegacyPageFallback />}>
          <SoftwareListPageLazy />
        </Suspense>
      )
    case 'blog-list.page':
      return (
        <Suspense fallback={<LegacyPageFallback />}>
          <BlogListPageLazy />
        </Suspense>
      )
    case 'contact.page':
      return (
        <Suspense fallback={<LegacyPageFallback />}>
          <ContactPageLazy />
        </Suspense>
      )
    case 'product-detail.page':
      return <SoftwareDetailView product={payload as PublicProductDetail} />
    case 'blog-detail.page':
      return <BlogDetailView post={payload as PublicBlogPost} />
    case 'legal.cookie':
      return <LegalCookieView content={payload as LegalPageContent} />

    default:
      return (
        <section className="border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">Tanımsız legacy bölüm</p>
          <p className="mt-1 text-xs text-slate-500">{sectionKey}</p>
        </section>
      )
  }
}
