import { useMemo, useState, type FormEvent, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { getErrorMessage } from '@/api/client'
import { adminProductsService } from '@/services/adminProductsService'
import { adminCustomersService } from '@/services/adminCustomersService'
import { adminSaasMembershipsService } from '@/services/adminSaasMembershipsService'
import { isManualSaasMembershipProduct } from '@/lib/manualSaasMembershipProduct'

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function addDaysIsoDate(days: number): string {
  const next = new Date()
  next.setDate(next.getDate() + days)
  return next.toISOString().slice(0, 10)
}

export function AdminSaasMembershipCreatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [customerEmail, setCustomerEmail] = useState('')
  const [productId, setProductId] = useState('')
  const [licenseStartDate, setLicenseStartDate] = useState(todayIsoDate())
  const [licenseEndDate, setLicenseEndDate] = useState(addDaysIsoDate(365))
  const [status, setStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'EXPIRED'>('ACTIVE')
  const [tenantId, setTenantId] = useState('')
  const [tenantSlug, setTenantSlug] = useState('')
  const [licenseKey, setLicenseKey] = useState('')
  const [orderRef, setOrderRef] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    const presetEmail = searchParams.get('customerEmail')?.trim()
    const presetCustomerId = searchParams.get('customerId')?.trim()
    if (presetEmail) setCustomerEmail(presetEmail)
    else if (presetCustomerId) {
      void adminCustomersService
        .getById(presetCustomerId)
        .then((row) => setCustomerEmail(row.customer.email))
        .catch(() => {
          /* prefill optional */
        })
    }
  }, [searchParams])

  const productsQuery = useQuery({
    queryKey: ['admin', 'products', 'saas-memberships-create'],
    queryFn: () => adminProductsService.list({ productType: 'SAAS', isActive: 'all' }),
  })

  const saasProducts = useMemo(
    () => (productsQuery.data ?? []).filter(isManualSaasMembershipProduct),
    [productsQuery.data],
  )

  const createMutation = useMutation({
    mutationFn: () =>
      adminSaasMembershipsService.create({
        customerEmail,
        productId,
        licenseStartDate,
        licenseEndDate,
        status,
        tenantId,
        tenantSlug,
        licenseKey,
        orderRef: orderRef.trim() || null,
      }),
    onSuccess: (row) => {
      navigate(`/admin/saas-subscriptions/${encodeURIComponent(row.id)}`)
    },
    onError: (error) => {
      setFormError(getErrorMessage(error, 'Manuel abonelik oluşturulamadı'))
    },
  })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)
    if (!customerEmail.trim() || !productId || !licenseStartDate || !licenseEndDate || !tenantId.trim() || !tenantSlug.trim() || !licenseKey.trim()) {
      setFormError('Müşteri, ürün, tarih ve erişim alanlarını doldurun.')
      return
    }
    void createMutation.mutateAsync()
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <Link to="/admin/saas-subscriptions" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" />
        SaaS Abonelikleri
      </Link>

      <PageHeader
        title="Manuel Abonelik Oluştur"
        description="Mevcut müşteri hesabına, siparişli veya siparişsiz manuel SaaS erişimi tanımlayın."
      />

      <Card className="border-emerald-200 bg-emerald-50/60">
        <CardBody className="space-y-2 text-sm text-emerald-900">
          <p className="font-semibold text-emerald-950">Bu fazda gerçek veriyle çalışan manuel oluşturma</p>
          <p>
            Abonelik, mevcut müşteri hesabına e-posta ile bağlanır ve `CustomerSaasMembership` tablosuna yazılır.
            Oluşan kayıt müşteri panelindeki `hesabim/uyelikler` ekranında görünür.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 lg:grid-cols-2">
              <Input
                label="Müşteri e-postası"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="mevcut-musteri@ornek.com"
                hint="Bu aşamada yalnızca mevcut müşteri hesabına e-posta ile abonelik bağlanır."
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Ürün</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">Ürün seçin</option>
                  {saasProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input label="Başlangıç tarihi" type="date" value={licenseStartDate} onChange={(e) => setLicenseStartDate(e.target.value)} />
              <Input label="Bitiş tarihi" type="date" value={licenseEndDate} onChange={(e) => setLicenseEndDate(e.target.value)} />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Durum</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'SUSPENDED' | 'EXPIRED')}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="EXPIRED">EXPIRED</option>
                </select>
              </div>

              <Input
                label="Sipariş referansı (opsiyonel)"
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value)}
                placeholder="Sipariş ID veya sipariş no"
                hint="Boş bırakırsanız kayıt listede manuel olarak görünür."
              />

              <Input label="Tenant ID" value={tenantId} onChange={(e) => setTenantId(e.target.value)} placeholder="tenant-id" />
              <Input label="Tenant Slug" value={tenantSlug} onChange={(e) => setTenantSlug(e.target.value)} placeholder="tenant-slug" />
              <Input
                label="License / erişim anahtarı"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="erişim anahtarı"
              />
            </div>

            {formError ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p> : null}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Oluşturuluyor…' : 'Aboneliği Oluştur'}
              </Button>
              <Link to="/admin/saas-subscriptions">
                <Button type="button" variant="secondary">İptal</Button>
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
