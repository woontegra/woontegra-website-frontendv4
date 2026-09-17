import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import {
  adminBhService,
  getErrorMessage,
  type BhBarPerformanceRow,
  type BhCampaign,
} from '@/services/adminBhService'
import {
  bhPaymentMethodLabel,
  formatBhDateTime,
  formatBhKurus,
} from '@/utils/bhAdminUi'

function campaignForBar(campaigns: BhCampaign[], key: string): BhCampaign | undefined {
  return campaigns.find(
    (c) =>
      c.campaignType === 'BAR_ASSOCIATION' &&
      String(c.barAssociationKey || '') === key,
  )
}

export function AdminBhBarPerformancePage() {
  const [selected, setSelected] = useState<BhBarPerformanceRow | null>(null)

  const perfQuery = useQuery({
    queryKey: ['admin', 'bh', 'bar-performance'],
    queryFn: () => adminBhService.listBarPerformance(),
  })

  const campaignsQuery = useQuery({
    queryKey: ['admin', 'bh', 'campaigns'],
    queryFn: () => adminBhService.listCampaigns(),
  })

  const detailsQuery = useQuery({
    queryKey: ['admin', 'bh', 'bar-performance', selected?.barAssociationKey],
    queryFn: () => adminBhService.getBarPerformanceDetails(selected!.barAssociationKey),
    enabled: Boolean(selected?.barAssociationKey),
  })

  const barCampaigns = useMemo(
    () => (campaignsQuery.data ?? []).filter((c) => c.campaignType === 'BAR_ASSOCIATION'),
    [campaignsQuery.data],
  )

  const rows = perfQuery.data ?? []
  const isLoading = perfQuery.isLoading
  const isError = perfQuery.isError
  const isFetching = perfQuery.isFetching || campaignsQuery.isFetching

  async function refresh() {
    setSelected(null)
    await Promise.all([perfQuery.refetch(), campaignsQuery.refetch()])
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Bilirkişi Hesap — Baro Performansı"
        description="Yalnızca başarılı ve lisansı uygulanmış gerçek baro kampanya satışları. Test kayıtları dahil edilmez."
        actions={
          <Button variant="secondary" size="sm" onClick={() => void refresh()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        }
      />

      {isLoading ? <LoadingState /> : null}
      {isError ? (
        <EmptyState title="Performans yüklenemedi" description={getErrorMessage(perfQuery.error)} />
      ) : null}

      {!isLoading && !isError ? (
        <Card>
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900">Baro satış özeti</h2>
              <span className="text-xs text-slate-500">{rows.length} baro</span>
            </div>
            {!rows.length ? (
              <EmptyState
                title="Kayıt yok"
                description="Başarılı baro kampanya satışı bulunamadı."
              />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Baro / Kampanya</TH>
                    <TH>Kod</TH>
                    <TH>İndirim</TH>
                    <TH>Durum</TH>
                    <TH>Kullanım</TH>
                    <TH>Benzersiz kullanıcı</TH>
                    <TH>İlk satın alma</TH>
                    <TH>Yenileme</TH>
                    <TH>Toplam satış</TH>
                    <TH>Son işlem</TH>
                  </TR>
                </THead>
                <TBody>
                  {rows.map((row) => {
                    const campaign = campaignForBar(barCampaigns, row.barAssociationKey)
                    const selectedRow = selected?.barAssociationKey === row.barAssociationKey
                    return (
                      <TR
                        key={row.barAssociationKey}
                        className={selectedRow ? 'bg-sky-50' : 'cursor-pointer hover:bg-slate-50'}
                        onClick={() => setSelected(row)}
                      >
                        <TD>
                          <div className="font-medium text-slate-900">
                            {row.barAssociationName}
                          </div>
                          {campaign?.name ? (
                            <div className="text-xs text-slate-500">{campaign.name}</div>
                          ) : null}
                          {campaign?.startsAt || campaign?.expiresAt ? (
                            <div className="mt-0.5 text-[11px] text-slate-400">
                              {formatBhDateTime(campaign.startsAt)} →{' '}
                              {formatBhDateTime(campaign.expiresAt)}
                            </div>
                          ) : null}
                        </TD>
                        <TD className="font-mono text-xs">
                          {campaign?.publicCode || '—'}
                        </TD>
                        <TD>
                          {campaign?.discountRate != null ? `%${campaign.discountRate}` : '—'}
                        </TD>
                        <TD>
                          {campaign ? (
                            <Badge tone={campaign.isActive ? 'success' : 'default'}>
                              {campaign.isActive ? 'Aktif' : 'Pasif'}
                            </Badge>
                          ) : (
                            '—'
                          )}
                        </TD>
                        <TD>
                          {campaign
                            ? `${campaign.usageCount ?? 0}${
                                campaign.usageLimit != null ? ` / ${campaign.usageLimit}` : ''
                              }`
                            : '—'}
                        </TD>
                        <TD>{row.uniqueUserCount}</TD>
                        <TD>{row.firstPurchaseCount}</TD>
                        <TD>{row.renewalCount}</TD>
                        <TD className="font-medium">{formatBhKurus(row.totalAmountKurus)}</TD>
                        <TD className="whitespace-nowrap text-xs text-slate-600">
                          {formatBhDateTime(row.lastTransactionAt)}
                        </TD>
                      </TR>
                    )
                  })}
                </TBody>
              </Table>
            )}
            <p className="text-xs text-slate-500">
              Satış tutarı, ödenen final tutardır. Kampanya kodu / indirim / durum, ilgili baro
              kampanya kaydından gelir; satış metrikleri yalnızca tamamlanmış işlemlerden
              hesaplanır.
            </p>
          </CardBody>
        </Card>
      ) : null}

      {selected ? (
        <Card>
          <CardBody className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900">
                {selected.barAssociationName} — kullanıcılar ve işlemler
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                Kapat
              </Button>
            </div>

            {detailsQuery.isLoading ? <LoadingState /> : null}
            {detailsQuery.isError ? (
              <EmptyState
                title="Detay yüklenemedi"
                description={getErrorMessage(detailsQuery.error)}
              />
            ) : null}

            {detailsQuery.data ? (
              <>
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Kullanıcılar
                  </h3>
                  {!detailsQuery.data.users.length ? (
                    <EmptyState title="Kullanıcı yok" description="Bu baro için kullanıcı yok." />
                  ) : (
                    <Table>
                      <THead>
                        <TR>
                          <TH>Ad Soyad</TH>
                          <TH>E-posta</TH>
                          <TH>İlk satın alma</TH>
                          <TH>Yenileme</TH>
                          <TH>Toplam</TH>
                          <TH>Son işlem</TH>
                        </TR>
                      </THead>
                      <TBody>
                        {detailsQuery.data.users.map((u) => (
                          <TR key={u.key}>
                            <TD className="font-medium">{u.name}</TD>
                            <TD>{u.email || '—'}</TD>
                            <TD>{u.firstPurchaseCount}</TD>
                            <TD>{u.renewalCount}</TD>
                            <TD>{formatBhKurus(u.totalAmountKurus)}</TD>
                            <TD className="whitespace-nowrap text-xs">
                              {formatBhDateTime(u.lastTransactionAt)}
                            </TD>
                          </TR>
                        ))}
                      </TBody>
                    </Table>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    İşlemler
                  </h3>
                  {!detailsQuery.data.transactions.length ? (
                    <EmptyState title="İşlem yok" description="Bu baro için işlem yok." />
                  ) : (
                    <Table>
                      <THead>
                        <TR>
                          <TH>Sipariş</TH>
                          <TH>Müşteri</TH>
                          <TH>Kampanya</TH>
                          <TH>Tür</TH>
                          <TH>Ödeme</TH>
                          <TH>Tutar</TH>
                          <TH>Tarih</TH>
                        </TR>
                      </THead>
                      <TBody>
                        {detailsQuery.data.transactions.map((t) => (
                          <TR key={t.merchantOid}>
                            <TD className="max-w-[140px] truncate font-mono text-xs" title={t.merchantOid}>
                              {t.merchantOid}
                            </TD>
                            <TD>
                              <div className="font-medium">{t.name}</div>
                              <div className="text-xs text-slate-500">{t.email || '—'}</div>
                            </TD>
                            <TD>
                              <div>{t.campaignName || '—'}</div>
                              {t.campaignPublicCode ? (
                                <div className="font-mono text-[11px] text-slate-500">
                                  /k/{t.campaignPublicCode}
                                </div>
                              ) : null}
                            </TD>
                            <TD>
                              {t.orderPurpose === 'RENEWAL' ? 'Yenileme' : 'İlk satın alma'}
                            </TD>
                            <TD>{bhPaymentMethodLabel(t.paymentMethod)}</TD>
                            <TD className="font-medium">{formatBhKurus(t.amountKurus)}</TD>
                            <TD className="whitespace-nowrap text-xs">
                              {formatBhDateTime(t.transactionAt)}
                            </TD>
                          </TR>
                        ))}
                      </TBody>
                    </Table>
                  )}
                </div>
              </>
            ) : null}
          </CardBody>
        </Card>
      ) : null}

      {!isLoading && barCampaigns.length > 0 ? (
        <Card>
          <CardBody className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">Tanımlı baro kampanyaları</h2>
            <p className="text-xs text-slate-500">
              Kampanya kaydı vardır; henüz tamamlanmış satış yoksa üst tabloda görünmeyebilir.
            </p>
            <Table>
              <THead>
                <TR>
                  <TH>Kampanya</TH>
                  <TH>Baro</TH>
                  <TH>Kod</TH>
                  <TH>İndirim</TH>
                  <TH>Başlangıç / Bitiş</TH>
                  <TH>Durum</TH>
                  <TH>Kullanım</TH>
                </TR>
              </THead>
              <TBody>
                {barCampaigns.map((c) => (
                  <TR key={c.id}>
                    <TD className="font-medium">{c.name}</TD>
                    <TD>{c.barAssociationNameSnapshot || c.barAssociationKey || '—'}</TD>
                    <TD className="font-mono text-xs">
                      {c.publicCode ? `/k/${c.publicCode}` : '—'}
                    </TD>
                    <TD>%{c.discountRate ?? 0}</TD>
                    <TD className="text-xs text-slate-600">
                      {formatBhDateTime(c.startsAt)}
                      <br />
                      {formatBhDateTime(c.expiresAt)}
                    </TD>
                    <TD>
                      <Badge tone={c.isActive ? 'success' : 'default'}>
                        {c.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </TD>
                    <TD>
                      {c.usageCount ?? 0}
                      {c.usageLimit != null ? ` / ${c.usageLimit}` : ''}
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
