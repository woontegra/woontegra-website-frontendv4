import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  Building2,
  Check,
  Cloud,
  CreditCard,
  Info,
  Mail,
  MapPin,
  Phone,
  Rocket,
  User,
  X,
  Zap,
} from 'lucide-react'
import {
  KOOPPLUS_BRAND_ICON,
  KOOPPLUS_KVKK_CONSENT_VERSION,
  KOOPPLUS_KVKK_PATH,
  KOOPPLUS_NAME,
} from '@/data/koopplusProduct'
import { trackKoopplusEvent } from '@/integrations/trackingEvents'
import { cn } from '@/lib/cn'
import {
  districtsForProvince,
  matchDistrictName,
  matchProvinceName,
  TURKEY_PROVINCES,
} from '@/data/turkeyLocation'
import { requestKoopPlusDemo, mapKoopPlusDemoError } from '@/services/koopplusDemoService'

export const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

export const KOOPPLUS_DEMO_BULLETS = [
  'Üye ve borç yönetimi',
  'Aidat, tahsilat ve ek borç takibi',
  'Faiz hesaplama ve işletme',
  'Banka hareketleri ve eşleştirme',
  'PDF / Excel raporlar',
] as const

export const KOOPPLUS_DEMO_FOOTER_POINTS = [
  { icon: CreditCard, label: 'Kredi kartı gerekmez' },
  { icon: Zap, label: 'Hemen başlayın' },
  { icon: Check, label: '7 gün tam erişim' },
] as const

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string
      callback: (token: string) => void
      'expired-callback'?: () => void
      'error-callback'?: () => void
      theme?: 'light' | 'dark' | 'auto'
    },
  ) => string
  reset: (widgetId?: string) => void
  remove: (widgetId?: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let turnstileScriptPromise: Promise<TurnstileApi> | null = null

function loadTurnstileScript(): Promise<TurnstileApi> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (turnstileScriptPromise) return turnstileScriptPromise
  turnstileScriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
    const done = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile unavailable')))
    const existing = document.querySelector<HTMLScriptElement>('script[data-koopplus-turnstile]')
    if (existing) {
      existing.addEventListener('load', done, { once: true })
      existing.addEventListener('error', () => reject(new Error('turnstile load failed')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = TURNSTILE_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.dataset.koopplusTurnstile = 'true'
    script.onload = done
    script.onerror = () => reject(new Error('turnstile load failed'))
    document.head.appendChild(script)
  }).catch((err) => {
    turnstileScriptPromise = null
    throw err
  })
  return turnstileScriptPromise
}

/** Yalnızca rakamları alır; 90 / 0 önekini atar; en fazla 10 hane. */
export function normalizePhoneDigits(value: string): string {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('90') && digits.length > 10) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = digits.slice(1)
  return digits.slice(0, 10)
}

/** (5XX) XXX XX XX */
export function formatPhoneMask(value: string): string {
  const d = normalizePhoneDigits(value)
  if (!d) return ''
  let out = `(${d.slice(0, 3)}`
  if (d.length >= 3) out += ')'
  if (d.length > 3) out += ` ${d.slice(3, 6)}`
  if (d.length > 6) out += ` ${d.slice(6, 8)}`
  if (d.length > 8) out += ` ${d.slice(8, 10)}`
  return out
}

type FormState = {
  fullName: string
  email: string
  phone: string
  cooperativeName: string
  city: string
  district: string
  kvkk: boolean
}

const emptyForm = (): FormState => ({
  fullName: '',
  email: '',
  phone: '',
  cooperativeName: '',
  city: '',
  district: '',
  kvkk: false,
})

type Props = {
  open: boolean
  onClose: () => void
  /** Sol paneldeki laptop alanı için opsiyonel ürün ekran görüntüsü. */
  screenshotUrl?: string | null
  screenshotAlt?: string
}

function FieldShell({
  label,
  icon,
  className,
  children,
}: {
  label: string
  icon: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-slate-400">
          {icon}
        </span>
        {children}
      </div>
    </div>
  )
}

const iconStroke = { className: 'h-4 w-4', strokeWidth: 1.5 as const }

export function KoopPlusDemoModal({ open, onClose, screenshotUrl = null, screenshotAlt = '' }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successEmail, setSuccessEmail] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileError, setTurnstileError] = useState<string | null>(null)
  const turnstileHostRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)

  const siteKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined)?.trim() || ''

  useEffect(() => {
    if (!open) return
    setForm(emptyForm())
    setError(null)
    setSuccessEmail(null)
    setTurnstileToken('')
    setTurnstileError(null)
    setSubmitting(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose, submitting])

  const showForm = open && !successEmail

  useEffect(() => {
    if (!showForm) return
    if (!siteKey) {
      setTurnstileError('Güvenlik doğrulaması yapılandırılmamış. Lütfen daha sonra tekrar deneyin.')
      return
    }
    let cancelled = false
    void loadTurnstileScript()
      .then((api) => {
        if (cancelled || !turnstileHostRef.current) return
        if (widgetIdRef.current) {
          api.remove(widgetIdRef.current)
          widgetIdRef.current = null
        }
        widgetIdRef.current = api.render(turnstileHostRef.current, {
          sitekey: siteKey,
          theme: 'light',
          callback: (token) => {
            setTurnstileToken(token)
            setTurnstileError(null)
          },
          'expired-callback': () => setTurnstileToken(''),
          'error-callback': () => {
            setTurnstileToken('')
            setTurnstileError('Güvenlik doğrulaması yüklenemedi. Sayfayı yenileyip tekrar deneyin.')
          },
        })
      })
      .catch(() => {
        if (!cancelled) setTurnstileError('Güvenlik doğrulaması yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin.')
      })
    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          /* ignore */
        }
      }
      widgetIdRef.current = null
    }
  }, [showForm, siteKey])

  const resetTurnstile = useCallback(() => {
    setTurnstileToken('')
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current)
      } catch {
        /* ignore */
      }
    }
  }, [])

  if (!open || typeof document === 'undefined') return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setError(null)

    const fullName = form.fullName.trim()
    const email = form.email.trim().toLowerCase()
    const cooperativeName = form.cooperativeName.trim()
    const phoneDigits = normalizePhoneDigits(form.phone)
    const city = matchProvinceName(form.city) || form.city.trim()
    const district = matchDistrictName(city, form.district) || form.district.trim()

    if (!fullName) return setError('Ad soyad zorunludur.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Geçerli bir e-posta adresi girin.')
    if (phoneDigits.length !== 10 || !phoneDigits.startsWith('5')) {
      return setError('Geçerli bir cep telefonu girin: (5XX) XXX XX XX')
    }
    if (!cooperativeName) return setError('Kooperatif adı zorunludur.')
    if (!city) return setError('İl seçimi zorunludur.')
    if (!district) return setError('İlçe seçimi zorunludur.')
    if (!form.kvkk) return setError('Devam etmek için KVKK Aydınlatma Metni’ni onaylayın.')
    if (!turnstileToken) return setError('Lütfen güvenlik doğrulamasını tamamlayın.')

    setSubmitting(true)
    try {
      trackKoopplusEvent('koopplus_demo_submit')
      await requestKoopPlusDemo({
        fullName,
        email,
        phone: `+90${phoneDigits}`,
        cooperativeName,
        city,
        district,
        kvkkConsent: true,
        kvkkConsentAt: new Date().toISOString(),
        kvkkConsentVersion: KOOPPLUS_KVKK_CONSENT_VERSION,
        turnstileToken,
      })
      setSuccessEmail(email)
    } catch (err) {
      const mapped = mapKoopPlusDemoError(err)
      setError(mapped.message)
      resetTurnstile()
    } finally {
      setSubmitting(false)
    }
  }

  const fieldCls =
    'h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
  const selectCls = fieldCls

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="koopplus-demo-modal-title"
      data-testid="koopplus-demo-modal"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Kapat"
        onClick={() => !submitting && onClose()}
      />
      <div
        className={cn(
          'relative z-10 grid w-full overflow-hidden bg-white shadow-2xl shadow-slate-950/30',
          'max-h-[94vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl',
          'md:max-w-5xl md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:overflow-hidden',
        )}
      >
        <button
          type="button"
          onClick={() => !submitting && onClose()}
          className="absolute right-3 top-3 z-20 rounded-full bg-white/90 p-1.5 text-slate-500 shadow transition hover:bg-white hover:text-slate-800"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <aside className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#0f2744] to-[#12335c] px-6 py-8 text-white sm:px-8 md:py-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(16,185,129,0.18),transparent_45%),radial-gradient(circle_at_90%_85%,rgba(56,189,248,0.14),transparent_40%)]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/95 p-1.5">
                <img src={KOOPPLUS_BRAND_ICON} alt="" className="h-full w-full object-contain" />
              </span>
              <div>
                <p className="text-base font-bold tracking-tight">{KOOPPLUS_NAME.toUpperCase()}</p>
                <p className="text-xs font-medium text-sky-200">Kooperatif Yönetim Sistemi</p>
              </div>
            </div>

            <h2 id="koopplus-demo-modal-title" className="mt-6 text-2xl font-black leading-tight sm:text-[1.75rem]">
              7 Gün Ücretsiz Demo Sürümü
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Kurulum yok, kredi kartı yok. Tarayıcınızdan KoopPlus’ı 7 gün boyunca tüm özellikleriyle deneyin; sorularınız için
              destek ekibimiz yanınızda.
            </p>

            <ul className="mt-5 space-y-2.5">
              {KOOPPLUS_DEMO_BULLETS.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-100">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="relative mt-7 hidden md:block">
              <div className="mx-auto w-full max-w-[17rem]">
                <div className="rounded-t-xl border border-white/15 bg-slate-900/80 p-1.5 shadow-xl">
                  {screenshotUrl ? (
                    <img
                      src={screenshotUrl}
                      alt={screenshotAlt}
                      className="aspect-[16/10] w-full rounded-md object-cover object-top"
                    />
                  ) : (
                    <div className="flex aspect-[16/10] w-full items-center justify-center rounded-md bg-gradient-to-br from-slate-800 to-slate-900">
                      <img src={KOOPPLUS_BRAND_ICON} alt="" className="h-14 w-14 rounded-xl bg-white/95 object-contain p-1.5" />
                    </div>
                  )}
                </div>
                <div className="mx-auto h-2 rounded-b-xl bg-slate-700/80" />
              </div>
              <span className="absolute -top-3 right-2 inline-flex items-center gap-1.5 rounded-full border border-sky-300/30 bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-100 backdrop-blur">
                <Cloud className="h-3.5 w-3.5" aria-hidden />
                Bulut tabanlı
              </span>
            </div>
          </div>
        </aside>

        <div className="min-w-0 bg-white px-5 py-7 sm:px-8 md:max-h-[94vh] md:overflow-y-auto md:py-9">
          {successEmail ? (
            <div className="flex min-h-[18rem] flex-col items-center justify-center text-center" data-testid="koopplus-demo-success">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Mail className="h-7 w-7" aria-hidden />
              </span>
              <h3 className="mt-5 text-2xl font-bold text-slate-900">E-postanızı kontrol edin</h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
                <span className="font-semibold text-slate-900">{successEmail}</span> adresine bir onay bağlantısı gönderdik.
                Bağlantıya tıkladığınızda 7 günlük demo hesabınız hazırlanır. E-postayı göremezseniz spam klasörünü kontrol edin.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Tamam
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => void handleSubmit(e)} noValidate>
              <h3 className="text-2xl font-bold text-slate-900">Ücretsiz Demo Başlat</h3>
              <p className="mt-1 text-sm text-slate-500">Bilgilerinizi girin, demo bağlantınız e-postanıza gelsin.</p>

              <div className="mt-6 space-y-4">
                <FieldShell label="Ad Soyad *" icon={<User {...iconStroke} aria-hidden />}>
                  <input
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                    autoComplete="name"
                    className={fieldCls}
                    required
                  />
                </FieldShell>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldShell label="E-posta *" icon={<Mail {...iconStroke} aria-hidden />}>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      autoComplete="email"
                      className={fieldCls}
                      required
                    />
                  </FieldShell>
                  <FieldShell label="Cep Telefonu *" icon={<Phone {...iconStroke} aria-hidden />}>
                    <input
                      type="tel"
                      inputMode="tel"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: formatPhoneMask(e.target.value) }))}
                      placeholder="(5XX) XXX XX XX"
                      autoComplete="tel-national"
                      className={fieldCls}
                      required
                    />
                  </FieldShell>
                </div>

                <FieldShell label="Kooperatif Adı *" icon={<Building2 {...iconStroke} aria-hidden />}>
                  <input
                    value={form.cooperativeName}
                    onChange={(e) => setForm((f) => ({ ...f, cooperativeName: e.target.value }))}
                    autoComplete="organization"
                    placeholder="Kooperatifinizin resmi adı"
                    className={fieldCls}
                    required
                  />
                </FieldShell>

                <div className="grid gap-4 sm:grid-cols-2" data-testid="koopplus-demo-city-district">
                  <FieldShell label="İl *" icon={<MapPin {...iconStroke} aria-hidden />}>
                    <select
                      id="koopplus-demo-city"
                      value={matchProvinceName(form.city)}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value, district: '' }))}
                      className={selectCls}
                      required
                    >
                      <option value="">Seçiniz</option>
                      {TURKEY_PROVINCES.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </FieldShell>
                  <FieldShell label="İlçe *" icon={<MapPin {...iconStroke} aria-hidden />}>
                    <select
                      id="koopplus-demo-district"
                      value={
                        matchDistrictName(matchProvinceName(form.city), form.district) ||
                        form.district.trim()
                      }
                      onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                      className={selectCls}
                      disabled={!matchProvinceName(form.city)}
                    >
                      <option value="">
                        {matchProvinceName(form.city) ? 'Seçiniz' : 'Önce il seçin'}
                      </option>
                      {districtsForProvince(matchProvinceName(form.city)).map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </FieldShell>
                </div>
              </div>

              <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.kvkk}
                  onChange={(e) => setForm((f) => ({ ...f, kvkk: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  <a
                    href={KOOPPLUS_KVKK_PATH}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-emerald-700 underline"
                  >
                    KVKK Aydınlatma Metni
                  </a>
                  ’ni okudum ve kişisel verilerimin işlenmesini kabul ediyorum. *
                </span>
              </label>

              <div className="mt-5 flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-relaxed text-sky-900">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" aria-hidden />
                <p>
                  Formu gönderdiğinizde e-posta adresinize bir onay bağlantısı gelir. Demo hesabınız bağlantıya tıkladığınızda
                  açılır.
                </p>
              </div>

              <div className="mt-5">
                <div ref={turnstileHostRef} data-testid="koopplus-turnstile" />
                {turnstileError ? (
                  <p className="mt-2 text-xs text-amber-700" role="status">
                    {turnstileError}
                  </p>
                ) : null}
              </div>

              {error ? (
                <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Rocket className="h-4 w-4" aria-hidden />
                {submitting ? 'Gönderiliyor…' : '7 Gün Ücretsiz Demoyu Başlat'}
              </button>

              <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {KOOPPLUS_DEMO_FOOTER_POINTS.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-50 px-2 py-2 text-center text-xs font-medium text-slate-600"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-emerald-600" strokeWidth={1.75} aria-hidden />
                    {label}
                  </li>
                ))}
              </ul>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
