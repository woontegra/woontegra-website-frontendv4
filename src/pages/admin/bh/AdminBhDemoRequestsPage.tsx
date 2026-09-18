import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import {
  adminBhService,
  getErrorMessage,
  type BhDemoRequest,
} from '@/services/adminBhService'
import { formatBhDateTime } from '@/utils/bhAdminUi'
import {
  formatExpertiseAreasCompact,
  getProfessionGroupLabel,
  resolveExpertiseAreas,
} from '@/data/bhDemoRequestCatalog'

function expertWitnessLabel(v: boolean | null | undefined) {
  if (v === true) return 'Evet'
  if (v === false) return 'Hayır'
  return '—'
}

function DemoRequestDetailModal({
  row,
  onClose,
}: {
  row: BhDemoRequest
  onClose: () => void
}) {
  const areas = resolveExpertiseAreas(row.expertiseAreas)
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/45 p-4 sm:items-center">
      <button type="button" className="absolute inset-0" aria-label="Kapat" onClick={onClose} />
      <div className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <h3 className="text-sm font-semibold text-slate-900">Demo talep detayı</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 overflow-y-auto px-5 py-4 text-sm">
          <DetailRow label="Ad Soyad" value={row.name || '—'} />
          <DetailRow label="E-posta" value={row.email} />
          <DetailRow label="Telefon" value={row.phone || '—'} />
          <DetailRow label="Kurum / Baro" value={row.company || '—'} />
          <DetailRow label="Meslek Grubu" value={getProfessionGroupLabel(row.professionGroup)} />
          <DetailRow label="Bilirkişi" value={expertWitnessLabel(row.isExpertWitness)} />
          <div>
            <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              Uzmanlık Alanları
            </div>
            {!areas.length ? (
              <p className="text-slate-600">—</p>
            ) : (
              <ul className="space-y-2">
                {areas.map((a) => (
                  <li
                    key={a.code}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <div className="font-semibold text-slate-900">
                      {a.code} — {a.shortName}
                    </div>
                    <div className="mt-0.5 text-xs leading-snug text-slate-600">{a.name}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <DetailRow label="Talep Tarihi" value={formatBhDateTime(row.createdAt)} />
        </div>
        <div className="border-t border-slate-100 px-5 py-3">
          <Button type="button" className="w-full" variant="secondary" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5 text-slate-900">{value}</div>
    </div>
  )
}

export function AdminBhDemoRequestsPage() {
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<BhDemoRequest | null>(null)
  const params = useMemo(() => ({ page: 1, limit: 50, q: q.trim() || undefined }), [q])

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'bh', 'demo-requests', params],
    queryFn: () => adminBhService.listDemoRequests(params),
  })

  const rows = data?.items ?? []

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Bilirkişi Hesap — Demo Talepleri"
        description="Gelen demo taleplerini görüntüleyin."
        actions={
          <Button variant="secondary" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        }
      />

      <Card>
        <CardBody>
          <Input
            label="Ara"
            placeholder="Ad, e-posta, telefon, kurum…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </CardBody>
      </Card>

      {isLoading ? <LoadingState /> : null}
      {isError ? (
        <EmptyState title="Demo talepleri yüklenemedi" description={getErrorMessage(error)} />
      ) : null}

      {!isLoading && !isError ? (
        <Card>
          <CardBody>
            <p className="mb-3 text-xs text-slate-500">Toplam: {data?.total ?? rows.length}</p>
            {!rows.length ? (
              <EmptyState title="Kayıt yok" description="Demo talebi bulunamadı." />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Ad Soyad</TH>
                    <TH>E-posta</TH>
                    <TH>Telefon</TH>
                    <TH>Kurum / Baro</TH>
                    <TH>Meslek</TH>
                    <TH>Bilirkişi</TH>
                    <TH>Uzmanlık</TH>
                    <TH>Talep Tarihi</TH>
                  </TR>
                </THead>
                <TBody>
                  {rows.map((r) => (
                    <TR
                      key={String(r.id)}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => setSelected(r)}
                    >
                      <TD>{r.name || '—'}</TD>
                      <TD>{r.email}</TD>
                      <TD>{r.phone || '—'}</TD>
                      <TD>{r.company || '—'}</TD>
                      <TD>{getProfessionGroupLabel(r.professionGroup)}</TD>
                      <TD>{expertWitnessLabel(r.isExpertWitness)}</TD>
                      <TD className="max-w-[14rem] truncate text-xs" title={formatExpertiseAreasCompact(r.expertiseAreas)}>
                        {r.isExpertWitness === false
                          ? '—'
                          : formatExpertiseAreasCompact(r.expertiseAreas)}
                      </TD>
                      <TD className="whitespace-nowrap text-xs">{formatBhDateTime(r.createdAt)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </CardBody>
        </Card>
      ) : null}

      {selected ? <DemoRequestDetailModal row={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  )
}
