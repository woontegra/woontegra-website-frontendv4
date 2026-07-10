import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Search, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { getErrorMessage } from '@/api/client'
import { adminTestDataCleanupService } from '@/services/adminTestDataCleanupService'
import { invalidateAdminSidebarBadges } from '@/services/adminSidebarBadgesService'
import {
  EMPTY_CLEANUP_OPTIONS,
  type MkSaasEmailLookupView,
  type TestDataCleanupOptions,
  type TestDataCleanupPreview,
  type TestDataCleanupResult,
} from '@/types/adminTestDataCleanup'
import { formatMoney } from '@/utils/formatMoney'
import { formatDateTime } from '@/utils/adminOrderUi'
import { cn } from '@/lib/cn'

const OPTION_LABELS: { key: keyof TestDataCleanupOptions; label: string; hint?: string }[] = [
  { key: 'deleteOrders', label: 'Siparişleri sil', hint: 'Sipariş kalemleri, yasal arşiv ve bağlı ödemeler dahil' },
  { key: 'deletePayments', label: 'Ödeme kayıtlarını sil', hint: 'Sipariş silinmediyse yalnızca ödeme transaction kayıtları' },
  { key: 'deleteSaasMemberships', label: 'SaaS aboneliklerini sil', hint: 'Website DB kaydı; tenant/provision ayrıca temizlenebilir' },
  { key: 'deleteWebsiteLicenses', label: 'Website lisans özetlerini sil', hint: 'Merkezi lisans sunucusuna dokunmaz' },
  { key: 'deleteCustomer', label: 'Customer kaydını sil', hint: 'Adres ve favoriler dahil; ilişkili kayıtlar önce temizlenmeli' },
  { key: 'deleteUserAccount', label: 'User (admin) hesabını sil', hint: 'Yalnızca admin User tablosu' },
  { key: 'deleteContactMessages', label: 'İletişim mesajlarını sil' },
]

function selectAllOptions(): TestDataCleanupOptions {
  return {
    deleteOrders: true,
    deletePayments: true,
    deleteSaasMemberships: true,
    deleteWebsiteLicenses: true,
    deleteCustomer: true,
    deleteUserAccount: true,
    deleteContactMessages: true,
  }
}

function hasAnyOption(options: TestDataCleanupOptions): boolean {
  return Object.values(options).some(Boolean)
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  )
}

function MkSaasLookupPanel({ lookup }: { lookup: MkSaasEmailLookupView }) {
  const primary = lookup.records[0]
  const tenant = primary?.tenant

  return (
    <Card className={lookup.found ? 'border-amber-300 bg-amber-50' : 'border-slate-200'}>
      <CardBody className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-900">MK SaaS (harici tenant)</h2>
          {lookup.found ? (
            <Badge tone="warning">MK tarafında kayıtlı</Badge>
          ) : lookup.reachable ? (
            <Badge tone="brand">MK kaydı yok</Badge>
          ) : (
            <Badge tone="default">Lookup erişilemedi</Badge>
          )}
        </div>

        <SummaryRow label="API yapılandırması" value={lookup.configured ? 'Var' : 'Yok'} />
        <SummaryRow label="API erişimi" value={lookup.reachable ? 'Erişilebilir' : 'Erişilemedi'} />
        <SummaryRow label="MK tenant durumu" value={lookup.found ? 'Kayıt var' : 'Kayıt yok'} />
        <SummaryRow label="MK kullanıcı durumu" value={primary ? (primary.userActive ? 'Aktif' : 'Pasif') : '—'} />

        {tenant ? (
          <>
            <SummaryRow label="tenantSlug" value={tenant.tenantSlug || '—'} />
            <SummaryRow label="tenantId" value={<span className="font-mono text-xs">{tenant.tenantId}</span>} />
            <SummaryRow label="licenseKey" value={tenant.licenseKey || '—'} />
            <SummaryRow label="externalCustomerId" value={tenant.externalCustomerId || '—'} />
            <SummaryRow label="externalOrderId" value={tenant.externalOrderId || '—'} />
            <SummaryRow label="Lisans durumu" value={tenant.licenseStatus} />
          </>
        ) : null}

        {lookup.error ? <p className="text-sm text-red-700">{lookup.error}</p> : null}
        {lookup.found ? (
          <p className="text-sm font-medium text-amber-900">
            Bu e-posta MK SaaS tarafında hâlâ kayıtlı. Tekrar test yapmadan önce MK kaydı temizlenmeli veya
            Woontegra customerId ile eşleştirilmeli.
          </p>
        ) : null}
        {lookup.manualCleanupHint ? (
          <p className="text-xs text-amber-900">{lookup.manualCleanupHint}</p>
        ) : null}
      </CardBody>
    </Card>
  )
}

export function AdminTestDataCleanupPage() {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [options, setOptions] = useState<TestDataCleanupOptions>({ ...EMPTY_CLEANUP_OPTIONS })
  const [irreversibleConfirmed, setIrreversibleConfirmed] = useState(false)
  const [forceRealEmailCleanup, setForceRealEmailCleanup] = useState(false)
  const [preview, setPreview] = useState<TestDataCleanupPreview | null>(null)
  const [result, setResult] = useState<TestDataCleanupResult | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const previewMutation = useMutation({
    mutationFn: () => adminTestDataCleanupService.preview(email),
    onSuccess: (data) => {
      setPreview(data)
      setResult(null)
      setPreviewError(null)
      setActionError(null)
      setConfirmEmail('')
      setIrreversibleConfirmed(false)
      setForceRealEmailCleanup(false)
      setOptions({ ...EMPTY_CLEANUP_OPTIONS })
    },
    onError: (err) => {
      setPreview(null)
      setPreviewError(getErrorMessage(err, 'Önizleme yüklenemedi'))
    },
  })

  const cleanupMutation = useMutation({
    mutationFn: () =>
      adminTestDataCleanupService.cleanup({
        email: email.trim(),
        confirmEmail: confirmEmail.trim(),
        options,
        forceRealEmailCleanup: preview?.requiresExtraConfirmation ? forceRealEmailCleanup : undefined,
      }),
    onSuccess: (data) => {
      setResult(data)
      setActionError(null)
      setPreview(null)
      setOptions({ ...EMPTY_CLEANUP_OPTIONS })
      setIrreversibleConfirmed(false)
      setConfirmEmail('')
      setForceRealEmailCleanup(false)
      invalidateAdminSidebarBadges(queryClient)
    },
    onError: (err) => setActionError(getErrorMessage(err, 'Temizlik başarısız')),
  })

  const canSubmitCleanup = useMemo(() => {
    if (!preview) return false
    if (!hasAnyOption(options)) return false
    if (!irreversibleConfirmed) return false
    if (confirmEmail.trim().toLowerCase() !== email.trim().toLowerCase()) return false
    if (preview.requiresExtraConfirmation && !forceRealEmailCleanup) return false
    return true
  }, [preview, options, irreversibleConfirmed, confirmEmail, email, forceRealEmailCleanup])

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Test Verisi Temizleme"
        description="Belirli bir e-posta adresine ait test müşteri verilerini önizleyip kontrollü şekilde temizleyin."
      />

      <Card className="border-amber-200 bg-amber-50">
        <CardBody className="space-y-2 text-sm text-amber-900">
          <p className="flex items-start gap-2 font-medium">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            Bu araç yalnızca test amaçlıdır ve geri alınamaz.
          </p>
          <p>
            Masaüstü lisansların gerçek yönetimi merkezi lisans sistemindedir. Bu araç yalnızca website
            veritabanındaki test kayıtlarını temizler.
          </p>
          <p>SaaS tenant/provision tarafında ayrıca temizlik gerekebilir.</p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <Input
              label="E-posta adresi"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@test-saas.woontegra.com"
            />
            <Button
              type="button"
              onClick={() => previewMutation.mutate()}
              disabled={!email.trim() || previewMutation.isPending}
            >
              <Search className="h-4 w-4" />
              Kayıtları Bul
            </Button>
          </div>
          {previewMutation.isPending ? <LoadingState label="Kayıtlar aranıyor…" /> : null}
          {previewError ? <p className="text-sm text-red-700">{previewError}</p> : null}
        </CardBody>
      </Card>

      {preview ? (
        <>
          <Card>
            <CardBody className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900">Kayıt özeti</h2>
                {preview.isLikelyTestEmail ? (
                  <Badge tone="brand">Test e-postası</Badge>
                ) : (
                  <Badge tone="warning">Gerçek e-posta — ekstra onay gerekir</Badge>
                )}
                {preview.hasProtectedPaytrPayments ? (
                  <Badge tone="danger">Korumalı PayTR ödemesi</Badge>
                ) : null}
              </div>

              {preview.warnings.map((w) => (
                <p key={w} className="text-sm text-amber-800">
                  {w}
                </p>
              ))}

              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <SummaryRow label="Customer kaydı" value={preview.customer ? 'Var' : 'Yok'} />
                  <SummaryRow label="User hesabı" value={preview.userAccount ? `Var (${preview.userAccount.role})` : 'Yok'} />
                  <SummaryRow label="Sipariş (aktif)" value={String(preview.counts.orders)} />
                  <SummaryRow label="Sipariş (arşiv)" value={String(preview.counts.archivedOrders)} />
                  <SummaryRow label="Ödeme kayıtları" value={String(preview.counts.paymentTransactions)} />
                  <SummaryRow label="SaaS abonelikleri" value={String(preview.counts.saasMemberships)} />
                  <SummaryRow label="Website lisans özetleri" value={String(preview.counts.websiteLicenses)} />
                  <SummaryRow label="İletişim mesajları" value={String(preview.counts.contactMessages)} />
                  <SummaryRow label="İndirme logları" value={String(preview.counts.downloadLogs)} />
                  <SummaryRow label="Müşteri adresleri" value={String(preview.counts.customerAddresses)} />
                </div>
                <div>
                  <SummaryRow
                    label="Son sipariş"
                    value={preview.totals.lastOrderDate ? formatDateTime(preview.totals.lastOrderDate) : '—'}
                  />
                  <SummaryRow
                    label="Toplam ödenen"
                    value={formatMoney(preview.totals.totalPaidAmount, preview.totals.currency)}
                  />
                  <SummaryRow label="Havale/EFT siparişleri" value={String(preview.paymentMethodBreakdown.bankTransfer)} />
                  <SummaryRow label="PayTR siparişleri" value={String(preview.paymentMethodBreakdown.paytr)} />
                  <SummaryRow label="Korumalı PayTR sipariş" value={String(preview.protectedPaytrOrderCount)} />
                </div>
              </div>
            </CardBody>
          </Card>

          {preview.mkSaasLookup ? <MkSaasLookupPanel lookup={preview.mkSaasLookup} /> : null}

          {preview.previewOrders.length > 0 ? (
            <Card>
              <CardBody className="overflow-x-auto p-0">
                <p className="border-b border-slate-100 px-4 py-3 text-sm font-medium text-slate-700">Siparişler</p>
                <Table>
                  <THead>
                    <TR>
                      <TH>Sipariş no</TH>
                      <TH>Durum</TH>
                      <TH>Ödeme</TH>
                      <TH>Tutar</TH>
                      <TH>Tarih</TH>
                      <TH>Koruma</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {preview.previewOrders.map((o) => (
                      <TR key={o.id}>
                        <TD className="font-mono text-xs">{o.orderNo}</TD>
                        <TD>{o.status}</TD>
                        <TD>{o.paymentProvider}</TD>
                        <TD>{formatMoney(o.total, o.currency)}</TD>
                        <TD>{formatDateTime(o.createdAt)}</TD>
                        <TD>{o.isProtected ? <Badge tone="danger">PayTR</Badge> : '—'}</TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </CardBody>
            </Card>
          ) : null}

          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Temizlik seçenekleri</h2>
              <p className="text-sm text-slate-600">Varsayılan olarak hiçbir seçenek işaretli değildir.</p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setOptions(selectAllOptions())}>
                  Hepsini seç
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => setOptions({ ...EMPTY_CLEANUP_OPTIONS })}>
                  Seçimi temizle
                </Button>
              </div>
              <div className="space-y-3">
                {OPTION_LABELS.map(({ key, label, hint }) => (
                  <label key={key} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={options[key]}
                      onChange={(e) => setOptions((prev) => ({ ...prev, [key]: e.target.checked }))}
                    />
                    <span>
                      <span className="block text-sm font-medium text-slate-900">{label}</span>
                      {hint ? <span className="mt-0.5 block text-xs text-slate-500">{hint}</span> : null}
                    </span>
                  </label>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card className="border-red-200">
            <CardBody className="space-y-4">
              <h2 className="text-lg font-semibold text-red-900">Onay</h2>
              <Input
                label="E-postayı tekrar yazın"
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder={preview.normalizedEmail}
              />
              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={irreversibleConfirmed}
                  onChange={(e) => setIrreversibleConfirmed(e.target.checked)}
                />
                <span>Bu işlem geri alınamaz. Silinecek kayıtları inceledim ve onaylıyorum.</span>
              </label>
              {preview.requiresExtraConfirmation ? (
                <label className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={forceRealEmailCleanup}
                    onChange={(e) => setForceRealEmailCleanup(e.target.checked)}
                  />
                  <span>
                    Gerçek e-posta veya korumalı PayTR kayıtları için riski anlıyorum; yine de temizlemek istiyorum.
                  </span>
                </label>
              ) : null}
              {actionError ? <p className="text-sm text-red-700">{actionError}</p> : null}
              <Button
                type="button"
                variant="danger"
                disabled={!canSubmitCleanup || cleanupMutation.isPending}
                onClick={() => cleanupMutation.mutate()}
              >
                <Trash2 className="h-4 w-4" />
                Test Verilerini Temizle
              </Button>
              {!hasAnyOption(options) ? (
                <p className="text-xs text-slate-500">En az bir temizlik seçeneği işaretleyin.</p>
              ) : null}
            </CardBody>
          </Card>
        </>
      ) : null}

      {result ? (
        <Card className={result.mkSaasStillRegistered ? 'border-amber-300 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}>
          <CardBody className="space-y-4">
            <h2 className={`text-lg font-semibold ${result.mkSaasStillRegistered ? 'text-amber-900' : 'text-emerald-900'}`}>
              Temizlik tamamlandı
            </h2>
            <p className={`text-sm ${result.mkSaasStillRegistered ? 'text-amber-900' : 'text-emerald-800'}`}>
              {result.mkSaasStillRegistered
                ? 'Woontegra website verileri temizlendi ancak MK SaaS tarafında bu e-posta kayıtlı kalıyor. Aynı e-posta ile tekrar test yaparsanız duplicate e-posta (409) hatası alırsınız.'
                : 'Woontegra website verileri temizlendi. MK SaaS tarafında kayıt görünmüyorsa aynı e-posta ile yeni test yapılabilir.'}
            </p>
            {result.warnings.map((w) => (
              <p key={w} className="text-sm text-amber-900">
                {w}
              </p>
            ))}
            {result.mkSaasLookupAfterCleanup ? (
              <MkSaasLookupPanel lookup={result.mkSaasLookupAfterCleanup} />
            ) : null}
            <div className="grid gap-2 text-sm text-emerald-900 sm:grid-cols-2">
              <p>Silinen sipariş: {result.deleted.orders}</p>
              <p>Silinen ödeme kaydı: {result.deleted.paymentTransactions}</p>
              <p>Silinen SaaS aboneliği: {result.deleted.saasMemberships}</p>
              <p>Silinen website lisansı: {result.deleted.websiteLicenses}</p>
              <p>Silinen iletişim mesajı: {result.deleted.contactMessages}</p>
              <p>Silinen indirme logu: {result.deleted.downloadLogs}</p>
              <p>Silinen customer: {result.deleted.customers}</p>
              <p>Silinen user hesabı: {result.deleted.userAccounts}</p>
              <p className={cn(result.skipped.protectedPaytrOrders > 0 && 'font-medium text-amber-900')}>
                Atlanan korumalı PayTR sipariş: {result.skipped.protectedPaytrOrders}
              </p>
            </div>
          </CardBody>
        </Card>
      ) : null}
    </div>
  )
}
