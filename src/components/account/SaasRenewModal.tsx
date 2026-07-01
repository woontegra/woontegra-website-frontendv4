import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { customersService } from '@/services/customersService'
import type { CustomerSaasMembershipRow, SaasRenewQuote } from '@/types/customerSaasMembership'
import {
  DEFAULT_SAAS_RENEWAL_PERIOD,
  renewalPeriodLabel,
  SAAS_RENEWAL_PERIODS,
  type SaasRenewalPeriod,
} from '@/lib/saasRenewalPeriod'
import { formatMoney } from '@/utils/formatMoney'
import { getErrorMessage } from '@/services/customersService'

type Props = {
  membership: CustomerSaasMembershipRow
  onClose: () => void
  onOrderCreated: (orderNo: string) => void
}

export function SaasRenewModal({ membership, onClose, onOrderCreated }: Props) {
  const [period, setPeriod] = useState<SaasRenewalPeriod>(DEFAULT_SAAS_RENEWAL_PERIOD)
  const [quote, setQuote] = useState<SaasRenewQuote | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(true)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [acceptPre, setAcceptPre] = useState(false)
  const [acceptDistance, setAcceptDistance] = useState(false)
  const [acceptKvkk, setAcceptKvkk] = useState(false)
  const [acceptSaas, setAcceptSaas] = useState(false)
  const [acceptWaiver, setAcceptWaiver] = useState(false)

  const legalOk = acceptPre && acceptDistance && acceptKvkk && acceptSaas && acceptWaiver

  useEffect(() => {
    let cancelled = false
    setQuoteLoading(true)
    setQuoteError(null)
    void customersService
      .getSaasRenewQuote(membership.id, period)
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
  }, [membership.id, period])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!legalOk || !quote) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const order = await customersService.createSaasRenewOrder(membership.id, {
        renewalPeriod: period,
        paymentProvider: 'BANK_TRANSFER',
        acceptPreInfo: acceptPre,
        acceptDistanceSales: acceptDistance,
        acceptKvkk: acceptKvkk,
        acceptSaasSubscription: acceptSaas,
        acceptDigitalServiceWaiver: acceptWaiver,
      })
      onOrderCreated(order.orderNo)
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Sipariş oluşturulamadı'))
    } finally {
      setSubmitting(false)
    }
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
          <fieldset>
            <legend className="text-sm font-semibold text-slate-800">Uzatma süresi</legend>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SAAS_RENEWAL_PERIODS.map((p) => (
                <label
                  key={p}
                  className={`cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-semibold transition ${
                    period === p
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500/30'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="renewalPeriod"
                    value={p}
                    checked={period === p}
                    onChange={() => setPeriod(p)}
                    className="sr-only"
                  />
                  {renewalPeriodLabel(p)}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ödenecek tutar</p>
            {quoteLoading ? (
              <p className="mt-1 text-sm text-slate-500">Hesaplanıyor…</p>
            ) : quoteError ? (
              <p className="mt-1 text-sm text-red-700">{quoteError}</p>
            ) : quote ? (
              <p className="mt-1 text-2xl font-bold text-slate-900">{formatMoney(quote.total, quote.currency)}</p>
            ) : null}
            {quote ? <p className="mt-1 text-xs text-slate-500">{quote.lineLabel}</p> : null}
          </div>

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
              {submitting ? 'Oluşturuluyor…' : 'Havale/EFT ile devam et'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
