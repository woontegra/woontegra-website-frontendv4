import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { adminCampaignsService, getErrorMessage } from '@/services/adminCampaignsService'
import {
  CAMPAIGN_TYPE_LABELS,
  DISCOUNT_TYPE_LABELS,
  formatCampaignDate,
  scheduleStatusLabel,
  TARGET_TYPE_LABELS,
  type Campaign,
  type CampaignType,
} from '@/types/campaign'
import { useToastStore } from '@/store/toastStore'

function discountSummary(c: Campaign): string {
  if (c.type !== 'product_discount' && c.type !== 'coupon') return '—'
  if (!c.discountType) return '—'
  const label = DISCOUNT_TYPE_LABELS[c.discountType]
  if (c.discountType === 'percent') return `${label}: %${c.discountValue ?? 0}`
  return `${label}: ${c.discountValue ?? 0} TRY`
}

function targetSummary(c: Campaign): string {
  if (c.type !== 'product_discount' && c.type !== 'coupon') return '—'
  const t = c.targetType ?? 'all'
  if (t === 'products') return `Ürün (${c.targetProductIds?.length ?? 0})`
  if (t === 'categories') return `Kategori (${c.targetCategoryIds?.length ?? 0})`
  if (t === 'product_types') return `Tip (${c.targetProductTypes?.length ?? 0})`
  return TARGET_TYPE_LABELS.all
}

export function AdminCampaignListPage() {
  const queryClient = useQueryClient()
  const toast = useToastStore((s) => s.show)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<'' | CampaignType>('')
  const [active, setActive] = useState<'' | 'true' | 'false'>('')
  const [schedule, setSchedule] = useState<'' | 'scheduled' | 'expired' | 'product_discount' | 'coupon'>('')

  const params = useMemo(
    () => ({
      search: search.trim() || undefined,
      type: type || undefined,
      active: active || undefined,
      schedule: schedule || undefined,
    }),
    [search, type, active, schedule],
  )

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'campaigns', params],
    queryFn: () => adminCampaignsService.list(params),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminCampaignsService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] })
      void queryClient.invalidateQueries({ queryKey: ['campaigns', 'public'] })
      toast('Kampanya silindi', 'success')
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  const handleDelete = async (item: Campaign) => {
    if (!window.confirm(`"${item.name}" kampanyası silinsin mi?`)) return
    await deleteMutation.mutateAsync(item.id)
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Kampanyalar"
        description="Duyuru barı, banner ve ürün indirimi kampanyalarını yönetin."
        actions={
          <Link to="/admin/campaigns/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni kampanya
            </Button>
          </Link>
        }
      />

      <Card>
        <CardBody className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input placeholder="Ara…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as '' | CampaignType)}
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            >
              <option value="">Tüm tipler</option>
              {Object.entries(CAMPAIGN_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <select
              value={active}
              onChange={(e) => setActive(e.target.value as '' | 'true' | 'false')}
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            >
              <option value="">Aktif / pasif</option>
              <option value="true">Aktif</option>
              <option value="false">Pasif</option>
            </select>
            <select
              value={schedule}
              onChange={(e) =>
                setSchedule(e.target.value as '' | 'scheduled' | 'expired' | 'product_discount' | 'coupon')
              }
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            >
              <option value="">Ek filtre</option>
              <option value="scheduled">Planlandı</option>
              <option value="expired">Süresi doldu</option>
              <option value="product_discount">Ürün indirimi</option>
              <option value="coupon">Kupon</option>
            </select>
          </div>

          {isLoading ? (
            <LoadingState label="Kampanyalar yükleniyor…" />
          ) : isError ? (
            <EmptyState
              title="Liste yüklenemedi"
              description={getErrorMessage(error)}
              action={
                <Button variant="secondary" onClick={() => void refetch()}>
                  Tekrar dene
                </Button>
              }
            />
          ) : !data?.length ? (
            <EmptyState
              title="Henüz kampanya yok"
              description="Duyuru, banner veya ürün indirimi kampanyası oluşturabilirsiniz."
              action={
                <Link to="/admin/campaigns/new">
                  <Button>Yeni kampanya</Button>
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>Kampanya adı</TH>
                    <TH>Tip</TH>
                    <TH>Durum</TH>
                    <TH>İndirim</TH>
                    <TH>Hedef</TH>
                    <TH>Başlangıç</TH>
                    <TH>Bitiş</TH>
                    <TH>Öncelik</TH>
                    <TH>Aktif</TH>
                    <TH className="text-right">İşlemler</TH>
                  </TR>
                </THead>
                <TBody>
                  {data.map((item) => {
                    const status = scheduleStatusLabel(item.scheduleStatus, item.active)
                    const tone =
                      status === 'Aktif'
                        ? 'success'
                        : status === 'Planlandı'
                          ? 'warning'
                          : status === 'Süresi doldu'
                            ? 'default'
                            : 'default'
                    return (
                      <TR key={item.id}>
                        <TD>
                          <div>
                            <p className="font-medium text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500">{item.slug}</p>
                          </div>
                        </TD>
                        <TD>{CAMPAIGN_TYPE_LABELS[item.type]}</TD>
                        <TD>
                          <Badge tone={tone}>{status}</Badge>
                        </TD>
                        <TD className="text-sm">{discountSummary(item)}</TD>
                        <TD className="text-sm">{targetSummary(item)}</TD>
                        <TD className="whitespace-nowrap text-sm">{formatCampaignDate(item.startAt)}</TD>
                        <TD className="whitespace-nowrap text-sm">{formatCampaignDate(item.endAt)}</TD>
                        <TD>{item.priority}</TD>
                        <TD>{item.active ? 'Evet' : 'Hayır'}</TD>
                        <TD>
                          <div className="flex justify-end gap-1">
                            <Link to={`/admin/campaigns/${item.id}/edit`}>
                              <Button variant="ghost" size="sm" aria-label="Düzenle">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Sil"
                              onClick={() => void handleDelete(item)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TD>
                      </TR>
                    )
                  })}
                </TBody>
              </Table>
              {isFetching && !isLoading ? (
                <p className="mt-2 text-xs text-slate-400">Güncelleniyor…</p>
              ) : null}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
