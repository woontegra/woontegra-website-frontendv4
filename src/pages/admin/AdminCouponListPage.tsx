import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { adminCouponsService, getErrorMessage, type AdminCoupon } from '@/services/adminCouponsService'
import { formatMoney } from '@/utils/formatMoney'
import { useToastStore } from '@/store/toastStore'

function discountLabel(row: AdminCoupon): string {
  if (row.discountType === 'percent') return `%${row.discountValue}`
  return formatMoney(row.discountValue)
}

export function AdminCouponListPage() {
  const toast = useToastStore((s) => s.show)
  const queryClient = useQueryClient()
  const [includeArchived, setIncludeArchived] = useState(false)
  const query = useQuery({
    queryKey: ['admin', 'coupons', includeArchived],
    queryFn: () => adminCouponsService.list(includeArchived),
  })
  const archiveMutation = useMutation({
    mutationFn: (id: string) => adminCouponsService.archive(id),
    onSuccess: async () => {
      toast('Kupon arşivlendi', 'success')
      await queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] })
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kupon Kodları"
        description="Checkout’ta müşterinin gireceği indirim kodları. Kampanyalardan ayrıdır."
        actions={
          <Link to="/admin/coupons/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni kupon
            </Button>
          </Link>
        }
      />
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={includeArchived} onChange={(e) => setIncludeArchived(e.target.checked)} />
        Arşivlenenleri göster
      </label>
      {query.isLoading ? <LoadingState label="Kuponlar yükleniyor…" /> : null}
      {query.isError ? <EmptyState title="Kuponlar yüklenemedi" description={getErrorMessage(query.error)} /> : null}
      {query.data && query.data.length === 0 ? <EmptyState title="Kupon yok" description="Yeni kupon ekleyebilirsiniz." /> : null}
      {query.data && query.data.length > 0 ? (
        <Card>
          <CardBody className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Ad</TH>
                  <TH>Kod</TH>
                  <TH>İndirim</TH>
                  <TH>Ürün</TH>
                  <TH>Durum</TH>
                  <TH>İşlem</TH>
                </TR>
              </THead>
              <TBody>
                {query.data.map((row) => (
                  <TR key={row.id}>
                    <TD className="font-medium">{row.name}</TD>
                    <TD className="font-mono text-xs">{row.code}</TD>
                    <TD>{discountLabel(row)}</TD>
                    <TD>{row.productIds.length === 0 ? 'Tüm ürünler' : row.productIds.length}</TD>
                    <TD>
                      {row.archivedAt ? (
                        <Badge>Arşiv</Badge>
                      ) : row.isActive ? (
                        <Badge tone="success">Aktif</Badge>
                      ) : (
                        <Badge tone="warning">Pasif</Badge>
                      )}
                    </TD>
                    <TD>
                      <div className="flex gap-2">
                        <Link to={`/admin/coupons/${row.id}/edit`} className="text-sm text-emerald-700 hover:underline">
                          <Pencil className="inline h-4 w-4" /> Düzenle
                        </Link>
                        {!row.archivedAt ? (
                          <button
                            type="button"
                            className="text-sm text-slate-500 hover:underline"
                            onClick={() => archiveMutation.mutate(row.id)}
                          >
                            Arşivle
                          </button>
                        ) : null}
                      </div>
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
