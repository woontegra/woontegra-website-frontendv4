import { Link } from 'react-router-dom'
import { Download } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { aggregateDownloadsFromOrders, formatAccountDate } from '@/lib/accountHelpers'
import { useCustomerPaidOrderDetails } from '@/hooks/useCustomerOrders'
import { getErrorMessage } from '@/services/customersService'

export function AccountDownloadsPage() {
  const { orders, details, isLoading, isError, error } = useCustomerPaidOrderDetails()
  const downloads = aggregateDownloadsFromOrders(orders, details)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">İndirmelerim</h2>
        <p className="mt-1 text-sm text-slate-600">Ödeme onaylı dijital ürünlerinizin kurulum dosyaları.</p>
      </div>

      {isLoading ? <LoadingState label="İndirmeler yükleniyor…" /> : null}
      {isError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {getErrorMessage(error, 'İndirmeler yüklenemedi.')}
        </p>
      ) : null}

      {!isLoading && !isError && downloads.length === 0 ? (
        <EmptyState
          title="İndirilebilir dosya yok"
          description="Satın aldığınız dijital ürünler ödeme onayından sonra burada listelenir."
        />
      ) : null}

      {downloads.length > 0 ? (
        <ul className="space-y-3">
          {downloads.map((row, i) => (
            <li key={`${row.orderNo}-${row.productName}-${i}`}>
              <Card>
                <CardBody className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{row.productName}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Sipariş {row.orderNo} · {formatAccountDate(row.createdAt)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{row.label}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={row.downloadUrl}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      <Download className="h-4 w-4" />
                      {row.buttonLabel}
                    </a>
                    <Link
                      to={`/hesabim/siparisler/${encodeURIComponent(row.orderNo)}`}
                      className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Sipariş
                    </Link>
                  </div>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Ücretsiz ürünler için{' '}
        <Link to="/yazilimlar" className="font-semibold text-emerald-700 hover:underline">
          yazılımlar
        </Link>{' '}
        sayfasındaki indirme bağlantılarını kullanabilirsiniz.
      </p>
    </div>
  )
}
