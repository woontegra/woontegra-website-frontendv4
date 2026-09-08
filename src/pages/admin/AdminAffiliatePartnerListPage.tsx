import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, Pencil, Plus, UserX } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import {
  adminAffiliatePartnersService,
  getErrorMessage,
} from '@/services/adminAffiliatePartnersService'
import { useToastStore } from '@/store/toastStore'

export function AdminAffiliatePartnerListPage() {
  const queryClient = useQueryClient()
  const toast = useToastStore((s) => s.show)
  const [search, setSearch] = useState('')
  const [isActive, setIsActive] = useState<'' | 'true' | 'false'>('')

  const params = useMemo(
    () => ({
      search: search.trim() || undefined,
      isActive: isActive || undefined,
    }),
    [search, isActive],
  )

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'affiliate-partners', params],
    queryFn: () => adminAffiliatePartnersService.list(params),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => adminAffiliatePartnersService.deactivate(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'affiliate-partners'] })
      toast('İş ortağı pasifleştirildi', 'success')
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  const handleDeactivate = async (id: string, name: string) => {
    if (!window.confirm(`“${name}” iş ortağı pasifleştirilsin mi?`)) return
    await deactivateMutation.mutateAsync(id)
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="İş Ortakları"
        description="İş ortaklarını, ürün atamalarını ve partner paneli erişimini yönetin."
        actions={
          <Link to="/admin/is-ortaklari/yeni">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni İş Ortağı
            </Button>
          </Link>
        }
      />

      <Card>
        <CardBody className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input placeholder="İsim, e-posta veya iletişim ara…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select
              value={isActive}
              onChange={(e) => setIsActive(e.target.value as '' | 'true' | 'false')}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="">Tüm durumlar</option>
              <option value="true">Aktif</option>
              <option value="false">Pasif</option>
            </select>
            <Button type="button" variant="secondary" onClick={() => void refetch()} disabled={isFetching}>
              Yenile
            </Button>
          </div>

          {isLoading ? <LoadingState label="İş ortakları yükleniyor…" /> : null}
          {isError ? <p className="text-sm text-rose-600">{getErrorMessage(error)}</p> : null}
          {!isLoading && !isError && (data?.length ?? 0) === 0 ? (
            <EmptyState title="İş ortağı yok" description="Yeni İş Ortağı ile ilk kaydı oluşturun." />
          ) : null}

          {(data?.length ?? 0) > 0 ? (
            <Table>
              <THead>
                <TR>
                  <TH>İsim</TH>
                  <TH>İletişim</TH>
                  <TH>E-posta</TH>
                  <TH>Varsayılan komisyon</TH>
                  <TH>Ürün</TH>
                  <TH>Durum</TH>
                  <TH className="text-right">İşlem</TH>
                </TR>
              </THead>
              <TBody>
                {data!.map((row) => (
                  <TR key={row.id}>
                    <TD>
                      <div className="font-medium text-slate-900">{row.name}</div>
                    </TD>
                    <TD>{row.contactName || '—'}</TD>
                    <TD>{row.email || '—'}</TD>
                    <TD>%{row.defaultCommissionRate}</TD>
                    <TD>{row.productCount}</TD>
                    <TD>
                      <Badge tone={row.isActive ? 'success' : 'default'}>
                        {row.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </TD>
                    <TD>
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/is-ortaklari/${row.id}`} className="inline-flex">
                          <Button type="button" size="sm" variant="secondary">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/admin/is-ortaklari/${row.id}/duzenle`} className="inline-flex">
                          <Button type="button" size="sm" variant="secondary">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        {row.isActive ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => void handleDeactivate(row.id, row.name)}
                            disabled={deactivateMutation.isPending}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          ) : null}
        </CardBody>
      </Card>
    </div>
  )
}
