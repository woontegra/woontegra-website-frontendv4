import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { KeyRound, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { MaskedSecret } from '@/components/account/MaskedSecret'
import { CENTRAL_LICENSE_PUBLIC_MESSAGE } from '@/constants/centralLicenseServer'
import { formatAccountDate } from '@/lib/accountHelpers'
import { useCustomerLicenses } from '@/hooks/useCustomerLicenses'
import { getErrorMessage } from '@/services/customersService'
import { bilirkisiHesapService } from '@/services/bilirkisiHesapService'
import { BILIRKISI_HESAP_SLUG } from '@/data/canonicalSoftwareProducts'
import { useCustomerSession } from '@/hooks/useCustomerSession'

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
  const { authed } = useCustomerSession()
  const [bhRenewalEnabled, setBhRenewalEnabled] = useState(false)
  const [bhOptions, setBhOptions] = useState<{
    currentPackage?: string
    remainingDays?: number
    licenseEnd?: string
    options?: Array<{ productType: string; period: number; label?: string }>
  } | null>(null)
  const [bhError, setBhError] = useState<string | null>(null)
  const [bhBusy, setBhBusy] = useState(false)
  const [panelLoginUrl, setPanelLoginUrl] = useState('https://panel.bilirkisihesap.com')

  useEffect(() => {
    let cancelled = false
    bilirkisiHesapService
      .getConfig()
      .then((cfg) => {
        if (cancelled) return
        setBhRenewalEnabled(Boolean(cfg.renewalEnabled))
        if (cfg.panelLoginUrl) setPanelLoginUrl(cfg.panelLoginUrl)
      })
      .catch(() => {
        /* BH config optional on this page */
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!authed || !bhRenewalEnabled) return
    let cancelled = false
    bilirkisiHesapService
      .renewalOptions()
      .then((res) => {
        if (cancelled) return
        if (res.success && res.data) {
          setBhOptions(res.data)
          setBhError(null)
        } else {
          setBhOptions(null)
          setBhError(res.message || res.code || null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setBhOptions(null)
          setBhError(getErrorMessage(err, 'Bilirkişi Hesap yenileme bilgisi alınamadı.'))
        }
      })
    return () => {
      cancelled = true
    }
  }, [authed, bhRenewalEnabled])

  const startBhRenewal = async (productType: 'monthly' | 'annual') => {
    setBhBusy(true)
    setBhError(null)
    try {
      const res = await bilirkisiHesapService.renewalStart({
        productType,
        period: productType === 'monthly' ? 0 : 1,
      })
      const token = res.data?.renewalToken
      if (!res.success || !token) {
        throw new Error(res.message || 'Yenileme başlatılamadı.')
      }
      window.location.href = `/yazilimlar/${BILIRKISI_HESAP_SLUG}/satin-al?renew=${encodeURIComponent(token)}`
    } catch (err) {
      setBhError(getErrorMessage(err, 'Yenileme başlatılamadı.'))
      setBhBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Lisanslarım</h2>
        <p className="mt-1 text-sm text-slate-600">{CENTRAL_LICENSE_PUBLIC_MESSAGE}</p>
      </div>

      {bhRenewalEnabled ? (
        <Card>
          <CardBody className="space-y-3">
            <div className="flex items-start gap-2">
              <RefreshCw className="mt-0.5 h-4 w-4 text-sky-600" />
              <div>
                <p className="font-semibold text-slate-900">Bilirkişi Hesap — Lisansı Yenile</p>
                <p className="mt-1 text-sm text-slate-600">
                  Panel hesabınızdaki aktif ücretli lisans için yenileme. Panel:{' '}
                  <a className="font-medium text-sky-700 underline" href={panelLoginUrl} target="_blank" rel="noreferrer">
                    {panelLoginUrl.replace(/^https?:\/\//, '')}
                  </a>
                </p>
              </div>
            </div>
            {bhOptions ? (
              <div className="space-y-2 text-sm text-slate-700">
                <p>
                  Paket: <strong>{bhOptions.currentPackage || '—'}</strong>
                  {bhOptions.remainingDays != null ? ` · Kalan ~${bhOptions.remainingDays} gün` : null}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(bhOptions.options || []).map((opt) => {
                    const type = opt.productType === 'monthly' ? 'monthly' : 'annual'
                    return (
                      <Button
                        key={`${opt.productType}-${opt.period}`}
                        type="button"
                        disabled={bhBusy}
                        onClick={() => startBhRenewal(type)}
                      >
                        {opt.label || (type === 'monthly' ? 'Aylık yenile' : 'Yıllık yenile')}
                      </Button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                {bhError ||
                  'Bu Woontegra e-postasıyla eşleşen aktif Bilirkişi Hesap lisansı bulunamadı. Önce panel hesabınızı aynı e-posta ile kullanın.'}
              </p>
            )}
            {bhError && bhOptions ? <p className="text-sm text-red-700">{bhError}</p> : null}
          </CardBody>
        </Card>
      ) : null}

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
