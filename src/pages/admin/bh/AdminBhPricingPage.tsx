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
    void saveMut.mutateAsync()
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Bilirkişi Hesap — Fiyatlandırma"
        description="Aylık ve yıllık satış fiyatlarını güncelleyin. Değişiklik satın alma ve kampanya tekliflerine yansır."
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
            <form className="mx-auto max-w-lg space-y-4" onSubmit={onSubmit}>
              <Input
                label="Ürün adı"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
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
                Ürün aktif
              </label>
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
