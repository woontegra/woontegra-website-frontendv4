import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, ExternalLink, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { getErrorMessage } from '@/api/client'
import { getApiRootUrl } from '@/lib/env'
import { adminDownloadStatsService } from '@/services/adminDownloadStatsService'
import { adminDownloadStatsStatusLabel, type AdminDownloadStatsItem } from '@/types/adminDownloadStats'
import { formatDateTime } from '@/utils/adminOrderUi'

function resolveApiHref(path: string): string {
  const apiRoot = getApiRootUrl()
  if (apiRoot.startsWith('http://') || apiRoot.startsWith('https://')) {
    return `${apiRoot}${path}`
  }
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`
  }
  return path
}

function periodLabel(value: number | null): string {
  return value == null ? 'Veri yok' : String(value)
}

function statusTone(status: AdminDownloadStatsItem['status']): 'success' | 'warning' | 'default' {
  if (status === 'active') return 'success'
  if (status === 'inactive') return 'warning'
  return 'default'
}

function EndpointTestButton({ label, path }: { label: string; path: string }) {
  const [state, setState] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle')

  const handleTest = async () => {
    setState('checking')
    try {
      const res = await fetch(resolveApiHref(path), { method: 'HEAD', credentials: 'same-origin' })
      setState(res.ok ? 'ok' : 'error')
    } catch {
      setState('error')
    }
  }

  return (
    <Button type="button" variant="secondary" size="sm" onClick={() => void handleTest()} disabled={state === 'checking'}>
      {label}
      {state === 'ok' ? ' ✓' : state === 'error' ? ' ✗' : ''}
    </Button>
  )
}

function SifreKasasiFeaturedCard({ item }: { item: AdminDownloadStatsItem }) {
  return (
    <Card className="border-emerald-200 bg-emerald-50/50">
      <CardBody className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-emerald-700" />
              <h2 className="text-lg font-semibold text-emerald-950">{item.name}</h2>
            </div>
            <p className="mt-1 text-sm text-emerald-900">
              Ücretsiz indirme sayaçları `DownloadStat` tablosundan okunur. Setup ve portable ayrı tutulur.
            </p>
          </div>
          <Badge tone={statusTone(item.status)}>{adminDownloadStatsStatusLabel(item.status)}</Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-emerald-200 bg-white/80 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Toplam indirme</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{item.total.toLocaleString('tr-TR')}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-white/80 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Setup indirildi</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{item.setup.toLocaleString('tr-TR')}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-white/80 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Portable indirildi</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{item.portable.toLocaleString('tr-TR')}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-white/80 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Son güncelleme</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {item.lastUpdatedAt ? formatDateTime(item.lastUpdatedAt) : '—'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to={item.publicPath} target="_blank" rel="noreferrer">
            <Button type="button" variant="secondary" size="sm">
              <ExternalLink className="h-4 w-4" />
              Public sayfayı görüntüle
            </Button>
          </Link>
          <EndpointTestButton label="Setup endpoint test" path={item.freeSetupPath} />
          <EndpointTestButton label="Portable endpoint test" path={item.freePortablePath} />
        </div>
      </CardBody>
    </Card>
  )
}

export function AdminDownloadStatsPage() {
  const statsQuery = useQuery({
    queryKey: ['admin', 'download-stats'],
    queryFn: () => adminDownloadStatsService.list(),
  })

  const items = statsQuery.data ?? []
  const sifreKasasi = items.find((item) => item.productKey === 'sifre-kasasi' || item.slug === 'sifre-kasasi')

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="İndirme İstatistikleri"
        description="Ücretsiz indirme ürünlerinin toplam, setup ve portable sayaçları."
        actions={
          <Button variant="secondary" size="sm" onClick={() => void statsQuery.refetch()} disabled={statsQuery.isFetching}>
            <RefreshCw className={`h-4 w-4 ${statsQuery.isFetching ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        }
      />

      {statsQuery.isLoading ? <LoadingState label="İndirme istatistikleri yükleniyor…" /> : null}

      {statsQuery.isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm text-red-700">
              {getErrorMessage(statsQuery.error, 'İndirme istatistikleri yüklenemedi')}
            </p>
          </CardBody>
        </Card>
      ) : null}

      {!statsQuery.isLoading && !statsQuery.isError && sifreKasasi ? <SifreKasasiFeaturedCard item={sifreKasasi} /> : null}

      {!statsQuery.isLoading && !statsQuery.isError && items.length === 0 ? (
        <EmptyState
          title="İndirme kaydı yok"
          description="Henüz sayaç verisi bulunmuyor. İlk indirme sonrası burada görünecektir."
        />
      ) : null}

      {!statsQuery.isLoading && !statsQuery.isError && items.length > 0 ? (
        <Card>
          <CardBody className="overflow-x-auto p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Ürün</TH>
                  <TH>Toplam</TH>
                  <TH>Setup</TH>
                  <TH>Portable</TH>
                  <TH>Son indirme / güncelleme</TH>
                  <TH>Bugün</TH>
                  <TH>Bu ay</TH>
                  <TH>Durum</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((row) => (
                  <TR key={row.productKey}>
                    <TD>
                      <div className="font-medium text-slate-900">{row.name}</div>
                      <div className="text-xs text-slate-500">{row.slug}</div>
                    </TD>
                    <TD className="font-semibold text-slate-900">{row.total.toLocaleString('tr-TR')}</TD>
                    <TD>{row.setup.toLocaleString('tr-TR')}</TD>
                    <TD>{row.portable.toLocaleString('tr-TR')}</TD>
                    <TD className="whitespace-nowrap text-sm text-slate-700">
                      {row.lastUpdatedAt ? formatDateTime(row.lastUpdatedAt) : '—'}
                    </TD>
                    <TD className="text-sm text-slate-500">{periodLabel(row.downloadsToday)}</TD>
                    <TD className="text-sm text-slate-500">{periodLabel(row.downloadsThisMonth)}</TD>
                    <TD>
                      <Badge tone={statusTone(row.status)}>{adminDownloadStatsStatusLabel(row.status)}</Badge>
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
