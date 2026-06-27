import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Download, KeyRound } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { MaskedSecret } from '@/components/account/MaskedSecret'
import { CENTRAL_LICENSE_PUBLIC_MESSAGE } from '@/constants/centralLicenseServer'
import {
  downloadButtonsForItem,
  formatAccountDate,
  isPaidLikeOrder,
  isSaasOrderDeliveryUrl,
} from '@/lib/accountHelpers'
import { customersService, getErrorMessage } from '@/services/customersService'
import { formatMoney } from '@/types/product'

export function AccountOrderDetailPage() {
  const { orderNo: raw } = useParams()
  const orderNo = raw ? decodeURIComponent(raw) : ''

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['customer', 'orders', orderNo],
    queryFn: () => customersService.getOrder(orderNo),
    enabled: Boolean(orderNo.trim()),
  })

  if (!orderNo.trim()) {
    return <EmptyState title="Sipariş bulunamadı" description="Geçersiz sipariş numarası." />
  }

  if (isLoading) return <LoadingState label="Sipariş yükleniyor…" />

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-800">{getErrorMessage(error, 'Sipariş bulunamadı.')}</p>
        <Link to="/hesabim/siparisler" className="text-sm font-semibold text-emerald-700 hover:underline">
          Siparişlerime dön
        </Link>
      </div>
    )
  }

  const paid = isPaidLikeOrder(data.status)

  return (
    <div className="space-y-6">
      <div>
        <Link to="/hesabim/siparisler" className="text-sm font-semibold text-emerald-700 hover:underline">
          ← Siparişlerim
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <h2 className="font-mono text-lg font-bold text-slate-900">{data.orderNo}</h2>
            <p className="mt-1 text-sm text-slate-600">{formatAccountDate(data.createdAt)}</p>
            <Badge tone={paid ? 'success' : 'warning'} className="mt-3">
              {paid ? 'Ödeme onaylı' : 'Ödeme bekleniyor'}
            </Badge>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Toplam</p>
            <p className="text-2xl font-bold text-slate-900">{formatMoney(data.total, data.currency)}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardBody className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Alıcı bilgileri</h3>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div><dt className="text-slate-500">Ad soyad</dt><dd className="font-medium text-slate-900">{data.customerName}</dd></div>
            <div><dt className="text-slate-500">E-posta</dt><dd className="font-medium text-slate-900">{data.customerEmail}</dd></div>
            {data.customerPhone ? (
              <div><dt className="text-slate-500">Telefon</dt><dd className="font-medium text-slate-900">{data.customerPhone}</dd></div>
            ) : null}
            {data.billingType ? (
              <div><dt className="text-slate-500">Fatura tipi</dt><dd className="font-medium text-slate-900">{data.billingType}</dd></div>
            ) : null}
            {data.companyName ? (
              <div><dt className="text-slate-500">Firma</dt><dd className="font-medium text-slate-900">{data.companyName}</dd></div>
            ) : null}
            {data.taxOffice ? (
              <div><dt className="text-slate-500">Vergi dairesi</dt><dd className="font-medium text-slate-900">{data.taxOffice}</dd></div>
            ) : null}
            {data.taxNumber ? (
              <div><dt className="text-slate-500">Vergi / T.C. No</dt><dd className="font-medium text-slate-900">{data.taxNumber}</dd></div>
            ) : null}
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Ürünler</h3>
          <ul className="divide-y divide-slate-100">
            {data.items.map((item, i) => {
              const buttons = downloadButtonsForItem(item, paid)
              return (
                <li key={`${item.productName}-${i}`} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium text-slate-900">{item.productName}</p>
                    <p className="text-sm text-slate-500">
                      {item.quantity} × {formatMoney(item.unitPrice, data.currency)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">{formatMoney(item.total, data.currency)}</p>
                    {paid && item.downloadUrl && isSaasOrderDeliveryUrl(item.downloadUrl) ? (
                      <p className="mt-1 text-xs text-slate-500">Hesap bilgileri e-posta ile</p>
                    ) : null}
                    {buttons.length > 0 ? (
                      <div className="mt-2 flex flex-wrap justify-end gap-2">
                        {buttons.map((btn) => (
                          <a
                            key={btn.label}
                            href={btn.href}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            <Download className="h-3.5 w-3.5" />
                            {btn.label}
                          </a>
                        ))}
                      </div>
                    ) : paid ? (
                      <p className="mt-1 text-xs text-slate-400">İndirme yok</p>
                    ) : (
                      <p className="mt-1 text-xs text-amber-700">Ödeme onayı sonrası açılır</p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </CardBody>
      </Card>

      {data.licenseCodesMasked && data.licenseCodesMasked.length > 0 ? (
        <Card className="border-sky-200 bg-sky-50/40">
          <CardBody className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-sky-950">
              <KeyRound className="h-4 w-4" />
              Lisans bilgisi
            </div>
            <p className="text-xs text-sky-900">{CENTRAL_LICENSE_PUBLIC_MESSAGE}</p>
            {data.licenseCodesMasked.map((code, i) => (
              <MaskedSecret key={i} value={code} label={`Lisans anahtarı ${data.licenseCodesMasked!.length > 1 ? i + 1 : ''}`.trim()} />
            ))}
            <p className="text-xs text-slate-500">
              Aktivasyon şifresi ve tam lisans detayları e-posta ile iletilir. Mail tekrar gönderme API&apos;si backend&apos;de tanımlı değil.
            </p>
          </CardBody>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Link to="/hesabim/destek">
          <Button variant="secondary">Destek</Button>
        </Link>
      </div>
    </div>
  )
}
