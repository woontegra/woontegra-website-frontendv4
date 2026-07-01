import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CustomerAuthShell } from '@/components/account/CustomerAuthShell'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { customersService } from '@/services/customersService'

const GENERIC_ERROR =
  'Şifre sıfırlama işlemi şu anda tamamlanamadı. Lütfen daha sonra tekrar deneyin.'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await customersService.forgotPassword(email)
      setSuccessMessage(result.message)
      setSubmitted(true)
    } catch {
      setError(GENERIC_ERROR)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CustomerAuthShell
      title="Şifremi unuttum"
      subtitle="E-posta adresinize sıfırlama bağlantısı gönderilir."
      footer={
        <Link to="/giris" className="font-semibold text-emerald-700 hover:underline">
          Giriş sayfasına dön
        </Link>
      }
    >
      {submitted ? (
        <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-950">
          <p className="font-medium">{successMessage}</p>
          <p className="text-emerald-900/80">
            E-postanızı kontrol edin. Birkaç dakika içinde gelmezse spam klasörüne bakın.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
          ) : null}
          <Input
            label="E-posta"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Gönderiliyor…' : 'Sıfırlama bağlantısı iste'}
          </Button>
        </form>
      )}
    </CustomerAuthShell>
  )
}
