import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { TurkeyCityDistrictFields } from '@/components/checkout/TurkeyCityDistrictFields'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { matchDistrictName, matchProvinceName } from '@/data/turkeyLocation'
import type { CustomerAddress, CustomerAddressInput } from '@/types/customerAddress'
import { customersService, getErrorMessage } from '@/services/customersService'
import { useToastStore } from '@/store/toastStore'

const emptyForm = (): CustomerAddressInput => ({
  title: '',
  fullName: '',
  phone: '',
  city: '',
  district: '',
  addressLine: '',
  postalCode: '',
  taxOffice: '',
  taxNumber: '',
  companyName: '',
  isDefault: false,
})

export function AccountBillingPage() {
  const toast = useToastStore((s) => s.show)
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CustomerAddressInput>(emptyForm())
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['customer', 'addresses'],
    queryFn: () => customersService.listAddresses(),
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: CustomerAddressInput = {
        ...form,
        city: matchProvinceName(form.city) || form.city.trim(),
        district:
          matchDistrictName(form.city, form.district ?? '') || form.district?.trim() || null,
      }
      if (editingId) {
        await customersService.patchAddress(editingId, payload)
        return
      }
      await customersService.createAddress(payload)
    },
    onSuccess: () => {
      toast(editingId ? 'Adres güncellendi' : 'Adres eklendi', 'success')
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm())
      void queryClient.invalidateQueries({ queryKey: ['customer', 'addresses'] })
    },
    onError: (err) => toast(getErrorMessage(err, 'Kaydedilemedi'), 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customersService.deleteAddress(id),
    onSuccess: () => {
      toast('Adres silindi', 'success')
      void queryClient.invalidateQueries({ queryKey: ['customer', 'addresses'] })
    },
    onError: (err) => toast(getErrorMessage(err, 'Silinemedi'), 'error'),
  })

  const startEdit = (row: CustomerAddress) => {
    setEditingId(row.id)
    setForm({
      title: row.title,
      fullName: row.fullName,
      phone: row.phone ?? '',
      city: row.city,
      district: row.district ?? '',
      addressLine: row.addressLine,
      postalCode: row.postalCode ?? '',
      taxOffice: row.taxOffice ?? '',
      taxNumber: row.taxNumber ?? '',
      companyName: row.companyName ?? '',
      isDefault: row.isDefault,
    })
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Fatura Bilgilerim</h2>
          <p className="mt-1 text-sm text-slate-600">Bireysel veya kurumsal fatura adreslerinizi yönetin.</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setEditingId(null)
            setForm(emptyForm())
            setShowForm(true)
          }}
        >
          Yeni adres
        </Button>
      </div>

      {isLoading ? <LoadingState label="Adresler yükleniyor…" /> : null}
      {isError ? (
        <p className="text-sm text-red-800">{getErrorMessage(error, 'Adresler yüklenemedi.')}</p>
      ) : null}

      {!isLoading && !isError && (!data || data.length === 0) && !showForm ? (
        <EmptyState title="Kayıtlı fatura adresi yok" description="Checkout ve faturalama için adres ekleyin." />
      ) : null}

      {data && data.length > 0 ? (
        <ul className="space-y-3">
          {data.map((row) => (
            <li key={row.id}>
              <Card>
                <CardBody className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{row.title}</p>
                      {row.isDefault ? <Badge tone="success">Varsayılan</Badge> : null}
                    </div>
                    <p className="mt-1 text-sm text-slate-700">{row.fullName}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {row.addressLine}
                      {row.district ? `, ${row.district}` : ''}, {row.city}
                    </p>
                    {row.companyName ? <p className="mt-1 text-sm text-slate-600">Firma: {row.companyName}</p> : null}
                    {row.taxNumber ? (
                      <p className="mt-1 text-sm text-slate-600">
                        {row.companyName ? 'Vergi no' : 'T.C. Kimlik No'}: {row.taxNumber}
                        {row.taxOffice ? ` · ${row.taxOffice}` : ''}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(row)}>
                      Düzenle
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(row.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}

      {showForm ? (
        <Card>
          <CardBody>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault()
                const city = matchProvinceName(form.city) || form.city.trim()
                if (!city) {
                  toast('İl seçimi zorunludur', 'error')
                  return
                }
                saveMutation.mutate()
              }}
            >
              <Input label="Adres başlığı" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required className="sm:col-span-2" />
              <Input label="Ad soyad" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} required />
              <Input label="Telefon" value={form.phone ?? ''} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              <TurkeyCityDistrictFields
                idPrefix="billing"
                city={form.city}
                district={form.district ?? ''}
                onCityChange={(city) => setForm((p) => ({ ...p, city }))}
                onDistrictChange={(district) => setForm((p) => ({ ...p, district }))}
              />
              <Input label="Adres" value={form.addressLine} onChange={(e) => setForm((p) => ({ ...p, addressLine: e.target.value }))} required className="sm:col-span-2" />
              <Input label="Posta kodu" value={form.postalCode ?? ''} onChange={(e) => setForm((p) => ({ ...p, postalCode: e.target.value }))} />
              <Input label="Firma ünvanı (kurumsal)" value={form.companyName ?? ''} onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))} />
              <Input label="Vergi dairesi" value={form.taxOffice ?? ''} onChange={(e) => setForm((p) => ({ ...p, taxOffice: e.target.value }))} />
              <Input label="Vergi no / T.C. Kimlik No" value={form.taxNumber ?? ''} onChange={(e) => setForm((p) => ({ ...p, taxNumber: e.target.value }))} hint="Kurumsal: vergi no · Bireysel: T.C. Kimlik No (opsiyonel)" />
              <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
                <input type="checkbox" checked={form.isDefault === true} onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))} />
                Varsayılan fatura adresi
              </label>
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Kaydediliyor…' : 'Kaydet'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setEditingId(null) }}>
                  İptal
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      ) : null}
    </div>
  )
}
