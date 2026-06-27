import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { CustomerAuthShell } from '@/components/account/CustomerAuthShell'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useCustomerSession } from '@/hooks/useCustomerSession'
import { customersService, getErrorMessage } from '@/services/customersService'
import { trackLogin } from '@/integrations/trackingEvents'

export function CustomerLoginPage() {
  const [params] = useSearchParams()
  const ret = params.get('return') || '/hesabim'
  const navigate = useNavigate()
  const { authed } = useCustomerSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (authed) return <Navigate to={ret.startsWith('/') ? ret : '/hesabim'} replace />

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await customersService.login(email, password, remember)
      trackLogin({ method: 'email' })
      navigate(ret.startsWith('/') ? ret : '/hesabim', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Giriş yapılamadı'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <CustomerAuthShell
      title="Giriş yap"
      subtitle="Siparişlerinizi, lisanslarınızı ve indirmelerinizi tek panelden yönetin."
      footer={
        <>
          Hesabınız yok mu?{' '}
          <Link to={`/kayit?return=${encodeURIComponent(ret)}`} className="font-semibold text-emerald-700 hover:underline">
            Kayıt olun
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
        <Input label="E-posta" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          label="Şifre"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-slate-700">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-slate-300" />
            Beni hatırla
          </label>
          <Link to="/sifremi-unuttum" className="font-medium text-emerald-700 hover:underline">
            Şifremi unuttum
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Giriş yapılıyor…' : 'Giriş yap'}
        </Button>
      </form>
    </CustomerAuthShell>
  )
}
