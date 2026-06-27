import { useMemo, useState, useEffect } from 'react'
import { Monitor } from 'lucide-react'
import { Breadcrumbs } from '@/components/public/Breadcrumbs'
import { ProductGallery } from '@/components/public/product/ProductGallery'
import { ProductPurchasePanel } from '@/components/public/product/ProductPurchasePanel'
import { addToCart } from '@/lib/cartStorage'
import {
  buildCartSnapshot,
  canPurchaseProduct,
  isFreeDownloadProduct,
  isSaasSubscriptionProduct,
  licenseDisplayLabel,
} from '@/utils/productPurchase'
import { productTypeLabel, type PublicProductDetail } from '@/types/product'
import { cn } from '@/lib/cn'
import { trackAddToCart, trackViewContent } from '@/integrations/trackingEvents'

const TYPE_LEAD = {
  DOWNLOAD: 'Masaüstü kullanım için hazırlanmış yazılım.',
  SAAS: 'Çoklu kullanıcı / abonelik yapısına uygun yazılım hizmeti.',
  SERVICE: 'Woontegra tarafından sunulan dijital hizmet.',
} as const

type Props = {
  product: PublicProductDetail
}

/** Public SoftwareDetailPage ile aynı PDP düzeni — dev hero yok. */
export function SoftwareDetailView({ product: data }: Props) {
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
  const canPurchase = canPurchaseProduct(data)
  const isSaas = isSaasSubscriptionProduct(data.productType)

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
    <div className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6 lg:py-8">
        <Breadcrumbs
          items={[
            { label: 'Ana Sayfa', href: '/' },
            { label: 'Yazılımlar', href: '/yazilimlar' },
            { label: data.name },
          ]}
        />

        <div className="mt-5 grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-10">
          <ProductGallery name={data.name} coverImage={data.coverImage} galleryImages={data.galleryImages} />

          <div className="min-w-0 lg:sticky lg:top-20 lg:self-start">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                {productTypeLabel(data.productType)}
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                {licenseDisplayLabel(data)}
              </span>
              {data.isFeatured ? (
                <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-medium text-white">Öne çıkan</span>
              ) : null}
              {data.category ? (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {data.category.name}
                </span>
              ) : null}
              {isFreeDownload ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">Ücretsiz</span>
              ) : null}
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{data.name}</h1>
            {lead ? <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">{lead}</p> : null}

            {data.productType === 'DOWNLOAD' && data.version?.trim() ? (
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-500">
                <Monitor className="h-4 w-4" aria-hidden />
                Sürüm {data.version.trim()}
              </p>
            ) : null}

            <div className="mt-5">
              <ProductPurchasePanel
                product={data}
                webUsageYears={webUsageYears}
                onWebUsageYearsChange={setWebUsageYears}
                feedback={feedback}
                onFeedbackDismiss={() => setFeedback(null)}
                onAddToCart={handleAddToCart}
              />
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-10 border-t border-slate-200 pt-10 lg:mt-12">
          {data.description ? (
            <section>
              <h2 className="text-lg font-semibold text-slate-900">Açıklama</h2>
              <div
                className="prose prose-slate mt-4 max-w-none text-slate-700"
                dangerouslySetInnerHTML={{ __html: data.description }}
              />
            </section>
          ) : null}

          {bullets.length > 0 ? (
            <section>
              <h2 className="text-lg font-semibold text-slate-900">Özellikler</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {bullets.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-slate-700">
                    <span className="text-emerald-600" aria-hidden>
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {(data.licenseRequired || data.hasDownload) && !isFreeDownload ? (
            <section className={cn('rounded-xl border border-slate-200 bg-slate-50 p-5')}>
              <h2 className="text-lg font-semibold text-slate-900">Teslimat & lisans</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {data.licenseRequired ? (
                  <li>Merkezi lisans yönetimi; aktivasyon bilgileri e-posta ile iletilir.</li>
                ) : null}
                {data.hasDownload ? <li>Dijital indirme linki ödeme onayı sonrası paylaşılır.</li> : null}
                {data.productType === 'SERVICE' ? <li>Hizmet teslimatı Woontegra ekibi tarafından planlanır.</li> : null}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  )
}
