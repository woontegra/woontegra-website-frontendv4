import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, CreditCard, X } from 'lucide-react'
import { PaytrIframe } from '@/components/payment/PaymentPanels'
import { Button } from '@/components/ui/Button'
import { customersService, getErrorMessage } from '@/services/customersService'
import { paymentsService } from '@/services/paymentsService'
import type { CustomerSaasMembershipRow, SaasRenewQuote } from '@/types/customerSaasMembership'
import { LAST_ORDER_EMAIL_KEY, SAAS_RENEW_ORDER_KEY } from '@/types/orderSuccess'
import { ANNUAL_SAAS_RENEWAL_PERIOD, renewalPeriodLabel } from '@/lib/saasRenewalPeriod'
import { formatMoney } from '@/utils/formatMoney'

type Props = {
  membership: CustomerSaasMembershipRow
  onClose: () => void
  onOrderCreated: (orderNo: string) => void
}

export function SaasRenewModal({ membership, onClose, onOrderCreated }: Props) {
  const [paymentMethod, setPaymentMethod] = useState<'PAYTR' | 'BANK_TRANSFER'>('PAYTR')
  const [quote, setQuote] = useState<SaasRenewQuote | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(true)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [paytrOrderNo, setPaytrOrderNo] = useState<string | null>(null)
  const [iframeToken, setIframeToken] = useState<string | null>(null)

  const [acceptPre, setAcceptPre] = useState(false)
  const [acceptDistance, setAcceptDistance] = useState(false)
  const [acceptKvkk, setAcceptKvkk] = useState(false)
  const [acceptSaas, setAcceptSaas] = useState(false)
  const [acceptWaiver, setAcceptWaiver] = useState(false)

  const legalOk = acceptPre && acceptDistance && acceptKvkk && acceptSaas && acceptWaiver

  const bankQuery = useQuery({
    queryKey: ['payments', 'bank-transfer-display'],
    queryFn: () => paymentsService.getBankTransferDisplay(),
  })

  const havaleEnabled = bankQuery.data?.bankTransferEnabled === true

  useEffect(() => {
    if (!havaleEnabled && paymentMethod === 'BANK_TRANSFER') {
      setPaymentMethod('PAYTR')
    }
  }, [havaleEnabled, paymentMethod])

  useEffect(() => {
    let cancelled = false
    setQuoteLoading(true)
    setQuoteError(null)
    void customersService
      .getSaasRenewQuote(membership.id, ANNUAL_SAAS_RENEWAL_PERIOD)
      .then((q) => {
        if (!cancelled) setQuote(q)
      })
      .catch((e) => {
        if (!cancelled) setQuoteError(getErrorMessage(e, 'Fiyat alınamadı'))
      })
      .finally(() => {
        if (!cancelled) setQuoteLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [membership.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!legalOk || !quote) return
    if (paymentMethod === 'BANK_TRANSFER' && !havaleEnabled) {
      setSubmitError('Havale/EFT şu anda kullanılamıyor.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      const order = await customersService.createSaasRenewOrder(membership.id, {
        renewalPeriod: ANNUAL_SAAS_RENEWAL_PERIOD,
        paymentProvider: paymentMethod,
        acceptPreInfo: acceptPre,
        acceptDistanceSales: acceptDistance,
        acceptKvkk: acceptKvkk,
        acceptSaasSubscription: acceptSaas,
        acceptDigitalServiceWaiver: acceptWaiver,
      })

      try {
        sessionStorage.setItem(SAAS_RENEW_ORDER_KEY, order.orderNo)
        if (membership.ownerEmail?.trim()) {
          sessionStorage.setItem(LAST_ORDER_EMAIL_KEY, membership.ownerEmail.trim().toLowerCase())
        }
      } catch {
        /* ignore */
      }

      if (paymentMethod === 'BANK_TRANSFER' || order.paymentProvider === 'BANK_TRANSFER') {
        onOrderCreated(order.orderNo)
        return
      }

      const token = await paymentsService.startPaytr(order.orderNo)
      setPaytrOrderNo(order.orderNo)
      setIframeToken(token)
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Sipariş oluşturulamadı'))
    } finally {
      setSubmitting(false)
    }
  }

  if (iframeToken && paytrOrderNo) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="saas-renew-paytr-title"
      >
        <div className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 id="saas-renew-paytr-title" className="text-lg font-bold text-slate-900">
                Üyelik uzatma — kart ile ödeme
              </h3>
              <p className="mt-0.5 text-sm text-slate-600">Sipariş no: {paytrOrderNo}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <PaytrIframe orderNo={paytrOrderNo} token={iframeToken} />
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="saas-renew-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 id="saas-renew-title" className="text-lg font-bold text-slate-900">
              Üyeliği Uzat
            </h3>
            <p className="mt-0.5 text-sm text-slate-600">{membership.productName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5 px-5 py-5">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Uzatma süresi</p>
            <p className="mt-1 text-lg font-bold text-emerald-950">1 Yıllık Uzatma</p>
            <p className="mt-1 text-sm text-emerald-900/80">
              Mevcut üyelik sürenize {renewalPeriodLabel()} eklenecektir.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ödenecek tutar (yıllık)</p>
            {quoteLoading ? (
              <p className="mt-1 text-sm text-slate-500">Hesaplanıyor…</p>
            ) : quoteError ? (
              <p className="mt-1 text-sm text-red-700">{quoteError}</p>
            ) : quote ? (
              <p className="mt-1 text-2xl font-bold text-slate-900">{formatMoney(quote.total, quote.currency)}</p>
            ) : null}
            {quote ? <p className="mt-1 text-xs text-slate-500">{quote.lineLabel}</p> : null}
          </div>

          <fieldset>
            <legend className="text-sm font-semibold text-slate-800">Ödeme yöntemi</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                  paymentMethod === 'PAYTR' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="renewPayment"
                  checked={paymentMethod === 'PAYTR'}
                  onChange={() => setPaymentMethod('PAYTR')}
                  className="mt-0.5"
                />
                <span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <CreditCard className="h-4 w-4 shrink-0" aria-hidden />
                    Kredi / banka kartı (PayTR)
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">Anında onay</span>
                </span>
              </label>
              {havaleEnabled ? (
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                    paymentMethod === 'BANK_TRANSFER' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="renewPayment"
                    checked={paymentMethod === 'BANK_TRANSFER'}
                    onChange={() => setPaymentMethod('BANK_TRANSFER')}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Building2 className="h-4 w-4 shrink-0" aria-hidden />
                      Havale / EFT
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">Banka onayı sonrası uzatma</span>
                  </span>
                </label>
              ) : null}
            </div>
          </fieldset>

          <div className="space-y-2 text-sm text-slate-700">
            <label className="flex gap-2">
              <input type="checkbox" checked={acceptPre} onChange={(e) => setAcceptPre(e.target.checked)} className="mt-0.5" />
              <span>Ön bilgilendirme formunu okudum ve kabul ediyorum.</span>
            </label>
            <label className="flex gap-2">
              <input
                type="checkbox"
                checked={acceptDistance}
                onChange={(e) => setAcceptDistance(e.target.checked)}
                className="mt-0.5"
              />
              <span>Mesafeli satış sözleşmesini okudum ve kabul ediyorum.</span>
            </label>
            <label className="flex gap-2">
              <input type="checkbox" checked={acceptKvkk} onChange={(e) => setAcceptKvkk(e.target.checked)} className="mt-0.5" />
              <span>KVKK aydınlatma metnini okudum.</span>
            </label>
            <label className="flex gap-2">
              <input type="checkbox" checked={acceptSaas} onChange={(e) => setAcceptSaas(e.target.checked)} className="mt-0.5" />
              <span>SaaS abonelik koşullarını kabul ediyorum.</span>
            </label>
            <label className="flex gap-2">
              <input
                type="checkbox"
                checked={acceptWaiver}
                onChange={(e) => setAcceptWaiver(e.target.checked)}
                className="mt-0.5"
              />
              <span>Dijital hizmet tesliminde cayma hakkından feragat ediyorum.</span>
            </label>
          </div>

          {submitError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{submitError}</p>
          ) : null}

          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Vazgeç
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={!legalOk || quoteLoading || !!quoteError || submitting}
            >
              {submitting
                ? 'Oluşturuluyor…'
                : paymentMethod === 'BANK_TRANSFER'
                  ? 'Havale/EFT ile devam et'
                  : 'Kart ile öde'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
