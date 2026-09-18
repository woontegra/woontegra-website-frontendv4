import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { CustomerAuthShell } from '@/components/account/CustomerAuthShell'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useCustomerSession } from '@/hooks/useCustomerSession'
import { customersService, getErrorMessage } from '@/services/customersService'
import { bilirkisiHesapService } from '@/services/bilirkisiHesapService'
import { trackSignUp } from '@/integrations/trackingEvents'
import { safeInternalReturnPath } from '@/lib/safeInternalReturnPath'

function extractRenewTokenFromReturn(ret: string): string {
  try {
    const url = new URL(ret, window.location.origin)
    return (url.searchParams.get('renew') || '').trim()
  } catch {
    return ''
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export function CustomerRegisterPage() {
  const [params] = useSearchParams()
  const ret = safeInternalReturnPath(params.get('return'), '/hesabim')
  const renewToken = useMemo(() => extractRenewTokenFromReturn(ret), [ret])
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
  const [demoPrefillHint, setDemoPrefillHint] = useState(false)

  useEffect(() => {
    if (!renewToken || renewToken.length < 32) return
    let cancelled = false
    bilirkisiHesapService
      .renewalResolve(renewToken)
      .then((raw) => {
        if (cancelled) return
        const root = asRecord(raw)
        const data = asRecord(root.data && Object.keys(asRecord(root.data)).length ? root.data : root)
        const nextEmail =
          String(data.accountEmail || data.targetEmail || data.email || '')
            .trim()
            .toLowerCase()
        const nextName = String(data.customerName || '').trim()
        const purchaseContext = String(data.purchaseContext || '').toUpperCase()
        const isDemo =
          purchaseContext === 'DEMO_CONVERSION' ||
          String(data.currentPackage || data.licenseType || '')
            .trim()
            .toLowerCase() === 'demo'
        if (nextEmail) setEmail((prev) => prev || nextEmail)
        if (nextName) setName((prev) => prev || nextName)
        if (isDemo && (nextEmail || nextName)) setDemoPrefillHint(true)
      })
      .catch(() => {
        /* token invalid/expired — leave form empty */
      })
    return () => {
      cancelled = true
    }
  }, [renewToken])

  if (authed) return <Navigate to={ret} replace />

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
      navigate(ret, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Kayıt oluşturulamadı'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <CustomerAuthShell
      title="Kayıt ol"
      subtitle={
        demoPrefillHint
          ? 'Demo yükseltme bilginiz korundu. Woontegra müşteri hesabınızı oluşturun; satın alma adımına otomatik döneceksiniz.'
          : 'Dijital ürünlerinizi güvenle takip edin; sipariş ve lisans bilgileriniz tek yerde.'
      }
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
        {demoPrefillHint ? (
          <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
            Bilirkişi Hesap demo hesabınızdaki ad ve e-posta önceden dolduruldu. Telefon ve fatura bilgilerini satın alma adımında tamamlayabilirsiniz.
          </p>
        ) : null}
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
