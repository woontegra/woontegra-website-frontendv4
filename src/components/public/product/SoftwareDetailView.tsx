import { useMemo, useState, useEffect } from 'react'
import { ProductContentSections } from '@/components/public/product/ProductContentSections'
import { ExternalProductPurchasePanel } from '@/components/public/product/ExternalProductPurchasePanel'
import { ProductPurchasePanel } from '@/components/public/product/ProductPurchasePanel'
import { ProductShowcaseHero } from '@/components/public/product/ProductShowcaseHero'
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
import { MkSaasLicensePurchasePanel } from '@/components/public/product/MkSaasLicensePurchasePanel'
import {
  isMkSaasLicenseRenewalContext,
  type MkSaasLicensePurchaseView,
} from '@/lib/mkSaasLicensePurchase'

const TYPE_LEAD = {
  DOWNLOAD: 'Masaüstü kullanım için hazırlanmış yazılım.',
  SAAS: 'Çoklu kullanıcı / abonelik yapısına uygun yazılım hizmeti.',
  SERVICE: 'Woontegra tarafından sunulan dijital hizmet.',
} as const

type Props = {
  product: PublicProductDetail
  licensePurchase?: MkSaasLicensePurchaseView | null
  licensePurchaseLoading?: boolean
}

export function SoftwareDetailView({ product: data, licensePurchase, licensePurchaseLoading }: Props) {
  const [webUsageYears, setWebUsageYears] = useState(1)
  const [feedback, setFeedback] = useState<'added' | 'in-cart' | null>(null)

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
    : null

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

  return (
    <div className="bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_16%,#f8fafc_55%,#f1f5f9_100%)]">
      <ProductShowcaseHero
        product={data}
        lead={lead}
        isFreeDownload={isFreeDownload}
      >
        {isExternalSales ? (
          <ExternalProductPurchasePanel product={data} />
        ) : (
          <>
            {licensePurchaseLoading ? (
              <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Hesap bilgileri doğrulanıyor…
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

      <ProductContentSections product={data} bullets={bullets} isFreeDownload={isFreeDownload} />
    </div>
  )
}
