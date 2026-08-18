import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { UseQueryResult } from '@tanstack/react-query'
import { Monitor, Globe, Sparkles } from 'lucide-react'
import { CartAddedFeedback } from '@/components/public/CartAddedFeedback'
import { ErrorState } from '@/components/public/ErrorState'
import { MediaImage } from '@/media/components/MediaImage'
import { useMkSaasProductPageContext } from '@/components/public/product/MkSaasProductPageProvider'
import { formatMkSaasTryMoney } from '@/components/public/product/ProductPurchasePanel'
import { addToCart } from '@/lib/cartStorage'
import { pickProductCoverUrl } from '@/lib/publicContentImages'
import { trackAddToCart } from '@/integrations/trackingEvents'
import { getErrorMessage } from '@/api/client'
import { canPurchaseProduct, buildCartSnapshot } from '@/utils/productPurchase'
import { formatCampaignDate } from '@/types/campaign'
import type { PublicProductDetail } from '@/types/product'
import type { MkComparePurchaseCardCopy } from '@/builder/types/mkSaasPurchase'
import {
  desktopDeliveryNotes,
  formatDeviceRightsFromApi,
  formatLicenseDurationFromApi,
} from '@/components/public/muvekkil-kasa/comparePageUtils'

type Query = UseQueryResult<PublicProductDetail, Error>

function CardSkeleton() {
  return (
    <div className="flex h-full animate-pulse flex-col rounded-3xl border border-slate-200 bg-white p-6 sm:p-7">
      <div className="aspect-video rounded-2xl bg-slate-100" />
      <div className="mt-6 h-7 w-3/4 rounded bg-slate-100" />
      <div className="mt-3 h-4 w-full rounded bg-slate-100" />
      <div className="mt-8 h-10 w-40 rounded bg-slate-100" />
      <div className="mt-auto space-y-3 pt-8">
        <div className="h-12 rounded-xl bg-slate-100" />
        <div className="h-12 rounded-xl bg-slate-100" />
      </div>
    </div>
  )
}

function RetryAction({ onRetry }: { onRetry: () => void }) {
  return (
    <button
      type="button"
      onClick={onRetry}
      className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-red-800 shadow-sm ring-1 ring-red-200 transition hover:bg-red-50"
    >
      Tekrar dene
    </button>
  )
}

function ProductCover({
  product,
  name,
  overrideUrl,
}: {
  product: PublicProductDetail
  name: string
  overrideUrl?: string
}) {
  const coverUrl = overrideUrl?.trim() || pickProductCoverUrl(product)
  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50">
      {coverUrl ? (
        <MediaImage
          src={overrideUrl?.trim() || undefined}
          input={overrideUrl?.trim() ? undefined : product}
          alt={name}
          className="h-full w-full object-contain p-3 sm:p-4"
          optimizeWidth={960}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-slate-400">{name}</div>
      )}
    </div>
  )
}

function DesktopCard({
  query,
  onShowDetails,
  copy,
}: {
  query: Query
  onShowDetails: () => void
  copy?: MkComparePurchaseCardCopy
}) {
  const [feedback, setFeedback] = useState<'added' | 'in-cart' | null>(null)
  const product = query.data

  if (query.isPending) return <CardSkeleton />
  if (query.isError || !product) {
    return (
      <ErrorState
        title="Masaüstü ürünü yüklenemedi"
        message={getErrorMessage(query.error, 'Masaüstü ürün bilgileri alınamadı.')}
        action={<RetryAction onRetry={() => query.refetch()} />}
      />
    )
  }

  const canPurchase = canPurchaseProduct(product)
  const unitPrice = product.price
  const hasPrice = Number.isFinite(unitPrice) && unitPrice > 0
  const strikePrice =
    product.originalPrice != null && product.originalPrice > unitPrice ? product.originalPrice : null
  const campaignBadge = product.campaign?.badge?.trim() || (product.campaign ? 'Kampanyalı' : null)

  const handleAddToCart = () => {
    if (!canPurchase) return
    const snapshot = buildCartSnapshot(product)
    const result = addToCart(product.id, 1, { snapshot, replaceLine: true })
    setFeedback(result === 'already_in_cart' ? 'in-cart' : 'added')
    if (result === 'added') {
      trackAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        currency: product.currency,
        quantity: 1,
      })
    }
  }

  return (
    <article className="flex h-full flex-col rounded-3xl border border-emerald-100 bg-white p-5 shadow-[0_18px_50px_-28px_rgba(15,118,110,0.35)] ring-1 ring-emerald-900/5 sm:p-7">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
          <Monitor className="h-3.5 w-3.5" aria-hidden />
          {copy?.badge?.trim() || 'Bilgisayara Kurulan'}
        </span>
      </div>
      <div className="mt-4">
        <ProductCover product={product} name={product.name} overrideUrl={copy?.imageUrl} />
      </div>
      <h2 className="mt-5 min-h-[3.25rem] text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
        {copy?.title?.trim() || 'Müvekkil Kasa Defteri Masaüstü'}
      </h2>
      <p className="mt-2 min-h-[3.25rem] text-sm leading-relaxed text-slate-600 sm:text-base">
        {copy?.description?.trim() ||
          'Programı bilgisayarına kurarak çalışan, merkezi lisanslı masaüstü sürüm.'}
      </p>

      <div className="mt-6 min-h-[5.75rem]">
        {hasPrice ? (
          <div>
            {campaignBadge ? (
              <span className="mb-2 inline-flex rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                {campaignBadge}
              </span>
            ) : null}
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="text-3xl font-black tabular-nums tracking-tight text-slate-950 sm:text-4xl">
                {formatMkSaasTryMoney(unitPrice, product.currency)}
              </p>
              {strikePrice != null ? (
                <p className="text-base text-slate-400 line-through tabular-nums">
                  {formatMkSaasTryMoney(strikePrice, product.currency)}
                </p>
              ) : null}
            </div>
            {product.campaign?.endsAt ? (
              <p className="mt-1 text-xs font-medium text-rose-600">
                Kampanya bitiş: {formatCampaignDate(product.campaign.endsAt)}
              </p>
            ) : null}
            <p className="mt-1 text-sm text-slate-500">KDV dahil · tek lisans</p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Fiyat ürün detayında belirtilir.</p>
        )}
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-700 sm:text-[15px]">
        <p>
          <span className="font-semibold text-slate-800">Lisans süresi: </span>
          {formatLicenseDurationFromApi(product)}
        </p>
        <p>
          <span className="font-semibold text-slate-800">Cihaz hakkı: </span>
          {formatDeviceRightsFromApi(product)}
        </p>
        <div>
          <p className="font-semibold text-slate-800">Teslimat</p>
          <ul className="mt-1 space-y-1 text-slate-600">
            {desktopDeliveryNotes(product).map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-auto space-y-2.5 pt-6">
        {feedback ? (
          <CartAddedFeedback
            message={feedback === 'in-cart' ? 'Bu ürün zaten sepetinizde.' : 'Ürün sepete eklendi.'}
            onContinue={() => setFeedback(null)}
          />
        ) : null}
        <button
          type="button"
          onClick={onShowDetails}
          className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
        >
          {copy?.detailsButtonLabel?.trim() || 'Masaüstü Detaylarını Gör'}
        </button>
        {canPurchase && !feedback ? (
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-105"
          >
            {copy?.addToCartLabel?.trim() || 'Sepete Ekle'}
          </button>
        ) : null}
        {canPurchase && !feedback ? (
          <Link to="/sepet" className="block text-center text-sm font-medium text-emerald-700 underline-offset-4 hover:underline">
            Sepete git
          </Link>
        ) : null}
      </div>
    </article>
  )
}

function SaasCard({
  query,
  onShowDetails,
  copy,
}: {
  query: Query
  onShowDetails: () => void
  copy?: MkComparePurchaseCardCopy
}) {
  const ctx = useMkSaasProductPageContext()
  const product = query.data

  if (query.isPending) return <CardSkeleton />
  if (query.isError || !product) {
    return (
      <ErrorState
        title="SaaS ürünü yüklenemedi"
        message={getErrorMessage(query.error, 'SaaS ürün bilgileri alınamadı.')}
        action={<RetryAction onRetry={() => query.refetch()} />}
      />
    )
  }

  const canPurchase = canPurchaseProduct(product)
  const unitPrice = product.price
  const years = ctx.webUsageYears
  const totalPrice = unitPrice * years
  const hasPrice = Number.isFinite(totalPrice) && totalPrice > 0
  const strikeUnit =
    product.originalPrice != null && product.originalPrice > unitPrice ? product.originalPrice : null
  const campaignBadge = product.campaign?.badge?.trim() || (product.campaign ? 'Kampanyalı' : null)
  const yearsId = 'mk-compare-saas-years'

  return (
    <article className="flex h-full flex-col rounded-3xl border border-sky-100 bg-white p-5 shadow-[0_18px_50px_-28px_rgba(2,132,199,0.35)] ring-1 ring-sky-900/5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-800">
          <Globe className="h-3.5 w-3.5" aria-hidden />
          {copy?.badge?.trim() || 'Tarayıcıdan Erişim'}
        </span>
        {copy?.extraBadge?.trim() !== '' ? (
          <span className="inline-flex items-center rounded-full bg-sky-600 px-2.5 py-1 text-[11px] font-semibold text-white">
            {copy?.extraBadge?.trim() || 'En kapsamlı'}
          </span>
        ) : null}
      </div>
      <div className="mt-4">
        <ProductCover product={product} name={product.name} overrideUrl={copy?.imageUrl} />
      </div>
      <h2 className="mt-5 min-h-[3.25rem] text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
        {copy?.title?.trim() || 'Müvekkil Kasa Defteri SaaS'}
      </h2>
      <p className="mt-2 min-h-[3.25rem] text-sm leading-relaxed text-slate-600 sm:text-base">
        {copy?.description?.trim() ||
          'Kurulum gerektirmeden tarayıcı üzerinden erişilen, çok kullanıcılı ve WhatsApp destekli web sürümü.'}
      </p>

      <div className="mt-6 min-h-[5.75rem]">
        {hasPrice ? (
          <div>
            {campaignBadge ? (
              <span className="mb-2 inline-flex rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                {campaignBadge}
              </span>
            ) : null}
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="text-3xl font-black tabular-nums tracking-tight text-slate-950 sm:text-4xl">
                {formatMkSaasTryMoney(totalPrice, product.currency)}
              </p>
              {strikeUnit != null && years === 1 ? (
                <p className="text-base text-slate-400 line-through tabular-nums">
                  {formatMkSaasTryMoney(strikeUnit, product.currency)}
                </p>
              ) : null}
            </div>
            {years > 1 ? (
              <p className="mt-1 text-sm text-slate-500">
                {formatMkSaasTryMoney(unitPrice, product.currency)} / yıl × {years} yıl
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-500">KDV dahil · 1 yıl birim fiyat</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Fiyat ürün detayında belirtilir.</p>
        )}
      </div>

      <div className="mt-4 min-h-[5.5rem]">
        {canPurchase ? (
          <div>
            <label htmlFor={yearsId} className="text-sm font-semibold text-slate-800">
              Kullanım süresi
            </label>
            <select
              id={yearsId}
              value={years}
              onChange={(e) => ctx.onWebUsageYearsChange(Number(e.target.value))}
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((y) => (
                <option key={y} value={y}>
                  {y} yıl
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <div className="mt-auto space-y-2.5 pt-4">
        {ctx.feedback ? (
          <CartAddedFeedback
            message={ctx.feedback === 'in-cart' ? 'Bu ürün zaten sepetinizde.' : 'Ürün sepete eklendi.'}
            onContinue={ctx.onFeedbackDismiss}
          />
        ) : null}
        <button
          type="button"
          onClick={ctx.onOpenDemo}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3.5 text-sm font-semibold text-sky-900 transition hover:border-sky-300 hover:bg-sky-100"
        >
          <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
          {copy?.demoButtonLabel?.trim() || '7 Gün Ücretsiz Dene'}
        </button>
        <button
          type="button"
          onClick={onShowDetails}
          className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
        >
          {copy?.detailsButtonLabel?.trim() || 'SaaS Detaylarını Gör'}
        </button>
        {canPurchase && !ctx.feedback ? (
          <button
            type="button"
            onClick={() => {
              if (!ctx.product || ctx.product.id !== product.id) return
              ctx.onAddToCart()
            }}
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:brightness-105"
          >
            {copy?.addToCartLabel?.trim() || 'Sepete Ekle'}
          </button>
        ) : null}
        {canPurchase && !ctx.feedback ? (
          <Link to="/sepet" className="block text-center text-sm font-medium text-sky-700 underline-offset-4 hover:underline">
            Sepete git
          </Link>
        ) : null}
      </div>
    </article>
  )
}

type Props = {
  desktopQuery: Query
  saasQuery: Query
  onShowProductDetails: (edition: 'desktop' | 'saas') => void
  desktopCopy?: MkComparePurchaseCardCopy
  saasCopy?: MkComparePurchaseCardCopy
}

export function MuvekkilKasaCompareProductCards({
  desktopQuery,
  saasQuery,
  onShowProductDetails,
  desktopCopy,
  saasCopy,
}: Props) {
  return (
    <div className="grid items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
      <DesktopCard
        query={desktopQuery}
        onShowDetails={() => onShowProductDetails('desktop')}
        copy={desktopCopy}
      />
      <SaasCard query={saasQuery} onShowDetails={() => onShowProductDetails('saas')} copy={saasCopy} />
    </div>
  )
}
