import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CustomerAuthShell } from '@/components/account/CustomerAuthShell'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { customersService, getErrorMessage } from '@/services/customersService'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')?.trim() ?? ''

  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Geçerli bir sıfırlama bağlantısı bulunamadı.')
      return
    }
    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.')
      return
    }
    if (password !== password2) {
      setError('Şifreler eşleşmiyor.')
      return
    }

    setLoading(true)
    try {
      const result = await customersService.resetPassword(token, password)
      setSuccessMessage(result.message)
      setTimeout(() => navigate('/giris', { replace: true }), 2500)
    } catch (err) {
      setError(getErrorMessage(err, 'Şifre güncellenemedi. Lütfen yeni bir sıfırlama talebi oluşturun.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <CustomerAuthShell
      title="Yeni şifre belirle"
      subtitle="Güvenli bir şifre seçin ve hesabınıza tekrar erişin."
      footer={
        <Link to="/giris" className="font-semibold text-emerald-700 hover:underline">
          Giriş sayfasına dön
        </Link>
      }
    >
      {!token ? (
        <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
          <p className="font-medium">Geçerli bir sıfırlama bağlantısı bulunamadı.</p>
          <p>
            <Link to="/sifremi-unuttum" className="font-semibold text-emerald-800 underline">
              Şifremi unuttum
            </Link>{' '}
            sayfasından yeni bir bağlantı isteyebilirsiniz.
          </p>
        </div>
      ) : successMessage ? (
        <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-950">
          <p className="font-medium">{successMessage}</p>
          <p className="text-emerald-900/80">Giriş sayfasına yönlendiriliyorsunuz…</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
          ) : null}
          <Input
            label="Yeni şifre"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            hint="En az 8 karakter"
          />
          <Input
            label="Yeni şifre tekrar"
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Güncelleniyor…' : 'Şifreyi güncelle'}
          </Button>
        </form>
      )}
    </CustomerAuthShell>
  )
}
