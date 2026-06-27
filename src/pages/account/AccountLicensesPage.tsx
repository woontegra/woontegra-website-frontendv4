import { Link } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { MaskedSecret } from '@/components/account/MaskedSecret'
import { CENTRAL_LICENSE_PUBLIC_MESSAGE } from '@/constants/centralLicenseServer'
import { formatAccountDate } from '@/lib/accountHelpers'
import { useCustomerLicenses } from '@/hooks/useCustomerLicenses'
import { getErrorMessage } from '@/services/customersService'

function licenseStatusLabel(status: string): string {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return 'Aktif'
    case 'PENDING':
      return 'Hazırlanıyor'
    case 'PASSIVE':
      return 'Pasif'
    case 'EXPIRED':
      return 'Süresi doldu'
    default:
      return status
  }
}

function licenseStatusTone(status: string): 'success' | 'warning' | 'danger' | 'default' {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return 'success'
    case 'PENDING':
      return 'warning'
    case 'EXPIRED':
      return 'danger'
    case 'PASSIVE':
      return 'warning'
    default:
      return 'default'
  }
}

export function AccountLicensesPage() {
  const { data: licenses = [], isLoading, isError, error } = useCustomerLicenses()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Lisanslarım</h2>
        <p className="mt-1 text-sm text-slate-600">{CENTRAL_LICENSE_PUBLIC_MESSAGE}</p>
      </div>

      {isLoading ? <LoadingState label="Lisanslar yükleniyor…" /> : null}
      {isError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {getErrorMessage(error, 'Lisanslar yüklenemedi.')}
        </p>
      ) : null}

      {!isLoading && !isError && licenses.length === 0 ? (
        <EmptyState
          title="Henüz lisans kaydı yok"
          description="Lisanslı ürün satın aldığınızda ve ödeme onaylandığında bilgiler burada görünür."
        />
      ) : null}

      {licenses.length > 0 ? (
        <ul className="space-y-4">
          {licenses.map((row) => (
            <li key={`${row.orderNo}-${row.id ?? row.licenseKeyMasked ?? 'pending'}`}>
              <Card>
                <CardBody className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-emerald-600" />
                        <p className="font-semibold text-slate-900">{row.productName}</p>
                      </div>
                      {row.programName && row.programName !== row.productName ? (
                        <p className="mt-1 text-sm text-slate-600">{row.programName}</p>
                      ) : null}
                      {row.orderNo ? (
                        <p className="mt-1 font-mono text-xs text-slate-500">Sipariş: {row.orderNo}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-slate-500">{formatAccountDate(row.createdAt)}</p>
                      {row.expiresAt ? (
                        <p className="mt-1 text-xs text-slate-500">
                          Bitiş: {formatAccountDate(row.expiresAt)}
                        </p>
                      ) : null}
                      {row.maxDevices != null ? (
                        <p className="mt-1 text-xs text-slate-500">Cihaz limiti: {row.maxDevices}</p>
                      ) : null}
                    </div>
                    <Badge tone={licenseStatusTone(row.status)}>{licenseStatusLabel(row.status)}</Badge>
                  </div>
                  {row.licenseKeyMasked ? (
                    <MaskedSecret value={row.licenseKeyMasked} label="Lisans anahtarı" />
                  ) : (
                    <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      Bu sipariş için lisans kaydı henüz oluşturulmadı veya senkronize edilmedi. Ödeme onayı
                      sonrası lisans bilgileri e-posta ile iletilir; kısa süre içinde burada da görünür.
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    {row.licenseKeyMasked
                      ? 'Tam lisans anahtarı ve aktivasyon şifresi e-posta ile iletilir. Lisanslar merkezi Woontegra Lisans Server üzerinden yönetilir.'
                      : 'Sorun devam ederse sipariş numaranızla destek ekibine ulaşın.'}
                  </p>
                  {row.orderNo ? (
                    <Link
                      to={`/hesabim/siparisler/${encodeURIComponent(row.orderNo)}`}
                      className="inline-flex text-sm font-semibold text-emerald-700 hover:underline"
                    >
                      Sipariş detayı →
                    </Link>
                  ) : null}
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
