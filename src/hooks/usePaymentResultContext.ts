import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { ordersService } from '@/services/ordersService'
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
        const data = await ordersService.getSuccess(orderNo, email || undefined)
        if (cancelled) return
        setOrderData(data)
      } catch {
        if (cancelled) return
        setOrderData(null)
        setOrderError('Sipariş özeti şu an yüklenemedi. Referans numaranızı not alıp e-postanızı kontrol edebilirsiniz.')
      } finally {
        if (!cancelled) setOrderLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [orderNo, email, fetchToken])

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
