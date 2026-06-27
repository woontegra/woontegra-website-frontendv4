import { Link } from 'react-router-dom'
import { KeyRound, Mail, ShieldCheck } from 'lucide-react'
import { CartAddedFeedback } from '@/components/public/CartAddedFeedback'
import { ProductFreeDownloadButton } from '@/components/public/product/ProductFreeDownloadButton'
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
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
        <ShieldCheck className="h-4 w-4" aria-hidden />
        {isFreeDownload ? 'Ücretsiz indirme' : 'Satın alma'}
      </div>

      <div className="mt-4">
        {isFreeDownload ? (
          <p className="text-2xl font-bold text-emerald-700">Ücretsiz</p>
        ) : hasPrice ? (
          <>
            {campaignBadge ? (
              <span className="mb-2 inline-flex rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                {campaignBadge}
              </span>
            ) : null}
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight text-slate-900">{formatMoney(totalPrice, product.currency)}</p>
              {strikePrice != null ? (
                <p className="text-lg text-slate-400 line-through">{formatMoney(strikePrice, product.currency)}</p>
              ) : null}
            </div>
            {product.campaign?.endsAt ? (
              <p className="mt-1 text-xs text-rose-600">
                Kampanya bitiş tarihi: {formatCampaignDate(product.campaign.endsAt)}
              </p>
            ) : null}
            {isSaas && webUsageYears > 1 ? (
              <p className="mt-1 text-sm text-slate-500">
                {formatMoney(unitPrice, product.currency)} / yıl × {webUsageYears} yıl
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-500">KDV dahil</p>
            )}
          </>
        ) : (
          <p className="text-sm font-medium text-slate-600">Fiyat için teklif alın</p>
        )}
      </div>

      {isSaas && canPurchase ? (
        <div className="mt-4">
          <label htmlFor="saas-years" className="text-sm font-medium text-slate-800">
            Kullanım süresi
          </label>
          <select
            id="saas-years"
            value={webUsageYears}
            onChange={(e) => onWebUsageYearsChange(Number(e.target.value))}
            className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((y) => (
              <option key={y} value={y}>
                {y} yıl{product.licenseMonths ? ` (${product.licenseMonths * y} ay)` : ''}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {product.licenseRequired ? (
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
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
        <p className="mt-4 text-sm text-slate-600">Ödeme sonrası indirme bilgileri e-posta ile gönderilir.</p>
      ) : null}

      {isFreeDownload && !product.licenseRequired ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-950">
          Ücretsiz Windows aracıdır. Verileriniz bilgisayarınızda kalır; Woontegra sunucularına gönderilmez.
        </p>
      ) : null}

      {isFreeDownload && publicDownloadFiles.length === 0 ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Ücretsiz indirme bağlantısı henüz tanımlı değil.
        </p>
      ) : null}

      <div className="mt-5 space-y-3">
        {isFreeDownload && publicDownloadFiles.length > 0 ? (
          <div className="flex flex-wrap gap-3">
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
          <button
            type="button"
            onClick={onAddToCart}
            className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Sepete Ekle
          </button>
        ) : showQuote ? (
          <Link
            to={teklifHref}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Mail className="h-4 w-4" aria-hidden />
            Teklif Al
          </Link>
        ) : null}

        {canPurchase && !feedback ? (
          <Link to="/sepet" className="block text-center text-sm font-medium text-emerald-700 hover:underline">
            Sepete git
          </Link>
        ) : null}
      </div>

      {canPurchase ? (
        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          Dijital ürün teslimatı e-posta ile yapılır. Ödeme adımında fatura ve yasal onaylar tamamlanır.
        </p>
      ) : null}
    </div>
  )
}
