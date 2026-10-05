import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/api/client'
import { ordersService } from '@/services/ordersService'
import type { CouponQuote } from '@/types/checkout'
import { formatMoney } from '@/utils/formatMoney'

const STORAGE_KEY = 'woontegra.checkoutCouponCode'

export type CheckoutCouponItem = { productId: string; quantity: number }

function readStoredCouponCode(): string {
  try {
    return sessionStorage.getItem(STORAGE_KEY)?.trim().toUpperCase() || ''
  } catch {
    return ''
  }
}

function writeStoredCouponCode(code: string) {
  try {
    if (code) sessionStorage.setItem(STORAGE_KEY, code)
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function useCheckoutCoupon(
  items: CheckoutCouponItem[],
  customerEmail: string,
  options?: {
    scope?: string
    /** Kurum kampanyası aktifken kayıtlı kupon silinir ve sorgulanmaz. */
    suspended?: boolean
    /** Kampanya teklifi gelene kadar sorgu yapılmaz; kayıtlı kod silinmez. */
    held?: boolean
    validate?: (input: {
      couponCode: string
      items: CheckoutCouponItem[]
      customerEmail?: string
    }) => Promise<CouponQuote>
  },
) {
  const [appliedCode, setAppliedCode] = useState(readStoredCouponCode)
  const [draft, setDraft] = useState(appliedCode)
  const [emptyError, setEmptyError] = useState<string | null>(null)
  const itemKey = items.map((item) => `${item.productId}:${item.quantity}`).join('|')
  const email = customerEmail.trim().toLowerCase()
  const scope = options?.scope ?? ''
  const validate = options?.validate
  const suspended = options?.suspended === true
  const held = options?.held === true
  const couponPaused = suspended || held

  useEffect(() => {
    if (!suspended) return
    setEmptyError(null)
    setDraft('')
    setAppliedCode('')
  }, [suspended])

  const query = useQuery({
    queryKey: ['checkout-coupon', appliedCode, itemKey, email, scope],
    queryFn: () =>
      (validate ?? ordersService.validateCoupon)({
        couponCode: appliedCode,
        items,
        customerEmail: email || undefined,
      }),
    enabled: Boolean(appliedCode) && items.length > 0 && !couponPaused,
    retry: false,
  })

  const quote: CouponQuote | null = couponPaused ? null : (query.data ?? null)
  const error = couponPaused
    ? null
    : emptyError || (appliedCode && query.isError ? getErrorMessage(query.error, 'Kupon doğrulanamadı.') : null)
  const pending = !couponPaused && Boolean(appliedCode) && query.isFetching
  const blocksCheckout = !couponPaused && Boolean(appliedCode) && (pending || query.isError || !quote)

  useEffect(() => {
    writeStoredCouponCode(appliedCode)
  }, [appliedCode])

  function apply() {
    const next = draft.trim().toUpperCase()
    if (!next) {
      setEmptyError('Bu kupon bulunamadı.')
      setAppliedCode('')
      return
    }
    setEmptyError(null)
    setDraft(next)
    if (next === appliedCode) {
      void query.refetch()
      return
    }
    setAppliedCode(next)
  }

  function clear() {
    setEmptyError(null)
    setDraft('')
    setAppliedCode('')
  }

  return {
    draft,
    setDraft,
    apply,
    clear,
    appliedCode,
    quote,
    error,
    pending,
    blocksCheckout,
  }
}

export function CheckoutCouponBox({
  coupon,
  currency,
  className,
}: {
  coupon: ReturnType<typeof useCheckoutCoupon>
  currency: string
  className?: string
}) {
  return (
    <div className={className ?? 'mt-4 space-y-2 border-t border-slate-100 pt-4'}>
      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="checkout-coupon-code">
        Kupon kodu
      </label>
      <div className="flex gap-2">
        <input
          id="checkout-coupon-code"
          value={coupon.draft}
          onChange={(event) => coupon.setDraft(event.target.value.toUpperCase())}
          autoComplete="off"
          className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm uppercase tracking-wide"
          placeholder="Kupon kodu"
        />
        <button
          type="button"
          onClick={coupon.apply}
          disabled={coupon.pending}
          className="rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {coupon.pending ? '…' : 'Uygula'}
        </button>
      </div>
      {coupon.error ? <p className="text-sm text-red-700">{coupon.error}</p> : null}
      {coupon.quote ? (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium text-rose-800">Kupon indirimi</span>
          <span className="flex items-center gap-3">
            <span className="font-semibold text-rose-800">
              -{formatMoney(coupon.quote.discountAmount, currency)}
            </span>
            <button type="button" onClick={coupon.clear} className="text-xs font-medium text-slate-500 hover:underline">
              Kaldır
            </button>
          </span>
        </div>
      ) : null}
    </div>
  )
}
