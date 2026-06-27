import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { SettingsMediaField } from '@/components/admin/SettingsMediaField'
import { adminCampaignsService, getErrorMessage } from '@/services/adminCampaignsService'
import { adminProductsService } from '@/services/adminProductsService'
import { productCategoriesService } from '@/services/productCategoriesService'
import {
  CAMPAIGN_TYPE_LABELS,
  DISCOUNT_TYPE_LABELS,
  PRODUCT_TARGET_LABELS,
  TARGET_TYPE_LABELS,
  slugifyCampaignName,
  type Campaign,
  type CampaignType,
  type DiscountType,
  type ProductTargetType,
  type TargetType,
} from '@/types/campaign'
import { cn } from '@/lib/cn'
import { useToastStore } from '@/store/toastStore'

type TabId =
  | 'general'
  | 'discount'
  | 'targeting'
  | 'visual'
  | 'schedule'
  | 'coupon'
  | 'advanced'

const TABS: { id: TabId; label: string }[] = [
  { id: 'general', label: 'Genel Bilgiler' },
  { id: 'discount', label: 'İndirim Ayarları' },
  { id: 'targeting', label: 'Hedefleme' },
  { id: 'visual', label: 'Görsel & Tasarım' },
  { id: 'schedule', label: 'Tarih & Durum' },
  { id: 'coupon', label: 'Kupon Ayarları' },
  { id: 'advanced', label: 'Gelişmiş' },
]

const emptyForm: Partial<Campaign> = {
  name: '',
  slug: '',
  type: 'product_discount',
  active: true,
  priority: 0,
  shortTitle: '',
  description: '',
  badge: '',
  ctaText: '',
  ctaLink: '',
  discountType: 'percent',
  discountValue: 10,
  minCartTotal: null,
  maxDiscountAmount: null,
  freeProductEnabled: false,
  stackPriority: 'highest',
  targetType: 'products',
  targetProductIds: [],
  targetCategoryIds: [],
  targetProductTypes: [],
  excludeProductIds: [],
  desktopImage: '',
  mobileImage: '',
  backgroundColor: '#047857',
  gradient: '',
  textColor: '#ffffff',
  overlay: '',
  startAt: null,
  endAt: null,
  couponCode: '',
  couponUsageLimit: null,
  couponUsagePerCustomer: null,
  couponFirstPurchaseOnly: false,
  couponProductScopeOnly: false,
  adminNote: '',
  showOnPublic: true,
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}

function toDatetimeLocal(value: string | null | undefined): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromDatetimeLocal(value: string): string | null {
  if (!value.trim()) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

export function AdminCampaignFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToastStore((s) => s.show)
  const [tab, setTab] = useState<TabId>('general')
  const [form, setForm] = useState<Partial<Campaign>>(emptyForm)
  const [slugTouched, setSlugTouched] = useState(false)

  const detailQuery = useQuery({
    queryKey: ['admin', 'campaigns', id],
    queryFn: () => adminCampaignsService.getById(id!),
    enabled: isEdit,
  })

  const productsQuery = useQuery({
    queryKey: ['admin', 'products', 'picker'],
    queryFn: () => adminProductsService.list({ isActive: 'all' }),
  })

  const categoriesQuery = useQuery({
    queryKey: ['product-categories'],
    queryFn: () => productCategoriesService.list(),
  })

  useEffect(() => {
    if (detailQuery.data) {
      setForm(detailQuery.data)
      setSlugTouched(true)
    }
  }, [detailQuery.data])

  const visibleTabs = useMemo(() => {
    const discountTabs = form.type === 'product_discount' || form.type === 'coupon'
    const couponTab = form.type === 'coupon'
    return TABS.filter((t) => {
      if (t.id === 'discount' || t.id === 'targeting') return discountTabs
      if (t.id === 'coupon') return couponTab
      return true
    })
  }, [form.type])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form }
      if (isEdit && id) return adminCampaignsService.update(id, payload)
      return adminCampaignsService.create(payload as Campaign)
    },
    onSuccess: (saved) => {
      toast(isEdit ? 'Kampanya güncellendi' : 'Kampanya oluşturuldu', 'success')
      navigate(`/admin/campaigns/${saved.id}/edit`, { replace: !isEdit })
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  const patch = <K extends keyof Campaign>(key: K, value: Campaign[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const toggleId = (key: 'targetProductIds' | 'targetCategoryIds' | 'excludeProductIds' | 'targetProductTypes', idValue: string) => {
    setForm((prev) => {
      const current = (prev[key] as string[] | undefined) ?? []
      const next = current.includes(idValue) ? current.filter((x) => x !== idValue) : [...current, idValue]
      return { ...prev, [key]: next }
    })
  }

  const toggleProductType = (pt: ProductTargetType) => {
    setForm((prev) => {
      const current = prev.targetProductTypes ?? []
      const next = current.includes(pt) ? current.filter((x) => x !== pt) : [...current, pt]
      return { ...prev, targetProductTypes: next }
    })
  }

  if (isEdit && detailQuery.isLoading) return <LoadingState label="Kampanya yükleniyor…" />
  if (isEdit && detailQuery.isError) {
    return (
      <EmptyState
        title="Kampanya bulunamadı"
        description={getErrorMessage(detailQuery.error)}
        action={
          <Link to="/admin/campaigns">
            <Button variant="secondary">Listeye dön</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title={isEdit ? 'Kampanyayı düzenle' : 'Yeni kampanya'}
        description="Kampanya tipine göre sekmeleri doldurun. Ürün indirimi checkout ve PayTR tutarını backend’de etkiler."
        actions={
          <div className="flex gap-2">
            <Link to="/admin/campaigns">
              <Button variant="secondary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Geri
              </Button>
            </Link>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              Kaydet
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition',
              tab === t.id ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        <CardBody className="space-y-5">
          {tab === 'general' ? (
            <>
              <Input
                label="Kampanya adı"
                value={form.name ?? ''}
                onChange={(e) => {
                  const name = e.target.value
                  setForm((prev) => ({
                    ...prev,
                    name,
                    slug: slugTouched ? prev.slug : slugifyCampaignName(name),
                  }))
                }}
              />
              <Input
                label="Slug"
                value={form.slug ?? ''}
                onChange={(e) => {
                  setSlugTouched(true)
                  patch('slug', e.target.value)
                }}
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Kampanya tipi</label>
                <select
                  value={form.type ?? 'product_discount'}
                  onChange={(e) => patch('type', e.target.value as CampaignType)}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                >
                  {Object.entries(CAMPAIGN_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Kısa başlık"
                value={form.shortTitle ?? ''}
                onChange={(e) => patch('shortTitle', e.target.value)}
              />
              <TextArea
                label="Açıklama"
                value={form.description ?? ''}
                onChange={(v) => patch('description', v)}
              />
              <Input label="Badge / etiket" value={form.badge ?? ''} onChange={(e) => patch('badge', e.target.value)} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="CTA metni" value={form.ctaText ?? ''} onChange={(e) => patch('ctaText', e.target.value)} />
                <Input label="CTA linki" value={form.ctaLink ?? ''} onChange={(e) => patch('ctaLink', e.target.value)} />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.active !== false}
                  onChange={(e) => patch('active', e.target.checked)}
                />
                Aktif
              </label>
            </>
          ) : null}

          {tab === 'discount' ? (
            <>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">İndirim tipi</label>
                <select
                  value={form.discountType ?? 'percent'}
                  onChange={(e) => patch('discountType', e.target.value as DiscountType)}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                >
                  {Object.entries(DISCOUNT_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="İndirim değeri"
                type="number"
                value={String(form.discountValue ?? '')}
                onChange={(e) => patch('discountValue', Number(e.target.value))}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Minimum sepet tutarı (opsiyonel)"
                  type="number"
                  value={form.minCartTotal == null ? '' : String(form.minCartTotal)}
                  onChange={(e) => patch('minCartTotal', e.target.value ? Number(e.target.value) : null)}
                />
                <Input
                  label="Maksimum indirim tutarı (opsiyonel)"
                  type="number"
                  value={form.maxDiscountAmount == null ? '' : String(form.maxDiscountAmount)}
                  onChange={(e) => patch('maxDiscountAmount', e.target.value ? Number(e.target.value) : null)}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.freeProductEnabled === true}
                  onChange={(e) => patch('freeProductEnabled', e.target.checked)}
                />
                Ücretsiz ürün kampanyası (taslak)
              </label>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Öncelik kuralı (çakışma)</label>
                <select
                  value={form.stackPriority ?? 'highest'}
                  onChange={(e) => patch('stackPriority', e.target.value as 'highest' | 'lowest')}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                >
                  <option value="highest">Yüksek öncelik kazanır</option>
                  <option value="lowest">Düşük öncelik kazanır</option>
                </select>
              </div>
            </>
          ) : null}

          {tab === 'targeting' ? (
            <>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Hedefleme</label>
                <select
                  value={form.targetType ?? 'all'}
                  onChange={(e) => patch('targetType', e.target.value as TargetType)}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                >
                  {Object.entries(TARGET_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              {form.targetType === 'products' ? (
                <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3">
                  <p className="text-sm font-medium text-slate-700">Belirli ürünler</p>
                  {(productsQuery.data ?? []).map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={(form.targetProductIds ?? []).includes(p.id)}
                        onChange={() => toggleId('targetProductIds', p.id)}
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              ) : null}

              {form.targetType === 'categories' ? (
                <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3">
                  <p className="text-sm font-medium text-slate-700">Belirli kategoriler</p>
                  {(categoriesQuery.data ?? []).map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={(form.targetCategoryIds ?? []).includes(c.id)}
                        onChange={() => toggleId('targetCategoryIds', c.id)}
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              ) : null}

              {form.targetType === 'product_types' ? (
                <div className="space-y-2 rounded-lg border border-slate-200 p-3">
                  {Object.entries(PRODUCT_TARGET_LABELS).map(([k, v]) => (
                    <label key={k} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={(form.targetProductTypes ?? []).includes(k as ProductTargetType)}
                        onChange={() => toggleProductType(k as ProductTargetType)}
                      />
                      {v}
                    </label>
                  ))}
                </div>
              ) : null}

              <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3">
                <p className="text-sm font-medium text-slate-700">Hariç tutulacak ürünler</p>
                {(productsQuery.data ?? []).map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={(form.excludeProductIds ?? []).includes(p.id)}
                      onChange={() => toggleId('excludeProductIds', p.id)}
                    />
                    {p.name}
                  </label>
                ))}
              </div>
            </>
          ) : null}

          {tab === 'visual' ? (
            <>
              <SettingsMediaField
                label="Desktop görsel"
                value={form.desktopImage ?? ''}
                onChange={(v) => patch('desktopImage', v)}
              />
              <SettingsMediaField
                label="Mobil görsel"
                value={form.mobileImage ?? ''}
                onChange={(v) => patch('mobileImage', v)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Arka plan rengi"
                  value={form.backgroundColor ?? ''}
                  onChange={(e) => patch('backgroundColor', e.target.value)}
                />
                <Input label="Gradient" value={form.gradient ?? ''} onChange={(e) => patch('gradient', e.target.value)} />
                <Input label="Yazı rengi" value={form.textColor ?? ''} onChange={(e) => patch('textColor', e.target.value)} />
                <Input label="Overlay" value={form.overlay ?? ''} onChange={(e) => patch('overlay', e.target.value)} />
              </div>
            </>
          ) : null}

          {tab === 'schedule' ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Başlangıç tarihi</label>
                  <input
                    type="datetime-local"
                    value={toDatetimeLocal(form.startAt)}
                    onChange={(e) => patch('startAt', fromDatetimeLocal(e.target.value))}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Bitiş tarihi</label>
                  <input
                    type="datetime-local"
                    value={toDatetimeLocal(form.endAt)}
                    onChange={(e) => patch('endAt', fromDatetimeLocal(e.target.value))}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                  />
                </div>
              </div>
              <Input
                label="Öncelik / sıralama"
                type="number"
                value={String(form.priority ?? 0)}
                onChange={(e) => patch('priority', Number(e.target.value))}
              />
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.active !== false}
                  onChange={(e) => patch('active', e.target.checked)}
                />
                Aktif
              </label>
              {isEdit && detailQuery.data ? (
                <p className="text-sm text-slate-500">
                  Durum: {detailQuery.data.scheduleStatus ?? '—'} {detailQuery.data.isLive ? '(yayında)' : ''}
                </p>
              ) : null}
            </>
          ) : null}

          {tab === 'coupon' ? (
            <>
              <Input
                label="Kupon kodu"
                value={form.couponCode ?? ''}
                onChange={(e) => patch('couponCode', e.target.value.toUpperCase())}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Kullanım limiti"
                  type="number"
                  value={form.couponUsageLimit == null ? '' : String(form.couponUsageLimit)}
                  onChange={(e) => patch('couponUsageLimit', e.target.value ? Number(e.target.value) : null)}
                />
                <Input
                  label="Müşteri başına limit"
                  type="number"
                  value={form.couponUsagePerCustomer == null ? '' : String(form.couponUsagePerCustomer)}
                  onChange={(e) => patch('couponUsagePerCustomer', e.target.value ? Number(e.target.value) : null)}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.couponFirstPurchaseOnly === true}
                  onChange={(e) => patch('couponFirstPurchaseOnly', e.target.checked)}
                />
                İlk alışverişe özel
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.couponProductScopeOnly === true}
                  onChange={(e) => patch('couponProductScopeOnly', e.target.checked)}
                />
                Sadece belirli ürünlerde
              </label>
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Checkout kupon uygulaması bu aşamada devre dışıdır. Altyapı hazır; backend doğrulaması tamamlanınca
                etkinleştirilecek.
              </p>
            </>
          ) : null}

          {tab === 'advanced' ? (
            <>
              <TextArea
                label="Admin notu"
                value={form.adminNote ?? ''}
                onChange={(v) => patch('adminNote', v)}
              />
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.showOnPublic !== false}
                  onChange={(e) => patch('showOnPublic', e.target.checked)}
                />
                Public’te göster
              </label>
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-slate-700">JSON önizle</p>
                <pre className="max-h-80 overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
                  {JSON.stringify(form, null, 2)}
                </pre>
              </div>
            </>
          ) : null}
        </CardBody>
      </Card>
    </div>
  )
}
