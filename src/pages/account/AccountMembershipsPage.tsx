import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Cloud, KeyRound } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { SaasRenewModal } from '@/components/account/SaasRenewModal'
import { customersService, getErrorMessage } from '@/services/customersService'
import type { CustomerSaasMembershipRow } from '@/types/customerSaasMembership'
import { LAST_ORDER_EMAIL_KEY, SAAS_RENEW_ORDER_KEY } from '@/types/orderSuccess'

function formatDateTR(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR')
}

function statusLabel(status: string): string {
  if (status === 'ACTIVE') return 'Aktif'
  if (status === 'EXPIRED') return 'Süresi doldu'
  if (status === 'SUSPENDED') return 'Askıda'
  return status
}

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'default' {
  if (status === 'ACTIVE') return 'success'
  if (status === 'EXPIRED') return 'warning'
  if (status === 'SUSPENDED') return 'danger'
  return 'default'
}

export function AccountMembershipsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [rows, setRows] = useState<CustomerSaasMembershipRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [renewTarget, setRenewTarget] = useState<CustomerSaasMembershipRow | null>(null)
  const [successBanner, setSuccessBanner] = useState<string | null>(null)

  const loadRows = () => {
    setLoading(true)
    setError(null)
    return customersService
      .listSaasMemberships()
      .then(setRows)
      .catch((e) => setError(getErrorMessage(e, 'Üyelikler yüklenemedi.')))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    void loadRows()
  }, [])

  useEffect(() => {
    if (searchParams.get('renewSuccess') === '1') {
      setSuccessBanner('Üyeliğiniz başarıyla uzatıldı. Güncel bitiş tarihi aşağıda görüntülenir.')
      searchParams.delete('renewSuccess')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  function handleRenewOrderCreated(orderNo: string) {
    setRenewTarget(null)
    try {
      sessionStorage.setItem(SAAS_RENEW_ORDER_KEY, orderNo)
      const email = rows[0]?.ownerEmail
      if (email) sessionStorage.setItem(LAST_ORDER_EMAIL_KEY, email.toLowerCase())
    } catch {
      /* ignore */
    }
    navigate(`/odeme/basarili/${encodeURIComponent(orderNo)}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-emerald-600" aria-hidden />
          <h2 className="text-lg font-bold text-slate-900">Üyelikler</h2>
        </div>
        <p className="mt-1 text-sm text-slate-600">Woontegra SaaS ürünlerinizin abonelik ve lisans bilgileri.</p>
      </div>

      {successBanner ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
          {successBanner}
        </p>
      ) : null}

      {loading ? <LoadingState label="Üyelikler yükleniyor…" /> : null}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      {!loading && !error && rows.length === 0 ? (
        <EmptyState
          title="Henüz aktif yazılım üyeliğiniz bulunmuyor."
          description="Müvekkil Kasa Defteri gibi SaaS ürünleri satın aldığınızda burada listelenir."
        />
      ) : null}

      {rows.length > 0 ? (
        <ul className="space-y-4">
          {rows.map((row) => (
            <li key={row.id}>
              <Card>
                <CardBody className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{row.productName}</p>
                      {row.tenantSlug ? (
                        <p className="mt-1 text-sm text-slate-600">Büro: {row.tenantSlug}</p>
                      ) : null}
                    </div>
                    <Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge>
                  </div>

                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lisans anahtarı</dt>
                      <dd className="mt-1 flex items-center gap-2 font-mono text-xs text-slate-800">
                        <KeyRound className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                        {row.licenseKey}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Başlangıç</dt>
                      <dd className="mt-1 text-slate-800">{formatDateTR(row.licenseStartDate)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bitiş tarihi</dt>
                      <dd className="mt-1 text-slate-800">
                        {formatDateTR(row.licenseEndDate)}
                        {row.kalanGun != null ? (
                          <span className="ml-2 text-slate-500">
                            ({row.kalanGun > 0 ? `${row.kalanGun} gün kaldı` : 'süresi doldu'})
                          </span>
                        ) : null}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Durum</dt>
                      <dd className="mt-1 text-slate-800">{statusLabel(row.status)}</dd>
                    </div>
                  </dl>

                  <div className="border-t border-slate-100 pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      className="border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      onClick={() => setRenewTarget(row)}
                    >
                      Üyeliği Uzat
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}

      {renewTarget ? (
        <SaasRenewModal
          membership={renewTarget}
          onClose={() => setRenewTarget(null)}
          onOrderCreated={handleRenewOrderCreated}
        />
      ) : null}
    </div>
  )
}
