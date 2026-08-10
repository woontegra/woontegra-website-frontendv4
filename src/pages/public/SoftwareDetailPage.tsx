import { useQuery } from '@tanstack/react-query'
import { SoftwareDetailView } from '@/components/public/product/SoftwareDetailView'
import { PublicDetailSkeleton } from '@/components/public/PublicRouteSkeleton'
import { ErrorState } from '@/components/public/ErrorState'
import { PublicBuilderBlocksPage } from '@/components/public/PublicBuilderBlocksPage'
import { usePageMeta } from '@/hooks/usePageMeta'
import { usePublicPageBlocks } from '@/hooks/usePublicPageBlocks'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { usePreviewOrParamSlug } from '@/lib/previewRouteParams'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { productsService } from '@/services/productsService'
import { mkSaasLicensePurchaseService } from '@/services/mkSaasLicensePurchaseService'
import { getErrorMessage } from '@/api/client'
import { isMuvekkilKasaSaasProduct } from '@/lib/muvekkilKasaSaasProduct'
import { isMuvekkilKasaDesktopCentralLicenseProduct } from '@/lib/muvekkilKasaDesktopProduct'
import { saveMkSaasRenewalToken } from '@/lib/mkSaasLicensePurchase'
import { saveDesktopRenewalToken } from '@/lib/desktopLicenseRenewal'
import { desktopLicenseRenewalService } from '@/services/desktopLicenseRenewalService'

import { PRODUCT_PAGES_CONTENT_KEY } from '@/lib/builderPageContentKeys'

export function SoftwareDetailPage() {
  const { slug: paramSlug = '' } = useParams()
  const slug = usePreviewOrParamSlug(paramSlug)
  const [searchParams] = useSearchParams()
  const renewalToken = searchParams.get('renewalToken')?.trim() || ''
  const { blocks } = usePublicPageBlocks(PRODUCT_PAGES_CONTENT_KEY, slug)

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['products', slug],
    queryFn: () => productsService.getBySlug(slug),
    enabled: Boolean(slug),
    ...publicQueryOptions,
  })

  const isMkSaasProduct = isMuvekkilKasaSaasProduct({ slug })
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

  usePageMeta({
    title: data?.seoTitle || data?.name || 'Yazılım',
    description: data?.seoDescription || data?.shortDescription,
    canonicalPath: slug ? `/yazilimlar/${slug}` : '/yazilimlar',
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

  return <PublicBuilderBlocksPage blocks={blocks} fallback={legacyView} />
}
