import { LoadingState } from '@/components/public/LoadingState'
import { PaymentResultPanel } from '@/components/public/payment/PaymentResultLayout'
import type { PaymentResultContext } from '@/hooks/usePaymentResultContext'
import type { OrderSuccessData } from '@/types/orderSuccess'
import { formatMoney } from '@/utils/formatMoney'

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null
  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-200/80 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900 sm:text-right">{value}</dd>
    </div>
  )
}

function OrderLinesTable({ data }: { data: OrderSuccessData }) {
  if (!data.lines.length) return null
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-[280px] text-sm">
        <thead className="border-b border-slate-200 bg-white text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-2.5 font-semibold">Ürün</th>
            <th className="px-4 py-2.5 font-semibold">Adet</th>
            <th className="px-4 py-2.5 text-right font-semibold">Tutar</th>
          </tr>
        </thead>
        <tbody>
          {data.lines.map((row, i) => (
            <tr key={`${row.productName}-${i}`} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-3 font-medium text-slate-900">{row.productName}</td>
              <td className="px-4 py-3 text-slate-700">{row.quantity}</td>
              <td className="px-4 py-3 text-right text-slate-800">{formatMoney(row.lineTotal, data.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

type Props = {
  ctx: PaymentResultContext
}

export function PaymentOrderSummary({ ctx }: Props) {
  const { orderNo, email, productName, amount, currency, orderData, orderLoading, orderError } = ctx

  if (orderLoading && orderNo) {
    return (
      <PaymentResultPanel title="Sipariş özeti">
        <LoadingState label="Sipariş bilgileri yükleniyor…" />
      </PaymentResultPanel>
    )
  }

  const displayEmail = orderData?.customerEmail || email
  const displayProduct =
    orderData && 'productName' in orderData && orderData.productName
      ? orderData.productName
      : productName
  const displayTotal =
    orderData?.orderTotal ?? (amount != null ? amount : null)
  const displayCurrency = orderData?.currency ?? currency
  const displayOrderNo = orderData?.orderNo || orderNo

  const hasSummary = displayOrderNo || displayEmail || displayProduct || displayTotal != null

  if (!hasSummary && !orderError) return null

  return (
    <PaymentResultPanel title="Sipariş özeti">
      {orderError ? (
        <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {orderError}
        </p>
      ) : null}

      <dl>
        <DetailRow label="Sipariş no" value={displayOrderNo} />
        <DetailRow label="E-posta" value={displayEmail} />
        {displayProduct ? <DetailRow label="Ürün" value={displayProduct} /> : null}
        {displayTotal != null ? (
          <DetailRow label="Toplam" value={formatMoney(displayTotal, displayCurrency)} />
        ) : null}
        {orderData?.paymentStatusLabel ? (
          <DetailRow label="Durum" value={orderData.paymentStatusLabel} />
        ) : null}
      </dl>

      {orderData ? <OrderLinesTable data={orderData} /> : null}

      {orderData && 'message' in orderData && orderData.message ? (
        <p className="mt-4 text-sm leading-relaxed text-slate-600">{orderData.message}</p>
      ) : null}
    </PaymentResultPanel>
  )
}
