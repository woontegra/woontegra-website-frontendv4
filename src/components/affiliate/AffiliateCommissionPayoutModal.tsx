import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { formatAffiliateDateTime, formatAffiliateTry } from '@/lib/affiliateMoney'
import { affiliateSaleTypeLabel } from '@/lib/affiliateUiLabels'
import {
  adminAffiliatePartnersService,
  getErrorMessage,
} from '@/services/adminAffiliatePartnersService'
import type { AffiliateEarnedForPayoutItem } from '@/types/affiliatePartner'

type PaymentMethod = 'BANK_TRANSFER' | 'CASH' | 'OTHER'

type PayoutFormState = {
  paymentMethod: PaymentMethod
  reference: string
  notes: string
  paidAt: string
}

const emptyForm: PayoutFormState = {
  paymentMethod: 'BANK_TRANSFER',
  reference: '',
  notes: '',
  paidAt: '',
}

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'BANK_TRANSFER', label: 'Havale / EFT' },
  { value: 'CASH', label: 'Nakit' },
  { value: 'OTHER', label: 'Diğer' },
]

function parseTlToKurus(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s/g, '').replace(',', '.')
  if (!cleaned) return null
  const n = Number(cleaned)
  if (!Number.isFinite(n) || n < 0) return null
  return Math.round(n * 100)
}

function kurusToTlInput(kurus: number): string {
  return (kurus / 100).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function makeIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `pay_${crypto.randomUUID().replace(/-/g, '')}`.slice(0, 80)
  }
  return `pay_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`
}

type Props = {
  open: boolean
  partnerId: string
  onClose: () => void
  onSuccess: () => void
  onError: (message: string) => void
}

export function AffiliateCommissionPayoutModal({
  open,
  partnerId,
  onClose,
  onSuccess,
  onError,
}: Props) {
  const [earnedLoading, setEarnedLoading] = useState(false)
  const [earnedItems, setEarnedItems] = useState<AffiliateEarnedForPayoutItem[]>([])
  const [allocationTlById, setAllocationTlById] = useState<Record<string, string>>({})
  const [form, setForm] = useState<PayoutFormState>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [idempotencyKey, setIdempotencyKey] = useState('')

  useEffect(() => {
    if (!open || !partnerId) return
    let cancelled = false
    setForm(emptyForm)
    setAllocationTlById({})
    setIdempotencyKey(makeIdempotencyKey())
    setEarnedLoading(true)
    void (async () => {
      try {
        const { items } = await adminAffiliatePartnersService.listEarnedForPayout(partnerId)
        if (cancelled) return
        setEarnedItems(items)
        const initial: Record<string, string> = {}
        for (const c of items) {
          initial[c.id] = kurusToTlInput(c.remainingAmountKurus)
        }
        setAllocationTlById(initial)
      } catch (e) {
        if (!cancelled) {
          onError(getErrorMessage(e))
          setEarnedItems([])
        }
      } finally {
        if (!cancelled) setEarnedLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // onError kasıtlı olarak bağımlılıktan çıkarıldı (her render yeni fonksiyon → döngü)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, partnerId])

  const pendingTotalKurus = useMemo(
    () => earnedItems.reduce((sum, c) => sum + c.remainingAmountKurus, 0),
    [earnedItems],
  )

  const payoutAllocations = useMemo(() => {
    const rows: Array<{ commissionId: string; amountKurus: number }> = []
    for (const c of earnedItems) {
      const kurus = parseTlToKurus(allocationTlById[c.id] ?? '')
      if (kurus == null || kurus <= 0) continue
      rows.push({ commissionId: c.id, amountKurus: kurus })
    }
    return rows
  }, [earnedItems, allocationTlById])

  const selectedPayoutTotal = useMemo(
    () => payoutAllocations.reduce((sum, a) => sum + a.amountKurus, 0),
    [payoutAllocations],
  )

  if (!open) return null

  const submit = async () => {
    if (payoutAllocations.length === 0) {
      onError('En az bir komisyon için ödeme tutarı girin')
      return
    }
    for (const a of payoutAllocations) {
      const c = earnedItems.find((x) => x.id === a.commissionId)
      if (!c) continue
      if (a.amountKurus > c.remainingAmountKurus) {
        onError('Ödeme tutarı kalan bakiyeyi aşamaz')
        return
      }
    }
    setSubmitting(true)
    try {
      await adminAffiliatePartnersService.createPayout(partnerId, {
        allocations: payoutAllocations,
        paymentMethod: form.paymentMethod,
        reference: form.reference.trim() || undefined,
        notes: form.notes.trim() || undefined,
        paidAt: form.paidAt.trim() ? new Date(form.paidAt).toISOString() : undefined,
        idempotencyKey: idempotencyKey || makeIdempotencyKey(),
      })
      onSuccess()
      onClose()
    } catch (e) {
      onError(getErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-slate-200 bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="affiliate-payout-title"
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 id="affiliate-payout-title" className="text-base font-semibold text-slate-900">
            Komisyon Ödemesi Yap
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Yalnız hak edilmiş bekleyen tutarlar kaydedilir; otomatik banka transferi yapılmaz.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {earnedLoading ? <LoadingState label="Bekleyen komisyonlar yükleniyor…" /> : null}
          {!earnedLoading && earnedItems.length === 0 ? (
            <p className="text-sm text-slate-600">Ödenecek kalan komisyon yok.</p>
          ) : null}
          {!earnedLoading && earnedItems.length > 0 ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="text-slate-600">Toplam bekleyen komisyon</span>
                  <span className="font-semibold tabular-nums text-slate-900">
                    {formatAffiliateTry(pendingTotalKurus)}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap justify-between gap-2">
                  <span className="text-slate-600">Bu ödemede toplam</span>
                  <span className="font-semibold tabular-nums text-emerald-800">
                    {formatAffiliateTry(selectedPayoutTotal)}
                  </span>
                </div>
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900">Komisyon bazlı ödeme</p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const next: Record<string, string> = {}
                        for (const c of earnedItems) {
                          next[c.id] = kurusToTlInput(c.remainingAmountKurus)
                        }
                        setAllocationTlById(next)
                      }}
                    >
                      Kalanların tamamı
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const next: Record<string, string> = {}
                        for (const c of earnedItems) next[c.id] = ''
                        setAllocationTlById(next)
                      }}
                    >
                      Temizle
                    </Button>
                  </div>
                </div>
                <ul className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-2">
                  {earnedItems.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-lg border border-slate-100 bg-white px-3 py-2.5 text-sm"
                    >
                      <p className="text-[12px] text-slate-500">
                        {formatAffiliateDateTime(c.createdAt)} · {affiliateSaleTypeLabel(c.saleType)} ·{' '}
                        {c.productName || c.orderNo}
                      </p>
                      <div className="mt-1.5 grid gap-1 text-[12px] text-slate-600 sm:grid-cols-3">
                        <span>
                          Hak edilen:{' '}
                          <strong className="text-slate-900">
                            {formatAffiliateTry(c.commissionAmountKurus)}
                          </strong>
                        </span>
                        <span>
                          Ödenen:{' '}
                          <strong className="text-slate-900">
                            {formatAffiliateTry(c.paidAmountKurus)}
                          </strong>
                        </span>
                        <span>
                          Kalan:{' '}
                          <strong className="text-slate-900">
                            {formatAffiliateTry(c.remainingAmountKurus)}
                          </strong>
                        </span>
                      </div>
                      <label className="mt-2 block">
                        <span className="mb-1 block text-xs font-medium text-slate-600">
                          Bu ödemede (TL)
                        </span>
                        <input
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          inputMode="decimal"
                          value={allocationTlById[c.id] ?? ''}
                          onChange={(e) =>
                            setAllocationTlById((prev) => ({
                              ...prev,
                              [c.id]: e.target.value,
                            }))
                          }
                          placeholder={kurusToTlInput(c.remainingAmountKurus)}
                        />
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Ödeme yöntemi</span>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.paymentMethod}
                    onChange={(e) => {
                      const v = e.target.value
                      if (v === 'BANK_TRANSFER' || v === 'CASH' || v === 'OTHER') {
                        setForm((f) => ({ ...f, paymentMethod: v }))
                      }
                    }}
                  >
                    {PAYMENT_METHOD_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Referans</span>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.reference}
                    onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                    placeholder="Dekont no vb."
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">
                    Ödeme tarihi (opsiyonel)
                  </span>
                  <input
                    type="datetime-local"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.paidAt}
                    onChange={(e) => setForm((f) => ({ ...f, paidAt: e.target.value }))}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Açıklama</span>
                  <textarea
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  />
                </label>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            İptal
          </Button>
          <Button
            type="button"
            disabled={submitting || payoutAllocations.length === 0}
            onClick={() => void submit()}
          >
            {submitting
              ? 'Kaydediliyor…'
              : `Ödemeyi kaydet (${formatAffiliateTry(selectedPayoutTotal)})`}
          </Button>
        </div>
      </div>
    </div>
  )
}
