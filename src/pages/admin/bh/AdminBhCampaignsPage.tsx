import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, RefreshCw } from 'lucide-react'
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
  type BhCampaign,
} from '@/services/adminBhService'
import { useToastStore } from '@/store/toastStore'
import { formatBhDateTime } from '@/utils/bhAdminUi'
import { bilirkisiHesapCampaignCheckoutUrl } from '@/data/canonicalSoftwareProducts'

/** Modal package scope — maps to API eligibleProductTypes (null = all). */
type PackageEligibility = 'all' | 'monthly' | 'annual'

type CampaignForm = {
  name: string
  discountRate: string
  usageLimit: string
  startsAt: string
  expiresAt: string
  isActive: boolean
  campaignType: 'GENERAL' | 'BAR_ASSOCIATION'
  barAssociationKey: string
  appliesToNewPurchase: boolean
  appliesToRenewal: boolean
  packageEligibility: PackageEligibility
}

const emptyForm = (): CampaignForm => ({
  name: '',
  discountRate: '40',
  usageLimit: '',
  startsAt: '',
  expiresAt: '',
  isActive: true,
  campaignType: 'GENERAL',
  barAssociationKey: '',
  appliesToNewPurchase: true,
  appliesToRenewal: true,
  packageEligibility: 'all',
})

/** null / empty / both monthly+annual → Tüm paketler. */
function packageEligibilityFromCampaign(
  types: BhCampaign['eligibleProductTypes'],
): PackageEligibility {
  if (types == null || !Array.isArray(types) || types.length === 0) return 'all'
  const normalized = [
    ...new Set(types.map((t) => String(t || '').toLowerCase()).filter(Boolean)),
  ]
  const hasMonthly = normalized.includes('monthly')
  const hasAnnual = normalized.includes('annual')
  if (hasMonthly && !hasAnnual) return 'monthly'
  if (hasAnnual && !hasMonthly) return 'annual'
  return 'all'
}

function packageEligibilityToApi(scope: PackageEligibility): {
  eligibleProductTypes: string[] | null
  eligiblePeriods: number[] | null
} {
  if (scope === 'monthly') {
    return { eligibleProductTypes: ['monthly'], eligiblePeriods: null }
  }
  if (scope === 'annual') {
    return { eligibleProductTypes: ['annual'], eligiblePeriods: null }
  }
  return { eligibleProductTypes: null, eligiblePeriods: null }
}

function toDatetimeLocal(value?: string | null): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function campaignToForm(c: BhCampaign): CampaignForm {
  return {
    name: c.name || '',
    discountRate: String(c.discountRate ?? 0),
    usageLimit: c.usageLimit != null ? String(c.usageLimit) : '',
    startsAt: toDatetimeLocal(c.startsAt),
    expiresAt: toDatetimeLocal(c.expiresAt),
    isActive: c.isActive !== false,
    campaignType: c.campaignType === 'BAR_ASSOCIATION' ? 'BAR_ASSOCIATION' : 'GENERAL',
    barAssociationKey: String(c.barAssociationKey || ''),
    appliesToNewPurchase: c.appliesToNewPurchase !== false,
    appliesToRenewal: Boolean(c.appliesToRenewal),
    packageEligibility: packageEligibilityFromCampaign(c.eligibleProductTypes),
  }
}

function formToPayload(form: CampaignForm, mode: 'create' | 'edit') {
  const discountRate = Number.parseInt(form.discountRate, 10)
  const eligibility = packageEligibilityToApi(form.packageEligibility)
  const payload: Record<string, unknown> = {
    name: form.name.trim(),
    discountRate,
    isActive: form.isActive,
    appliesToNewPurchase: form.appliesToNewPurchase,
    appliesToRenewal: form.appliesToRenewal,
    campaignType: form.campaignType,
    startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
    expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    usageLimit: form.usageLimit.trim() ? Number.parseInt(form.usageLimit, 10) : null,
    eligibleProductTypes: eligibility.eligibleProductTypes,
    eligiblePeriods: eligibility.eligiblePeriods,
  }
  if (form.campaignType === 'BAR_ASSOCIATION') {
    payload.barAssociationKey = form.barAssociationKey.trim()
  } else if (mode === 'create') {
    payload.barAssociationKey = null
  }
  return payload
}

export function AdminBhCampaignsPage() {
  const toast = useToastStore((s) => s.show)
  const qc = useQueryClient()
  const [editor, setEditor] = useState<'create' | BhCampaign | null>(null)
  const [form, setForm] = useState<CampaignForm>(emptyForm())

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'bh', 'campaigns'],
    queryFn: () => adminBhService.listCampaigns(),
  })

  const barsQuery = useQuery({
    queryKey: ['admin', 'bh', 'bar-associations'],
    queryFn: () => adminBhService.listBarAssociations(),
    enabled: Boolean(editor) && form.campaignType === 'BAR_ASSOCIATION',
    retry: false,
  })

  useEffect(() => {
    if (!editor) return
    if (editor === 'create') setForm(emptyForm())
    else setForm(campaignToForm(editor))
  }, [editor])

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = formToPayload(form, editor === 'create' ? 'create' : 'edit')
      if (!payload.name || Number.isNaN(Number(payload.discountRate))) {
        throw new Error('Kampanya adı ve indirim oranı gerekli')
      }
      if (editor === 'create') return adminBhService.createCampaign(payload)
      if (editor && typeof editor === 'object') {
        return adminBhService.updateCampaign(editor.id, payload)
      }
      throw new Error('Geçersiz form')
    },
    onSuccess: async () => {
      toast(editor === 'create' ? 'Kampanya oluşturuldu' : 'Kampanya güncellendi', 'success')
      setEditor(null)
      await qc.invalidateQueries({ queryKey: ['admin', 'bh'] })
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  const toggleMut = useMutation({
    mutationFn: async (c: BhCampaign) =>
      adminBhService.updateCampaign(c.id, { isActive: !c.isActive }),
    onSuccess: async () => {
      toast('Kampanya durumu güncellendi', 'success')
      await qc.invalidateQueries({ queryKey: ['admin', 'bh', 'campaigns'] })
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  const rows = data ?? []
  const barOptions = useMemo(() => {
    const list = barsQuery.data ?? []
    return list.map((b) => ({
      key: String(b.key || b.id || ''),
      name: String(b.name || b.key || b.id || ''),
    })).filter((b) => b.key)
  }, [barsQuery.data])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void saveMut.mutateAsync()
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Bilirkişi Hesap — Kampanyalar"
        description="Baro ve genel indirim kampanyalarını yönetin. Paylaşım için tam Woontegra satış bağlantısı kullanılır."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => void refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
            <Button size="sm" onClick={() => setEditor('create')}>
              <Plus className="h-4 w-4" />
              Yeni kampanya
            </Button>
          </div>
        }
      />

      {isLoading ? <LoadingState /> : null}
      {isError ? (
        <EmptyState title="Kampanyalar yüklenemedi" description={getErrorMessage(error)} />
      ) : null}

      {!isLoading && !isError ? (
        <Card>
          <CardBody>
            {!rows.length ? (
              <EmptyState title="Kampanya yok" description="Henüz kampanya kaydı yok." />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Ad</TH>
                    <TH>Kod</TH>
                    <TH>İndirim</TH>
                    <TH>Tür</TH>
                    <TH>Kullanım</TH>
                    <TH>Başlangıç / Bitiş</TH>
                    <TH>Durum</TH>
                    <TH>İşlem</TH>
                  </TR>
                </THead>
                <TBody>
                  {rows.map((c) => (
                    <TR key={c.id}>
                      <TD className="font-medium">{c.name}</TD>
                      <TD className="font-mono text-xs">{c.publicCode || '—'}</TD>
                      <TD>%{c.discountRate ?? 0}</TD>
                      <TD>
                        {c.campaignType === 'BAR_ASSOCIATION'
                          ? `Baro${c.barAssociationNameSnapshot ? `: ${c.barAssociationNameSnapshot}` : ''}`
                          : 'Genel'}
                      </TD>
                      <TD>
                        {c.usageCount ?? 0}
                        {c.usageLimit != null ? ` / ${c.usageLimit}` : ''}
                      </TD>
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
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="secondary" onClick={() => setEditor(c)}>
                            <Pencil className="h-3.5 w-3.5" />
                            Düzenle
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={toggleMut.isPending}
                            onClick={() => void toggleMut.mutateAsync(c)}
                          >
                            {c.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                          </Button>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </CardBody>
        </Card>
      ) : null}

      <AdminSimpleModal
        open={Boolean(editor)}
        title={editor === 'create' ? 'Yeni kampanya' : 'Kampanyayı düzenle'}
        onClose={() => setEditor(null)}
        wide
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditor(null)} disabled={saveMut.isPending}>
              Vazgeç
            </Button>
            <Button disabled={saveMut.isPending} onClick={() => void saveMut.mutateAsync()}>
              {saveMut.isPending ? 'Kaydediliyor…' : 'Kaydet'}
            </Button>
          </>
        }
      >
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={onSubmit}>
          <div className="sm:col-span-2">
            <Input
              label="Kampanya adı"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          {editor && typeof editor === 'object' ? (
            <div className="sm:col-span-2 rounded-md bg-slate-50 px-3 py-2 text-sm space-y-1">
              <div>
                <span className="text-slate-500">Kampanya kodu:</span>{' '}
                <span className="font-mono">{editor.publicCode}</span>
              </div>
              <div className="break-all">
                <span className="text-slate-500">Satış bağlantısı:</span>{' '}
                <span className="font-mono text-xs">
                  {bilirkisiHesapCampaignCheckoutUrl(editor.publicCode || '')}
                </span>
              </div>
            </div>
          ) : (
            <p className="sm:col-span-2 text-xs text-slate-500">
              Kampanya kodu kayıtta otomatik üretilir; sonradan değiştirilemez.
            </p>
          )}
          <Input
            label="İndirim oranı (%)"
            type="number"
            min={0}
            max={100}
            step={1}
            value={form.discountRate}
            onChange={(e) => setForm((f) => ({ ...f, discountRate: e.target.value }))}
            required
          />
          <Input
            label="Kullanım limiti"
            type="number"
            min={1}
            value={form.usageLimit}
            onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
            hint="Boş = sınırsız"
          />
          <Input
            label="Başlangıç"
            type="datetime-local"
            value={form.startsAt}
            onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
          />
          <Input
            label="Bitiş"
            type="datetime-local"
            value={form.expiresAt}
            onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
          />
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block text-slate-600">Paket uygunluğu</span>
            <select
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              value={form.packageEligibility}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  packageEligibility: e.target.value as PackageEligibility,
                }))
              }
            >
              <option value="all">Tüm paketler</option>
              <option value="monthly">Aylık</option>
              <option value="annual">Yıllık</option>
            </select>
            <span className="mt-1 block text-xs text-slate-500">
              Tüm paketler: aylık ve yıllık indirimli. Aylık / Yıllık: yalnız seçilen paket
              indirimli.
            </span>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">Kampanya türü</span>
            <select
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              value={form.campaignType}
              disabled={editor !== 'create' && form.campaignType === 'BAR_ASSOCIATION'}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  campaignType: e.target.value as CampaignForm['campaignType'],
                }))
              }
            >
              <option value="GENERAL">Genel</option>
              <option value="BAR_ASSOCIATION">Baro</option>
            </select>
          </label>
          {form.campaignType === 'BAR_ASSOCIATION' ? (
            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">Baro</span>
              <select
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                value={form.barAssociationKey}
                disabled={editor !== 'create'}
                onChange={(e) => setForm((f) => ({ ...f, barAssociationKey: e.target.value }))}
              >
                <option value="">Seçin…</option>
                {form.barAssociationKey &&
                !barOptions.some((b) => b.key === form.barAssociationKey) ? (
                  <option value={form.barAssociationKey}>{form.barAssociationKey}</option>
                ) : null}
                {barOptions.map((b) => (
                  <option key={b.key} value={b.key}>
                    {b.name}
                  </option>
                ))}
              </select>
              {barsQuery.isError ? (
                <span className="mt-1 block text-xs text-amber-700">
                  Baro listesi alınamadı; mevcut anahtar korunur.
                </span>
              ) : null}
            </label>
          ) : (
            <div />
          )}
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            Aktif
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.appliesToNewPurchase}
              onChange={(e) => setForm((f) => ({ ...f, appliesToNewPurchase: e.target.checked }))}
            />
            Yeni satın almada geçerli
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.appliesToRenewal}
              onChange={(e) => setForm((f) => ({ ...f, appliesToRenewal: e.target.checked }))}
            />
            Yenilemede geçerli
          </label>
        </form>
      </AdminSimpleModal>
    </div>
  )
}
