import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  adminBhService,
  formatTlInput,
  getErrorMessage,
  type BhProduct,
} from '@/services/adminBhService'
import { useToastStore } from '@/store/toastStore'

function productToForm(p: BhProduct) {
  return {
    name: p.name || 'Bilirkişi Hesap',
    priceAnnualTl: formatTlInput(p.price),
    priceMonthlyTl: formatTlInput(p.priceMonthly ?? p.monthlyPrice),
    windowsYearlyTl: formatTlInput(p.windowsPriceYearly),
    windowsSalesEnabled: p.windowsSalesEnabled === true,
    windowsDeviceLimit: String(p.windowsDeviceLimit ?? 1),
    windowsTrialDays: String(p.windowsTrialDays ?? 7),
    macosYearlyTl: formatTlInput(p.macosPriceYearly),
    macosSalesEnabled: p.macosSalesEnabled === true,
    macosDeviceLimit: String(p.macosDeviceLimit ?? 1),
    macosTrialDays: String(p.macosTrialDays ?? 7),
    originalPriceTl: p.originalPrice != null ? formatTlInput(p.originalPrice) : '',
    isActive: p.isActive !== false,
  }
}

export function AdminBhPricingPage() {
  const toast = useToastStore((s) => s.show)
  const qc = useQueryClient()
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'bh', 'product'],
    queryFn: () => adminBhService.getProduct(),
  })

  const [form, setForm] = useState({
    name: 'Bilirkişi Hesap',
    priceAnnualTl: '',
    priceMonthlyTl: '',
    windowsYearlyTl: '',
    windowsSalesEnabled: false,
    windowsDeviceLimit: '1',
    windowsTrialDays: '7',
    macosYearlyTl: '',
    macosSalesEnabled: false,
    macosDeviceLimit: '1',
    macosTrialDays: '7',
    originalPriceTl: '',
    isActive: true,
  })

  useEffect(() => {
    if (data) setForm(productToForm(data))
  }, [data])

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!data) throw new Error('Ürün yüklenmedi')
      return adminBhService.updateProduct({
        name: form.name.trim() || data.name,
        price: form.priceAnnualTl,
        priceMonthly: form.priceMonthlyTl,
        monthlyPrice: form.priceMonthlyTl,
        windowsPriceYearly: form.windowsYearlyTl,
        windowsSalesEnabled: form.windowsSalesEnabled,
        windowsDeviceLimit: form.windowsDeviceLimit.trim(),
        windowsTrialDays: form.windowsTrialDays.trim(),
        macosPriceYearly: form.macosYearlyTl,
        macosSalesEnabled: form.macosSalesEnabled,
        macosDeviceLimit: form.macosDeviceLimit.trim(),
        macosTrialDays: form.macosTrialDays.trim(),
        originalPrice: form.originalPriceTl.trim() || undefined,
        price2Year: data.price2Year != null ? (Number(data.price2Year) / 100).toFixed(2) : undefined,
        originalPrice2Year:
          data.originalPrice2Year != null
            ? (Number(data.originalPrice2Year) / 100).toFixed(2)
            : undefined,
        price3Year: data.price3Year != null ? (Number(data.price3Year) / 100).toFixed(2) : undefined,
        originalPrice3Year:
          data.originalPrice3Year != null
            ? (Number(data.originalPrice3Year) / 100).toFixed(2)
            : undefined,
        price2YearActive: data.price2YearActive,
        price3YearActive: data.price3YearActive,
        imageUrl: data.imageUrl || '',
        shortDescription: data.shortDescription || '',
        longDescription: data.longDescription || '',
        features: data.features || '[]',
        targetAudience: data.targetAudience || '[]',
        trustInfo: data.trustInfo || '{}',
        isActive: form.isActive,
      })
    },
    onSuccess: async () => {
      toast('Fiyatlar kaydedildi', 'success')
      await qc.invalidateQueries({ queryKey: ['admin', 'bh'] })
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const limits = [form.windowsDeviceLimit, form.macosDeviceLimit, form.windowsTrialDays, form.macosTrialDays]
    if (limits.some((value) => !/^[1-9]\d*$/.test(value.trim()))) {
      toast('Cihaz limiti ve ücretsiz deneme süresi 1 veya daha büyük bir tam sayı olmalıdır.', 'error')
      return
    }
    void saveMut.mutateAsync()
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Bilirkişi Hesap — Fiyatlandırma"
        description="Web, Windows ve macOS fiyatlarını TL olarak güncelleyin. Satın alma akışı mevcut Web fiyatlarını kullanır."
        actions={
          <Button variant="secondary" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        }
      />

      {isLoading ? <LoadingState /> : null}
      {isError ? (
        <EmptyState title="Fiyatlar yüklenemedi" description={getErrorMessage(error)} />
      ) : null}

      {data ? (
        <Card>
          <CardBody>
            <form className="mx-auto max-w-2xl space-y-4" onSubmit={onSubmit}>
              <Input
                label="Ürün adı"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />

              <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">WEB / SaaS</h2>
                  <p className="text-xs text-slate-500">Web tabanlı sürüm</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Aylık fiyat (TL)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.priceMonthlyTl}
                    onChange={(e) => setForm((f) => ({ ...f, priceMonthlyTl: e.target.value }))}
                  />
                  <Input
                    label="Yıllık fiyat (TL)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.priceAnnualTl}
                    onChange={(e) => setForm((f) => ({ ...f, priceAnnualTl: e.target.value }))}
                  />
                </div>
                <Input
                  label="Üstü çizili yıllık fiyat (TL)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.originalPriceTl}
                  onChange={(e) => setForm((f) => ({ ...f, originalPriceTl: e.target.value }))}
                  hint="İsteğe bağlı; boş bırakılabilir"
                />
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  />
                  Satışa açık
                </label>
              </section>

              <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">WINDOWS MASAÜSTÜ</h2>
                  <p className="text-xs text-slate-500">Yalnızca yıllık lisans</p>
                </div>
                <Input
                  label="Yıllık fiyat (TL)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.windowsYearlyTl}
                  onChange={(e) => setForm((f) => ({ ...f, windowsYearlyTl: e.target.value }))}
                />
                <Input
                  label="Cihaz limiti"
                  type="number"
                  step="1"
                  min="1"
                  value={form.windowsDeviceLimit}
                  onChange={(e) => setForm((f) => ({ ...f, windowsDeviceLimit: e.target.value }))}
                />
                <Input
                  label="Ücretsiz deneme süresi (gün)"
                  type="number"
                  step="1"
                  min="1"
                  value={form.windowsTrialDays}
                  onChange={(e) => setForm((f) => ({ ...f, windowsTrialDays: e.target.value }))}
                />
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.windowsSalesEnabled}
                    onChange={(e) => setForm((f) => ({ ...f, windowsSalesEnabled: e.target.checked }))}
                  />
                  Satışa açık
                </label>
              </section>

              <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">macOS MASAÜSTÜ</h2>
                  <p className="text-xs text-slate-500">Yalnızca yıllık lisans</p>
                </div>
                <Input
                  label="Yıllık fiyat (TL)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.macosYearlyTl}
                  onChange={(e) => setForm((f) => ({ ...f, macosYearlyTl: e.target.value }))}
                />
                <Input
                  label="Cihaz limiti"
                  type="number"
                  step="1"
                  min="1"
                  value={form.macosDeviceLimit}
                  onChange={(e) => setForm((f) => ({ ...f, macosDeviceLimit: e.target.value }))}
                />
                <Input
                  label="Ücretsiz deneme süresi (gün)"
                  type="number"
                  step="1"
                  min="1"
                  value={form.macosTrialDays}
                  onChange={(e) => setForm((f) => ({ ...f, macosTrialDays: e.target.value }))}
                />
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.macosSalesEnabled}
                    onChange={(e) => setForm((f) => ({ ...f, macosSalesEnabled: e.target.checked }))}
                  />
                  Satışa açık
                </label>
              </section>
              <Button type="submit" disabled={saveMut.isPending}>
                <Save className="h-4 w-4" />
                {saveMut.isPending ? 'Kaydediliyor…' : 'Kaydet'}
              </Button>
            </form>
          </CardBody>
        </Card>
      ) : null}
    </div>
  )
}
