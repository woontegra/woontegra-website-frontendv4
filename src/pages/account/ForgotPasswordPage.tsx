import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CustomerAuthShell } from '@/components/account/CustomerAuthShell'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

/** Backend: POST /api/customers/forgot-password henüz yok — UI hazır, bilgilendirme gösterilir. */
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
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
        <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
          <p className="font-medium">Müşteri şifre sıfırlama API&apos;si henüz aktif değil.</p>
          <p>
            Backend&apos;de <code className="rounded bg-white/80 px-1">POST /api/customers/forgot-password</code> endpoint&apos;i
            tanımlanmadığı için otomatik e-posta gönderilemiyor.
          </p>
          <p>
            Şifrenizi sıfırlamak için{' '}
            <Link to="/iletisim" className="font-semibold text-emerald-800 underline">
              destek ekibimizle iletişime geçin
            </Link>{' '}
            ve kayıtlı e-posta adresinizi belirtin: <strong>{email}</strong>
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="E-posta" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <Button type="submit" className="w-full">
            Sıfırlama bağlantısı iste
          </Button>
        </form>
      )}
    </CustomerAuthShell>
  )
}
