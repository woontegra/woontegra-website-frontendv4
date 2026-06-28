import { lazy, Suspense, type ComponentType, type ReactNode } from 'react'
import { getBuilderPageDefinition, type BuilderPageDefinition } from '@/builder/pages/builderPageRegistry'
import { PreviewSlugProvider } from '@/lib/previewRouteParams'

const LANDING_COMPONENTS: Record<string, ComponentType> = {
  home: lazy(() => import('@/pages/public/HomePage').then((m) => ({ default: m.HomePage }))),
  about: lazy(() => import('@/pages/public/AboutPage').then((m) => ({ default: m.AboutPage }))),
  services: lazy(() => import('@/pages/public/ServicesPage').then((m) => ({ default: m.ServicesPage }))),
  solutions: lazy(() => import('@/pages/public/SolutionsPage').then((m) => ({ default: m.SolutionsPage }))),
  software: lazy(() =>
    import('@/pages/public/SoftwareListPage').then((m) => ({ default: m.SoftwareListPage })),
  ),
  blog: lazy(() => import('@/pages/public/BlogListPage').then((m) => ({ default: m.BlogListPage }))),
  contact: lazy(() => import('@/pages/public/ContactPage').then((m) => ({ default: m.ContactPage }))),
  'legal-cookie': lazy(() =>
    import('@/pages/public/LegalPublicPages').then((m) => ({ default: m.CookiePolicyPage })),
  ),
  'legal-kvkk': lazy(() => import('@/pages/public/LegalPublicPages').then((m) => ({ default: m.KvkkPage }))),
  'legal-privacy': lazy(() => import('@/pages/public/LegalPublicPages').then((m) => ({ default: m.PrivacyPage }))),
  'legal-consent': lazy(() =>
    import('@/pages/public/LegalPublicPages').then((m) => ({ default: m.AcikRizaMetniPage })),
  ),
  'legal-terms': lazy(() =>
    import('@/pages/public/LegalPublicPages').then((m) => ({ default: m.KullanimSartlariPage })),
  ),
}

const ServiceDetailPage = lazy(() =>
  import('@/pages/public/ServiceDetailPage').then((m) => ({ default: m.ServiceDetailPage })),
)
const SolutionDetailPage = lazy(() =>
  import('@/pages/public/SolutionDetailPage').then((m) => ({ default: m.SolutionDetailPage })),
)
const SoftwareDetailPage = lazy(() =>
  import('@/pages/public/SoftwareDetailPage').then((m) => ({ default: m.SoftwareDetailPage })),
)
const BlogDetailPage = lazy(() => import('@/pages/public/BlogDetailPage').then((m) => ({ default: m.BlogDetailPage })))

type Props = {
  pageKey: string
}

function EmbedFallback() {
  return (
    <div className="space-y-3 p-6">
      <div className="h-40 animate-pulse rounded-lg bg-slate-100" />
      <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
    </div>
  )
}

function EmbedSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<EmbedFallback />}>{children}</Suspense>
}

function LandingEmbed({ pageKey }: { pageKey: string }) {
  const Page = LANDING_COMPONENTS[pageKey]
  if (!Page) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Bu sayfa için public renderer tanımlı değil: {pageKey}
      </div>
    )
  }

  return (
    <EmbedSuspense>
      <Page />
    </EmbedSuspense>
  )
}

function DetailPageEmbed({ def }: { def: BuilderPageDefinition }) {
  if (def.kind === 'legal') {
    return <LandingEmbed pageKey={def.key} />
  }

  const slug = def.slug?.trim()
  if (!slug) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Bu sayfa için slug tanımlı değil: {def.key}
      </div>
    )
  }

  let Page: ComponentType
  switch (def.kind) {
    case 'service-detail':
      Page = ServiceDetailPage
      break
    case 'solution-detail':
      Page = SolutionDetailPage
      break
    case 'product-detail':
      Page = SoftwareDetailPage
      break
    case 'blog-detail':
      Page = BlogDetailPage
      break
    default:
      return (
        <div className="p-8 text-center text-sm text-slate-500">
          Desteklenmeyen builder sayfa türü: {def.kind}
        </div>
      )
  }

  return (
    <PreviewSlugProvider slug={slug}>
      <EmbedSuspense>
        <Page />
      </EmbedSuspense>
    </PreviewSlugProvider>
  )
}

/** Public sitedeki sayfa component'ini builder önizlemesinde render eder (iç içe Router yok). */
export function PublicSitePageEmbed({ pageKey }: Props) {
  const def = getBuilderPageDefinition(pageKey)

  if (!def) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Geçersiz builder sayfa anahtarı: {pageKey}
      </div>
    )
  }

  if (def.kind === 'landing') {
    return <LandingEmbed pageKey={def.key} />
  }

  return <DetailPageEmbed def={def} />
}
