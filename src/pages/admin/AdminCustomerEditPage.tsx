import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { getErrorMessage } from '@/api/client'
import { adminCustomersService } from '@/services/adminCustomersService'
import type { AdminUpdateCustomerInput } from '@/types/adminCustomer'

export function AdminCustomerEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const detailQuery = useQuery({
    queryKey: ['admin', 'customer', id],
    queryFn: () => adminCustomersService.getById(id),
    enabled: Boolean(id),
  })

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [fullName, setFullName] = useState('')
  const [addressPhone, setAddressPhone] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [addressLine, setAddressLine] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [taxOffice, setTaxOffice] = useState('')
  const [taxNumber, setTaxNumber] = useState('')

  const data = detailQuery.data
  const defaultAddress = data?.addresses.find((a) => a.isDefault) ?? data?.addresses[0] ?? null
  const defaultAddressId = defaultAddress?.id ?? null

  useEffect(() => {
    if (!data) return
    setName(data.customer.name)
    setPhone(data.customer.phone ?? '')
    setIsActive(data.customer.isActive)
    const addr = data.addresses.find((a) => a.isDefault) ?? data.addresses[0] ?? null
    if (addr) {
      setFullName(addr.fullName)
      setAddressPhone(addr.phone ?? '')
      setCity(addr.city)
      setDistrict(addr.district ?? '')
      setAddressLine(addr.addressLine)
      setPostalCode(addr.postalCode ?? '')
      setCompanyName(addr.companyName ?? '')
      setTaxOffice(addr.taxOffice ?? '')
      setTaxNumber(addr.taxNumber ?? '')
    }
  }, [data, defaultAddressId])

  const updateMutation = useMutation({
    mutationFn: (input: AdminUpdateCustomerInput) => adminCustomersService.update(id, input),
    onSuccess: () => {
      navigate(`/admin/customers/${encodeURIComponent(id)}`)
    },
    onError: (err) => {
      setFormError(getErrorMessage(err, 'Müşteri güncellenemedi'))
    },
  })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)
    if (!name.trim()) {
      setFormError('Ad soyad zorunludur.')
      return
    }

    const input: AdminUpdateCustomerInput = {
      name: name.trim(),
      phone: phone.trim() || null,
      isActive,
    }

    if (defaultAddress) {
      if (!fullName.trim() || !city.trim() || !addressLine.trim()) {
        setFormError('Varsayılan adres için alıcı adı, şehir ve adres satırı zorunludur.')
        return
      }
      input.defaultAddress = {
        fullName: fullName.trim(),
        phone: addressPhone.trim() || null,
        city: city.trim(),
        district: district.trim() || null,
        addressLine: addressLine.trim(),
        postalCode: postalCode.trim() || null,
        companyName: companyName.trim() || null,
        taxOffice: taxOffice.trim() || null,
        taxNumber: taxNumber.trim() || null,
      }
    }

    updateMutation.mutate(input)
  }

  if (detailQuery.isLoading) return <LoadingState label="Müşteri bilgileri yükleniyor…" />

  if (detailQuery.isError || !data) {
    return (
      <div className="space-y-4">
        <Link to="/admin/customers" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" />
          Müşteriler
        </Link>
        <EmptyState
          title="Müşteri bulunamadı"
          description={getErrorMessage(detailQuery.error, 'Kayıt yüklenemedi veya silinmiş olabilir.')}
        />
      </div>
    )
  }

  const customer = data.customer

  return (
    <div className="w-full min-w-0 space-y-6">
      <Link
        to={`/admin/customers/${encodeURIComponent(id)}`}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Müşteri detayı
      </Link>

      <PageHeader title="Müşteri düzenle" description={`${customer.name} — ${customer.email}`} />

      <Card className="border-sky-200 bg-sky-50/50">
        <CardBody className="space-y-2 text-sm text-sky-950">
          <p>
            E-posta adresi güvenlik nedeniyle düzenlenemez. Müşteri tipi (bireysel/kurumsal) sipariş ve adres
            kayıtlarından türetilir; ayrı bir alan olarak saklanmaz.
          </p>
          {customer.isCorporate ? <Badge tone="default">Kurumsal müşteri</Badge> : <Badge tone="default">Bireysel müşteri</Badge>}
        </CardBody>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardBody className="grid gap-4 md:grid-cols-2">
            <h3 className="md:col-span-2 text-sm font-semibold text-slate-900">Hesap bilgileri</h3>
            <Input label="Ad soyad" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="E-posta" value={customer.email} disabled readOnly />
            <Input label="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Hesap durumu</label>
              <select
                value={isActive ? 'active' : 'inactive'}
                onChange={(e) => setIsActive(e.target.value === 'active')}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
              <p className="text-xs text-slate-500">Pasif hesaplar giriş yapamaz.</p>
            </div>
          </CardBody>
        </Card>

        {defaultAddress ? (
          <Card>
            <CardBody className="grid gap-4 md:grid-cols-2">
              <h3 className="md:col-span-2 text-sm font-semibold text-slate-900">
                Varsayılan adres ({defaultAddress.title})
              </h3>
              <Input label="Alıcı adı" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              <Input label="Adres telefonu" value={addressPhone} onChange={(e) => setAddressPhone(e.target.value)} />
              <Input label="Şehir" value={city} onChange={(e) => setCity(e.target.value)} required />
              <Input label="İlçe" value={district} onChange={(e) => setDistrict(e.target.value)} />
              <Input
                label="Adres"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                className="md:col-span-2"
                required
              />
              <Input label="Posta kodu" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
              <Input label="Şirket / kurum" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              <Input label="Vergi dairesi" value={taxOffice} onChange={(e) => setTaxOffice(e.target.value)} />
              <Input label="Vergi no" value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} />
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody className="text-sm text-slate-600">
              Bu müşterinin kayıtlı adresi yok. Şirket, vergi ve adres bilgileri yalnızca mevcut{' '}
              <code className="text-xs">CustomerAddress</code> kaydı üzerinden düzenlenebilir.
            </CardBody>
          </Card>
        )}

        {formError ? (
          <Card className="border-red-200 bg-red-50">
            <CardBody>
              <p className="text-sm text-red-700">{formError}</p>
            </CardBody>
          </Card>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Kaydediliyor…' : 'Kaydet'}
          </Button>
          <Link to={`/admin/customers/${encodeURIComponent(id)}`}>
            <Button type="button" variant="secondary">
              İptal
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
