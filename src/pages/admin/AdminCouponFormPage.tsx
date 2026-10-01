import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { adminCouponsService, getErrorMessage, type CouponInput } from '@/services/adminCouponsService'
import { adminProductsService } from '@/services/adminProductsService'
import { productTypeLabel } from '@/types/product'
import { formatMoney } from '@/utils/formatMoney'
import { useToastStore } from '@/store/toastStore'

function toDatetimeLocal(value: string | null | undefined): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function fromDatetimeLocal(value: string): string | null {
  if (!value.trim()) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

const empty: CouponInput = {
  name: '',
  code: '',
  description: '',
  adminNote: '',
  isActive: true,
  discountType: 'percent',
  discountValue: 10,
  startsAt: null,
  endsAt: null,
  usageLimit: null,
  perCustomerLimit: null,
  firstPurchaseOnly: false,
  minimumCartTotal: null,
  productIds: [],
}

export function AdminCouponFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToastStore((s) => s.show)
  const [form, setForm] = useState<CouponInput>(empty)
  const [productError, setProductError] = useState<string | null>(null)

  const detailQuery = useQuery({
    queryKey: ['admin', 'coupons', id],
    queryFn: () => adminCouponsService.getById(id!),
    enabled: isEdit,
  })
  const productsQuery = useQuery({
    queryKey: ['admin', 'products', 'picker'],
    queryFn: () => adminProductsService.list({ isActive: 'all' }),
  })

  useEffect(() => {
    if (!detailQuery.data) return
    const row = detailQuery.data
    setForm({
      name: row.name,
      code: row.code,
      description: row.description ?? '',
      adminNote: row.adminNote ?? '',
      isActive: row.isActive,
      discountType: row.discountType,
      discountValue: row.discountValue,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      usageLimit: row.usageLimit,
      perCustomerLimit: row.perCustomerLimit,
      firstPurchaseOnly: row.firstPurchaseOnly,
      minimumCartTotal: row.minimumCartTotal,
      productIds: row.productIds,
    })
  }, [detailQuery.data])

  const saveMutation = useMutation({
    mutationFn: () => (isEdit && id ? adminCouponsService.update(id, form) : adminCouponsService.create(form)),
    onSuccess: (saved) => {
      toast(isEdit ? 'Kupon güncellendi' : 'Kupon oluşturuldu', 'success')
      navigate(`/admin/coupons/${saved.id}/edit`, { replace: !isEdit })
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  const archiveMutation = useMutation({
    mutationFn: () => adminCouponsService.archive(id!),
    onSuccess: () => {
      toast('Kupon arşivlendi', 'success')
      navigate('/admin/coupons')
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  const toggleProduct = (productId: string) => {
    setProductError(null)
    setForm((prev) => {
      const has = prev.productIds.includes(productId)
      return {
        ...prev,
        productIds: has ? prev.productIds.filter((item) => item !== productId) : [...prev.productIds, productId],
      }
    })
  }

  if (isEdit && detailQuery.isLoading) return <LoadingState label="Kupon yükleniyor…" />
  if (isEdit && detailQuery.isError) {
    return <EmptyState title="Kupon bulunamadı" description={getErrorMessage(detailQuery.error)} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Kuponu düzenle' : 'Yeni kupon'}
        description="Bu kod checkout’ta ayrıca girilir. Kampanya indiriminden bağımsızdır."
        actions={
          <div className="flex gap-2">
            <Link to="/admin/coupons">
              <Button variant="secondary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Geri
              </Button>
            </Link>
            {isEdit && !detailQuery.data?.archivedAt ? (
              <Button variant="secondary" onClick={() => archiveMutation.mutate()} disabled={archiveMutation.isPending}>
                Arşivle
              </Button>
            ) : null}
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || Boolean(detailQuery.data?.archivedAt)}>
              <Save className="mr-2 h-4 w-4" />
              Kaydet
            </Button>
          </div>
        }
      />
      <Card>
        <CardBody className="space-y-5">
          <Input label="Kupon adı" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input
            label="Kupon kodu"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Açıklama</label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Admin notu</label>
            <textarea
              value={form.adminNote ?? ''}
              onChange={(e) => setForm({ ...form, adminNote: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Aktif
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">İndirim tipi</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value === 'fixed_amount' ? 'fixed_amount' : 'percent' })}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              >
                <option value="percent">Yüzde</option>
                <option value="fixed_amount">Sabit tutar</option>
              </select>
            </div>
            <Input
              label="İndirim değeri"
              type="number"
              value={String(form.discountValue)}
              onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Başlangıç</label>
              <input
                type="datetime-local"
                value={toDatetimeLocal(form.startsAt)}
                onChange={(e) => setForm({ ...form, startsAt: fromDatetimeLocal(e.target.value) })}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Bitiş</label>
              <input
                type="datetime-local"
                value={toDatetimeLocal(form.endsAt)}
                onChange={(e) => setForm({ ...form, endsAt: fromDatetimeLocal(e.target.value) })}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              />
            </div>
            <Input
              label="Kullanım limiti"
              type="number"
              value={form.usageLimit == null ? '' : String(form.usageLimit)}
              onChange={(e) => setForm({ ...form, usageLimit: e.target.value ? Number(e.target.value) : null })}
            />
            <Input
              label="Müşteri başına limit"
              type="number"
              value={form.perCustomerLimit == null ? '' : String(form.perCustomerLimit)}
              onChange={(e) => setForm({ ...form, perCustomerLimit: e.target.value ? Number(e.target.value) : null })}
            />
            <Input
              label="Minimum sepet tutarı"
              type="number"
              value={form.minimumCartTotal == null ? '' : String(form.minimumCartTotal)}
              onChange={(e) => setForm({ ...form, minimumCartTotal: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.firstPurchaseOnly}
              onChange={(e) => setForm({ ...form, firstPurchaseOnly: e.target.checked })}
            />
            İlk alışverişe özel
          </label>
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Geçerli ürünler</p>
            <p className="text-xs text-slate-500">Seçim yoksa kupon sepetteki ürünlerin tümünde geçerlidir.</p>
            <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-3">
              {productsQuery.isLoading ? <p className="text-sm text-slate-500">Ürünler yükleniyor…</p> : null}
              {productsQuery.isError ? <p className="text-sm text-red-700">{getErrorMessage(productsQuery.error)}</p> : null}
              {(productsQuery.data ?? []).map((product) => (
                <label key={product.id} className="flex items-start gap-2 rounded-md px-1 py-1.5 text-sm hover:bg-slate-50">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={form.productIds.includes(product.id)}
                    onChange={() => toggleProduct(product.id)}
                  />
                  <span>
                    <span className="font-medium text-slate-900">{product.name}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {productTypeLabel(product.productType)} · {formatMoney(product.price, product.currency || 'TRY')}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {productError ? <p className="text-sm text-red-700">{productError}</p> : null}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
