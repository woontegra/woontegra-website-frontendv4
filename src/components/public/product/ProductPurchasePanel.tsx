import { Link } from 'react-router-dom'
import { KeyRound, Mail, ShieldCheck } from 'lucide-react'
import { CartAddedFeedback } from '@/components/public/CartAddedFeedback'
import { ProductFreeDownloadButton } from '@/components/public/product/ProductFreeDownloadButton'
import { SifreKasasiDownloadCounter } from '@/components/public/product/SifreKasasiDownloadCounter'
import { useBuilderEditContext } from '@/builder/edit/BuilderEditContext'
import type { PublicProductDetail } from '@/types/product'
import { formatMoney } from '@/types/product'
import { formatCampaignDate } from '@/types/campaign'
import { getPublicProductDownloadFiles } from '@/lib/freeProductDownload'
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
}

export function ProductPurchasePanel({
  product,
  webUsageYears,
  onWebUsageYearsChange,
  feedback,
  onFeedbackDismiss,
  onAddToCart,
}: Props) {
  const { annotateFields } = useBuilderEditContext()
  const canPurchase = canPurchaseProduct(product)
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

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/92 p-5 shadow-[0_28px_80px_-38px_rgba(15,23,42,0.5)] ring-1 ring-slate-900/5 backdrop-blur-xl sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/75 to-transparent" />
      <div className="relative flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
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
              <p className="text-4xl font-black tracking-tight text-slate-950">{formatMoney(totalPrice, product.currency)}</p>
              {strikePrice != null ? (
                <p className="text-lg text-slate-400 line-through">{formatMoney(strikePrice, product.currency)}</p>
              ) : null}
            </div>
            {product.campaign?.endsAt ? (
              <p className="mt-2 text-xs font-medium text-rose-600">
                Kampanya bitiş tarihi: {formatCampaignDate(product.campaign.endsAt)}
              </p>
            ) : null}
            {isSaas && webUsageYears > 1 ? (
              <p className="mt-2 text-sm text-slate-500">
                {formatMoney(unitPrice, product.currency)} / yıl × {webUsageYears} yıl
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
      </div>

      {isSaas && canPurchase ? (
        <div className="relative mt-5 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm">
          <label htmlFor="saas-years" className="text-sm font-semibold text-slate-800">
            Kullanım süresi
          </label>
          <select
            id="saas-years"
            value={webUsageYears}
            onChange={(e) => onWebUsageYearsChange(Number(e.target.value))}
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((y) => (
              <option key={y} value={y} className="text-slate-900">
                {y} yıl
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {product.licenseRequired ? (
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
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-sky-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-105"
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

        {canPurchase && !feedback && !annotateFields ? (
          <Link to="/sepet" className="block text-center text-sm font-medium text-emerald-700 underline-offset-4 hover:underline">
            Sepete git
          </Link>
        ) : null}
      </div>

      {canPurchase ? (
        <p className="relative mt-5 text-xs leading-relaxed text-slate-500">
          Dijital ürün teslimatı e-posta ile yapılır. Ödeme adımında fatura ve yasal onaylar tamamlanır.
        </p>
      ) : null}
    </div>
  )
}
