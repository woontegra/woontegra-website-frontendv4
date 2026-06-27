import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { formatAccountDate, orderStatusLabel, orderStatusTone } from '@/lib/accountHelpers'
import { customersService, getErrorMessage } from '@/services/customersService'
import { formatMoney } from '@/types/product'

export function AccountOrdersPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['customer', 'orders'],
    queryFn: () => customersService.listOrders(),
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Siparişlerim</h2>
        <p className="mt-1 text-sm text-slate-600">Ödeme durumu, teslimat ve lisans bilgileri sipariş detayında.</p>
      </div>

      {isLoading ? <LoadingState label="Siparişler yükleniyor…" /> : null}
      {isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm text-red-800">{getErrorMessage(error, 'Siparişler yüklenemedi.')}</p>
          </CardBody>
        </Card>
      ) : null}

      {!isLoading && !isError && (!data || data.length === 0) ? (
        <EmptyState title="Henüz sipariş yok" description="Satın aldığınız ürünler burada listelenir." />
      ) : null}

      {data && data.length > 0 ? (
        <ul className="space-y-3">
          {data.map((order) => (
            <li key={order.orderNo}>
              <Link
                to={`/hesabim/siparisler/${encodeURIComponent(order.orderNo)}`}
                className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold text-slate-900">{order.orderNo}</p>
                    <p className="mt-1 text-sm text-slate-600">{order.productSummary}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatAccountDate(order.createdAt)}</p>
                    <p className="mt-1 text-xs text-slate-500">{order.itemCount} ürün · {order.paymentProvider}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{formatMoney(order.total, order.currency)}</p>
                    <div className="mt-2 flex flex-wrap justify-end gap-1">
                      <Badge tone={orderStatusTone(order.status)}>{orderStatusLabel(order.status)}</Badge>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-emerald-700">Detay →</p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
