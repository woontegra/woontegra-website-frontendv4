import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Cloud, Eye, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { getErrorMessage } from '@/api/client'
import { adminProductsService } from '@/services/adminProductsService'
import { adminSaasMembershipsService } from '@/services/adminSaasMembershipsService'
import {
  adminSaasMembershipStatusLabel,
  adminSaasMembershipStatusTone,
} from '@/types/adminSaasMembership'
import { formatDateTime } from '@/utils/adminOrderUi'
import { isManualSaasMembershipProduct } from '@/lib/manualSaasMembershipProduct'

function formatMembershipRange(start: string, end: string): string {
  return `${formatDateTime(start)} → ${formatDateTime(end)}`
}

function kalanGunLabel(days: number | null): string {
  if (days == null) return '—'
  if (days < 0) return 'Süresi doldu'
  if (days === 0) return 'Bugün bitiyor'
  return `${days} gün`
}

export function AdminSaasMembershipsPage() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [productId, setProductId] = useState('')
  const [expiringSoon, setExpiringSoon] = useState(false)

  const params = useMemo(
    () => ({
      q: q.trim() || undefined,
      status: status || undefined,
      productId: productId || undefined,
      expiringSoon: expiringSoon || undefined,
    }),
    [q, status, productId, expiringSoon],
  )

  const membershipsQuery = useQuery({
    queryKey: ['admin', 'saas-memberships', params],
    queryFn: () => adminSaasMembershipsService.list(params),
  })

  const productsQuery = useQuery({
    queryKey: ['admin', 'products', 'saas-memberships-filter'],
    queryFn: () => adminProductsService.list({ productType: 'SAAS', isActive: 'all' }),
  })

  const items = membershipsQuery.data ?? []
  const saasProducts = (productsQuery.data ?? []).filter(isManualSaasMembershipProduct)

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="SaaS Abonelikleri"
        description="Web tabanlı ürünlerin müşteri erişim, abonelik ve tenant kayıtları."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/saas-subscriptions/new">
              <Button size="sm">Manuel Abonelik Oluştur</Button>
            </Link>
            <Button variant="secondary" size="sm" onClick={() => void membershipsQuery.refetch()} disabled={membershipsQuery.isFetching}>
              <RefreshCw className={`h-4 w-4 ${membershipsQuery.isFetching ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
          </div>
        }
      />

      <Card className="border-emerald-200 bg-emerald-50/60">
        <CardBody className="space-y-2">
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4 text-emerald-700" />
            <h2 className="text-sm font-semibold text-emerald-950">Website içinde yönetilen erişim</h2>
          </div>
          <p className="text-sm text-emerald-900">
            Bu ekran yalnızca website veritabanındaki SaaS / web tabanlı ürün erişimlerini yönetir. AppCode, cihaz
            hakkı ve aktivasyon mantığı burada kullanılmaz.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="grid gap-3 lg:grid-cols-4">
          <Input
            label="Ara"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Müşteri, e-posta, ürün, sipariş, tenant, erişim anahtarı"
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Durum</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Tümü</option>
              <option value="ACTIVE">Aktif</option>
              <option value="SUSPENDED">Askıda</option>
              <option value="EXPIRED">Süresi dolmuş</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Ürün</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Tüm SaaS ürünleri</option>
              {saasProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-end gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={expiringSoon}
              onChange={(e) => setExpiringSoon(e.target.checked)}
            />
            Süresi 7 gün içinde bitecekler
          </label>
        </CardBody>
      </Card>

      {membershipsQuery.isLoading ? <LoadingState label="SaaS abonelikleri yükleniyor…" /> : null}

      {membershipsQuery.isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm text-red-700">
              {getErrorMessage(membershipsQuery.error, 'SaaS abonelikleri yüklenemedi')}
            </p>
          </CardBody>
        </Card>
      ) : null}

      {!membershipsQuery.isLoading && !membershipsQuery.isError && items.length === 0 ? (
        <EmptyState
          title="Kayıt bulunamadı"
          description="Bu filtrelerle eşleşen SaaS aboneliği veya web tabanlı ürün erişimi yok."
        />
      ) : null}

      {!membershipsQuery.isLoading && !membershipsQuery.isError && items.length > 0 ? (
        <Card>
          <CardBody className="overflow-x-auto p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Müşteri</TH>
                  <TH>E-posta</TH>
                  <TH>Ürün</TH>
                  <TH>Sipariş no</TH>
                  <TH>Başlangıç / bitiş</TH>
                  <TH>Kalan gün</TH>
                  <TH>Durum</TH>
                  <TH>Tenant / erişim</TH>
                  <TH>Son sipariş</TH>
                  <TH className="w-10"> </TH>
                </TR>
              </THead>
              <TBody>
                {items.map((row) => (
                  <TR key={row.id}>
                    <TD>
                      <div className="font-medium text-slate-900">{row.customerName}</div>
                    </TD>
                    <TD>
                      <div className="text-sm text-slate-700">{row.customerEmail}</div>
                      {row.ownerEmail !== row.customerEmail ? (
                        <div className="text-xs text-slate-500">Sahip: {row.ownerEmail}</div>
                      ) : null}
                    </TD>
                    <TD>
                      <div className="max-w-[14rem] truncate font-medium text-slate-900">{row.productName}</div>
                      <div className="text-xs text-slate-500">{row.productCode}</div>
                    </TD>
                    <TD className="whitespace-nowrap text-sm">{row.firstOrderNo ?? '—'}</TD>
                    <TD className="min-w-[14rem] text-xs text-slate-600">
                      {formatMembershipRange(row.licenseStartDate, row.licenseEndDate)}
                    </TD>
                    <TD className="whitespace-nowrap text-sm">{kalanGunLabel(row.kalanGun)}</TD>
                    <TD>
                      <Badge tone={adminSaasMembershipStatusTone(row.effectiveStatus)}>
                        {adminSaasMembershipStatusLabel(row.effectiveStatus)}
                      </Badge>
                    </TD>
                    <TD>
                      <div className="max-w-[12rem] truncate text-sm text-slate-800">{row.tenantSlug || row.tenantId}</div>
                      <div className="font-mono text-[11px] text-slate-500">{row.tenantId}</div>
                      {row.lastProvisionError ? (
                        <div className="mt-1 text-xs text-amber-700">Uyarı: {row.lastProvisionError}</div>
                      ) : null}
                    </TD>
                    <TD>
                      <div className="text-sm text-slate-800">{row.lastOrderNo ?? '—'}</div>
                      {row.lastOrderStatus ? <div className="text-xs text-slate-500">{row.lastOrderStatus}</div> : null}
                    </TD>
                    <TD>
                      <Link
                        to={`/admin/saas-subscriptions/${encodeURIComponent(row.id)}`}
                        className="inline-flex text-brand-600 hover:text-brand-700"
                        title="Detay"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
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
