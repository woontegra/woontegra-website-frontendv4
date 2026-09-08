import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Copy, Pencil, Plus, UserCheck, UserX, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { affTable, formatAffiliateDateTime, formatAffiliateTry } from '@/lib/affiliateMoney'
import {
  affiliatePaymentMethodLabel,
  affiliatePayoutStatusLabel,
} from '@/lib/affiliateUiLabels'
import { AffiliateCommissionSalesView } from '@/components/affiliate/AffiliateCommissionSalesView'
import { AffiliateCommissionPayoutModal } from '@/components/affiliate/AffiliateCommissionPayoutModal'
import {
  AFFILIATE_TABLE_PAGE_SIZE,
  AffiliateListPaginationBar,
  emptyAffiliateListPagination,
  normalizeAffiliateListPagination,
} from '@/components/affiliate/AffiliateListPaginationBar'
import {
  getAffiliateDevFixtureCommissions,
  getAffiliateDevFixturePayouts,
  getAffiliateDevFixtureSummary,
  isAffiliateDevFixturesEnabled,
} from '@/lib/affiliateDevFixtures'
import { CLIPBOARD_COPY_ERROR_TR, copyTextToClipboard } from '@/lib/copyTextToClipboard'
import {
  adminAffiliatePartnersService,
  getErrorMessage,
} from '@/services/adminAffiliatePartnersService'
import { useToastStore } from '@/store/toastStore'
import type { AffiliatePartnerFinancialSummary } from '@/types/affiliatePartner'

const emptySummary: AffiliatePartnerFinancialSummary = {
  saleCount: 0,
  totalGrossPaidAmountKurus: 0,
  totalCommissionBaseAmountKurus: 0,
  lifetimeEarnedCommissionKurus: 0,
  paidCommissionKurus: 0,
  pendingCommissionKurus: 0,
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 px-4 py-3 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  )
}

function DashedEmpty({ children }: { children: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
      {children}
    </div>
  )
}

export function AdminAffiliatePartnerDetailPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const toast = useToastStore((s) => s.show)
  const [magicUrl, setMagicUrl] = useState<string | null>(null)
  const [magicExpiresAt, setMagicExpiresAt] = useState<string | null>(null)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [payoutModalOpen, setPayoutModalOpen] = useState(false)
  const [linksPage, setLinksPage] = useState(1)
  const [commissionsPage, setCommissionsPage] = useState(1)
  const [payoutsPage, setPayoutsPage] = useState(1)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'affiliate-partners', id],
    queryFn: () => adminAffiliatePartnersService.getById(id!),
    enabled: Boolean(id),
  })

  const useDevFixtures = isAffiliateDevFixturesEnabled()

  const summaryQuery = useQuery({
    queryKey: ['admin', 'affiliate-partners', id, 'summary', useDevFixtures ? 'dev-fixtures' : 'live'],
    queryFn: () =>
      useDevFixtures
        ? Promise.resolve(getAffiliateDevFixtureSummary())
        : adminAffiliatePartnersService.getSummary(id!),
    enabled: Boolean(id),
  })

  const linksQuery = useQuery({
    queryKey: ['admin', 'affiliate-partners', id, 'links', linksPage],
    queryFn: () => adminAffiliatePartnersService.listLinks(id!, linksPage, AFFILIATE_TABLE_PAGE_SIZE),
    enabled: Boolean(id),
  })

  const commissionsQuery = useQuery({
    queryKey: [
      'admin',
      'affiliate-partners',
      id,
      'commissions',
      useDevFixtures ? 'dev-fixtures' : 'live',
      commissionsPage,
    ],
    queryFn: () =>
      useDevFixtures
        ? Promise.resolve(getAffiliateDevFixtureCommissions())
        : adminAffiliatePartnersService.listCommissions(id!, commissionsPage, AFFILIATE_TABLE_PAGE_SIZE),
    enabled: Boolean(id),
  })

  const payoutsQuery = useQuery({
    queryKey: [
      'admin',
      'affiliate-partners',
      id,
      'payouts',
      useDevFixtures ? 'dev-fixtures' : 'live',
      payoutsPage,
    ],
    queryFn: () =>
      useDevFixtures
        ? Promise.resolve(getAffiliateDevFixturePayouts())
        : adminAffiliatePartnersService.listPayouts(id!, payoutsPage, AFFILIATE_TABLE_PAGE_SIZE),
    enabled: Boolean(id),
  })

  const assignableProducts = useMemo(
    () => (data?.products ?? []).filter((p) => p.isActive && p.productId),
    [data?.products],
  )

  const statusMutation = useMutation({
    mutationFn: async (nextActive: boolean) => {
      if (!id) throw new Error('Kayıt bulunamadı')
      return nextActive
        ? adminAffiliatePartnersService.activate(id)
        : adminAffiliatePartnersService.deactivate(id)
    },
    onSuccess: (partner) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'affiliate-partners'] })
      toast(partner.isActive ? 'İş ortağı aktifleştirildi' : 'İş ortağı pasifleştirildi', 'success')
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  const inviteMutation = useMutation({
    mutationFn: () => adminAffiliatePartnersService.invitePartnerAccess(id!),
    onSuccess: (result) => {
      setMagicUrl(result.magicUrl)
      setMagicExpiresAt(result.expiresAt)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'affiliate-partners', id] })
      toast('Partner giriş linki oluşturuldu', 'success')
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  const revokeMutation = useMutation({
    mutationFn: () => adminAffiliatePartnersService.revokePartnerAccess(id!),
    onSuccess: () => {
      setMagicUrl(null)
      setMagicExpiresAt(null)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'affiliate-partners', id] })
      toast('Partner erişimi iptal edildi', 'success')
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  const createLinkMutation = useMutation({
    mutationFn: () => adminAffiliatePartnersService.createLink(id!, selectedProductId),
    onSuccess: () => {
      setSelectedProductId('')
      setLinksPage(1)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'affiliate-partners', id] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'affiliate-partners', id, 'links'] })
      toast('Tanıtım bağlantısı oluşturuldu', 'success')
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  if (isLoading) return <LoadingState label="İş ortağı yükleniyor…" />
  if (isError || !data) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-rose-600">{getErrorMessage(error)}</p>
        <Button variant="secondary" onClick={() => void refetch()}>
          Yeniden dene
        </Button>
      </div>
    )
  }

  const hasEmail = Boolean(data.email?.includes('@'))
  const accessActive = Boolean(data.partnerAccess && !data.partnerAccess.isRevoked)
  const summary = summaryQuery.data ?? emptySummary
  const commissionItems = commissionsQuery.data?.items ?? []
  const commissionsPagination = normalizeAffiliateListPagination(
    commissionsQuery.data?.pagination ?? emptyAffiliateListPagination(),
  )
  const payoutItems = payoutsQuery.data?.items ?? []
  const payoutsPagination = normalizeAffiliateListPagination(
    payoutsQuery.data?.pagination ?? emptyAffiliateListPagination(),
  )
  const linkItems = linksQuery.data?.items ?? []
  const linksPagination = normalizeAffiliateListPagination(
    linksQuery.data?.pagination ?? emptyAffiliateListPagination(),
  )

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title={data.name}
        description={
          useDevFixtures
            ? 'İş ortağı detayı · DEV sahte finans verisi (DB yazılmaz)'
            : 'İş ortağı detayı'
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/is-ortaklari">
              <Button variant="secondary">Listeye dön</Button>
            </Link>
            <Link to={`/admin/is-ortaklari/${data.id}/duzenle`}>
              <Button variant="secondary">
                <Pencil className="h-4 w-4" />
                Düzenle
              </Button>
            </Link>
            {data.isActive ? (
              <Button
                variant="secondary"
                onClick={() => {
                  if (!window.confirm(`“${data.name}” pasifleştirilsin mi?`)) return
                  void statusMutation.mutateAsync(false)
                }}
                disabled={statusMutation.isPending}
              >
                <UserX className="h-4 w-4" />
                Pasifleştir
              </Button>
            ) : (
              <Button onClick={() => void statusMutation.mutateAsync(true)} disabled={statusMutation.isPending}>
                <UserCheck className="h-4 w-4" />
                Aktifleştir
              </Button>
            )}
          </div>
        }
      />

      <Card>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">İletişim adı</div>
            <div className="mt-1 text-sm">{data.contactName || '—'}</div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Durum</div>
            <div className="mt-1">
              <Badge tone={data.isActive ? 'success' : 'default'}>{data.isActive ? 'Aktif' : 'Pasif'}</Badge>
            </div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">E-posta</div>
            <div className="mt-1 text-sm">{data.email || '—'}</div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Telefon</div>
            <div className="mt-1 text-sm">{data.phone || '—'}</div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Varsayılan komisyon</div>
            <div className="mt-1 text-sm">%{data.defaultCommissionRate}</div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Kayıt tarihi</div>
            <div className="mt-1 text-sm">{new Date(data.createdAt).toLocaleString('tr-TR')}</div>
          </div>
          {data.internalNotes ? (
            <div className="sm:col-span-2">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">İç not</div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{data.internalNotes}</p>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Partner Paneli</h2>
            <p className="mt-1 text-sm text-slate-600">
              Şifresiz güvenli erişim: tek kullanımlık giriş bağlantısı oluşturun (yaklaşık 30 dakika geçerli).
            </p>
          </div>

          {!hasEmail ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Davet için iş ortağının e-postası gerekli.
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={!hasEmail || inviteMutation.isPending}
              onClick={() => void inviteMutation.mutateAsync()}
            >
              {accessActive ? 'Yeni Giriş Linki Oluştur' : 'Partner Erişimi Oluştur'}
            </Button>
            {accessActive ? (
              <Button
                type="button"
                variant="secondary"
                disabled={revokeMutation.isPending}
                onClick={() => {
                  if (!window.confirm('Partner erişimi iptal edilsin mi?')) return
                  void revokeMutation.mutateAsync()
                }}
              >
                Erişimi İptal Et
              </Button>
            ) : null}
          </div>

          {data.partnerAccess ? (
            <div className="text-sm text-slate-600">
              Erişim durumu:{' '}
              <Badge tone={data.partnerAccess.isRevoked ? 'default' : 'success'}>
                {data.partnerAccess.isRevoked ? 'İptal' : 'Aktif'}
              </Badge>{' '}
              · {data.partnerAccess.email}
            </div>
          ) : null}

          {magicUrl ? (
            <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <div className="text-sm font-semibold text-emerald-900">Partner giriş linki</div>
              <p className="text-xs text-emerald-800">
                Bu bağlantı yalnızca bir kez gösterilir. Sayfa yenilenince tekrar görünmez. Tek kullanımlıktır
                {magicExpiresAt ? ` · süre: ${new Date(magicExpiresAt).toLocaleString('tr-TR')}` : ''}.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <code className="block flex-1 break-all rounded-lg bg-white px-3 py-2 text-xs text-slate-800">
                  {magicUrl}
                </code>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    void (async () => {
                      try {
                        await copyTextToClipboard(magicUrl)
                        toast('Bağlantı kopyalandı', 'success')
                      } catch {
                        toast(CLIPBOARD_COPY_ERROR_TR, 'error')
                      }
                    })()
                  }}
                >
                  <Copy className="h-4 w-4" />
                  Kopyala
                </Button>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Finansal Özet</h2>
              <p className="mt-1 text-sm text-slate-600">Bu iş ortağına ait tahsilat ve komisyon özeti</p>
            </div>
            {!useDevFixtures ? (
              <Button type="button" onClick={() => setPayoutModalOpen(true)}>
                <Wallet className="h-4 w-4" />
                Komisyon Ödemesi Yap
              </Button>
            ) : null}
          </div>
          {summaryQuery.isLoading ? <LoadingState label="Finansal özet yükleniyor…" /> : null}
          {summaryQuery.isError ? (
            <p className="text-sm text-rose-600">{getErrorMessage(summaryQuery.error)}</p>
          ) : null}
          {!summaryQuery.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SummaryMetric label="Satış" value={String(summary.saleCount)} />
              <SummaryMetric label="Tahsilat" value={formatAffiliateTry(summary.totalGrossPaidAmountKurus)} />
              <SummaryMetric
                label="Matrah"
                value={formatAffiliateTry(summary.totalCommissionBaseAmountKurus)}
              />
              <SummaryMetric
                label="Hak edilen"
                value={formatAffiliateTry(summary.lifetimeEarnedCommissionKurus)}
              />
              <SummaryMetric label="Ödenen" value={formatAffiliateTry(summary.paidCommissionKurus)} />
              <SummaryMetric label="Bekleyen" value={formatAffiliateTry(summary.pendingCommissionKurus)} />
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Komisyonlar</h2>
            <p className="mt-1 text-sm text-slate-600">Satış bazlı komisyon kayıtları</p>
          </div>
          {commissionsQuery.isLoading ? <LoadingState label="Komisyonlar yükleniyor…" /> : null}
          {commissionsQuery.isError ? (
            <p className="text-sm text-rose-600">{getErrorMessage(commissionsQuery.error)}</p>
          ) : null}
          {!commissionsQuery.isLoading && commissionsPagination.total === 0 ? (
            <DashedEmpty>Henüz satış yok</DashedEmpty>
          ) : null}
          {!commissionsQuery.isLoading && commissionItems.length > 0 ? (
            <>
              <AffiliateCommissionSalesView items={commissionItems} variant="admin" />
              <AffiliateListPaginationBar
                pagination={commissionsPagination}
                disabled={commissionsQuery.isFetching}
                onPageChange={setCommissionsPage}
              />
            </>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Ödeme Geçmişi</h2>
            <p className="mt-1 text-sm text-slate-600">Kaydedilmiş komisyon ödemeleri</p>
          </div>
          {payoutsQuery.isLoading ? <LoadingState label="Ödemeler yükleniyor…" /> : null}
          {payoutsQuery.isError ? (
            <p className="text-sm text-rose-600">{getErrorMessage(payoutsQuery.error)}</p>
          ) : null}
          {!payoutsQuery.isLoading && payoutsPagination.total === 0 ? (
            <DashedEmpty>Henüz ödeme kaydı yok</DashedEmpty>
          ) : null}
          {!payoutsQuery.isLoading && payoutItems.length > 0 ? (
            <>
              <Table tableClassName={affTable.adminPayoutTable}>
                <colgroup>
                  <col className="w-[9rem]" />
                  <col className="w-[8rem]" />
                  <col className="w-[9rem]" />
                  <col className="w-[14%]" />
                  <col className="w-[7.5rem]" />
                  <col />
                </colgroup>
                <THead>
                  <TR>
                    <TH className={affTable.th}>Tarih</TH>
                    <TH className={`${affTable.th} text-right`}>Tutar</TH>
                    <TH className={affTable.th}>Yöntem</TH>
                    <TH className={affTable.th}>Referans</TH>
                    <TH className={affTable.th}>Durum</TH>
                    <TH className={`${affTable.th} ${affTable.grow}`}>Not</TH>
                  </TR>
                </THead>
                <TBody>
                  {payoutItems.map((row) => (
                    <TR key={row.id}>
                      <TD className={`${affTable.td} ${affTable.date}`}>
                        {formatAffiliateDateTime(row.paidAt || row.createdAt)}
                      </TD>
                      <TD className={`${affTable.td} ${affTable.money}`}>
                        {formatAffiliateTry(row.amountKurus)}
                      </TD>
                      <TD className={`${affTable.td} ${affTable.method}`}>
                        {affiliatePaymentMethodLabel(row.paymentMethod)}
                      </TD>
                      <TD className={`${affTable.td} whitespace-nowrap`}>{row.reference || '—'}</TD>
                      <TD className={`${affTable.td} ${affTable.status}`}>
                        {affiliatePayoutStatusLabel(row.status)}
                      </TD>
                      <TD className={`${affTable.td} ${affTable.grow}`}>{row.notes || '—'}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
              <AffiliateListPaginationBar
                pagination={payoutsPagination}
                disabled={payoutsQuery.isFetching}
                onPageChange={setPayoutsPage}
              />
            </>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Tanıtım Bağlantıları</h2>
              <p className="mt-1 text-sm text-slate-600">
                Atanmış ürünlerden biri için benzersiz satış bağlantısı oluşturun.
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <label className="space-y-1 text-sm">
                <span className="font-medium text-slate-700">Ürün</span>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="h-10 min-w-[220px] rounded-lg border border-slate-200 bg-white px-3 text-sm"
                >
                  <option value="">Ürün seçin</option>
                  {assignableProducts.map((p) => (
                    <option key={p.productId} value={p.productId}>
                      {p.product?.name ?? p.productId} · komisyon %{p.commissionRatePercent} · indirim %
                      {p.discountRatePercent}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                type="button"
                disabled={!selectedProductId || createLinkMutation.isPending || !data.isActive}
                onClick={() => void createLinkMutation.mutateAsync()}
              >
                <Plus className="h-4 w-4" />
                Yeni Bağlantı
              </Button>
            </div>
          </div>

          {linksQuery.isLoading ? <LoadingState label="Bağlantılar yükleniyor…" /> : null}
          {linksQuery.isError ? (
            <p className="text-sm text-rose-600">{getErrorMessage(linksQuery.error)}</p>
          ) : null}
          {!linksQuery.isLoading && linksPagination.total === 0 ? (
            <EmptyState title="Bağlantı yok" description="Yeni Bağlantı ile ürün bazlı tanıtım linki ekleyin." />
          ) : null}
          {!linksQuery.isLoading && linkItems.length > 0 ? (
            <>
              <Table>
                <THead>
                  <TR>
                    <TH>Ürün</TH>
                    <TH>Müşteri indirimi</TH>
                    <TH>Komisyon</TH>
                    <TH>Bağlantı</TH>
                    <TH>Durum</TH>
                  </TR>
                </THead>
                <TBody>
                  {linkItems.map((link) => (
                    <TR key={link.id}>
                      <TD>
                        <div className="font-medium text-slate-900">{link.product.name}</div>
                        <div className="text-xs text-slate-500">{link.product.slug}</div>
                      </TD>
                      <TD>%{link.customerDiscountRate}</TD>
                      <TD>%{link.commissionRatePercent}</TD>
                      <TD>
                        <div className="flex max-w-md items-center gap-2">
                          <code className="truncate text-xs text-slate-700">{link.publicUrl}</code>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              void (async () => {
                                try {
                                  await copyTextToClipboard(link.publicUrl)
                                  toast('Bağlantı kopyalandı', 'success')
                                } catch {
                                  toast(CLIPBOARD_COPY_ERROR_TR, 'error')
                                }
                              })()
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TD>
                      <TD>
                        <Badge tone={link.isActive ? 'success' : 'default'}>
                          {link.isActive ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
              <AffiliateListPaginationBar
                pagination={linksPagination}
                disabled={linksQuery.isFetching}
                onPageChange={setLinksPage}
              />
            </>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Ürün atamaları</h2>
          {(data.products?.length ?? 0) === 0 ? (
            <EmptyState
              title="Ürün atanmamış"
              description="Düzenleme ekranından bir veya daha fazla ürün ekleyebilirsiniz."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Ürün</TH>
                  <TH>Komisyon</TH>
                  <TH>Müşteri indirimi</TH>
                  <TH>Durum</TH>
                </TR>
              </THead>
              <TBody>
                {data.products!.map((row) => (
                  <TR key={row.id ?? row.productId}>
                    <TD>
                      <div className="font-medium text-slate-900">{row.product?.name ?? row.productId}</div>
                      {row.product?.slug ? <div className="text-xs text-slate-500">{row.product.slug}</div> : null}
                    </TD>
                    <TD>%{row.commissionRatePercent}</TD>
                    <TD>%{row.discountRatePercent}</TD>
                    <TD>
                      <Badge tone={row.isActive ? 'success' : 'default'}>
                        {row.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardBody>
      </Card>

      <AffiliateCommissionPayoutModal
        open={payoutModalOpen}
        partnerId={data.id}
        onClose={() => setPayoutModalOpen(false)}
        onSuccess={() => {
          toast('Komisyon ödemesi kaydedildi', 'success')
          void queryClient.invalidateQueries({ queryKey: ['admin', 'affiliate-partners', id, 'summary'] })
          void queryClient.invalidateQueries({
            queryKey: ['admin', 'affiliate-partners', id, 'commissions'],
          })
          void queryClient.invalidateQueries({ queryKey: ['admin', 'affiliate-partners', id, 'payouts'] })
        }}
        onError={(message) => toast(message, 'error')}
      />
    </div>
  )
}
