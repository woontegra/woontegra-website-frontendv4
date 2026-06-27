import { lazy, Suspense, type ComponentType } from 'react'

import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { getBuilderPageDefinition } from '@/builder/pages/builderPageRegistry'



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

const BlogDetailPage = lazy(() =>

  import('@/pages/public/BlogDetailPage').then((m) => ({ default: m.BlogDetailPage })),

)



type Props = {

  pageKey: string

}



function DetailRouteEmbed({ previewPath }: { previewPath: string }) {

  return (

    <MemoryRouter initialEntries={[previewPath]}>

      <Routes>

        <Route path="/hizmetler/:slug" element={<ServiceDetailPage />} />

        <Route path="/cozumler/:slug" element={<SolutionDetailPage />} />

        <Route path="/yazilimlar/:slug" element={<SoftwareDetailPage />} />

        <Route path="/blog/:slug" element={<BlogDetailPage />} />

        <Route path="/cerez-politikasi" element={<LandingEmbed pageKey="legal-cookie" />} />

        <Route path="/kvkk-aydinlatma-metni" element={<LandingEmbed pageKey="legal-kvkk" />} />

        <Route path="/gizlilik-politikasi" element={<LandingEmbed pageKey="legal-privacy" />} />

        <Route path="/acik-riza-metni" element={<LandingEmbed pageKey="legal-consent" />} />

        <Route path="/kullanim-sartlari" element={<LandingEmbed pageKey="legal-terms" />} />

      </Routes>

    </MemoryRouter>

  )

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

    <Suspense

      fallback={

        <div className="space-y-3 p-6">

          <div className="h-40 animate-pulse rounded-lg bg-slate-100" />

          <div className="h-24 animate-pulse rounded-lg bg-slate-100" />

        </div>

      }

    >

      <Page />

    </Suspense>

  )

}



/**

 * Public sitedeki sayfa component'ini olduğu gibi render eder.

 * Detay sayfaları MemoryRouter ile previewPath üzerinden yüklenir.

 */

export function PublicSitePageEmbed({ pageKey }: Props) {

  const def = getBuilderPageDefinition(pageKey)



  if (!def) {

    return (

      <div className="p-8 text-center text-sm text-slate-500">

        Geçersiz builder sayfa anahtarı: {pageKey}

      </div>

    )

  }



  if (def.kind !== 'landing') {

    return (

      <Suspense

        fallback={

          <div className="space-y-3 p-6">

            <div className="h-40 animate-pulse rounded-lg bg-slate-100" />

          </div>

        }

      >

        <DetailRouteEmbed previewPath={def.previewPath} />

      </Suspense>

    )

  }



  return <LandingEmbed pageKey={def.key} />

}


