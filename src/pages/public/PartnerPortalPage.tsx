import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Copy, Loader2, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { getErrorMessage } from '@/api/client'
import { CLIPBOARD_COPY_ERROR_TR, copyTextToClipboard } from '@/lib/copyTextToClipboard'
import { affTable, formatAffiliateDateTime, formatAffiliateTry } from '@/lib/affiliateMoney'
import {
  affiliatePaymentMethodLabel,
  affiliatePayoutStatusLabel,
} from '@/lib/affiliateUiLabels'
import { AffiliateCommissionSalesView } from '@/components/affiliate/AffiliateCommissionSalesView'
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
import { partnerPortalService } from '@/services/partnerPortalService'
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
      <p className="text-[10px] font-medium tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-[13px] font-semibold tabular-nums tracking-tight text-slate-900">{value}</p>
    </div>
  )
}

function DashedEmpty({ children }: { children: string }) {
  return (
    <div className="mt-2.5 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
      {children}
    </div>
  )
}

export function PartnerPortalPage() {
  const toast = useToastStore((s) => s.show)
  const [refreshing, setRefreshing] = useState(false)
  const [linksPage, setLinksPage] = useState(1)
  const [commissionsPage, setCommissionsPage] = useState(1)
  const [payoutsPage, setPayoutsPage] = useState(1)

  const meQuery = useQuery({
    queryKey: ['partner', 'me'],
    queryFn: () => partnerPortalService.me(),
    retry: false,
  })

  const useDevFixtures = isAffiliateDevFixturesEnabled()

  const summaryQuery = useQuery({
    queryKey: ['partner', 'summary', useDevFixtures ? 'dev-fixtures' : 'live'],
    queryFn: () =>
      useDevFixtures ? Promise.resolve(getAffiliateDevFixtureSummary()) : partnerPortalService.summary(),
    enabled: meQuery.isSuccess,
  })

  const linksQuery = useQuery({
    queryKey: ['partner', 'links', linksPage],
    queryFn: () => partnerPortalService.links(linksPage, AFFILIATE_TABLE_PAGE_SIZE),
    enabled: meQuery.isSuccess,
  })

  const commissionsQuery = useQuery({
    queryKey: ['partner', 'commissions', useDevFixtures ? 'dev-fixtures' : 'live', commissionsPage],
    queryFn: () =>
      useDevFixtures
        ? Promise.resolve(getAffiliateDevFixtureCommissions())
        : partnerPortalService.commissions(commissionsPage, AFFILIATE_TABLE_PAGE_SIZE),
    enabled: meQuery.isSuccess,
  })

  const payoutsQuery = useQuery({
    queryKey: ['partner', 'payouts', useDevFixtures ? 'dev-fixtures' : 'live', payoutsPage],
    queryFn: () =>
      useDevFixtures
        ? Promise.resolve(getAffiliateDevFixturePayouts())
        : partnerPortalService.payouts(payoutsPage, AFFILIATE_TABLE_PAGE_SIZE),
    enabled: meQuery.isSuccess,
  })

  const refreshPortalData = async () => {
    if (refreshing) return
    setRefreshing(true)
    try {
      const results = await Promise.all([
        summaryQuery.refetch({ throwOnError: false }),
        linksQuery.refetch({ throwOnError: false }),
        commissionsQuery.refetch({ throwOnError: false }),
        payoutsQuery.refetch({ throwOnError: false }),
      ])
      const firstError = results.find((r) => r.isError)?.error
      if (firstError) {
        toast(getErrorMessage(firstError), 'error')
        return
      }
      toast('Bilgiler güncellendi', 'success')
    } catch (err) {
      toast(getErrorMessage(err), 'error')
    } finally {
      setRefreshing(false)
    }
  }

  if (meQuery.isLoading) return <LoadingState label="İş ortağı paneli yükleniyor…" />

  if (meQuery.isError) {
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <h1 className="text-[15px] font-medium text-slate-800">İş Ortağı Paneli</h1>
        <p className="mt-2 text-sm text-slate-600">İş ortağı oturumu bulunamadı.</p>
        <p className="mt-2 text-sm text-slate-500">
          Yönetim panelinden size gönderilen giriş bağlantısını kullanın.
        </p>
        <Link to="/" className="mt-6 inline-block text-sm text-sky-700 hover:underline">
          Ana sayfaya dön
        </Link>
      </div>
    )
  }

  const summary = summaryQuery.data ?? emptySummary
  const linkItems = linksQuery.data?.items ?? []
  const linksPagination = normalizeAffiliateListPagination(
    linksQuery.data?.pagination ?? emptyAffiliateListPagination(),
  )
  const commissionItems = commissionsQuery.data?.items ?? []
  const commissionsPagination = normalizeAffiliateListPagination(
    commissionsQuery.data?.pagination ?? emptyAffiliateListPagination(),
  )
  const payoutItems = payoutsQuery.data?.items ?? []
  const payoutsPagination = normalizeAffiliateListPagination(
    payoutsQuery.data?.pagination ?? emptyAffiliateListPagination(),
  )
  const salesEmpty = !commissionsQuery.isLoading && commissionsPagination.total === 0
  const payoutsEmpty = !payoutsQuery.isLoading && payoutsPagination.total === 0
  const linksEmpty = !linksQuery.isLoading && linksPagination.total === 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-[15px] font-medium tracking-tight text-slate-800">İş Ortağı Paneli</h1>
          <p className="mt-0.5 text-[12px] font-normal text-slate-500">
            Hoş geldiniz, {meQuery.data?.name}
            {meQuery.data?.email ? ` · ${meQuery.data.email}` : ''}
          </p>
          {useDevFixtures ? (
            <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-900">
              DEV sahte finans verisi (production DB’ye yazılmaz). Kapatmak için URL’den{' '}
              <code>affDevFixtures</code> kaldırın veya localStorage <code>wt_aff_dev_fixtures</code> silin.
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => void refreshPortalData()}
          disabled={refreshing}
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-md border border-[#e4ebf0] bg-white px-2.5 py-1.5 text-[11px] font-normal text-[#5c6b7a] hover:bg-[#f7faf9] hover:text-[#1e2a3a] disabled:cursor-not-allowed disabled:opacity-60 sm:self-center"
          aria-busy={refreshing}
        >
          {refreshing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin opacity-70" aria-hidden />
          ) : (
            <RefreshCw className="h-3.5 w-3.5 opacity-70" aria-hidden />
          )}
          {refreshing ? 'Yenileniyor…' : 'Yenile'}
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Satış" value={String(summary.saleCount)} />
        <StatCard label="Toplam Tahsilat" value={formatAffiliateTry(summary.totalGrossPaidAmountKurus)} />
        <StatCard
          label="Hak Edilen Komisyon"
          value={formatAffiliateTry(summary.lifetimeEarnedCommissionKurus)}
        />
        <StatCard label="Ödenen" value={formatAffiliateTry(summary.paidCommissionKurus)} />
        <StatCard label="Bekleyen" value={formatAffiliateTry(summary.pendingCommissionKurus)} />
      </div>
      {summaryQuery.isError ? (
        <p className="text-sm text-rose-600">{getErrorMessage(summaryQuery.error)}</p>
      ) : null}

      <Card>
        <CardBody className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Tanıtım Bağlantıları</h2>
            <p className="mt-1 text-sm text-slate-600">Oranları yalnızca platform yönetimi değiştirir.</p>
          </div>
          {linksQuery.isLoading ? <LoadingState label="Bağlantılar yükleniyor…" /> : null}
          {linksQuery.isError ? (
            <p className="text-sm text-rose-600">{getErrorMessage(linksQuery.error)}</p>
          ) : null}
          {linksEmpty ? (
            <EmptyState
              title="Henüz bağlantı yok"
              description="Yönetim sizin için ürün bağlantısı oluşturduğunda burada görünür."
            />
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
                      </TD>
                      <TD>%{link.customerDiscountRate}</TD>
                      <TD>%{link.commissionRatePercent}</TD>
                      <TD>
                        <div className="flex max-w-md items-center gap-2">
                          <code className="truncate text-xs">{link.publicUrl}</code>
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
        <CardBody className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900">Satış Geçmişi</h2>
          {commissionsQuery.isLoading ? <LoadingState label="Satış geçmişi yükleniyor…" /> : null}
          {commissionsQuery.isError ? (
            <p className="text-sm text-rose-600">{getErrorMessage(commissionsQuery.error)}</p>
          ) : null}
          {salesEmpty ? <DashedEmpty>Henüz satış yok</DashedEmpty> : null}
          {!commissionsQuery.isLoading && commissionItems.length > 0 ? (
            <>
              <AffiliateCommissionSalesView items={commissionItems} variant="partner" />
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
        <CardBody className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900">Ödeme Geçmişi</h2>
          {payoutsQuery.isLoading ? <LoadingState label="Ödeme geçmişi yükleniyor…" /> : null}
          {payoutsQuery.isError ? (
            <p className="text-sm text-rose-600">{getErrorMessage(payoutsQuery.error)}</p>
          ) : null}
          {payoutsEmpty ? <DashedEmpty>Henüz ödeme kaydı yok</DashedEmpty> : null}
          {!payoutsQuery.isLoading && payoutItems.length > 0 ? (
            <>
              <Table tableClassName={affTable.payoutTable}>
                <colgroup>
                  <col className="w-[9rem]" />
                  <col className="w-[8rem]" />
                  <col className="w-[9rem]" />
                  <col className="w-[18%]" />
                  <col />
                </colgroup>
                <THead>
                  <TR>
                    <TH className={affTable.th}>Tarih</TH>
                    <TH className={`${affTable.th} text-right`}>Tutar</TH>
                    <TH className={affTable.th}>Yöntem</TH>
                    <TH className={affTable.th}>Referans</TH>
                    <TH className={`${affTable.th} ${affTable.grow}`}>Durum</TH>
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
                      <TD className={`${affTable.td} ${affTable.status} ${affTable.grow}`}>
                        {affiliatePayoutStatusLabel(row.status)}
                      </TD>
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
    </div>
  )
}
