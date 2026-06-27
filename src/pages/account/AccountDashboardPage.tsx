import { Link } from 'react-router-dom'
import { Download, HeadphonesIcon, KeyRound, Package, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import {
  aggregateDownloadsFromOrders,
  countPendingPayments,
  formatAccountDate,
  orderStatusLabel,
  orderStatusTone,
  pickLatestOrder,
} from '@/lib/accountHelpers'
import { useCustomerLicenses } from '@/hooks/useCustomerLicenses'
import { useCustomerPaidOrderDetails } from '@/hooks/useCustomerOrders'
import { formatMoney } from '@/types/product'
import { getErrorMessage } from '@/services/customersService'

export function AccountDashboardPage() {
  const { orders, details, isLoading, isError, error } = useCustomerPaidOrderDetails()
  const licensesQuery = useCustomerLicenses()
  const latest = pickLatestOrder(orders)
  const pendingCount = countPendingPayments(orders)
  const licenses = licensesQuery.data ?? []
  const activeLicenseCount = licenses.filter((l) => l.licenseKeyMasked && l.status.toUpperCase() === 'ACTIVE').length
  const downloads = aggregateDownloadsFromOrders(orders, details)

  if (isLoading || licensesQuery.isLoading) return <LoadingState label="Hesap özeti yükleniyor…" />

  if (isError || licensesQuery.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {getErrorMessage(error ?? licensesQuery.error, 'Hesap bilgileri yüklenemedi.')}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Genel Bakış</h2>
        <p className="mt-1 text-sm text-slate-600">Siparişleriniz, lisanslarınız ve indirmeleriniz tek ekranda.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Package}
          title="Son sipariş"
          value={latest ? latest.orderNo : '—'}
          hint={latest ? formatAccountDate(latest.createdAt) : 'Henüz sipariş yok'}
          to={latest ? `/hesabim/siparisler/${encodeURIComponent(latest.orderNo)}` : '/hesabim/siparisler'}
        />
        <SummaryCard icon={KeyRound} title="Aktif lisans" value={String(activeLicenseCount)} hint="Ödeme onaylı lisanslar" to="/hesabim/lisanslar" />
        <SummaryCard icon={Download} title="İndirme dosyası" value={String(downloads.length)} hint="Hazır indirmeler" to="/hesabim/indirmeler" />
        <SummaryCard icon={Wallet} title="Bekleyen ödeme" value={String(pendingCount)} hint={pendingCount ? 'Onay bekleyen sipariş' : 'Bekleyen ödeme yok'} to="/hesabim/siparisler" />
      </div>

      {latest ? (
        <Card>
          <CardBody className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Son sipariş</p>
              <p className="mt-1 font-mono text-sm font-semibold text-slate-900">{latest.orderNo}</p>
              <p className="mt-1 text-sm text-slate-600">{latest.productSummary}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone={orderStatusTone(latest.status)}>{orderStatusLabel(latest.status)}</Badge>
                <span className="text-sm font-semibold text-slate-900">{formatMoney(latest.total, latest.currency)}</span>
              </div>
            </div>
            <Link
              to={`/hesabim/siparisler/${encodeURIComponent(latest.orderNo)}`}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Detayı gör
            </Link>
          </CardBody>
        </Card>
      ) : (
        <EmptyState title="Henüz sipariş yok" description="Satın aldığınız ürünler burada görünecek." />
      )}

      <Card className="border-sky-200 bg-gradient-to-br from-sky-50/80 to-white">
        <CardBody className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <HeadphonesIcon className="mt-0.5 h-5 w-5 text-sky-700" />
            <div>
              <p className="font-semibold text-slate-900">Hızlı yardım</p>
              <p className="mt-1 text-sm text-slate-600">Sipariş, lisans veya indirme sorunlarında destek ekibimiz yanınızda.</p>
            </div>
          </div>
          <Link to="/hesabim/destek" className="rounded-xl border border-sky-200 bg-white px-4 py-2.5 text-sm font-semibold text-sky-900 hover:bg-sky-50">
            Destek merkezi
          </Link>
        </CardBody>
      </Card>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  title,
  value,
  hint,
  to,
}: {
  icon: typeof Package
  title: string
  value: string
  hint: string
  to: string
}) {
  return (
    <Link to={to} className="group rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
      <Icon className="h-5 w-5 text-emerald-600" aria-hidden />
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-1 truncate text-lg font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </Link>
  )
}
