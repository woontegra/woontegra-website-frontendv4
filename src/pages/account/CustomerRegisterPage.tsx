import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { CustomerAuthShell } from '@/components/account/CustomerAuthShell'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useCustomerSession } from '@/hooks/useCustomerSession'
import { customersService, getErrorMessage } from '@/services/customersService'
import { trackSignUp } from '@/integrations/trackingEvents'

export function CustomerRegisterPage() {
  const [params] = useSearchParams()
  const ret = params.get('return') || '/hesabim'
  const navigate = useNavigate()
  const { authed } = useCustomerSession()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [kvkk, setKvkk] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (authed) return <Navigate to="/hesabim" replace />

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== password2) {
      setError('Şifreler eşleşmiyor.')
      return
    }
    if (!kvkk) {
      setError('Üyelik için KVKK metnini onaylamanız gerekir.')
      return
    }
    setLoading(true)
    try {
      await customersService.register({
        name,
        email,
        password,
        phone: phone.trim() || undefined,
      })
      trackSignUp({ method: 'email' })
      navigate(ret.startsWith('/') ? ret : '/hesabim', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Kayıt oluşturulamadı'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <CustomerAuthShell
      title="Kayıt ol"
      subtitle="Dijital ürünlerinizi güvenle takip edin; sipariş ve lisans bilgileriniz tek yerde."
      footer={
        <>
          Zaten hesabınız var mı?{' '}
          <Link to={`/giris?return=${encodeURIComponent(ret)}`} className="font-semibold text-emerald-700 hover:underline">
            Giriş yapın
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
        <Input label="Ad soyad" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
        <Input label="E-posta" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <Input label="Telefon" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" hint="Opsiyonel" />
        <Input label="Şifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" hint="En az 8 karakter" />
        <Input label="Şifre tekrar" type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} required autoComplete="new-password" />
        <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={kvkk} onChange={(e) => setKvkk(e.target.checked)} className="mt-0.5 rounded border-slate-300" required />
          <span>
            <Link to="/kvkk-aydinlatma-metni" className="text-emerald-700 hover:underline" target="_blank">
              KVKK aydınlatma metnini
            </Link>{' '}
            okudum ve üyelik koşullarını kabul ediyorum.
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 rounded border-slate-300" />
          <span>Kampanya ve ürün duyurularını e-posta ile almak istiyorum. (Opsiyonel)</span>
        </label>
        {marketing ? (
          <p className="text-xs text-slate-500">Ticari ileti tercihiniz profilinizde saklanır; backend entegrasyonu sonraki aşamada eklenecektir.</p>
        ) : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Kayıt oluşturuluyor…' : 'Hesap oluştur'}
        </Button>
      </form>
    </CustomerAuthShell>
  )
}
