import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { ordersService } from '@/services/ordersService'
import { bilirkisiHesapService } from '@/services/bilirkisiHesapService'
import {
  LAST_ORDER_EMAIL_KEY,
  type OrderSuccessData,
  type PaymentResultLocationState,
} from '@/types/orderSuccess'

export type PaymentResultContext = {
  orderNo: string
  email: string
  productName: string
  amount: number | null
  currency: string
  orderData: OrderSuccessData | null
  orderLoading: boolean
  orderError: string | null
  refetchOrder: () => void
}

function readStoredEmail(): string {
  try {
    return sessionStorage.getItem(LAST_ORDER_EMAIL_KEY)?.trim() ?? ''
  } catch {
    return ''
  }
}

function parseAmount(raw: string | null | undefined): number | null {
  if (!raw?.trim()) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

function looksLikeBhMerchantOid(oid: string): boolean {
  const s = oid.trim().toUpperCase()
  return s.startsWith('GUEST') || s.startsWith('BANK') || s.startsWith('ORDER') || s.startsWith('BH-')
}

export function usePaymentResultContext(): PaymentResultContext {
  const { orderNo: paramOrderNo } = useParams()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const state = (location.state ?? {}) as PaymentResultLocationState

  const orderNo = useMemo(() => {
    const fromParam = paramOrderNo?.trim()
    if (fromParam) return decodeURIComponent(fromParam)
    return (
      searchParams.get('orderNo')?.trim() ||
      searchParams.get('order')?.trim() ||
      searchParams.get('merchant_oid')?.trim() ||
      state.orderNo?.trim() ||
      ''
    )
  }, [paramOrderNo, searchParams, state.orderNo])

  const email = useMemo(
    () =>
      searchParams.get('email')?.trim() ||
      state.email?.trim() ||
      readStoredEmail() ||
      '',
    [searchParams, state.email],
  )

  const productName = useMemo(
    () => searchParams.get('product')?.trim() || state.productName?.trim() || '',
    [searchParams, state.productName],
  )

  const amount = useMemo(() => {
    const fromQuery = parseAmount(searchParams.get('value') ?? searchParams.get('amount'))
    if (fromQuery != null) return fromQuery
    if (typeof state.amount === 'number' && Number.isFinite(state.amount)) return state.amount
    return null
  }, [searchParams, state.amount])

  const currency = useMemo(
    () => searchParams.get('currency')?.trim() || state.currency?.trim() || 'TRY',
    [searchParams, state.currency],
  )

  const [orderData, setOrderData] = useState<OrderSuccessData | null>(null)
  const [orderLoading, setOrderLoading] = useState(Boolean(orderNo))
  const [orderError, setOrderError] = useState<string | null>(null)
  const [fetchToken, setFetchToken] = useState(0)

  const refetchOrder = useCallback(() => setFetchToken((k) => k + 1), [])

  useEffect(() => {
    if (!orderNo) {
      setOrderData(null)
      setOrderLoading(false)
      setOrderError(null)
      return
    }

    let cancelled = false
    setOrderLoading(true)
    setOrderError(null)

    void (async () => {
      try {
        if (looksLikeBhMerchantOid(orderNo)) {
          const raw = await bilirkisiHesapService.getPaymentPublicStatus(orderNo)
          if (cancelled) return
          const nested = (raw.data || raw) as {
            status?: string
            email?: string
            productType?: string
            finalPriceKurus?: number
            amount?: number
            fulfillmentStatus?: string
          }
          const status = String(nested.status || '').toLowerCase()
          const paid = status === 'success' || status === 'paid'
          const kurus = Number(nested.finalPriceKurus ?? nested.amount ?? 0)
          const amountTl = kurus > 1000 ? kurus / 100 : kurus
          if (paid) {
            setOrderData({
              status: 'PAID',
              orderNo,
              customerEmail: nested.email || email || '',
              productName: productName || `Bilirkişi Hesap (${nested.productType || 'abonelik'})`,
              paymentStatusLabel: 'Ödendi',
              lines: [
                {
                  productName: productName || `Bilirkişi Hesap (${nested.productType || 'abonelik'})`,
                  quantity: 1,
                  lineTotal: amountTl,
                },
              ],
              orderTotal: amountTl,
              currency: 'TRY',
              items: [
                {
                  productName: productName || `Bilirkişi Hesap (${nested.productType || 'abonelik'})`,
                  quantity: 1,
                  lineTotal: amountTl,
                  downloadUrl: null,
                },
              ],
              paidAt: new Date().toISOString(),
              message: 'Ödemeniz alındı. Panel erişim bilgileri e-posta ile iletilir.',
              paymentProvider: 'PAYTR',
              deliveryState: 'delivered',
            })
          } else {
            setOrderData({
              status: 'PENDING',
              message: 'Ödeme durumu kontrol ediliyor.',
              orderNo,
              customerEmail: nested.email || email || '',
              paymentStatusLabel: String(nested.status || 'Bekliyor'),
              paymentProvider: 'PAYTR',
              lines: [],
              orderTotal: amountTl,
              currency: 'TRY',
            })
          }
          return
        }

        const data = await ordersService.getSuccess(orderNo, email || undefined)
        if (cancelled) return
        setOrderData(data)
      } catch {
        if (cancelled) return
        setOrderData(null)
        setOrderError(
          'Sipariş özeti şu an yüklenemedi. Referans numaranızı not alıp e-postanızı kontrol edebilirsiniz.',
        )
      } finally {
        if (!cancelled) setOrderLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [orderNo, email, fetchToken, productName])

  return {
    orderNo,
    email,
    productName,
    amount,
    currency,
    orderData,
    orderLoading,
    orderError,
    refetchOrder,
  }
}
