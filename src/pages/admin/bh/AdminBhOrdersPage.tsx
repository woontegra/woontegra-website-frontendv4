import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Eye, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { AdminSimpleModal } from '@/components/admin/AdminSimpleModal'
import { adminBhService, getErrorMessage, type BhOrderDetail } from '@/services/adminBhService'
import {
  bhFulfillmentLabel,
  bhInvoiceTypeLabel,
  bhLegalStatusMeta,
  bhPackageLabel,
  bhPaymentMethodLabel,
  bhPaymentStatusMeta,
  formatBhDateTime,
  formatBhKurus,
  formatBhPaidAmount,
  shortOrderRef,
} from '@/utils/bhAdminUi'

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  if (value == null || value === '' || value === '—') return null
  return (
    <div className="grid grid-cols-[8.5rem_1fr] gap-2 border-b border-slate-50 py-1.5 text-sm last:border-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="min-w-0 break-words text-slate-900">{value}</dd>
    </div>
  )
}

export function AdminBhOrdersPage() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [detailOid, setDetailOid] = useState<string | null>(null)

  const params = useMemo(
    () => ({
      page: 1,
      limit: 50,
      q: q.trim() || undefined,
      status: status || undefined,
    }),
    [q, status],
  )

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'bh', 'orders', params],
    queryFn: () => adminBhService.listOrders(params),
  })

  const detailQuery = useQuery({
    queryKey: ['admin', 'bh', 'order', detailOid],
    queryFn: () => adminBhService.getOrder(detailOid!),
    enabled: Boolean(detailOid),
  })

  const rows = data?.items ?? []
  const detail = detailQuery.data as BhOrderDetail | undefined
  const billing = detail?.billingSnapshot
  const legal = detail?.legalPackage

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Bilirkişi Hesap — Siparişler"
        description="Bilirkişi Hesap siparişlerini görüntüleyin."
        actions={
          <Button variant="secondary" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        }
      />

      <Card>
        <CardBody className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Ara"
            placeholder="Sipariş no, e-posta…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">Durum</span>
            <select
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Tümü</option>
              <option value="success">Ödendi</option>
              <option value="pending">Beklemede</option>
              <option value="failed">Başarısız</option>
              <option value="bank_transfer_pending">Havale Onayı Bekliyor</option>
              <option value="bank_transfer_rejected">Havale Reddedildi</option>
            </select>
          </label>
        </CardBody>
      </Card>

      {isLoading ? <LoadingState /> : null}
      {isError ? (
        <EmptyState title="Siparişler yüklenemedi" description={getErrorMessage(error)} />
      ) : null}

      {!isLoading && !isError ? (
        <Card>
          <CardBody>
            <p className="mb-3 text-xs text-slate-500">Toplam: {data?.total ?? rows.length}</p>
            {!rows.length ? (
              <EmptyState title="Sipariş yok" description="Filtreye uygun kayıt bulunamadı." />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Sipariş No</TH>
                    <TH>Müşteri</TH>
                    <TH>Paket</TH>
                    <TH>Normal Fiyat</TH>
                    <TH>İndirim</TH>
                    <TH>Ödenen</TH>
                    <TH>Kampanya</TH>
                    <TH>Ödeme Yöntemi</TH>
                    <TH>Durum</TH>
                    <TH>Tarih</TH>
                    <TH>İşlem</TH>
                  </TR>
                </THead>
                <TBody>
                  {rows.map((o) => {
                    const st = bhPaymentStatusMeta(o.status)
                    return (
                      <TR key={o.merchantOid}>
                        <TD title={o.merchantOid}>{shortOrderRef(o.merchantOid)}</TD>
                        <TD>{o.email}</TD>
                        <TD>
                          {bhPackageLabel({
                            productType: o.productType,
                            subscriptionPeriod: o.subscriptionPeriod,
                          })}
                        </TD>
                        <TD>{formatBhKurus(o.normalPriceKurus)}</TD>
                        <TD>
                          {o.discountRate != null ? `%${o.discountRate}` : '—'}
                          {o.discountAmountKurus != null
                            ? ` (${formatBhKurus(o.discountAmountKurus)})`
                            : ''}
                        </TD>
                        <TD>{formatBhPaidAmount(o)}</TD>
                        <TD className="max-w-[10rem] truncate" title={o.campaignNameSnapshot || ''}>
                          {o.campaignNameSnapshot || '—'}
                        </TD>
                        <TD>{bhPaymentMethodLabel(o.paymentMethod)}</TD>
                        <TD>
                          <Badge tone={st.tone}>{st.label}</Badge>
                        </TD>
                        <TD className="whitespace-nowrap text-xs">{formatBhDateTime(o.createdAt)}</TD>
                        <TD>
                          <Button size="sm" variant="secondary" onClick={() => setDetailOid(o.merchantOid)}>
                            <Eye className="h-3.5 w-3.5" />
                            Detay
                          </Button>
                        </TD>
                      </TR>
                    )
                  })}
                </TBody>
              </Table>
            )}
          </CardBody>
        </Card>
      ) : null}

      <AdminSimpleModal
        open={Boolean(detailOid)}
        title="Sipariş detayı"
        onClose={() => setDetailOid(null)}
        wide
      >
        {detailQuery.isLoading ? <LoadingState /> : null}
        {detailQuery.isError ? (
          <EmptyState title="Detay yüklenemedi" description={getErrorMessage(detailQuery.error)} />
        ) : null}
        {detail ? (
          <dl className="space-y-0">
            <DetailRow label="Sipariş No" value={<span className="font-mono text-xs">{detail.merchantOid}</span>} />
            <DetailRow
              label="Ad Soyad"
              value={billing?.fullName || legal?.customerName || undefined}
            />
            <DetailRow label="E-posta" value={billing?.email || detail.email || legal?.customerEmail} />
            <DetailRow label="Telefon" value={billing?.phone || legal?.customerPhone || undefined} />
            <DetailRow label="Fatura tipi" value={bhInvoiceTypeLabel(billing?.invoiceType)} />
            {billing?.invoiceType === 'corporate' ? (
              <>
                <DetailRow label="Firma / Unvan" value={billing.companyName || undefined} />
                <DetailRow label="VKN" value={billing.taxNumber || legal?.customerTaxNo || undefined} />
                <DetailRow label="Vergi dairesi" value={billing.taxOffice || undefined} />
              </>
            ) : (
              <DetailRow
                label="TCKN"
                value={billing?.identityNumber || legal?.customerIdentityNo || undefined}
              />
            )}
            <DetailRow label="İl" value={billing?.city || undefined} />
            <DetailRow label="İlçe" value={billing?.district || undefined} />
            <DetailRow
              label="Fatura adresi"
              value={billing?.address || legal?.customerAddress || undefined}
            />
            <DetailRow label="Ürün" value={detail.product?.name || detail.productName || legal?.productName} />
            <DetailRow
              label="Paket"
              value={bhPackageLabel({
                productType: detail.productType,
                subscriptionPeriod: detail.subscriptionPeriod,
                planName: legal?.planName,
                billingCycle: legal?.billingCycle,
              })}
            />
            <DetailRow label="Normal fiyat" value={formatBhKurus(detail.normalPriceKurus)} />
            <DetailRow
              label="Kampanya"
              value={
                detail.campaignNameSnapshot
                  ? `${detail.campaignNameSnapshot}${detail.campaignPublicCode ? ` (${detail.campaignPublicCode})` : ''}`
                  : undefined
              }
            />
            <DetailRow
              label="İndirim"
              value={
                detail.discountRate != null
                  ? `%${detail.discountRate}${
                      detail.discountAmountKurus != null
                        ? ` · ${formatBhKurus(detail.discountAmountKurus)}`
                        : ''
                    }`
                  : undefined
              }
            />
            <DetailRow label="Ödenen" value={formatBhPaidAmount(detail)} />
            <DetailRow label="Ödeme yöntemi" value={bhPaymentMethodLabel(detail.paymentMethod)} />
            <DetailRow label="Ödeme durumu" value={bhPaymentStatusMeta(detail.status).label} />
            <DetailRow label="Sipariş tarihi" value={formatBhDateTime(detail.createdAt)} />
            <DetailRow label="Lisans / fulfillment" value={bhFulfillmentLabel(detail.fulfillmentStatus)} />
            {detail.fulfillmentError ? (
              <DetailRow label="Fulfillment notu" value={detail.fulfillmentError} />
            ) : null}
            {detail.panelLicenseId ? (
              <DetailRow label="Lisans ID" value={detail.panelLicenseId} />
            ) : null}
            {detail.userProduct ? (
              <DetailRow
                label="Ürün süresi"
                value={`${formatBhDateTime(detail.userProduct.purchasedAt)} → ${formatBhDateTime(detail.userProduct.expiresAt)}${detail.userProduct.isExpired ? ' (süresi dolmuş)' : ''}`}
              />
            ) : null}
            {legal ? (
              <DetailRow
                label="Sözleşme arşivi"
                value={`${legal.packageNo || legal.id} · ${bhLegalStatusMeta(legal.status).label}`}
              />
            ) : null}
          </dl>
        ) : null}
      </AdminSimpleModal>
    </div>
  )
}
