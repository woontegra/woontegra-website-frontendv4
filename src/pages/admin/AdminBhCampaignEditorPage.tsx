import { useEffect, useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Copy, ExternalLink, Save } from 'lucide-react'
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
  type BhCampaign,
} from '@/services/adminBhService'
import { useToastStore } from '@/store/toastStore'
import { bilirkisiHesapCampaignCheckoutUrl } from '@/data/canonicalSoftwareProducts'
import {
  bhPaymentMethodLabel,
  formatBhDateTime,
  formatBhKurus,
} from '@/utils/bhAdminUi'

type CampaignProductType = 'monthly' | 'annual'
type CampaignType = 'GENERAL' | 'BAR_ASSOCIATION'

export type BhCampaignFormState = {
  name: string
  discountRate: string
  usageLimit: string
  startsAt: string
  expiresAt: string
  isActive: boolean
  campaignType: CampaignType
  barAssociationKey: string
  appliesToNewPurchase: boolean
  appliesToRenewal: boolean
  eligibleProductTypes: CampaignProductType[]
  eligiblePeriods: number[]
}

export const emptyBhCampaignForm = (): BhCampaignFormState => ({
  name: '',
  discountRate: '',
  usageLimit: '',
  startsAt: '',
  expiresAt: '',
  isActive: true,
  campaignType: 'GENERAL',
  barAssociationKey: '',
  appliesToNewPurchase: true,
  appliesToRenewal: false,
  eligibleProductTypes: ['monthly', 'annual'],
  eligiblePeriods: [1, 2, 3],
})

function toDateInput(value?: string | null): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function asProductTypes(raw: unknown): CampaignProductType[] {
  if (!Array.isArray(raw)) return ['monthly', 'annual']
  const allowed = raw
    .map((x) => String(x).toLowerCase())
    .filter((x): x is CampaignProductType => x === 'monthly' || x === 'annual')
  return allowed.length ? [...new Set(allowed)] : ['monthly', 'annual']
}

function asPeriods(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [1, 2, 3]
  const allowed = raw.map(Number).filter((n) => n === 1 || n === 2 || n === 3)
  return allowed.length ? [...new Set(allowed)] : [1, 2, 3]
}

export function campaignToBhForm(c: BhCampaign): BhCampaignFormState {
  return {
    name: c.name || '',
    discountRate: String(c.discountRate ?? ''),
    usageLimit: c.usageLimit != null ? String(c.usageLimit) : '',
    startsAt: toDateInput(c.startsAt),
    expiresAt: toDateInput(c.expiresAt),
    isActive: c.isActive !== false,
    campaignType: c.campaignType === 'BAR_ASSOCIATION' ? 'BAR_ASSOCIATION' : 'GENERAL',
    barAssociationKey: String(c.barAssociationKey || ''),
    appliesToNewPurchase: c.appliesToNewPurchase !== false,
    appliesToRenewal: Boolean(c.appliesToRenewal),
    eligibleProductTypes: asProductTypes(c.eligibleProductTypes),
    eligiblePeriods: asPeriods(c.eligiblePeriods),
  }
}

export function bhFormToPayload(form: BhCampaignFormState, mode: 'create' | 'edit') {
  const discountRate = Number.parseInt(form.discountRate, 10)
  const campaignType: CampaignType =
    form.campaignType === 'BAR_ASSOCIATION' || Boolean(form.barAssociationKey.trim())
      ? 'BAR_ASSOCIATION'
      : 'GENERAL'

  const payload: Record<string, unknown> = {
    name: form.name.trim(),
    discountRate,
    usageLimit: form.usageLimit.trim() ? Number.parseInt(form.usageLimit, 10) : null,
    startsAt: form.startsAt || null,
    expiresAt: form.expiresAt || null,
    isActive: form.isActive,
    campaignType,
    appliesToNewPurchase: form.appliesToNewPurchase,
    appliesToRenewal: form.appliesToRenewal,
    eligibleProductTypes: form.eligibleProductTypes,
    eligiblePeriods: form.eligiblePeriods,
  }

  if (campaignType === 'BAR_ASSOCIATION') {
    payload.barAssociationKey = form.barAssociationKey.trim()
  } else if (mode === 'create') {
    payload.barAssociationKey = null
  } else {
    payload.barAssociationKey = null
  }

  return payload
}

type BhCampaignFormProps = {
  form: BhCampaignFormState
  setForm: Dispatch<SetStateAction<BhCampaignFormState>>
  mode: 'create' | 'edit'
  loaded?: BhCampaign | null
  barOptions: Array<{ key: string; name: string }>
  barsLoading?: boolean
  barsError?: boolean
  onSubmit: (e: FormEvent) => void
}

/** Shared create/edit fields — mirrors old BH AdminV2CampaignsPage form. */
export function BhCampaignFormFields({
  form,
  setForm,
  mode,
  loaded,
  barOptions,
  barsError,
  onSubmit,
}: BhCampaignFormProps) {
  const toast = useToastStore((s) => s.show)
  const publicCode = loaded?.publicCode || ''

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast('Link kopyalandı', 'success')
    } catch {
      toast('Kopyalama başarısız', 'error')
    }
  }

  const toggleProductType = (type: CampaignProductType, checked: boolean) => {
    setForm((f) => ({
      ...f,
      eligibleProductTypes: checked
        ? [...f.eligibleProductTypes, type]
        : f.eligibleProductTypes.filter((v) => v !== type),
    }))
  }

  const togglePeriod = (period: number, checked: boolean) => {
    setForm((f) => ({
      ...f,
      eligiblePeriods: checked
        ? [...f.eligiblePeriods, period]
        : f.eligiblePeriods.filter((v) => v !== period),
    }))
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit} id="bh-campaign-form">
      <div className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
        <span className="font-medium">Ürün:</span> Bilirkişi Hesap
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label="Kampanya adı *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">Kampanya türü</span>
          <select
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            value={form.campaignType}
            disabled={mode === 'edit' && form.campaignType === 'BAR_ASSOCIATION'}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                campaignType: e.target.value as CampaignType,
                barAssociationKey:
                  e.target.value === 'BAR_ASSOCIATION' ? f.barAssociationKey : '',
              }))
            }
          >
            <option value="GENERAL">Genel</option>
            <option value="BAR_ASSOCIATION">Baro</option>
          </select>
        </label>

        {form.campaignType === 'BAR_ASSOCIATION' ? (
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">Baro *</span>
            <select
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              value={form.barAssociationKey}
              disabled={mode === 'edit'}
              required
              onChange={(e) => setForm((f) => ({ ...f, barAssociationKey: e.target.value }))}
            >
              <option value="">Baro seçin</option>
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
            {barsError ? (
              <span className="mt-1 block text-xs text-amber-700">
                Baro listesi alınamadı; mevcut değer korunur.
              </span>
            ) : null}
          </label>
        ) : (
          <div />
        )}

        <Input
          label="İndirim oranı (%) *"
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
          hint="Boş = limitsiz"
        />
        <Input
          label="Başlangıç tarihi"
          type="date"
          value={form.startsAt}
          onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
        />
        <Input
          label="Bitiş tarihi"
          type="date"
          value={form.expiresAt}
          onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
        />

        <div className="sm:col-span-2 space-y-2">
          <label className="block text-sm font-medium text-slate-700">Satış bağlantısı</label>
          {publicCode ? (
            <>
              <div className="flex flex-wrap items-stretch gap-2">
                <input
                  className="min-w-0 flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs"
                  value={bilirkisiHesapCampaignCheckoutUrl(publicCode)}
                  readOnly
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => void copyText(bilirkisiHesapCampaignCheckoutUrl(publicCode))}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Kopyala
                </Button>
                <a
                  href={bilirkisiHesapCampaignCheckoutUrl(publicCode)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Aç
                </a>
              </div>
              <p className="text-xs text-slate-500">
                Dahili kampanya kodu: <span className="font-mono">{publicCode}</span>
              </p>
            </>
          ) : (
            <input
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
              value="Kampanya oluşturulunca otomatik atanır"
              readOnly
              disabled
            />
          )}
        </div>
      </div>

      <div className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-slate-700">Uygulama alanı</p>
          <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.appliesToNewPurchase}
              onChange={(e) => setForm((f) => ({ ...f, appliesToNewPurchase: e.target.checked }))}
            />
            Yeni satın alma
          </label>
          <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.appliesToRenewal}
              onChange={(e) => setForm((f) => ({ ...f, appliesToRenewal: e.target.checked }))}
            />
            Yenileme
          </label>
          <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            Aktif
          </label>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">Uygun paketler / dönemler</p>
          <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.eligibleProductTypes.includes('monthly')}
              onChange={(e) => toggleProductType('monthly', e.target.checked)}
            />
            Aylık
          </label>
          <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.eligibleProductTypes.includes('annual')}
              onChange={(e) => toggleProductType('annual', e.target.checked)}
            />
            Yıllık
          </label>
          {form.eligibleProductTypes.includes('annual') ? (
            <>
              <p className="mt-4 text-sm font-medium text-slate-700">Yıllık dönemler</p>
              {[1, 2, 3].map((period) => (
                <label key={period} className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.eligiblePeriods.includes(period)}
                    onChange={(e) => togglePeriod(period, e.target.checked)}
                  />
                  {period} yıl
                </label>
              ))}
            </>
          ) : null}
        </div>
      </div>

      {mode === 'edit' && loaded ? (
        <p className="text-xs text-slate-500">
          Kullanım: {loaded.usageCount ?? 0}
          {loaded.usageLimit != null ? ` / ${loaded.usageLimit}` : ''}
        </p>
      ) : null}
    </form>
  )
}

export function AdminBhCampaignEditorPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToastStore((s) => s.show)
  const qc = useQueryClient()
  const [form, setForm] = useState<BhCampaignFormState>(emptyBhCampaignForm())
  const [loaded, setLoaded] = useState<BhCampaign | null>(null)

  const detailQuery = useQuery({
    queryKey: ['admin', 'bh', 'campaigns', id],
    queryFn: () => adminBhService.getCampaign(id!),
    enabled: isEdit,
  })

  const barsQuery = useQuery({
    queryKey: ['admin', 'bh', 'bar-associations'],
    queryFn: () => adminBhService.listBarAssociations(),
    enabled: form.campaignType === 'BAR_ASSOCIATION',
    retry: false,
  })

  const barKey = loaded?.barAssociationKey || form.barAssociationKey
  const perfQuery = useQuery({
    queryKey: ['admin', 'bh', 'bar-performance', barKey],
    queryFn: () => adminBhService.getBarPerformanceDetails(barKey),
    enabled: Boolean(isEdit && loaded?.campaignType === 'BAR_ASSOCIATION' && barKey),
    retry: false,
  })

  const summaryQuery = useQuery({
    queryKey: ['admin', 'bh', 'bar-performance'],
    queryFn: () => adminBhService.listBarPerformance(),
    enabled: Boolean(isEdit && loaded?.campaignType === 'BAR_ASSOCIATION' && barKey),
    retry: false,
  })

  useEffect(() => {
    if (detailQuery.data) {
      setLoaded(detailQuery.data)
      setForm(campaignToBhForm(detailQuery.data))
    }
  }, [detailQuery.data])

  const barOptions = useMemo(() => {
    const list = barsQuery.data ?? []
    return list
      .map((b) => ({
        key: String(b.key || b.id || ''),
        name: String(b.name || b.key || b.id || ''),
      }))
      .filter((b) => b.key)
  }, [barsQuery.data])

  const barSummary = useMemo(() => {
    if (!barKey || !summaryQuery.data) return null
    return summaryQuery.data.find((r) => r.barAssociationKey === barKey) ?? null
  }, [summaryQuery.data, barKey])

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!form.name.trim() || !form.discountRate.trim()) {
        throw new Error('Kampanya adı ve indirim oranı zorunludur')
      }
      const discountRate = Number.parseInt(form.discountRate, 10)
      if (Number.isNaN(discountRate) || discountRate < 0 || discountRate > 100) {
        throw new Error('İndirim oranı 0–100 arasında olmalıdır')
      }
      if (form.campaignType === 'BAR_ASSOCIATION' && !form.barAssociationKey.trim()) {
        throw new Error('Baro seçimi zorunludur')
      }
      if (form.eligibleProductTypes.length === 0) {
        throw new Error('En az bir paket seçilmelidir')
      }
      if (form.eligibleProductTypes.includes('annual') && form.eligiblePeriods.length === 0) {
        throw new Error('Yıllık paket için en az bir dönem seçilmelidir')
      }
      const payload = bhFormToPayload(form, isEdit ? 'edit' : 'create')
      if (isEdit && id) return adminBhService.updateCampaign(id, payload)
      return adminBhService.createCampaign(payload)
    },
    onSuccess: async (saved) => {
      toast(isEdit ? 'Kampanya güncellendi' : 'Kampanya oluşturuldu', 'success')
      await qc.invalidateQueries({ queryKey: ['admin', 'bh'] })
      await qc.invalidateQueries({ queryKey: ['admin', 'campaigns'] })
      navigate(`/admin/bh/kampanyalar/${saved.id}`, { replace: !isEdit })
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void saveMut.mutateAsync()
  }

  if (isEdit && detailQuery.isLoading) return <LoadingState label="Kampanya yükleniyor…" />
  if (isEdit && detailQuery.isError) {
    return (
      <EmptyState
        title="Kampanya bulunamadı"
        description={getErrorMessage(detailQuery.error)}
        action={
          <Link to="/admin/bh/kampanyalar">
            <Button variant="secondary">Listeye dön</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title={isEdit ? 'Bilirkişi Hesap kampanyasını düzenle' : 'Yeni Bilirkişi Hesap kampanyası'}
        description="İndirim linki, paket ve yenileme seçeneklerini yönetin."
        actions={
          <div className="flex gap-2">
            <Link to="/admin/bh/kampanyalar">
              <Button variant="secondary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Listeye dön
              </Button>
            </Link>
            <Button
              disabled={saveMut.isPending}
              onClick={() => void saveMut.mutateAsync()}
            >
              <Save className="mr-2 h-4 w-4" />
              {saveMut.isPending ? 'Kaydediliyor…' : isEdit ? 'Güncelle' : 'Oluştur'}
            </Button>
          </div>
        }
      />

      <Card>
        <CardBody>
          <BhCampaignFormFields
            form={form}
            setForm={setForm}
            mode={isEdit ? 'edit' : 'create'}
            loaded={loaded}
            barOptions={barOptions}
            barsError={barsQuery.isError}
            onSubmit={onSubmit}
          />
        </CardBody>
      </Card>

      {isEdit && loaded?.campaignType === 'BAR_ASSOCIATION' ? (
        <Card>
          <CardBody className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Baro satış özeti</h2>
              <p className="mt-1 text-xs text-slate-500">
                Yalnızca başarılı ve lisansı uygulanmış satışlar listelenir.
              </p>
            </div>
            {summaryQuery.isLoading || perfQuery.isLoading ? <LoadingState /> : null}
            {barSummary ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-slate-200 px-3 py-2">
                  <p className="text-xs text-slate-500">Benzersiz kullanıcı</p>
                  <p className="text-lg font-semibold">{barSummary.uniqueUserCount}</p>
                </div>
                <div className="rounded-lg border border-slate-200 px-3 py-2">
                  <p className="text-xs text-slate-500">İlk satın alma</p>
                  <p className="text-lg font-semibold">{barSummary.firstPurchaseCount}</p>
                </div>
                <div className="rounded-lg border border-slate-200 px-3 py-2">
                  <p className="text-xs text-slate-500">Yenileme</p>
                  <p className="text-lg font-semibold">{barSummary.renewalCount}</p>
                </div>
                <div className="rounded-lg border border-slate-200 px-3 py-2">
                  <p className="text-xs text-slate-500">Toplam satış</p>
                  <p className="text-lg font-semibold">
                    {formatBhKurus(barSummary.totalAmountKurus)}
                  </p>
                </div>
              </div>
            ) : !summaryQuery.isLoading ? (
              <EmptyState
                title="Satış yok"
                description="Bu baro için henüz tamamlanmış satış bulunamadı."
              />
            ) : null}

            {perfQuery.data?.transactions?.length ? (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Son işlemler
                </h3>
                <Table>
                  <THead>
                    <TR>
                      <TH>Sipariş</TH>
                      <TH>Müşteri</TH>
                      <TH>Tür</TH>
                      <TH>Ödeme</TH>
                      <TH>Tutar</TH>
                      <TH>Tarih</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {perfQuery.data.transactions.slice(0, 20).map((t) => (
                      <TR key={t.merchantOid}>
                        <TD
                          className="max-w-[120px] truncate font-mono text-xs"
                          title={t.merchantOid}
                        >
                          {t.merchantOid}
                        </TD>
                        <TD>
                          <div className="font-medium">{t.name}</div>
                          <div className="text-xs text-slate-500">{t.email || '—'}</div>
                        </TD>
                        <TD>{t.orderPurpose === 'RENEWAL' ? 'Yenileme' : 'İlk satın alma'}</TD>
                        <TD>{bhPaymentMethodLabel(t.paymentMethod)}</TD>
                        <TD>{formatBhKurus(t.amountKurus)}</TD>
                        <TD className="whitespace-nowrap text-xs">
                          {formatBhDateTime(t.transactionAt)}
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>
            ) : null}
          </CardBody>
        </Card>
      ) : null}
    </div>
  )
}
