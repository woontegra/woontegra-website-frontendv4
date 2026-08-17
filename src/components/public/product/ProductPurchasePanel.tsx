import { Link } from 'react-router-dom'
import { useState } from 'react'
import { KeyRound, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { CartAddedFeedback } from '@/components/public/CartAddedFeedback'
import { ProductFreeDownloadButton } from '@/components/public/product/ProductFreeDownloadButton'
import { SifreKasasiDownloadCounter } from '@/components/public/product/SifreKasasiDownloadCounter'
import { MkSaasDemoRequestModal } from '@/components/public/product/MkSaasDemoRequestModal'
import { useBuilderEditContext } from '@/builder/edit/BuilderEditContext'
import { useCustomerSession } from '@/hooks/useCustomerSession'
import type { PublicProductDetail } from '@/types/product'
import { formatMoney } from '@/types/product'

/** MK SaaS satış sayfası: TRY fiyatını `3.000,00 ₺` biçiminde gösterir. */
export function formatMkSaasTryMoney(amount: number, currency = 'TRY'): string {
  if (currency.toUpperCase() === 'TRY') {
    const number = new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
    return `${number} ₺`
  }
  return formatMoney(amount, currency)
}
import { formatCampaignDate } from '@/types/campaign'
import { getPublicProductDownloadFiles } from '@/lib/freeProductDownload'
import { isMuvekkilKasaSaasProduct } from '@/lib/muvekkilKasaSaasProduct'
import {
  canPurchaseProduct,
  isFreeDownloadProduct,
  isSaasSubscriptionProduct,
  licenseDisplayLabel,
  shouldShowQuoteCta,
} from '@/utils/productPurchase'

type Props = {
  product: PublicProductDetail
  webUsageYears: number
  onWebUsageYearsChange: (years: number) => void
  feedback: 'added' | 'in-cart' | null
  onFeedbackDismiss: () => void
  onAddToCart: () => void
  variant?: 'default' | 'mkSaasSales'
  onOpenDemo?: () => void
}

export function ProductPurchasePanel({
  product,
  webUsageYears,
  onWebUsageYearsChange,
  feedback,
  onFeedbackDismiss,
  onAddToCart,
  variant = 'default',
  onOpenDemo,
}: Props) {
  const { annotateFields } = useBuilderEditContext()
  const { authed, profile } = useCustomerSession()
  const [demoOpenInternal, setDemoOpenInternal] = useState(false)
  const demoOpen = onOpenDemo ? false : demoOpenInternal
  const openDemo = onOpenDemo ?? (() => setDemoOpenInternal(true))
  const closeDemo = () => {
    if (onOpenDemo) return
    setDemoOpenInternal(false)
  }
  const isMkSaasSales = variant === 'mkSaasSales'
  const canPurchase = canPurchaseProduct(product)
  const isMkSaas = isMuvekkilKasaSaasProduct({
    slug: product.slug,
    productType: product.productType,
  })
  const isFreeDownload = isFreeDownloadProduct(product)
  const showQuote = shouldShowQuoteCta(product)
  const isSaas = isSaasSubscriptionProduct(product.productType)
  const teklifHref = `/iletisim?konu=${encodeURIComponent(`Teklif: ${product.name}`)}`

  const unitPrice = product.price
  const totalPrice = isSaas ? unitPrice * webUsageYears : unitPrice
  const hasPrice = Number.isFinite(totalPrice) && totalPrice > 0
  const strikePrice =
    product.originalPrice != null && product.originalPrice > unitPrice ? product.originalPrice : null
  const campaignBadge = product.campaign?.badge?.trim() || (product.campaign ? 'Kampanyalı' : null)
  const publicDownloadFiles = getPublicProductDownloadFiles(product)

  const saasYearsId = isMkSaasSales ? 'mk-saas-years' : 'saas-years'

  const formatPrice = isMkSaasSales ? formatMkSaasTryMoney : formatMoney

  const mkSaasFeatures = [
    'Dijital teslimat',
    product.licenseDays != null && product.licenseDays > 0
      ? `Lisans süresi: ${product.licenseDays} gün`
      : 'Yıllık lisans süresi',
    'Tüm kasa ve dosya özellikleri',
    'Çoklu kullanıcı erişimi',
    'WhatsApp Business bağlantısı',
    'Güncellemeler ve destek',
  ]

  const cardClass = isMkSaasSales
    ? 'relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-6'
    : 'relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/92 p-5 shadow-[0_28px_80px_-38px_rgba(15,23,42,0.5)] ring-1 ring-slate-900/5 backdrop-blur-xl sm:p-6'

  return (
    <div className={cardClass}>
      {!isMkSaasSales ? (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_32%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/75 to-transparent" />
        </>
      ) : null}
      <div
        className={`relative flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] ${isMkSaasSales ? 'text-sky-700' : 'text-emerald-700'}`}
      >
        <ShieldCheck className="h-4 w-4" aria-hidden />
        {isFreeDownload ? 'Ücretsiz indirme' : 'Satın alma'}
      </div>

      <div className="relative mt-5">
        {isFreeDownload ? (
          <p className="text-3xl font-bold tracking-tight text-emerald-700">Ücretsiz</p>
        ) : hasPrice ? (
          <>
            {campaignBadge ? (
              <span className="mb-3 inline-flex rounded-full border border-rose-200 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-700">
                {campaignBadge}
              </span>
            ) : null}
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="text-4xl font-black tracking-tight text-slate-950">{formatPrice(totalPrice, product.currency)}</p>
              {strikePrice != null ? (
                <p className="text-lg text-slate-400 line-through">{formatPrice(strikePrice, product.currency)}</p>
              ) : null}
            </div>
            {product.campaign?.endsAt ? (
              <p className="mt-2 text-xs font-medium text-rose-600">
                Kampanya bitiş tarihi: {formatCampaignDate(product.campaign.endsAt)}
              </p>
            ) : null}
            {isSaas && webUsageYears > 1 ? (
              <p className="mt-2 text-sm text-slate-500">
                {formatPrice(unitPrice, product.currency)} / yıl × {webUsageYears} yıl
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-500">KDV dahil</p>
            )}
          </>
        ) : (
          <p className="text-sm font-medium text-slate-600">Fiyat için teklif alın</p>
        )}
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-3">
        {!isMkSaasSales ? (
          <>
            <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Teslimat</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {isFreeDownload ? 'Anında erişim' : product.productType === 'SERVICE' ? 'Planlı teslimat' : 'Dijital teslimat'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Lisans tipi</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{licenseDisplayLabel(product)}</p>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Teslimat</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">Dijital teslimat</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Lisans</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {product.licenseDays != null && product.licenseDays > 0
                  ? `${product.licenseDays} gün`
                  : 'Yıllık'}
              </p>
            </div>
          </>
        )}
      </div>

      {isSaas && canPurchase ? (
        <div className="relative mt-5 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm">
          <label htmlFor={saasYearsId} className="text-sm font-semibold text-slate-800">
            Kullanım süresi
          </label>
          <select
            id={saasYearsId}
            value={webUsageYears}
            onChange={(e) => onWebUsageYearsChange(Number(e.target.value))}
            className={`mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:ring-2 ${isMkSaasSales ? 'focus:border-sky-500 focus:ring-sky-100' : 'focus:border-emerald-500 focus:ring-emerald-100'}`}
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((y) => (
              <option key={y} value={y} className="text-slate-900">
                {y} yıl
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {isMkSaasSales && canPurchase ? (
        <ul className="relative mt-5 space-y-2 text-sm text-slate-600">
          {mkSaasFeatures.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      {product.licenseRequired && !isMkSaasSales ? (
        <ul className="relative mt-5 space-y-2.5 rounded-2xl border border-emerald-100/80 bg-emerald-50/70 p-4 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
            <span>
              {licenseDisplayLabel(product)} — dijital teslimat; lisans bilgileri ödeme sonrası e-posta ile gönderilir.
            </span>
          </li>
          {product.licenseDays != null && product.licenseDays > 0 ? (
            <li>Lisans süresi: {product.licenseDays} gün</li>
          ) : null}
          {product.licenseMaxDevices != null && product.licenseMaxDevices > 0 ? (
            <li>Cihaz hakkı: {product.licenseMaxDevices}</li>
          ) : null}
        </ul>
      ) : product.productType === 'DOWNLOAD' && product.hasDownload && !isFreeDownload ? (
        <p className="relative mt-5 rounded-2xl border border-slate-200/80 bg-white/75 px-4 py-3 text-sm text-slate-600 shadow-sm">
          Ödeme sonrası indirme bilgileri e-posta ile gönderilir.
        </p>
      ) : null}

      {isFreeDownload && !product.licenseRequired ? (
        <p className="relative mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
          Ücretsiz Windows aracıdır. Verileriniz bilgisayarınızda kalır; Woontegra sunucularına gönderilmez.
        </p>
      ) : null}

      {isFreeDownload && publicDownloadFiles.length === 0 ? (
        <p className="relative mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Ücretsiz indirme bağlantısı henüz tanımlı değil.
        </p>
      ) : null}

      {isFreeDownload && product.slug === 'sifre-kasasi' ? <SifreKasasiDownloadCounter /> : null}

      <div className="relative mt-6 space-y-3">
        {isFreeDownload && publicDownloadFiles.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {publicDownloadFiles.map((file) => (
              <ProductFreeDownloadButton key={`${file.type ?? file.label}-${file.downloadPath}`} file={file} />
            ))}
          </div>
        ) : null}
        {feedback ? (
          <CartAddedFeedback
            message={feedback === 'in-cart' ? 'Bu ürün zaten sepetinizde.' : 'Ürün sepete eklendi.'}
            onContinue={onFeedbackDismiss}
          />
        ) : canPurchase ? (
          annotateFields ? (
            <span className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-sky-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20">
              Sepete Ekle
            </span>
          ) : (
            <button
              type="button"
              onClick={onAddToCart}
              className={`w-full rounded-2xl px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-105 ${
                isMkSaasSales
                  ? 'bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 shadow-sky-500/20'
                  : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-sky-500 shadow-emerald-500/20'
              }`}
            >
              Sepete Ekle
            </button>
          )
        ) : showQuote ? (
          annotateFields ? (
            <span className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 shadow-sm">
              <Mail className="h-4 w-4" aria-hidden />
              Teklif Al
            </span>
          ) : (
            <Link
              to={teklifHref}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              <Mail className="h-4 w-4" aria-hidden />
              Teklif Al
            </Link>
          )
        ) : null}

        {isMkSaas && canPurchase && !feedback && !annotateFields ? (
          <button
            type="button"
            onClick={openDemo}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3.5 text-sm font-semibold shadow-sm transition ${
              isMkSaasSales
                ? 'border-slate-200 bg-white text-slate-800 hover:border-sky-200 hover:bg-sky-50'
                : 'border-sky-200 bg-sky-50 text-sky-900 hover:border-sky-300 hover:bg-sky-100'
            }`}
          >
            <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
            {isMkSaasSales ? '7 Gün Ücretsiz Dene' : 'Demo Talep Et'}
          </button>
        ) : null}

        {canPurchase && !feedback && !annotateFields ? (
          <Link
            to="/sepet"
            className={`block text-center text-sm font-medium underline-offset-4 hover:underline ${isMkSaasSales ? 'text-sky-700' : 'text-emerald-700'}`}
          >
            Sepete git
          </Link>
        ) : null}
      </div>

      {canPurchase ? (
        <p className="relative mt-5 text-xs leading-relaxed text-slate-500">
          Dijital ürün teslimatı e-posta ile yapılır. Ödeme adımında fatura ve yasal onaylar tamamlanır.
        </p>
      ) : null}

      {!onOpenDemo ? (
        <MkSaasDemoRequestModal
          open={demoOpen}
          onClose={closeDemo}
          defaultEmail={authed ? profile?.email ?? '' : ''}
          defaultName={authed ? profile?.name ?? '' : ''}
          defaultPhone={authed ? profile?.phone ?? '' : ''}
        />
      ) : null}
    </div>
  )
}
