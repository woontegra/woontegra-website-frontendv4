import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  adminAffiliatePartnersService,
  getErrorMessage,
} from '@/services/adminAffiliatePartnersService'
import { adminProductsService } from '@/services/adminProductsService'
import { useToastStore } from '@/store/toastStore'

type ProductRowDraft = {
  key: string
  productId: string
  commissionRatePercent: string
  discountRatePercent: string
  isActive: boolean
}

function emptyRow(defaultCommission = '10'): ProductRowDraft {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    productId: '',
    commissionRatePercent: defaultCommission,
    discountRatePercent: '0',
    isActive: true,
  }
}

export function AdminAffiliatePartnerFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToastStore((s) => s.show)

  const [name, setName] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [defaultCommissionRate, setDefaultCommissionRate] = useState('0')
  const [internalNotes, setInternalNotes] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [productRows, setProductRows] = useState<ProductRowDraft[]>([emptyRow()])

  const partnerQuery = useQuery({
    queryKey: ['admin', 'affiliate-partners', id],
    queryFn: () => adminAffiliatePartnersService.getById(id!),
    enabled: isEdit,
  })

  const productsQuery = useQuery({
    queryKey: ['admin', 'products', 'affiliate-picker'],
    queryFn: () => adminProductsService.list(),
  })

  useEffect(() => {
    const partner = partnerQuery.data
    if (!partner) return
    setName(partner.name)
    setContactName(partner.contactName ?? '')
    setEmail(partner.email ?? '')
    setPhone(partner.phone ?? '')
    setDefaultCommissionRate(String(partner.defaultCommissionRate))
    setInternalNotes(partner.internalNotes ?? '')
    setIsActive(partner.isActive)
    const rows =
      partner.products && partner.products.length > 0
        ? partner.products.map((p) => ({
            key: p.id ?? `${p.productId}-${Math.random()}`,
            productId: p.productId,
            commissionRatePercent: String(p.commissionRatePercent),
            discountRatePercent: String(p.discountRatePercent),
            isActive: p.isActive,
          }))
        : [emptyRow(String(partner.defaultCommissionRate))]
    setProductRows(rows)
  }, [partnerQuery.data])

  const productOptions = useMemo(() => productsQuery.data ?? [], [productsQuery.data])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const products = productRows
        .filter((r) => r.productId)
        .map((r) => ({
          productId: r.productId,
          commissionRatePercent: Number(r.commissionRatePercent),
          discountRatePercent: Number(r.discountRatePercent),
          isActive: r.isActive,
        }))

      const payload = {
        name,
        contactName: contactName.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        defaultCommissionRate: Number(defaultCommissionRate),
        isActive,
        internalNotes: internalNotes.trim() || null,
        products,
      }

      if (isEdit) return adminAffiliatePartnersService.update(id!, payload)
      return adminAffiliatePartnersService.create(payload)
    },
    onSuccess: (partner) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'affiliate-partners'] })
      toast(isEdit ? 'İş ortağı güncellendi' : 'İş ortağı oluşturuldu', 'success')
      navigate(`/admin/is-ortaklari/${partner.id}`)
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  const updateRow = (key: string, patch: Partial<ProductRowDraft>) => {
    setProductRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  }

  if (isEdit && partnerQuery.isLoading) {
    return <LoadingState label="İş ortağı yükleniyor…" />
  }

  if (isEdit && partnerQuery.isError) {
    return <p className="text-sm text-rose-600">{getErrorMessage(partnerQuery.error)}</p>
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title={isEdit ? 'İş ortağı düzenle' : 'Yeni İş Ortağı'}
        description="Bilirkişi ile uyumlu alanlar; Woontegra’da komisyon ve müşteri indirimi ürün bazında tanımlanır."
        actions={
          <Link to={isEdit ? `/admin/is-ortaklari/${id}` : '/admin/is-ortaklari'}>
            <Button variant="secondary">İptal</Button>
          </Link>
        }
      />

      <Card>
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">İsim *</span>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">İletişim adı</span>
              <Input value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">E-posta</span>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <span className="text-xs text-slate-500">Partner Erişimi Oluştur için gerekli.</span>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Telefon</span>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Varsayılan komisyon oranı (%)</span>
              <Input
                value={defaultCommissionRate}
                onChange={(e) => setDefaultCommissionRate(e.target.value)}
                inputMode="numeric"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Durum</span>
              <select
                value={isActive ? 'true' : 'false'}
                onChange={(e) => setIsActive(e.target.value === 'true')}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="true">Aktif</option>
                <option value="false">Pasif</option>
              </select>
            </label>
          </div>
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">İç not</span>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Ürün atamaları</h2>
              <p className="text-sm text-slate-600">
                Her ürün için ayrı komisyon oranı ve müşteri indirim oranı belirleyin.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setProductRows((prev) => [...prev, emptyRow(defaultCommissionRate || '10')])}
            >
              <Plus className="h-4 w-4" />
              Ürün ekle
            </Button>
          </div>

          {productsQuery.isLoading ? <LoadingState label="Ürünler yükleniyor…" /> : null}

          <div className="space-y-3">
            {productRows.map((row) => (
              <div
                key={row.key}
                className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 lg:grid-cols-[minmax(0,2fr)_1fr_1fr_auto_auto]"
              >
                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Ürün</span>
                  <select
                    value={row.productId}
                    onChange={(e) => updateRow(row.key, { productId: e.target.value })}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                  >
                    <option value="">Ürün seçin</option>
                    {productOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Komisyon (%)</span>
                  <Input
                    value={row.commissionRatePercent}
                    onChange={(e) => updateRow(row.key, { commissionRatePercent: e.target.value })}
                    inputMode="numeric"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Müşteri indirimi (%)</span>
                  <Input
                    value={row.discountRatePercent}
                    onChange={(e) => updateRow(row.key, { discountRatePercent: e.target.value })}
                    inputMode="numeric"
                  />
                </label>
                <label className="flex items-end gap-2 pb-2 text-sm">
                  <input
                    type="checkbox"
                    checked={row.isActive}
                    onChange={(e) => updateRow(row.key, { isActive: e.target.checked })}
                  />
                  <span>Aktif</span>
                </label>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setProductRows((prev) =>
                        prev.length <= 1 ? [emptyRow(defaultCommissionRate || '10')] : prev.filter((r) => r.key !== row.key),
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          onClick={() => void saveMutation.mutateAsync()}
          disabled={saveMutation.isPending || !name.trim()}
        >
          {saveMutation.isPending ? 'Kaydediliyor…' : 'Kaydet'}
        </Button>
      </div>
    </div>
  )
}
