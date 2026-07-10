import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Cloud, CreditCard, ExternalLink, KeyRound, Mail, Pencil, RefreshCw, ShoppingBag, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { getErrorMessage } from '@/api/client'
import { adminCustomersService } from '@/services/adminCustomersService'
import {
  adminSaasMembershipStatusLabel,
  adminSaasMembershipStatusTone,
  type AdminSaasMembershipStatus,
} from '@/types/adminSaasMembership'
import { formatMoney } from '@/utils/formatMoney'
import {
  formatDateTime,
  orderStatusMeta,
  paymentBadgeLabel,
  paymentBadgeTone,
  paymentMethodLabel,
  resolvePaymentBadgeKind,
} from '@/utils/adminOrderUi'
import { cn } from '@/lib/cn'

type TabId = 'general' | 'orders' | 'payments' | 'saas' | 'licenses'

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[minmax(140px,170px)_1fr] sm:gap-3">
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

export function AdminCustomerDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabId>('general')
  const [statusOpen, setStatusOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const detailQuery = useQuery({
    queryKey: ['admin', 'customer', id],
    queryFn: () => adminCustomersService.getById(id),
    enabled: Boolean(id),
  })

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] }),
      queryClient.invalidateQueries({ queryKey: ['admin', 'customer', id] }),
    ])
  }

  const statusMutation = useMutation({
    mutationFn: (isActive: boolean) => adminCustomersService.patchStatus(id, isActive),
    onSuccess: async (_data, isActive) => {
      setActionMessage(isActive ? 'Müşteri aktif edildi.' : 'Müşteri pasife alındı.')
      setActionError(null)
      setStatusOpen(false)
      await invalidate()
    },
    onError: (err) => {
      setActionError(getErrorMessage(err, 'Durum güncellenemedi'))
      setActionMessage(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => adminCustomersService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] })
      navigate('/admin/customers')
    },
    onError: (err) => {
      setActionError(getErrorMessage(err, 'Müşteri silinemedi'))
      setDeleteOpen(false)
    },
  })

  const data = detailQuery.data
  const customer = data?.customer
  const summary = data?.summary

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: 'general', label: 'Genel' },
    { id: 'orders', label: 'Siparişler' },
    { id: 'payments', label: 'Ödemeler' },
    { id: 'saas', label: 'SaaS Abonelikleri' },
    { id: 'licenses', label: 'Masaüstü Lisans Özetleri' },
  ]

  if (detailQuery.isLoading) return <LoadingState label="Müşteri detayı yükleniyor…" />

  if (detailQuery.isError || !data || !customer || !summary) {
    return (
      <div className="space-y-4">
        <Link to="/admin/customers" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" />
          Müşteriler
        </Link>
        <EmptyState
          title="Müşteri bulunamadı"
          description={getErrorMessage(detailQuery.error, 'Kayıt yüklenemedi veya silinmiş olabilir.')}
        />
      </div>
    )
  }

  const saasCreateHref = `/admin/saas-subscriptions/new?customerId=${encodeURIComponent(customer.id)}&customerEmail=${encodeURIComponent(customer.email)}`
  const ordersFilterHref = `/admin/orders?customerQuery=${encodeURIComponent(customer.email)}`
  const paymentsFilterHref = `/admin/payments?customerQuery=${encodeURIComponent(customer.email)}`
  const canDelete =
    summary.orderCount === 0 &&
    data.payments.length === 0 &&
    data.saasMemberships.length === 0 &&
    summary.licenseCount === 0
  const deleteBlockReason =
    summary.orderCount > 0
      ? 'Sipariş kaydı var'
      : data.payments.length > 0
        ? 'Ödeme kaydı var'
        : data.saasMemberships.length > 0
          ? 'SaaS aboneliği var'
          : summary.licenseCount > 0
            ? 'Masaüstü lisans kaydı var'
            : null

  return (
    <div className="w-full min-w-0 space-y-6">
      <Link to="/admin/customers" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" />
        Müşteriler
      </Link>

      <PageHeader
        title={customer.name}
        description={customer.email}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => void detailQuery.refetch()} disabled={detailQuery.isFetching}>
              <RefreshCw className={`h-4 w-4 ${detailQuery.isFetching ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
            <Link to={`/admin/customers/${encodeURIComponent(customer.id)}/edit`}>
              <Button variant="secondary" size="sm">
                <Pencil className="h-4 w-4" />
                Düzenle
              </Button>
            </Link>
            <Link to={ordersFilterHref}>
              <Button variant="secondary" size="sm">
                <ShoppingBag className="h-4 w-4" />
                Siparişleri gör
              </Button>
            </Link>
            <Link to={paymentsFilterHref}>
              <Button variant="secondary" size="sm">
                <CreditCard className="h-4 w-4" />
                Ödemeleri gör
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setStatusOpen(true)}
              disabled={statusMutation.isPending}
            >
              {customer.isActive ? 'Pasife al' : 'Aktif et'}
            </Button>
            <Link to={saasCreateHref}>
              <Button size="sm">
                <Cloud className="h-4 w-4" />
                SaaS aboneliği oluştur
              </Button>
            </Link>
            <a href={`mailto:${customer.email}`}>
              <Button variant="secondary" size="sm">
                <Mail className="h-4 w-4" />
                E-posta gönder
              </Button>
            </a>
          </div>
        }
      />

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

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={customer.isActive ? 'success' : 'warning'}>{customer.isActive ? 'Aktif hesap' : 'Pasif hesap'}</Badge>
        {customer.isCorporate ? <Badge tone="default">Kurumsal</Badge> : <Badge tone="default">Bireysel</Badge>}
        {customer.phone ? <span className="text-sm text-slate-600">{customer.phone}</span> : null}
        {customer.companyName ? <span className="text-sm text-slate-600">{customer.companyName}</span> : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardBody className="p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Toplam sipariş</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.orderCount}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Toplam ödeme</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {formatMoney(summary.totalPaidAmount, summary.currency)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Aktif SaaS</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.activeSaasMembershipCount}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Son işlem</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {summary.lastActivityAt ? formatDateTime(summary.lastActivityAt) : '—'}
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardBody className="space-y-3 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Müşteri bilgisi</h3>
            <dl className="space-y-2">
              <DetailRow label="Ad soyad" value={customer.name} />
              <DetailRow label="E-posta" value={customer.email} />
              <DetailRow label="Telefon" value={customer.phone ?? '—'} />
              <DetailRow label="Şirket" value={customer.companyName ?? '—'} />
              <DetailRow label="Vergi dairesi" value={customer.taxOffice ?? '—'} />
              <DetailRow label="Vergi no" value={customer.taxNumber ?? '—'} />
            </dl>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="space-y-3 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Sipariş özeti</h3>
            <dl className="space-y-2">
              <DetailRow label="Toplam sipariş" value={summary.orderCount} />
              <DetailRow label="Ödenen" value={summary.paidOrderCount} />
              <DetailRow label="Bekleyen ödeme" value={summary.pendingOrderCount} />
              <DetailRow label="Toplam ciro" value={formatMoney(summary.totalPaidAmount, summary.currency)} />
            </dl>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="space-y-3 p-4">
            <h3 className="text-sm font-semibold text-slate-900">SaaS abonelik özeti</h3>
            <dl className="space-y-2">
              <DetailRow label="Aktif abonelik" value={summary.activeSaasMembershipCount} />
              <DetailRow label="Süresi dolan" value={summary.expiredSaasMembershipCount} />
              <DetailRow
                label="En yakın bitiş"
                value={summary.nearestSaasEndDate ? formatDateTime(summary.nearestSaasEndDate) : '—'}
              />
            </dl>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="space-y-3 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Son işlem</h3>
            <dl className="space-y-2">
              <DetailRow
                label="Son sipariş"
                value={summary.lastOrderDate ? formatDateTime(summary.lastOrderDate) : '—'}
              />
              <DetailRow
                label="Son ödeme"
                value={summary.lastPaymentDate ? formatDateTime(summary.lastPaymentDate) : '—'}
              />
              <DetailRow
                label="Son abonelik hareketi"
                value={summary.lastSaasActivityAt ? formatDateTime(summary.lastSaasActivityAt) : '—'}
              />
            </dl>
          </CardBody>
        </Card>
      </div>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex flex-wrap gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'border-b-2 px-1 pb-3 text-sm font-medium transition',
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'general' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardBody className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Hesap bilgileri</h3>
              <dl className="space-y-2">
                <DetailRow label="Hesap durumu" value={customer.isActive ? 'Aktif' : 'Pasif'} />
                <DetailRow label="Oluşturulma" value={formatDateTime(customer.createdAt)} />
                <DetailRow label="Son güncelleme" value={formatDateTime(customer.updatedAt)} />
                <DetailRow label="Fatura tipi" value={customer.billingType ?? '—'} />
              </dl>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Adresler</h3>
              {data.addresses.length === 0 ? (
                <p className="text-sm text-slate-500">Kayıtlı adres yok.</p>
              ) : (
                <ul className="space-y-3">
                  {data.addresses.map((addr) => (
                    <li key={addr.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                      <div className="font-medium text-slate-900">
                        {addr.title}
                        {addr.isDefault ? <span className="ml-2 text-xs text-emerald-700">(varsayılan)</span> : null}
                      </div>
                      <div className="mt-1 text-slate-700">{addr.fullName}</div>
                      <div className="mt-1 text-slate-600">
                        {addr.addressLine}
                        <br />
                        {[addr.district, addr.city].filter(Boolean).join(' / ')}
                        {addr.postalCode ? ` — ${addr.postalCode}` : ''}
                      </div>
                      {addr.companyName ? <div className="mt-1 text-slate-600">Şirket: {addr.companyName}</div> : null}
                      {addr.taxNumber ? <div className="text-slate-600">Vergi no: {addr.taxNumber}</div> : null}
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      ) : null}

      {activeTab === 'orders' ? (
        data.orders.length === 0 ? (
          <EmptyState title="Sipariş yok" description="Bu müşteriye bağlı sipariş kaydı bulunamadı." />
        ) : (
          <Card>
            <CardBody className="overflow-x-auto p-0">
              <Table>
                <THead>
                  <TR>
                    <TH>Sipariş no</TH>
                    <TH>Ürün</TH>
                    <TH>Tutar</TH>
                    <TH>Ödeme tipi</TH>
                    <TH>Ödeme durumu</TH>
                    <TH>Sipariş durumu</TH>
                    <TH>Tarih</TH>
                    <TH className="w-10"> </TH>
                  </TR>
                </THead>
                <TBody>
                  {data.orders.map((order) => {
                    const statusMeta = orderStatusMeta(order.status)
                    const paymentKind = resolvePaymentBadgeKind({
                      status: order.status,
                      paymentProvider: order.paymentProvider,
                      paymentStatus: order.paymentStatus,
                    })
                    return (
                      <TR key={order.id}>
                        <TD className="font-medium">{order.orderNo}</TD>
                        <TD className="max-w-[14rem] truncate text-sm">{order.productSummary}</TD>
                        <TD>{formatMoney(order.total, order.currency)}</TD>
                        <TD className="text-sm">{paymentMethodLabel({ paymentProvider: order.paymentProvider })}</TD>
                        <TD>
                          <Badge tone={paymentBadgeTone(paymentKind)}>{paymentBadgeLabel(paymentKind)}</Badge>
                        </TD>
                        <TD>
                          <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>
                        </TD>
                        <TD className="whitespace-nowrap text-xs text-slate-600">{formatDateTime(order.createdAt)}</TD>
                        <TD>
                          <Link to={`/admin/orders/${encodeURIComponent(order.id)}`} className="text-brand-600 hover:text-brand-700">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </TD>
                      </TR>
                    )
                  })}
                </TBody>
              </Table>
            </CardBody>
          </Card>
        )
      ) : null}

      {activeTab === 'payments' ? (
        data.payments.length === 0 ? (
          <EmptyState title="Ödeme kaydı yok" description="Bu müşteriye bağlı ödeme hareketi bulunamadı." />
        ) : (
          <Card>
            <CardBody className="overflow-x-auto p-0">
              <Table>
                <THead>
                  <TR>
                    <TH>Ödeme no</TH>
                    <TH>Sipariş no</TH>
                    <TH>Ödeme yöntemi</TH>
                    <TH>Tutar</TH>
                    <TH>Durum</TH>
                    <TH>Tarih</TH>
                    <TH className="w-10"> </TH>
                  </TR>
                </THead>
                <TBody>
                  {data.payments.map((payment) => (
                    <TR key={payment.id}>
                      <TD className="font-mono text-xs">{payment.id.slice(0, 8)}…</TD>
                      <TD className="font-medium">{payment.orderNo}</TD>
                      <TD>{paymentMethodLabel({ paymentProvider: payment.provider })}</TD>
                      <TD>{formatMoney(payment.amount, payment.currency)}</TD>
                      <TD>
                        <Badge
                          tone={paymentBadgeTone(
                            resolvePaymentBadgeKind({
                              status: payment.status,
                              paymentProvider: payment.provider,
                              paymentStatus: payment.status,
                            }),
                          )}
                        >
                          {paymentBadgeLabel(
                            resolvePaymentBadgeKind({
                              status: payment.status,
                              paymentProvider: payment.provider,
                              paymentStatus: payment.status,
                            }),
                          )}
                        </Badge>
                      </TD>
                      <TD className="whitespace-nowrap text-xs text-slate-600">{formatDateTime(payment.createdAt)}</TD>
                      <TD>
                        <Link to={`/admin/orders/${encodeURIComponent(payment.orderId)}`} className="text-brand-600 hover:text-brand-700">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </CardBody>
          </Card>
        )
      ) : null}

      {activeTab === 'saas' ? (
        data.saasMemberships.length === 0 ? (
          <EmptyState title="SaaS aboneliği yok" description="Bu müşteriye bağlı CustomerSaasMembership kaydı bulunamadı." />
        ) : (
          <Card>
            <CardBody className="overflow-x-auto p-0">
              <Table>
                <THead>
                  <TR>
                    <TH>Ürün</TH>
                    <TH>Başlangıç / bitiş</TH>
                    <TH>Kalan gün</TH>
                    <TH>Durum</TH>
                    <TH>Tenant</TH>
                    <TH className="w-10"> </TH>
                  </TR>
                </THead>
                <TBody>
                  {data.saasMemberships.map((row) => (
                    <TR key={row.id}>
                      <TD className="font-medium">{row.productName}</TD>
                      <TD className="text-xs text-slate-600">
                        {formatDateTime(row.licenseStartDate)} → {formatDateTime(row.licenseEndDate)}
                      </TD>
                      <TD>{kalanGunLabel(row.kalanGun)}</TD>
                      <TD>
                        <Badge tone={adminSaasMembershipStatusTone(row.effectiveStatus as AdminSaasMembershipStatus)}>
                          {adminSaasMembershipStatusLabel(row.effectiveStatus as AdminSaasMembershipStatus)}
                        </Badge>
                      </TD>
                      <TD className="text-sm">{row.tenantSlug}</TD>
                      <TD>
                        <Link
                          to={`/admin/saas-subscriptions/${encodeURIComponent(row.id)}`}
                          className="text-brand-600 hover:text-brand-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </CardBody>
          </Card>
        )
      ) : null}

      {activeTab === 'licenses' ? (
        <div className="space-y-4">
          <Card className="border-amber-200 bg-amber-50/60">
            <CardBody className="text-sm text-amber-950">
              Bu sekme yalnızca website veritabanındaki masaüstü lisans özetlerini gösterir. Gerçek lisans yönetimi,
              aktivasyon ve cihaz hakları merkezi Woontegra lisans sistemindedir.
            </CardBody>
          </Card>
          {data.licenses.length === 0 ? (
            <EmptyState title="Lisans özeti yok" description="Bu müşteriye bağlı website License kaydı bulunamadı." />
          ) : (
            <Card>
              <CardBody className="overflow-x-auto p-0">
                <Table>
                  <THead>
                    <TR>
                      <TH>Ürün</TH>
                      <TH>Lisans anahtarı</TH>
                      <TH>Kaynak</TH>
                      <TH>Durum</TH>
                      <TH>Bitiş</TH>
                      <TH className="w-10"> </TH>
                    </TR>
                  </THead>
                  <TBody>
                    {data.licenses.map((lic) => (
                      <TR key={lic.id}>
                        <TD>
                          <div className="font-medium">{lic.productName}</div>
                          {lic.productCode ? <div className="text-xs text-slate-500">{lic.productCode}</div> : null}
                        </TD>
                        <TD className="font-mono text-xs">{lic.licenseKey}</TD>
                        <TD className="text-sm">{lic.source}</TD>
                        <TD>
                          <Badge tone={lic.status === 'ACTIVE' ? 'success' : 'warning'}>{lic.status}</Badge>
                        </TD>
                        <TD className="text-xs text-slate-600">
                          {lic.expiresAt ? formatDateTime(lic.expiresAt) : '—'}
                        </TD>
                        <TD>
                          <Link to={`/admin/licenses/${encodeURIComponent(lic.id)}`} className="text-brand-600 hover:text-brand-700">
                            <KeyRound className="h-4 w-4" />
                          </Link>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </CardBody>
            </Card>
          )}
        </div>
      ) : null}

      <Card className="border-red-200">
        <CardBody className="space-y-3">
          <h3 className="text-sm font-semibold text-red-900">Tehlikeli alan</h3>
          {canDelete ? (
            <>
              <p className="text-sm text-slate-600">
                Bu müşterinin ilişkili sipariş, ödeme, SaaS aboneliği veya lisans kaydı yok. Yalnızca test/boş
                kayıtlar kalıcı silinebilir.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Müşteriyi kalıcı sil…
              </Button>
            </>
          ) : (
            <p className="text-sm text-slate-600">
              Bu müşteri silinemez ({deleteBlockReason}). Bunun yerine hesabı pasife alabilirsiniz; ilişkili kayıtlar
              korunur.
            </p>
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        open={statusOpen}
        title={customer.isActive ? 'Müşteriyi pasife al' : 'Müşteriyi aktif et'}
        description={
          customer.isActive
            ? `${customer.name} hesabı pasife alınır; giriş yapamaz.`
            : `${customer.name} hesabı tekrar aktif edilir.`
        }
        confirmLabel={customer.isActive ? 'Pasife al' : 'Aktif et'}
        loading={statusMutation.isPending}
        onCancel={() => setStatusOpen(false)}
        onConfirm={() => statusMutation.mutate(!customer.isActive)}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Müşteriyi kalıcı sil"
        tone="danger"
        confirmLabel="Kalıcı sil"
        description={
          <p>
            <strong>{customer.name}</strong> ({customer.email}) kalıcı olarak silinecek. Bu işlem geri alınamaz.
          </p>
        }
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  )
}
