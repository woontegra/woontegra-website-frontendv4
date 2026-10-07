import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { bilirkisiHesapService } from '@/services/bilirkisiHesapService'
import { ProductContentSections } from '@/components/public/product/ProductContentSections'
import { ExternalProductPurchasePanel } from '@/components/public/product/ExternalProductPurchasePanel'
import { ProductPurchasePanel } from '@/components/public/product/ProductPurchasePanel'
import { ProductShowcaseHero } from '@/components/public/product/ProductShowcaseHero'
import { BilirkisiOfferHeroNote } from '@/components/public/bilirkisi/BilirkisiOfferNote'
import { BILIRKISI_HESAP_SLUG } from '@/data/canonicalSoftwareProducts'
import { addToCart } from '@/lib/cartStorage'
import {
  buildCartSnapshot,
  canPurchaseProduct,
  isFreeDownloadProduct,
  isSaasSubscriptionProduct,
} from '@/utils/productPurchase'
import type { PublicProductDetail } from '@/types/product'
import { trackAddToCart, trackViewContent } from '@/integrations/trackingEvents'
import { isExternalSalesProduct } from '@/lib/publicSoftwareCatalog'
import { isMuvekkilKasaSaasProduct } from '@/lib/muvekkilKasaSaasProduct'
import { MkSaasLicensePurchasePanel } from '@/components/public/product/MkSaasLicensePurchasePanel'
import { DesktopLicenseRenewalPanel } from '@/components/public/product/DesktopLicenseRenewalPanel'
import {
  isMkSaasLicenseRenewalContext,
  type MkSaasLicensePurchaseView,
} from '@/lib/mkSaasLicensePurchase'
import { isDesktopLicenseRenewalContext, type DesktopLicenseRenewalView } from '@/lib/desktopLicenseRenewal'
import {
  desktopPlatformFacts,
  findPlatform,
  getProductPlatformFamily,
  type SoftwarePlatformId,
} from '@/components/public/product/softwarePlatforms'

const TYPE_LEAD = {
  DOWNLOAD: 'Woontegra tarafından geliştirilmiş masaüstü yazılım.',
  SAAS: 'Woontegra’nın çoklu kullanıcı / abonelik yapısına uygun yazılım hizmeti.',
  SERVICE: 'Woontegra tarafından sunulan dijital hizmet.',
} as const

type Props = {
  product: PublicProductDetail
  licensePurchase?: MkSaasLicensePurchaseView | null
  licensePurchaseLoading?: boolean
  desktopLicenseRenewal?: DesktopLicenseRenewalView | null
  desktopLicenseRenewalLoading?: boolean
}

export function SoftwareDetailView({
  product: data,
  licensePurchase,
  licensePurchaseLoading,
  desktopLicenseRenewal,
  desktopLicenseRenewalLoading,
}: Props) {
  const [webUsageYears, setWebUsageYears] = useState(1)
  const [feedback, setFeedback] = useState<'added' | 'in-cart' | null>(null)
  const platformFamily = getProductPlatformFamily(data.slug)
  const [searchParams] = useSearchParams()
  const requestedPlatform = useMemo((): SoftwarePlatformId | null => {
    const raw = (searchParams.get('platform') || '').trim().toLowerCase()
    if (raw === 'windows' || raw === 'macos' || raw === 'web') return raw
    return null
  }, [searchParams])
  const [platformId, setPlatformId] = useState<SoftwarePlatformId>(
    requestedPlatform ?? platformFamily?.defaultPlatform ?? 'web',
  )
  const selectedPlatform = findPlatform(platformFamily, platformId)
  const bhProductQuery = useQuery({
    queryKey: ['bh-public-product'],
    queryFn: () => bilirkisiHesapService.getProduct(),
    enabled: Boolean(platformFamily),
    staleTime: 60_000,
    gcTime: 30 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  })
  const desktopDeviceLimit = (() => {
    const product = bhProductQuery.data
    if (!product || (platformId !== 'windows' && platformId !== 'macos')) return null
    const value = platformId === 'windows' ? product.windowsDeviceLimit : product.macosDeviceLimit
    return value != null && Number.isInteger(Number(value)) && Number(value) >= 1 ? Number(value) : null
  })()
  const desktopFacts =
    selectedPlatform?.checkout === 'not-connected' && selectedPlatform.presentation
      ? desktopPlatformFacts(selectedPlatform.presentation, 'yearly', desktopDeviceLimit)
      : null
  const desktopDeliveryNotes = selectedPlatform?.presentation
    ? [selectedPlatform.presentation.licenseNote, selectedPlatform.presentation.deliveryLabel]
    : null

  const bullets = useMemo(
    () =>
      (data.featureBullets ?? '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    [data.featureBullets],
  )

  const lead = data.shortDescription?.trim() || TYPE_LEAD[data.productType]
  const isFreeDownload = isFreeDownloadProduct(data)
  const isExternalSales = isExternalSalesProduct(data)
  const canPurchase = canPurchaseProduct(data) && !isExternalSales
  const isSaas = isSaasSubscriptionProduct(data.productType)
  const licenseDaysPerUnit = Math.max(1, data.licenseDays ?? 365)
  const renewalDaysForCart = isSaas ? webUsageYears * licenseDaysPerUnit : licenseDaysPerUnit
  const renewalLabel = isSaas
    ? webUsageYears === 1
      ? licenseDaysPerUnit >= 360
        ? '1 Yıl'
        : `${licenseDaysPerUnit} Gün`
      : `${webUsageYears} Yıl`
    : licenseDaysPerUnit >= 360
      ? '1 Yıl'
      : `${licenseDaysPerUnit} Gün`

  useEffect(() => {
    setPlatformId(requestedPlatform ?? getProductPlatformFamily(data.slug)?.defaultPlatform ?? 'web')
  }, [data.slug, requestedPlatform])

  useEffect(() => {
    trackViewContent({
      id: data.id,
      name: data.name,
      price: data.price,
      currency: data.currency,
    })
  }, [data.id, data.name, data.price, data.currency])

  const handleAddToCart = () => {
    if (!canPurchase) return
    const snapshot = buildCartSnapshot(data)
    if (isSaas) {
      addToCart(data.id, webUsageYears, { snapshot, replaceLine: true })
      setFeedback('added')
      trackAddToCart({
        id: data.id,
        name: data.name,
        price: data.price,
        currency: data.currency,
        quantity: webUsageYears,
      })
      return
    }
    const result = addToCart(data.id, 1, { snapshot, replaceLine: true })
    setFeedback(result === 'already_in_cart' ? 'in-cart' : 'added')
    if (result === 'added') {
      trackAddToCart({
        id: data.id,
        name: data.name,
        price: data.price,
        currency: data.currency,
        quantity: 1,
      })
    }
  }

  const isMkSaas = isMuvekkilKasaSaasProduct({
    slug: data.slug,
  })
  const inRenewalFlow = Boolean(
    licensePurchaseLoading || licensePurchase || desktopLicenseRenewalLoading || desktopLicenseRenewal,
  )

  if (isMkSaas && !inRenewalFlow) {
    return null
  }

  return (
    <div className="bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_16%,#f8fafc_55%,#f1f5f9_100%)]">
      <ProductShowcaseHero
        product={data}
        lead={lead}
        isFreeDownload={isFreeDownload}
        metaItems={desktopFacts ?? undefined}
        afterLead={data.slug === BILIRKISI_HESAP_SLUG ? <BilirkisiOfferHeroNote /> : null}
      >
        {isExternalSales ? (
          <ExternalProductPurchasePanel
            product={data}
            platformFamily={platformFamily}
            platformId={platformId}
            onPlatformChange={platformFamily ? setPlatformId : undefined}
          />
        ) : (
          <>
            {licensePurchaseLoading || desktopLicenseRenewalLoading ? (
              <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Lisans bilgileri doğrulanıyor…
              </div>
            ) : licensePurchase ? (
              <MkSaasLicensePurchasePanel
                data={licensePurchase}
                renewalDays={
                  isMkSaasLicenseRenewalContext(licensePurchase) ? renewalDaysForCart : undefined
                }
                renewalLabel={
                  isMkSaasLicenseRenewalContext(licensePurchase) ? renewalLabel : undefined
                }
              />
            ) : desktopLicenseRenewal ? (
              <DesktopLicenseRenewalPanel
                data={desktopLicenseRenewal}
                renewalDays={
                  isDesktopLicenseRenewalContext(desktopLicenseRenewal) ? renewalDaysForCart : undefined
                }
                renewalLabel={
                  isDesktopLicenseRenewalContext(desktopLicenseRenewal) ? renewalLabel : undefined
                }
              />
            ) : null}
            <ProductPurchasePanel
            product={data}
            webUsageYears={webUsageYears}
            onWebUsageYearsChange={setWebUsageYears}
            feedback={feedback}
            onFeedbackDismiss={() => setFeedback(null)}
            onAddToCart={handleAddToCart}
          />
          </>
        )}
      </ProductShowcaseHero>

      <ProductContentSections
        product={data}
        bullets={bullets}
        isFreeDownload={isFreeDownload}
        platformFacts={desktopFacts}
        platformDeliveryNotes={desktopFacts ? desktopDeliveryNotes : null}
      />
    </div>
  )
}
