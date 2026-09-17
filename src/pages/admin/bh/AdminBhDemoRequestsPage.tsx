import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { adminBhService, getErrorMessage } from '@/services/adminBhService'
import { formatBhDateTime } from '@/utils/bhAdminUi'

export function AdminBhDemoRequestsPage() {
  const [q, setQ] = useState('')
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
                    <TH>Talep Tarihi</TH>
                  </TR>
                </THead>
                <TBody>
                  {rows.map((r) => (
                    <TR key={String(r.id)}>
                      <TD>{r.name || '—'}</TD>
                      <TD>{r.email}</TD>
                      <TD>{r.phone || '—'}</TD>
                      <TD>{r.company || '—'}</TD>
                      <TD className="whitespace-nowrap text-xs">{formatBhDateTime(r.createdAt)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </CardBody>
        </Card>
      ) : null}
    </div>
  )
}
