import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { customersService, getErrorMessage } from '@/services/customersService'
import { useToastStore } from '@/store/toastStore'

export function AccountSecurityPage() {
  const navigate = useNavigate()
  const toast = useToastStore((s) => s.show)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPassword2, setNewPassword2] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== newPassword2) {
      toast('Yeni şifreler eşleşmiyor', 'error')
      return
    }
    setLoading(true)
    try {
      await customersService.patchPassword(currentPassword, newPassword)
      toast('Şifreniz güncellendi', 'success')
      setCurrentPassword('')
      setNewPassword('')
      setNewPassword2('')
    } catch (err) {
      toast(getErrorMessage(err, 'Şifre değiştirilemedi'), 'error')
    } finally {
      setLoading(false)
    }
  }

  const onLogout = () => {
    customersService.logoutLocal()
    navigate('/giris', { replace: true })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Güvenlik</h2>
        <p className="mt-1 text-sm text-slate-600">Şifrenizi güncelleyin ve oturumunuzu yönetin.</p>
      </div>

      <Card>
        <CardBody>
          <form className="max-w-lg space-y-4" onSubmit={onSubmit}>
            <Input label="Mevcut şifre" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required autoComplete="current-password" />
            <Input label="Yeni şifre" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required autoComplete="new-password" hint="En az 8 karakter" />
            <Input label="Yeni şifre tekrar" type="password" value={newPassword2} onChange={(e) => setNewPassword2(e.target.value)} required autoComplete="new-password" />
            <Button type="submit" disabled={loading}>
              {loading ? 'Güncelleniyor…' : 'Şifreyi değiştir'}
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card className="border-slate-200">
        <CardBody className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-900">Oturumu kapat</p>
            <p className="mt-1 text-sm text-slate-600">Tüm cihazlarda güvenli çıkış için oturumu sonlandırın.</p>
          </div>
          <Button type="button" variant="secondary" onClick={onLogout}>
            Çıkış yap
          </Button>
        </CardBody>
      </Card>

      <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
        Son giriş zamanı API&apos;si backend&apos;de müşteri profiline dahil değil; bu bilgi şu an gösterilemiyor.
      </p>
    </div>
  )
}
