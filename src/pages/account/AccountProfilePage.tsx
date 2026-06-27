import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { useCustomerSession } from '@/hooks/useCustomerSession'
import { customersService, getErrorMessage } from '@/services/customersService'
import { useToastStore } from '@/store/toastStore'

export function AccountProfilePage() {
  const { profile, refresh } = useCustomerSession()
  const toast = useToastStore((s) => s.show)
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')

  const meQuery = useQuery({
    queryKey: ['customer', 'me'],
    queryFn: () => customersService.getMe(),
  })

  useEffect(() => {
    const p = meQuery.data ?? profile
    if (!p) return
    setName(p.name)
    setPhone(p.phone ?? '')
    setEmail(p.email)
  }, [meQuery.data, profile])

  const saveMutation = useMutation({
    mutationFn: () =>
      customersService.patchMe({
        name,
        phone: phone.trim() || null,
        email: email.trim() !== (meQuery.data?.email ?? profile?.email) ? email.trim() : undefined,
        currentPassword: currentPassword || undefined,
      }),
    onSuccess: () => {
      toast('Profil güncellendi', 'success')
      setCurrentPassword('')
      refresh()
      void queryClient.invalidateQueries({ queryKey: ['customer', 'me'] })
    },
    onError: (err) => toast(getErrorMessage(err, 'Profil güncellenemedi'), 'error'),
  })

  if (meQuery.isLoading && !profile) return <LoadingState label="Profil yükleniyor…" />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Profil Bilgilerim</h2>
        <p className="mt-1 text-sm text-slate-600">İletişim bilgilerinizi güncelleyin.</p>
      </div>

      <form
        className="max-w-lg space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          saveMutation.mutate()
        }}
      >
        <Input label="Ad soyad" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="E-posta" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Telefon" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} hint="Opsiyonel" />
        {email.trim() !== (meQuery.data?.email ?? profile?.email ?? '') ? (
          <Input
            label="Mevcut şifre"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            hint="E-posta değişikliği için gerekli"
            required
          />
        ) : null}
        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Kaydediliyor…' : 'Kaydet'}
        </Button>
      </form>
    </div>
  )
}
