import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { AdminSimpleModal } from '@/components/admin/AdminSimpleModal'
import {
  adminBhService,
  getErrorMessage,
  type BhBankTransferItem,
} from '@/services/adminBhService'
import { useToastStore } from '@/store/toastStore'
import {
  bhBankTransferStatusMeta,
  bhPackageLabel,
  formatBhDateTime,
  formatBhPaidAmount,
  shortOrderRef,
} from '@/utils/bhAdminUi'

export function AdminBhBankTransfersPage() {
  const toast = useToastStore((s) => s.show)
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('bank_transfer_pending')
  const [approveRow, setApproveRow] = useState<BhBankTransferItem | null>(null)
  const [rejectRow, setRejectRow] = useState<BhBankTransferItem | null>(null)
  const [rejectionNote, setRejectionNote] = useState('')

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
    queryKey: ['admin', 'bh', 'bank-transfers', params],
    queryFn: () => adminBhService.listBankTransfers(params),
  })

  const approveMut = useMutation({
    mutationFn: (merchantOid: string) => adminBhService.approveBankTransfer(merchantOid),
    onSuccess: async () => {
      toast('Havale onaylandı', 'success')
      setApproveRow(null)
      await qc.invalidateQueries({ queryKey: ['admin', 'bh'] })
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  const rejectMut = useMutation({
    mutationFn: (merchantOid: string) =>
      adminBhService.rejectBankTransfer(merchantOid, {
        rejectionNote: rejectionNote.trim() || undefined,
      }),
    onSuccess: async () => {
      toast('Havale reddedildi', 'success')
      setRejectRow(null)
      setRejectionNote('')
      await qc.invalidateQueries({ queryKey: ['admin', 'bh'] })
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  const rows = data?.items ?? []
  const busy = approveMut.isPending || rejectMut.isPending

  function customerName(o: BhBankTransferItem) {
    return o.name || o.customerName || '—'
  }

  function campaignLabel(o: BhBankTransferItem) {
    if (o.campaignNameSnapshot) {
      return o.discountRate != null
        ? `${o.campaignNameSnapshot} (%${o.discountRate})`
        : o.campaignNameSnapshot
    }
    if (o.discountRate != null) return `%${o.discountRate} indirim`
    return '—'
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Bilirkişi Hesap — Havale Ödemeleri"
        description="Bekleyen havaleleri onaylayın veya reddedin. Onay sonrası lisans oluşturma otomatik devam eder."
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
              <option value="bank_transfer_pending">Onay Bekliyor</option>
              <option value="success">Onaylandı</option>
              <option value="bank_transfer_rejected">Reddedildi</option>
            </select>
          </label>
        </CardBody>
      </Card>

      {isLoading ? <LoadingState /> : null}
      {isError ? (
        <EmptyState title="Havaleler yüklenemedi" description={getErrorMessage(error)} />
      ) : null}

      {!isLoading && !isError ? (
        <Card>
          <CardBody>
            <p className="mb-3 text-xs text-slate-500">Toplam: {data?.total ?? rows.length}</p>
            {!rows.length ? (
              <EmptyState title="Kayıt yok" description="Filtreye uygun havale bulunamadı." />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Sipariş No</TH>
                    <TH>Müşteri</TH>
                    <TH>E-posta</TH>
                    <TH>Paket</TH>
                    <TH>Kampanya / İndirim</TH>
                    <TH>Beklenen Tutar</TH>
                    <TH>Durum</TH>
                    <TH>Tarih</TH>
                    <TH>İşlem</TH>
                  </TR>
                </THead>
                <TBody>
                  {rows.map((o) => {
                    const st = bhBankTransferStatusMeta(o.status)
                    return (
                      <TR key={o.merchantOid}>
                        <TD title={o.merchantOid}>{shortOrderRef(o.merchantOid)}</TD>
                        <TD>{customerName(o)}</TD>
                        <TD>{o.email}</TD>
                        <TD>
                          {bhPackageLabel({
                            productType: o.productType,
                            subscriptionPeriod: o.subscriptionPeriod,
                          })}
                        </TD>
                        <TD className="max-w-[12rem] truncate" title={campaignLabel(o)}>
                          {campaignLabel(o)}
                        </TD>
                        <TD>{formatBhPaidAmount(o)}</TD>
                        <TD>
                          <Badge tone={st.tone}>{st.label}</Badge>
                        </TD>
                        <TD className="whitespace-nowrap text-xs">{formatBhDateTime(o.createdAt)}</TD>
                        <TD>
                          {o.status === 'bank_transfer_pending' ? (
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" disabled={busy} onClick={() => setApproveRow(o)}>
                                Onayla
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={busy}
                                onClick={() => {
                                  setRejectionNote('')
                                  setRejectRow(o)
                                }}
                              >
                                Reddet
                              </Button>
                            </div>
                          ) : (
                            '—'
                          )}
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
        open={Boolean(approveRow)}
        title="Havale ödemesini onaylamak üzeresiniz."
        onClose={() => setApproveRow(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setApproveRow(null)} disabled={approveMut.isPending}>
              Vazgeç
            </Button>
            <Button
              disabled={approveMut.isPending || !approveRow}
              onClick={() => approveRow && void approveMut.mutateAsync(approveRow.merchantOid)}
            >
              {approveMut.isPending ? 'Onaylanıyor…' : 'Ödemeyi Onayla'}
            </Button>
          </>
        }
      >
        {approveRow ? (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Müşteri</dt>
              <dd className="text-right font-medium">{customerName(approveRow)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">E-posta</dt>
              <dd className="text-right">{approveRow.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Paket</dt>
              <dd className="text-right">
                {bhPackageLabel({
                  productType: approveRow.productType,
                  subscriptionPeriod: approveRow.subscriptionPeriod,
                })}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Beklenen tutar</dt>
              <dd className="text-right font-semibold">{formatBhPaidAmount(approveRow)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Sipariş no</dt>
              <dd className="max-w-[16rem] break-all text-right font-mono text-xs">
                {approveRow.merchantOid}
              </dd>
            </div>
            <p className="pt-2 text-xs text-slate-500">
              Onay sonrası mevcut lisans oluşturma süreci otomatik devam eder.
            </p>
          </dl>
        ) : null}
      </AdminSimpleModal>

      <AdminSimpleModal
        open={Boolean(rejectRow)}
        title="Havale ödemesini reddet"
        onClose={() => setRejectRow(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectRow(null)} disabled={rejectMut.isPending}>
              Vazgeç
            </Button>
            <Button
              disabled={rejectMut.isPending || !rejectRow}
              onClick={() => rejectRow && void rejectMut.mutateAsync(rejectRow.merchantOid)}
            >
              {rejectMut.isPending ? 'Reddediliyor…' : 'Reddet'}
            </Button>
          </>
        }
      >
        {rejectRow ? (
          <div className="space-y-3 text-sm">
            <p>
              <span className="text-slate-500">Sipariş no:</span>{' '}
              <span className="font-mono text-xs">{rejectRow.merchantOid}</span>
            </p>
            <p>
              <span className="text-slate-500">Müşteri:</span> {customerName(rejectRow)} ·{' '}
              {rejectRow.email}
            </p>
            <p>
              <span className="text-slate-500">Tutar:</span> {formatBhPaidAmount(rejectRow)}
            </p>
            <label className="block">
              <span className="mb-1 block text-slate-600">Red notu</span>
              <textarea
                className="min-h-[88px] w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                placeholder="Müşteriye / kayda düşecek açıklama (opsiyonel)"
              />
            </label>
          </div>
        ) : null}
      </AdminSimpleModal>
    </div>
  )
}
