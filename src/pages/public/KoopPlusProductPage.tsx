import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams, Navigate } from 'react-router-dom'
import { KoopPlusProductView } from '@/components/public/koopplus/KoopPlusProductView'
import { ErrorState } from '@/components/public/ErrorState'
import { SoftwareProductJsonLd } from '@/components/seo/SoftwareProductJsonLd'
import {
  KOOPPLUS_NAME,
  KOOPPLUS_PATH,
  KOOPPLUS_SEO,
  KOOPPLUS_SEO_TOPIC,
  KOOPPLUS_SLUG,
} from '@/data/koopplusProduct'
import { usePageMeta } from '@/hooks/usePageMeta'
import { trackKoopplusEvent } from '@/integrations/trackingEvents'
import { saveDesktopRenewalToken } from '@/lib/desktopLicenseRenewal'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { desktopLicenseRenewalService } from '@/services/desktopLicenseRenewalService'
import { productsService } from '@/services/productsService'

export function KoopPlusLegacyPathRedirect() {
  const [searchParams] = useSearchParams()
  const search = searchParams.toString()
  return <Navigate to={search ? `${KOOPPLUS_PATH}?${search}` : KOOPPLUS_PATH} replace />
}

export function KoopPlusProductPage() {
  const [searchParams] = useSearchParams()
  const renewalToken = searchParams.get('renewalToken')?.trim() || ''

  const productQuery = useQuery({
    queryKey: ['products', KOOPPLUS_SLUG],
    queryFn: () => productsService.getBySlug(KOOPPLUS_SLUG),
    ...publicQueryOptions,
  })

  const desktopRenewalQuery = useQuery({
    ...publicQueryOptions,
    queryKey: ['desktop-license-renewal', renewalToken],
    queryFn: async () => {
      saveDesktopRenewalToken(renewalToken)
      return desktopLicenseRenewalService.resolve(renewalToken)
    },
    enabled: Boolean(renewalToken),
    retry: false,
  })

  usePageMeta({
    title: KOOPPLUS_SEO.title,
    description: KOOPPLUS_SEO.description,
    canonicalPath: KOOPPLUS_PATH,
    ogType: 'product',
    ogImage: productQuery.data?.coverImage ?? null,
  })

  useEffect(() => {
    trackKoopplusEvent('koopplus_view')
  }, [])

  const product = productQuery.data ?? null
  const includeOffer =
    product != null && Number.isFinite(product.price) && product.price >= 0

  if (renewalToken && desktopRenewalQuery.isError) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24">
        <ErrorState message="Yenileme bağlantısı geçersiz veya süresi dolmuş." />
        <p className="mt-4 text-sm text-slate-600">
          Masaüstü uygulamasından &quot;Lisansı Yenile&quot; ile yeni bağlantı oluşturun.
        </p>
        <Link to={KOOPPLUS_PATH} className="mt-6 inline-block text-emerald-700 hover:underline">
          KoopPlus sayfasına dön
        </Link>
      </div>
    )
  }

  return (
    <>
      <SoftwareProductJsonLd
        name={product?.name || KOOPPLUS_NAME}
        description={KOOPPLUS_SEO.description}
        path={KOOPPLUS_PATH}
        applicationCategory="BusinessApplication"
        operatingSystem="Windows"
        price={includeOffer ? product.price : null}
        priceCurrency={product?.currency || 'TRY'}
        includeOffer={includeOffer}
        breadcrumbs={[
          { name: 'Ana Sayfa', path: '/' },
          { name: 'Yazılımlar', path: '/yazilimlar' },
          { name: KOOPPLUS_SEO_TOPIC, path: KOOPPLUS_PATH },
        ]}
      />
      <KoopPlusProductView
        product={product}
        productLoading={productQuery.isPending}
        desktopLicenseRenewal={desktopRenewalQuery.data ?? null}
        desktopLicenseRenewalLoading={Boolean(renewalToken) && desktopRenewalQuery.isPending}
      />
    </>
  )
}
