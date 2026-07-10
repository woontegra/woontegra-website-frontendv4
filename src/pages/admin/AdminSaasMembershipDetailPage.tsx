import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { Input } from '@/components/ui/Input'
import { getErrorMessage } from '@/api/client'
import { adminSaasMembershipsService } from '@/services/adminSaasMembershipsService'
import { invalidateAdminSidebarBadges } from '@/services/adminSidebarBadgesService'
import {
  adminSaasMembershipStatusLabel,
  adminSaasMembershipStatusTone,
  type AdminSaasMembershipStatus,
} from '@/types/adminSaasMembership'
import { formatDateTime, orderStatusMeta } from '@/utils/adminOrderUi'
import { formatMoney } from '@/utils/formatMoney'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[minmax(160px,190px)_1fr] sm:gap-3">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900">{value}</dd>
    </div>
  )
}

function kalanGunLabel(days: number | null): string {
  if (days == null) return '—'
  if (days < 0) return 'Süresi doldu'
  if (days === 0) return 'Bugün bitiyor'
  return `${days} gün`
}

export function AdminSaasMembershipDetailPage() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'general' | 'access' | 'orders'>('general')
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [extendDays, setExtendDays] = useState('365')
  const [extendOpen, setExtendOpen] = useState(false)

  const membershipQuery = useQuery({
    queryKey: ['admin', 'saas-membership', id],
    queryFn: () => adminSaasMembershipsService.getById(id),
    enabled: Boolean(id),
  })

  const refreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin', 'saas-memberships'] }),
      queryClient.invalidateQueries({ queryKey: ['admin', 'saas-membership', id] }),
    ])
    invalidateAdminSidebarBadges(queryClient)
  }

  const statusMutation = useMutation({
    mutationFn: (status: AdminSaasMembershipStatus) => adminSaasMembershipsService.patchStatus(id, status),
    onSuccess: async () => {
      setActionMessage('Abonelik durumu güncellendi.')
      setActionError(null)
      await refreshAll()
    },
    onError: (err) => {
      setActionError(getErrorMessage(err, 'Durum güncellenemedi'))
      setActionMessage(null)
    },
  })

  const extendMutation = useMutation({
    mutationFn: (days: number) => adminSaasMembershipsService.extend(id, days),
    onSuccess: async () => {
      setActionMessage('Abonelik süresi uzatıldı.')
      setActionError(null)
      await refreshAll()
    },
    onError: (err) => {
      setActionError(getErrorMessage(err, 'Abonelik uzatılamadı'))
      setActionMessage(null)
    },
  })

  const membership = membershipQuery.data
  const nextEndDatePreview = useMemo(() => {
    if (!membership) return '—'
    const days = Number(extendDays)
    if (!Number.isFinite(days) || days < 1) return '—'
    const base = new Date(membership.licenseEndDate)
    const today = new Date()
    const baseDate = base.getTime() > today.getTime() ? base : today
    baseDate.setDate(baseDate.getDate() + days)
    return formatDateTime(baseDate.toISOString())
  }, [membership, extendDays])

  const handleStatusChange = (nextStatus: AdminSaasMembershipStatus) => {
    const confirmText =
      nextStatus === 'ACTIVE'
        ? 'Bu erişim tekrar aktif edilsin mi?'
        : nextStatus === 'SUSPENDED'
          ? 'Bu erişim askıya alınsın mı?'
          : 'Bu erişim süresi dolmuş olarak işaretlensin mi?'
    if (!window.confirm(confirmText)) return
    void statusMutation.mutateAsync(nextStatus)
  }

  const handleExtend = () => {
    const days = Number(extendDays)
    if (!Number.isFinite(days) || days < 1) {
      setActionError('Geçerli bir uzatma günü girin.')
      setActionMessage(null)
      return
    }
    void extendMutation.mutateAsync(days).then(() => setExtendOpen(false))
  }

  if (membershipQuery.isLoading) {
    return (
      <div className="w-full min-w-0 space-y-6">
        <LoadingState label="SaaS abonelik detayı yükleniyor…" />
      </div>
    )
  }

  if (membershipQuery.isError || !membership) {
    return (
      <div className="w-full min-w-0 space-y-6">
        <Link to="/admin/saas-subscriptions" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" />
          SaaS Abonelikleri
        </Link>
        <EmptyState
          title="SaaS aboneliği bulunamadı"
          description={getErrorMessage(membershipQuery.error, 'Kayıt okunamadı veya silinmiş olabilir.')}
        />
      </div>
    )
  }

  const busy = statusMutation.isPending || extendMutation.isPending

  return (
    <div className="w-full min-w-0 space-y-6">
      <Link to="/admin/saas-subscriptions" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" />
        SaaS Abonelikleri
      </Link>

      <PageHeader
        title={membership.customerName || 'SaaS abonelik detayı'}
        description={membership.customerEmail}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => void membershipQuery.refetch()} disabled={membershipQuery.isFetching || busy}>
              <RefreshCw className={`h-4 w-4 ${membershipQuery.isFetching ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setExtendOpen(true)} disabled={busy}>
              Manuel uzatma
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleStatusChange('ACTIVE')} disabled={busy}>
              Aktif et
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleStatusChange('SUSPENDED')} disabled={busy}>
              Askıya al
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleStatusChange('EXPIRED')} disabled={busy}>
              Süresi doldu yap
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Badge tone={adminSaasMembershipStatusTone(membership.effectiveStatus)}>
          {adminSaasMembershipStatusLabel(membership.effectiveStatus)}
        </Badge>
        <Badge tone="default">{membership.productName}</Badge>
        <Badge tone={membership.kalanGun != null && membership.kalanGun < 0 ? 'warning' : 'default'}>
          {kalanGunLabel(membership.kalanGun)}
        </Badge>
      </div>

      <Card className="border-emerald-200 bg-emerald-50/60">
        <CardBody className="space-y-2">
          <p className="text-sm font-semibold text-emerald-950">SaaS erişim yönetimi</p>
          <p className="text-sm text-emerald-900">
            Bu kayıt merkezi lisans sistemine gitmez. Web tabanlı ürün erişimi website veritabanı ve tenant bilgileri
            üzerinden takip edilir.
          </p>
        </CardBody>
      </Card>

      {actionMessage ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardBody className="text-sm text-emerald-800">{actionMessage}</CardBody>
        </Card>
      ) : null}
      {actionError ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody className="text-sm text-red-700">{actionError}</CardBody>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardBody className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Abonelik</p>
            <p className="text-sm font-semibold text-slate-900">{membership.productName}</p>
            <p className="text-sm text-slate-600">{formatDateTime(membership.licenseStartDate)} → {formatDateTime(membership.licenseEndDate)}</p>
            <p className="text-sm text-slate-800">{kalanGunLabel(membership.kalanGun)}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Erişim</p>
            <p className="font-mono text-xs text-slate-800">{membership.tenantId}</p>
            <p className="font-mono text-xs text-slate-600">{membership.tenantSlug}</p>
            <p className="font-mono text-xs text-slate-600">{membership.licenseKey}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sipariş</p>
            <p className="text-sm text-slate-900">İlk: {membership.firstOrderNo ?? '—'}</p>
            <p className="text-sm text-slate-600">Son: {membership.lastOrderNo ?? '—'}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Durum</p>
            <p className="text-sm text-slate-900">{adminSaasMembershipStatusLabel(membership.status)}</p>
            <p className="text-sm text-slate-600">Son güncelleme: {formatDateTime(membership.updatedAt)}</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
            {[
              { id: 'general', label: 'Genel' },
              { id: 'access', label: 'Abonelik & Erişim' },
              { id: 'orders', label: 'Siparişler' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as 'general' | 'access' | 'orders')}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  activeTab === tab.id ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'general' ? (
            <dl className="space-y-3">
              <DetailRow label="Müşteri" value={membership.customerName} />
              <DetailRow label="E-posta" value={membership.customerEmail} />
              <DetailRow label="Sahip e-posta" value={membership.ownerEmail} />
              <DetailRow label="Ürün" value={membership.productName} />
              <DetailRow label="Durum" value={adminSaasMembershipStatusLabel(membership.effectiveStatus)} />
              <DetailRow label="İlk sipariş" value={membership.firstOrderNo ?? 'Manuel'} />
              <DetailRow label="Son sipariş" value={membership.lastOrderNo ?? '—'} />
              <DetailRow label="Son işlem" value={formatDateTime(membership.updatedAt)} />
              {membership.lastProvisionError ? <DetailRow label="Provision uyarısı" value={membership.lastProvisionError} /> : null}
            </dl>
          ) : null}

          {activeTab === 'access' ? (
            <dl className="space-y-3">
              <DetailRow label="Başlangıç" value={formatDateTime(membership.licenseStartDate)} />
              <DetailRow label="Bitiş" value={formatDateTime(membership.licenseEndDate)} />
              <DetailRow label="Kalan gün" value={kalanGunLabel(membership.kalanGun)} />
              <DetailRow label="Kaydedilen durum" value={adminSaasMembershipStatusLabel(membership.status)} />
              <DetailRow label="Etkin durum" value={adminSaasMembershipStatusLabel(membership.effectiveStatus)} />
              <DetailRow label="Tenant ID" value={<span className="font-mono text-xs">{membership.tenantId}</span>} />
              <DetailRow label="Tenant slug" value={<span className="font-mono text-xs">{membership.tenantSlug}</span>} />
              <DetailRow label="License key" value={<span className="font-mono text-xs">{membership.licenseKey}</span>} />
            </dl>
          ) : null}

          {activeTab === 'orders' ? (
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>Sipariş no</TH>
                    <TH>Satır / ürün</TH>
                    <TH>Durum</TH>
                    <TH>Tutar</TH>
                    <TH>Tarih</TH>
                    <TH>Uyarı</TH>
                    <TH className="w-10"> </TH>
                  </TR>
                </THead>
                <TBody>
                  {membership.orderHistory.length === 0 ? (
                    <TR>
                      <TD colSpan={7} className="text-center text-sm text-slate-500">
                        Sipariş geçmişi bulunamadı.
                      </TD>
                    </TR>
                  ) : (
                    membership.orderHistory.map((row) => (
                      <TR key={`${row.orderId}-${row.orderNo}`}>
                        <TD className="whitespace-nowrap font-medium">{row.orderNo}</TD>
                        <TD className="max-w-[16rem] truncate text-sm">{row.productName}</TD>
                        <TD>
                          <Badge tone={orderStatusMeta(row.orderStatus).tone}>{orderStatusMeta(row.orderStatus).label}</Badge>
                        </TD>
                        <TD className="whitespace-nowrap text-sm">{formatMoney(row.total, row.currency)}</TD>
                        <TD className="whitespace-nowrap text-xs text-slate-500">{formatDateTime(row.createdAt)}</TD>
                        <TD className="text-xs text-amber-700">{row.provisionError ?? '—'}</TD>
                        <TD>
                          <Link
                            to={`/admin/orders/${row.orderId}`}
                            className="inline-flex text-brand-600 hover:text-brand-700"
                            title="Sipariş detayı"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </TD>
                      </TR>
                    ))
                  )}
                </TBody>
              </Table>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardBody className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Müşteri bilgileri</h2>
            <dl className="space-y-3">
              <DetailRow label="Müşteri" value={membership.customerName} />
              <DetailRow label="E-posta" value={membership.customerEmail} />
              <DetailRow label="Sahip e-posta" value={membership.ownerEmail} />
              <DetailRow label="Müşteri ID" value={<span className="font-mono text-xs">{membership.customerId}</span>} />
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Ürün ve tenant bilgisi</h2>
            <dl className="space-y-3">
              <DetailRow label="Ürün" value={membership.productName} />
              <DetailRow label="Ürün kodu" value={membership.productCode} />
              <DetailRow label="Tenant ID" value={<span className="font-mono text-xs">{membership.tenantId}</span>} />
              <DetailRow label="Tenant slug" value={<span className="font-mono text-xs">{membership.tenantSlug}</span>} />
              <DetailRow label="License key" value={<span className="font-mono text-xs">{membership.licenseKey}</span>} />
            </dl>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardBody className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">İlk sipariş</h2>
            {membership.firstOrder ? (
              <dl className="space-y-3">
                <DetailRow label="Sipariş no" value={membership.firstOrder.orderNo} />
                <DetailRow
                  label="Durum"
                  value={<Badge tone={orderStatusMeta(membership.firstOrder.orderStatus).tone}>{orderStatusMeta(membership.firstOrder.orderStatus).label}</Badge>}
                />
                <DetailRow label="Tutar" value={formatMoney(membership.firstOrder.total, membership.firstOrder.currency)} />
                <DetailRow label="Sipariş tarihi" value={formatDateTime(membership.firstOrder.createdAt)} />
                <DetailRow
                  label="Sipariş detayı"
                  value={
                    <Link to={`/admin/orders/${membership.firstOrder.orderId}`} className="inline-flex items-center gap-1 font-medium text-brand-700 hover:underline">
                      Siparişi aç
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  }
                />
              </dl>
            ) : (
              <p className="text-sm text-slate-500">İlk sipariş bağlantısı bulunamadı.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Son sipariş / son işlem</h2>
            {membership.lastOrder ? (
              <dl className="space-y-3">
                <DetailRow label="Sipariş no" value={membership.lastOrder.orderNo} />
                <DetailRow
                  label="Durum"
                  value={<Badge tone={orderStatusMeta(membership.lastOrder.orderStatus).tone}>{orderStatusMeta(membership.lastOrder.orderStatus).label}</Badge>}
                />
                <DetailRow label="Tutar" value={formatMoney(membership.lastOrder.total, membership.lastOrder.currency)} />
                <DetailRow label="Sipariş tarihi" value={formatDateTime(membership.lastOrder.createdAt)} />
                <DetailRow
                  label="Sipariş detayı"
                  value={
                    <Link to={`/admin/orders/${membership.lastOrder.orderId}`} className="inline-flex items-center gap-1 font-medium text-brand-700 hover:underline">
                      Siparişi aç
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  }
                />
              </dl>
            ) : (
              <p className="text-sm text-slate-500">Son sipariş bağlantısı bulunamadı.</p>
            )}
          </CardBody>
        </Card>
      </div>

      <ConfirmDialog
        open={extendOpen}
        title="Süre uzat"
        description={
          <div className="space-y-3">
            <Input label="Gün sayısı" type="number" min={1} value={extendDays} onChange={(e) => setExtendDays(e.target.value)} />
            <p>
              Yeni bitiş tarihi: <strong>{nextEndDatePreview}</strong>
            </p>
          </div>
        }
        confirmLabel="Uzatmayı kaydet"
        loading={extendMutation.isPending}
        onCancel={() => setExtendOpen(false)}
        onConfirm={handleExtend}
      />
    </div>
  )
}
