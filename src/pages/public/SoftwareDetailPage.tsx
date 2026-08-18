import { useQuery } from '@tanstack/react-query'
import { SoftwareDetailView } from '@/components/public/product/SoftwareDetailView'
import { MuvekkilKasaSaasSalesPage } from '@/components/public/product/MuvekkilKasaSaasSalesPage'
import { MkSaasProductPageProvider, useMkSaasProductPageContext } from '@/components/public/product/MkSaasProductPageProvider'
import { PublicDetailSkeleton } from '@/components/public/PublicRouteSkeleton'
import { ErrorState } from '@/components/public/ErrorState'
import { PublicBuilderBlocksPage } from '@/components/public/PublicBuilderBlocksPage'
import { usePageMeta } from '@/hooks/usePageMeta'
import { usePublicPageBlocks } from '@/hooks/usePublicPageBlocks'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { useIsBuilderPreview, usePreviewOrParamSlug } from '@/lib/previewRouteParams'
import { MK_COMPARE_PATH } from '@/components/public/muvekkil-kasa/comparePageUtils'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { productsService } from '@/services/productsService'
import { mkSaasLicensePurchaseService } from '@/services/mkSaasLicensePurchaseService'
import { getErrorMessage } from '@/api/client'
import { isMuvekkilKasaSaasProduct, resolveMkSaasBlocksSlug } from '@/lib/muvekkilKasaSaasProduct'
import {
  isMuvekkilKasaDesktopCentralLicenseProduct,
  isMuvekkilKasaDesktopSalesSlug,
} from '@/lib/muvekkilKasaDesktopProduct'
import { saveMkSaasRenewalToken } from '@/lib/mkSaasLicensePurchase'
import { saveDesktopRenewalToken } from '@/lib/desktopLicenseRenewal'
import { desktopLicenseRenewalService } from '@/services/desktopLicenseRenewalService'

import { PRODUCT_PAGES_CONTENT_KEY } from '@/lib/builderPageContentKeys'

function MkSaasSalesFallbackView() {
  const ctx = useMkSaasProductPageContext()
  if (!ctx.product) return null
  return (
    <MuvekkilKasaSaasSalesPage
      product={ctx.product}
      webUsageYears={ctx.webUsageYears}
      onWebUsageYearsChange={ctx.onWebUsageYearsChange}
      feedback={ctx.feedback}
      onFeedbackDismiss={ctx.onFeedbackDismiss}
      onAddToCart={ctx.onAddToCart}
      onOpenDemo={ctx.onOpenDemo}
    />
  )
}

export function SoftwareDetailPage() {
  const { slug: paramSlug = '' } = useParams()
  const slug = usePreviewOrParamSlug(paramSlug)
  const isBuilderPreview = useIsBuilderPreview()
  const [searchParams] = useSearchParams()
  const renewalToken = searchParams.get('renewalToken')?.trim() || ''

  const isMkSaasProduct = isMuvekkilKasaSaasProduct({ slug })
  const blocksSlug = isMkSaasProduct ? resolveMkSaasBlocksSlug(slug) : slug
  const { blocks, isPending: blocksPending } = usePublicPageBlocks(PRODUCT_PAGES_CONTENT_KEY, blocksSlug)

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['products', slug],
    queryFn: () => productsService.getBySlug(slug),
    enabled: Boolean(slug),
    ...publicQueryOptions,
  })

  const isMkDesktopProduct = isMuvekkilKasaDesktopCentralLicenseProduct({
    slug,
    licenseRequired: true,
  })
  const licensePurchaseQuery = useQuery({
    ...publicQueryOptions,
    queryKey: ['mk-saas-license-purchase', renewalToken],
    queryFn: async () => {
      saveMkSaasRenewalToken(renewalToken)
      return mkSaasLicensePurchaseService.resolve(renewalToken)
    },
    enabled: Boolean(renewalToken) && isMkSaasProduct,
    retry: false,
  })

  const desktopRenewalQuery = useQuery({
    ...publicQueryOptions,
    queryKey: ['desktop-license-renewal', renewalToken],
    queryFn: async () => {
      saveDesktopRenewalToken(renewalToken)
      return desktopLicenseRenewalService.resolve(renewalToken)
    },
    enabled: Boolean(renewalToken) && isMkDesktopProduct && !isMkSaasProduct,
    retry: false,
  })

  const redirectMkSalesToCompare =
    !isBuilderPreview &&
    !renewalToken &&
    (isMuvekkilKasaDesktopSalesSlug(slug) || isMkSaasProduct)

  usePageMeta({
    title: data?.seoTitle || data?.name || 'Yazılım',
    description: data?.seoDescription || data?.shortDescription,
    canonicalPath: redirectMkSalesToCompare ? MK_COMPARE_PATH : slug ? `/yazilimlar/${slug}` : '/yazilimlar',
  })

  const legacyView =
    isPending ? (
      <PublicDetailSkeleton />
    ) : isError || !data ? (
      <div className="mx-auto max-w-3xl px-6 py-24">
        <ErrorState message={getErrorMessage(error, 'Yazılım bulunamadı')} />
        <Link to="/yazilimlar" className="mt-6 inline-block text-emerald-700 hover:underline">
          Yazılımlara dön
        </Link>
      </div>
    ) : renewalToken && (licensePurchaseQuery.isError || desktopRenewalQuery.isError) ? (
      <div className="mx-auto max-w-3xl px-6 py-24">
        <ErrorState message="Yenileme bağlantısı geçersiz veya süresi dolmuş." />
        <p className="mt-4 text-sm text-slate-600">
          Müvekkil Kasa Defteri uygulamasından &quot;Lisansı Yenile&quot; ile yeni bağlantı oluşturun.
        </p>
      </div>
    ) : (
      <SoftwareDetailView
        product={data}
        licensePurchase={licensePurchaseQuery.data ?? null}
        licensePurchaseLoading={Boolean(renewalToken) && licensePurchaseQuery.isPending}
        desktopLicenseRenewal={desktopRenewalQuery.data ?? null}
        desktopLicenseRenewalLoading={Boolean(renewalToken) && desktopRenewalQuery.isPending}
      />
    )

  if (isMkSaasProduct && renewalToken) {
    return legacyView
  }

  if (!isBuilderPreview && !renewalToken && isMuvekkilKasaDesktopSalesSlug(slug)) {
    return <Navigate to={`${MK_COMPARE_PATH}?surum=masaustu`} replace />
  }

  if (!isBuilderPreview && !renewalToken && isMkSaasProduct) {
    return <Navigate to={`${MK_COMPARE_PATH}?surum=saas`} replace />
  }

  if (isMkSaasProduct && data && !isPending && !isError) {
    const hasPublishedBuilder = Boolean(blocks && blocks.length > 0)
    const mkFallback = <MkSaasSalesFallbackView />

    if (blocksPending) {
      return <PublicDetailSkeleton />
    }

    if (hasPublishedBuilder) {
      return (
        <MkSaasProductPageProvider product={data}>
          <PublicBuilderBlocksPage
            blocks={blocks}
            fallback={mkFallback}
            className="overflow-x-hidden bg-slate-50"
          />
        </MkSaasProductPageProvider>
      )
    }

    return <MkSaasProductPageProvider product={data}>{mkFallback}</MkSaasProductPageProvider>
  }

  return <PublicBuilderBlocksPage blocks={blocks} fallback={legacyView} />
}
