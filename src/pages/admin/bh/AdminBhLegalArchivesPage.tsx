import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { AdminSimpleModal } from '@/components/admin/AdminSimpleModal'
import {
  adminBhService,
  getErrorMessage,
  type BhLegalDocument,
} from '@/services/adminBhService'
import {
  bhDocumentTypeLabel,
  bhLegalStatusMeta,
  formatBhDateTime,
  formatBhKurus,
  shortOrderRef,
} from '@/utils/bhAdminUi'

const PRIMARY_DOC_TYPES = [
  'PRE_INFORMATION',
  'DISTANCE_SALE',
  'SUBSCRIPTION_AGREEMENT',
  'KVKK',
  'WITHDRAWAL_EXCEPTION',
] as const

export function AdminBhLegalArchivesPage() {
  const [status, setStatus] = useState('')
  const [archiveId, setArchiveId] = useState<number | null>(null)
  const [viewDoc, setViewDoc] = useState<BhLegalDocument | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)

  const params = useMemo(
    () => ({ page: 1, limit: 50, status: status || undefined }),
    [status],
  )

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'bh', 'legal-archives', params],
    queryFn: () => adminBhService.listLegalArchives(params),
  })

  const detailQuery = useQuery({
    queryKey: ['admin', 'bh', 'legal-archive', archiveId],
    queryFn: () => adminBhService.getLegalArchive(archiveId!),
    enabled: archiveId != null,
  })

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null

    if (!viewDoc) {
      setPdfUrl(null)
      setPdfError(null)
      setPdfLoading(false)
      return
    }

    if (!viewDoc.pdfPath) {
      setPdfUrl(null)
      setPdfLoading(false)
      setPdfError('Bu sipariş için arşivlenmiş sözleşme metni bulunamadı.')
      return
    }

    setPdfLoading(true)
    setPdfError(null)
    setPdfUrl(null)

    void adminBhService
      .fetchLegalDocumentPdfBlobUrl(viewDoc.id)
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url)
          return
        }
        objectUrl = url
        setPdfUrl(url)
      })
      .catch((err) => {
        if (cancelled) return
        setPdfError(
          err instanceof Error
            ? err.message
            : 'Bu sipariş için arşivlenmiş sözleşme metni bulunamadı.',
        )
      })
      .finally(() => {
        if (!cancelled) setPdfLoading(false)
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [viewDoc])

  const rows = data?.items ?? []
  const total = data?.pagination?.total ?? data?.total ?? rows.length
  const detail = detailQuery.data
  const docs = detail?.documents ?? []

  let acceptedMeta: { type: string; title?: string; version?: string }[] = []
  try {
    const parsed = JSON.parse(detail?.acceptedVersionsJson || '[]') as unknown
    if (Array.isArray(parsed)) {
      acceptedMeta = parsed
        .filter((x) => x && typeof x === 'object')
        .map((x) => {
          const row = x as { type?: string; title?: string; version?: string }
          return { type: String(row.type || ''), title: row.title, version: row.version }
        })
        .filter((x) => x.type)
    }
  } catch {
    acceptedMeta = []
  }

  const docByType = new Map(docs.map((d) => [d.documentType, d]))
  const orderedDocs: Array<BhLegalDocument | { id: number; documentType: string; documentTitle: string; documentVersion: string; pdfPath?: null }> =
    []
  const seen = new Set<string>()
  for (const t of PRIMARY_DOC_TYPES) {
    const existing = docByType.get(t)
    if (existing) {
      orderedDocs.push(existing)
      seen.add(t)
      continue
    }
    const meta = acceptedMeta.find((a) => a.type === t)
    if (meta) {
      orderedDocs.push({
        id: -1,
        documentType: t,
        documentTitle: meta.title || bhDocumentTypeLabel(t),
        documentVersion: meta.version || '—',
        pdfPath: null,
      })
      seen.add(t)
    }
  }
  for (const d of docs) {
    if (!seen.has(d.documentType)) orderedDocs.push(d)
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Bilirkişi Hesap — Sözleşme Arşivi"
        description="Sipariş anında saklanan sözleşme ve onay belgelerini görüntüleyin."
        actions={
          <Button variant="secondary" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        }
      />

      <Card>
        <CardBody>
          <label className="block max-w-xs text-sm">
            <span className="mb-1 block text-slate-600">Durum</span>
            <select
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Tümü</option>
              <option value="COMPLETED">Tamamlandı</option>
              <option value="PENDING_PAYMENT">Ödeme Bekliyor</option>
              <option value="CANCELLED">İptal</option>
              <option value="FAILED">Başarısız</option>
            </select>
          </label>
        </CardBody>
      </Card>

      {isLoading ? <LoadingState /> : null}
      {isError ? (
        <EmptyState title="Arşiv yüklenemedi" description={getErrorMessage(error)} />
      ) : null}

      {!isLoading && !isError ? (
        <Card>
          <CardBody>
            <p className="mb-3 text-xs text-slate-500">Toplam: {total}</p>
            {!rows.length ? (
              <EmptyState title="Kayıt yok" description="Sözleşme arşivi kaydı bulunamadı." />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Sipariş</TH>
                    <TH>Müşteri</TH>
                    <TH>Ürün / Paket</TH>
                    <TH>Tutar</TH>
                    <TH>Durum</TH>
                    <TH>Kabul Tarihi</TH>
                    <TH>İşlem</TH>
                  </TR>
                </THead>
                <TBody>
                  {rows.map((r) => {
                    const st = bhLegalStatusMeta(r.status)
                    return (
                      <TR key={r.id}>
                        <TD title={r.orderNo || ''}>{shortOrderRef(r.orderNo || String(r.id))}</TD>
                        <TD>
                          <div>{r.customerName || '—'}</div>
                          <div className="text-xs text-slate-500">{r.customerEmail}</div>
                        </TD>
                        <TD>
                          {r.productName || '—'}
                          {r.planName ? ` / ${r.planName}` : ''}
                        </TD>
                        <TD>{formatBhKurus(r.amount)}</TD>
                        <TD>
                          <Badge tone={st.tone}>{st.label}</Badge>
                        </TD>
                        <TD className="whitespace-nowrap text-xs">{formatBhDateTime(r.acceptedAt)}</TD>
                        <TD>
                          <Button size="sm" variant="secondary" onClick={() => setArchiveId(r.id)}>
                            Belgeleri Görüntüle
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
        open={archiveId != null}
        title="Sözleşme arşivi"
        onClose={() => {
          setArchiveId(null)
          setViewDoc(null)
        }}
        wide
      >
        {detailQuery.isLoading ? <LoadingState /> : null}
        {detailQuery.isError ? (
          <EmptyState title="Detay yüklenemedi" description={getErrorMessage(detailQuery.error)} />
        ) : null}
        {detail ? (
          <div className="space-y-4">
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Müşteri</dt>
                <dd className="font-medium">{detail.customerName || '—'}</dd>
                <dd className="text-xs text-slate-500">{detail.customerEmail}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Sipariş no</dt>
                <dd className="break-all font-mono text-xs">{detail.orderNo || '—'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Kabul tarihi</dt>
                <dd>{formatBhDateTime(detail.acceptedAt)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Ürün / Paket</dt>
                <dd>
                  {detail.productName || '—'}
                  {detail.planName ? ` / ${detail.planName}` : ''}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Tutar</dt>
                <dd>{formatBhKurus(detail.amount)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Durum</dt>
                <dd>{bhLegalStatusMeta(detail.status).label}</dd>
              </div>
            </dl>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">Kabul edilen belgeler</h3>
              {!orderedDocs.length ? (
                <p className="text-sm text-slate-600">
                  Bu sipariş için arşivlenmiş sözleşme metni bulunamadı.
                </p>
              ) : (
                <ul className="space-y-2">
                  {orderedDocs.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {bhDocumentTypeLabel(doc.documentType, doc.documentTitle)}
                        </p>
                        <p className="text-xs text-slate-500">Sürüm {doc.documentVersion}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={!doc.pdfPath || doc.id < 0}
                        onClick={() => {
                          if (doc.id > 0 && doc.pdfPath) setViewDoc(doc as BhLegalDocument)
                        }}
                      >
                        {doc.pdfPath ? 'Görüntüle' : 'Arşiv metni yok'}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-xs text-slate-500">
                Gösterilen metinler sipariş anında arşivlenen belgelerdir; güncel şablon kullanılmaz.
              </p>
            </div>
          </div>
        ) : null}
      </AdminSimpleModal>

      <AdminSimpleModal
        open={Boolean(viewDoc)}
        title={
          viewDoc
            ? bhDocumentTypeLabel(viewDoc.documentType, viewDoc.documentTitle)
            : 'Belge'
        }
        onClose={() => setViewDoc(null)}
        wide
        className="max-w-4xl"
      >
        {pdfLoading ? <LoadingState /> : null}
        {pdfError ? (
          <p className="text-sm text-rose-600">{pdfError}</p>
        ) : null}
        {pdfUrl ? (
          <iframe title="Arşiv belgesi" src={pdfUrl} className="h-[70vh] w-full rounded border border-slate-200" />
        ) : null}
        {!pdfLoading && !pdfError && !pdfUrl ? (
          <p className="text-sm text-slate-600">
            Bu sipariş için arşivlenmiş sözleşme metni bulunamadı.
          </p>
        ) : null}
      </AdminSimpleModal>
    </div>
  )
}
