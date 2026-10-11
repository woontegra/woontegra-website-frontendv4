import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { UseQueryResult } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'
import { CartAddedFeedback } from '@/components/public/CartAddedFeedback'
import { ErrorState } from '@/components/public/ErrorState'
import { useMkSaasProductPageContext } from '@/components/public/product/MkSaasProductPageProvider'
import { formatMkSaasTryMoney } from '@/components/public/product/ProductPurchasePanel'
import { addToCart } from '@/lib/cartStorage'
import { trackAddToCart } from '@/integrations/trackingEvents'
import { getErrorMessage } from '@/api/client'
import { canPurchaseProduct, buildCartSnapshot } from '@/utils/productPurchase'
import { formatCampaignDate } from '@/types/campaign'
import type { PublicProductDetail } from '@/types/product'
import type { MkComparePurchaseCardCopy } from '@/builder/types/mkSaasPurchase'
import { DEFAULT_MK_COMPARE_MACOS_COPY } from '@/builder/types/mkSaasPurchase'
import {
  desktopDeliveryNotes,
  MK_COMPARE_CARD_DESKTOP_ID,
  MK_COMPARE_CARD_SAAS_ID,
  MK_COMPARE_DESKTOP_LICENSE_CAPTION,
  MK_COMPARE_SAAS_LICENSE_CAPTION,
  MK_COMPARE_TRIAL_CTA_LABEL,
  webDeliveryNotes,
} from '@/components/public/muvekkil-kasa/comparePageUtils'
import { getMuvekkilKasaDesktopTrialDownload } from '@/lib/muvekkilKasaDesktopProduct'
import { getMuvekkilKasaMacosTrialDownload } from '@/lib/muvekkilKasaDesktopPlatform'
import { MK_COMPARE_CARD_MACOS_ID, MK_LAUNCH_PRICE_LABEL } from '@/components/public/muvekkil-kasa/mkComparePlatform'

type Query = UseQueryResult<PublicProductDetail, Error>

/** İş ortağı (/r/:code) vurgusu: bağlantının hedef ürünü mü. ?surum= tek başına vurgu üretmez. */
export type ReferralCardFocus = 'target' | 'none'

function LaunchPriceLabel() {
  return (
    <span
      className="mb-2 inline-flex w-fit items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-800"
      data-launch-price-label
    >
      {MK_LAUNCH_PRICE_LABEL}
    </span>
  )
}

function ReferralProductBadge({ tone }: { tone: 'emerald' | 'sky' }) {
  return (
    <p
      className={
        tone === 'emerald'
          ? 'mb-3 inline-flex w-fit items-center rounded-full border border-emerald-600 bg-emerald-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm'
          : 'mb-3 inline-flex w-fit items-center rounded-full border border-sky-600 bg-sky-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm'
      }
    >
      Bu bağlantıya ait ürün
    </p>
  )
}

function ReferralCartHint({ tone }: { tone: 'emerald' | 'sky' }) {
  return (
    <p
      className={
        tone === 'emerald'
          ? 'rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-xs font-medium leading-snug text-emerald-900'
          : 'rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-center text-xs font-medium leading-snug text-sky-900'
      }
    >
      İş ortağı bağlantısıyla seçilen ürün
    </p>
  )
}

function DesktopTrialCta({
  label,
  download,
}: {
  label: string
  download: { href: string; filename?: string } | null
}) {
  const className =
    'flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-semibold text-emerald-900 transition hover:border-emerald-300 hover:bg-emerald-100'
  const inner = (
    <>
      <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </>
  )
  if (download) {
    const external = /^https:/i.test(download.href)
    return (
      <a
        href={download.href}
        className={className}
        data-desktop-trial-cta="ready"
        {...(download.filename ? { download: download.filename } : {})}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {inner}
      </a>
    )
  }
  return (
    <p
      className={`${className} cursor-default hover:border-emerald-200 hover:bg-emerald-50`}
      data-desktop-trial-cta="pending"
    >
      {inner}
    </p>
  )
}

function CardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col" aria-busy="true">
      <div className="h-6 w-40 rounded-full bg-slate-100" />
      <div className="mt-4 h-7 w-3/4 rounded bg-slate-100" />
      <div className="mt-3 h-4 w-full rounded bg-slate-100" />
      <div className="mt-6 h-10 w-40 rounded bg-slate-100" />
      <div className="mt-6 space-y-3">
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

export type DesktopCardVariant = {
  cardId: string
  defaultCopy: Pick<MkComparePurchaseCardCopy, 'title' | 'description' | 'detailsButtonLabel'>
  errorTitle: string
  errorMessage: string
  /** WINDOWS: public .exe, MACOS: public https .dmg; ürün kaydında yoksa indirme bağlantısı üretilmez. */
  installer: 'exe' | 'dmg'
}

export const WINDOWS_CARD_VARIANT: DesktopCardVariant = {
  cardId: MK_COMPARE_CARD_DESKTOP_ID,
  defaultCopy: {
    title: 'Müvekkil Kasa Defteri Masaüstü',
    description:
      'Tek bilgisayarda çalışan, kurulum ile kullanılan masaüstü sürüm. Basit müvekkil kasa takibi için uygundur.',
    detailsButtonLabel: 'Masaüstü Detaylarını Gör',
  },
  errorTitle: 'Masaüstü ürünü yüklenemedi',
  errorMessage: 'Masaüstü ürün bilgileri alınamadı.',
  installer: 'exe',
}

export const MACOS_CARD_VARIANT: DesktopCardVariant = {
  cardId: MK_COMPARE_CARD_MACOS_ID,
  defaultCopy: DEFAULT_MK_COMPARE_MACOS_COPY,
  errorTitle: 'macOS ürünü yüklenemedi',
  errorMessage: 'macOS ürün bilgileri alınamadı.',
  installer: 'dmg',
}

export function DesktopCard({
  query,
  onShowDetails,
  copy,
  focus,
  variant = WINDOWS_CARD_VARIANT,
}: {
  query: Query
  onShowDetails: () => void
  copy?: MkComparePurchaseCardCopy
  focus: ReferralCardFocus
  variant?: DesktopCardVariant
}) {
  const [feedback, setFeedback] = useState<'added' | 'in-cart' | null>(null)
  const product = query.data

  if (query.isPending) return <CardSkeleton />
  if (query.isError || !product) {
    return (
      <ErrorState
        title={variant.errorTitle}
        message={getErrorMessage(query.error, variant.errorMessage)}
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
  const isTarget = focus === 'target'

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
    <article id={variant.cardId} className="flex scroll-mt-24 flex-col">
      {isTarget ? <ReferralProductBadge tone="emerald" /> : null}
      <h2 className="text-xl font-bold tracking-tight text-slate-950">
        {copy?.title?.trim() || variant.defaultCopy.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {copy?.description?.trim() || variant.defaultCopy.description}
      </p>

      <div className="mt-5">
        {hasPrice ? (
          <div>
            <LaunchPriceLabel />
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
            <p className="mt-1 text-sm text-slate-500">{MK_COMPARE_DESKTOP_LICENSE_CAPTION}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Fiyat ürün detayında belirtilir.</p>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-100/80 bg-emerald-50/60 px-4 py-3 text-sm leading-relaxed text-slate-700">
        <ul className="space-y-1">
          {desktopDeliveryNotes(product).map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>

      <div className="mt-5 space-y-2.5">
        {feedback ? (
          <CartAddedFeedback
            message={feedback === 'in-cart' ? 'Bu ürün zaten sepetinizde.' : 'Ürün sepete eklendi.'}
            onContinue={() => setFeedback(null)}
          />
        ) : null}
        <DesktopTrialCta
          label={copy?.demoButtonLabel?.trim() || MK_COMPARE_TRIAL_CTA_LABEL}
          download={
            variant.installer === 'dmg'
              ? getMuvekkilKasaMacosTrialDownload(product)
              : getMuvekkilKasaDesktopTrialDownload(product)
          }
        />
        <button
          type="button"
          onClick={onShowDetails}
          className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
        >
          {copy?.detailsButtonLabel?.trim() || variant.defaultCopy.detailsButtonLabel}
        </button>
        {canPurchase && !feedback && isTarget ? <ReferralCartHint tone="emerald" /> : null}
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

export function SaasCard({
  query,
  onShowDetails,
  copy,
  focus,
}: {
  query: Query
  onShowDetails: () => void
  copy?: MkComparePurchaseCardCopy
  focus: ReferralCardFocus
}) {
  const ctx = useMkSaasProductPageContext()
  const product = query.data

  if (query.isPending) return <CardSkeleton />
  if (query.isError || !product) {
    return (
      <ErrorState
        title="Web tabanlı ürün yüklenemedi"
        message={getErrorMessage(query.error, 'Web tabanlı ürün bilgileri alınamadı.')}
        action={<RetryAction onRetry={() => query.refetch()} />}
      />
    )
  }

  const canPurchase = canPurchaseProduct(product)
  const unitPrice = product.price
  const hasPrice = Number.isFinite(unitPrice) && unitPrice > 0
  const strikeUnit =
    product.originalPrice != null && product.originalPrice > unitPrice ? product.originalPrice : null
  const campaignBadge = product.campaign?.badge?.trim() || (product.campaign ? 'Kampanyalı' : null)
  const isTarget = focus === 'target'

  return (
    <article id={MK_COMPARE_CARD_SAAS_ID} className="flex scroll-mt-24 flex-col">
      {isTarget ? <ReferralProductBadge tone="sky" /> : null}
      {copy?.extraBadge?.trim() !== '' ? (
        <span className="mb-3 inline-flex w-fit items-center rounded-full bg-sky-600 px-2.5 py-1 text-[11px] font-semibold text-white">
          {copy?.extraBadge?.trim() || 'En kapsamlı'}
        </span>
      ) : null}
      <h2 className="text-xl font-bold tracking-tight text-slate-950">
        {copy?.title?.trim() || 'Müvekkil Kasa Defteri Web Tabanlı'}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {copy?.description?.trim() ||
          'Kurulum gerektirmeden tarayıcı üzerinden erişilen, büro içi ekip kullanımı ve kapsamlı takip sunan web tabanlı sürüm.'}
      </p>

      <div className="mt-5">
        {hasPrice ? (
          <div>
            <LaunchPriceLabel />
            {campaignBadge ? (
              <span className="mb-2 inline-flex rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                {campaignBadge}
              </span>
            ) : null}
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="text-3xl font-black tabular-nums tracking-tight text-slate-950 sm:text-4xl">
                {formatMkSaasTryMoney(unitPrice, product.currency)}
              </p>
              {strikeUnit != null ? (
                <p className="text-base text-slate-400 line-through tabular-nums">
                  {formatMkSaasTryMoney(strikeUnit, product.currency)}
                </p>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-slate-500">{MK_COMPARE_SAAS_LICENSE_CAPTION}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Fiyat ürün detayında belirtilir.</p>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-sky-100/80 bg-sky-50/70 px-4 py-3 text-sm leading-relaxed text-slate-700">
        <ul className="space-y-1">
          {webDeliveryNotes().map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>

      <div className="mt-5 space-y-2.5">
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
          {copy?.demoButtonLabel?.trim() || MK_COMPARE_TRIAL_CTA_LABEL}
        </button>
        <button
          type="button"
          onClick={onShowDetails}
          className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
        >
          {copy?.detailsButtonLabel?.trim() || 'Web Tabanlı Detaylarını Gör'}
        </button>
        {canPurchase && !ctx.feedback && isTarget ? <ReferralCartHint tone="sky" /> : null}
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
