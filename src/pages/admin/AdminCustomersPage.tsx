import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw, Users } from 'lucide-react'
import { AdminCustomerRowActions } from '@/components/admin/AdminCustomerRowActions'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { getErrorMessage } from '@/api/client'
import { adminCustomersService } from '@/services/adminCustomersService'
import type { AdminCustomerListParams } from '@/types/adminCustomer'
import { formatMoney } from '@/utils/formatMoney'
import { formatDateTime } from '@/utils/adminOrderUi'

const FILTER_OPTIONS = [
  { value: '', label: 'Tümü' },
  { value: 'active', label: 'Aktif müşteriler' },
  { value: 'has_saas', label: 'SaaS aboneliği olanlar' },
  { value: 'has_orders', label: 'Siparişi olanlar' },
  { value: 'pending_payment', label: 'Ödeme bekleyenler' },
  { value: 'ordered_last_30d', label: 'Son 30 günde sipariş verenler' },
  { value: 'no_orders', label: 'Hiç sipariş vermeyenler' },
  { value: 'corporate', label: 'Kurumsal' },
  { value: 'individual', label: 'Bireysel' },
] as const

export function AdminCustomersPage() {
  const [searchParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState(searchParams.get('filter') ?? '')
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const params: AdminCustomerListParams = useMemo(
    () => ({
      q: q.trim() || undefined,
      filter: filter || undefined,
    }),
    [q, filter],
  )

  const customersQuery = useQuery({
    queryKey: ['admin', 'customers', params],
    queryFn: () => adminCustomersService.list(params),
  })

  const items = customersQuery.data ?? []

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Müşteriler"
        description="Mağaza müşteri hesapları, sipariş ve SaaS abonelik özetleri."
        actions={
          <Button variant="secondary" size="sm" onClick={() => void customersQuery.refetch()} disabled={customersQuery.isFetching}>
            <RefreshCw className={`h-4 w-4 ${customersQuery.isFetching ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        }
      />

      <Card className="border-sky-200 bg-sky-50/50">
        <CardBody className="flex items-start gap-3 text-sm text-sky-950">
          <Users className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Bu ekran yalnızca website müşteri hesaplarını (`Customer`) listeler. Admin panel kullanıcıları (`User`) burada
            görünmez. Sipariş ve ödeme verileri müşteri hesabı veya e-posta eşleşmesiyle ilişkilendirilir.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="grid gap-3 lg:grid-cols-3">
          <Input
            label="Ara"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ad, e-posta, telefon, şirket, sipariş no, tenant, vergi no"
          />
          <div className="space-y-1.5 lg:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Filtre</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              {FILTER_OPTIONS.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </CardBody>
      </Card>

      {actionMessage ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardBody>
            <p className="text-sm text-emerald-800">{actionMessage}</p>
          </CardBody>
        </Card>
      ) : null}

      {actionError ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm text-red-700">{actionError}</p>
          </CardBody>
        </Card>
      ) : null}

      {customersQuery.isLoading ? <LoadingState label="Müşteriler yükleniyor…" /> : null}

      {customersQuery.isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm text-red-700">{getErrorMessage(customersQuery.error, 'Müşteriler yüklenemedi')}</p>
          </CardBody>
        </Card>
      ) : null}

      {!customersQuery.isLoading && !customersQuery.isError && items.length === 0 ? (
        <EmptyState title="Müşteri bulunamadı" description="Arama veya filtre kriterlerini değiştirmeyi deneyin." />
      ) : null}

      {!customersQuery.isLoading && !customersQuery.isError && items.length > 0 ? (
        <Card>
          <CardBody className="overflow-x-auto p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Müşteri</TH>
                  <TH>E-posta</TH>
                  <TH>Telefon</TH>
                  <TH>Şirket / kurum</TH>
                  <TH>Sipariş</TH>
                  <TH>Toplam ödeme</TH>
                  <TH>Aktif SaaS</TH>
                  <TH>Son sipariş</TH>
                  <TH>Son işlem</TH>
                  <TH>Durum</TH>
                  <TH className="min-w-[7rem] text-right">İşlemler</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((row) => (
                  <TR key={row.id}>
                    <TD>
                      <div className="font-medium text-slate-900">{row.name}</div>
                      {row.isCorporate ? <div className="text-xs text-slate-500">Kurumsal</div> : null}
                    </TD>
                    <TD className="text-sm text-slate-700">{row.email}</TD>
                    <TD className="whitespace-nowrap text-sm">{row.phone ?? '—'}</TD>
                    <TD className="max-w-[12rem] truncate text-sm">{row.companyName ?? '—'}</TD>
                    <TD className="whitespace-nowrap text-sm">
                      {row.orderCount}
                      {row.pendingOrderCount > 0 ? (
                        <span className="ml-1 text-amber-700">({row.pendingOrderCount} bekliyor)</span>
                      ) : null}
                    </TD>
                    <TD className="whitespace-nowrap text-sm font-medium">
                      {formatMoney(row.totalPaidAmount, row.currency)}
                    </TD>
                    <TD className="text-center text-sm">{row.activeSaasMembershipCount}</TD>
                    <TD className="whitespace-nowrap text-xs text-slate-600">
                      {row.lastOrderDate ? formatDateTime(row.lastOrderDate) : '—'}
                    </TD>
                    <TD className="whitespace-nowrap text-xs text-slate-600">
                      {row.lastActivityAt ? formatDateTime(row.lastActivityAt) : '—'}
                    </TD>
                    <TD>
                      <Badge tone={row.isActive ? 'success' : 'warning'}>{row.isActive ? 'Aktif' : 'Pasif'}</Badge>
                    </TD>
                    <TD className="text-right">
                      <AdminCustomerRowActions
                        row={row}
                        onActionMessage={setActionMessage}
                        onActionError={setActionError}
                      />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardBody>
        </Card>
      ) : null}
    </div>
  )
}
