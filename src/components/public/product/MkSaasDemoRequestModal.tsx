import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { saasDemoService } from '@/services/saasDemoService'
import { getErrorMessage } from '@/api/client'

type Props = {
  open: boolean
  onClose: () => void
  defaultEmail?: string
  defaultName?: string
  defaultPhone?: string
}

type FormState = {
  fullName: string
  phone: string
  email: string
  barAssociation: string
  note: string
}

export function MkSaasDemoRequestModal({
  open,
  onClose,
  defaultEmail = '',
  defaultName = '',
  defaultPhone = '',
}: Props) {
  const [form, setForm] = useState<FormState>({
    fullName: defaultName,
    phone: defaultPhone,
    email: defaultEmail,
    barAssociation: '',
    note: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loginUrl, setLoginUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setForm((prev) => ({
      ...prev,
      fullName: defaultName || prev.fullName,
      phone: defaultPhone || prev.phone,
      email: defaultEmail || prev.email,
    }))
    setError(null)
    setSuccess(false)
    setLoginUrl(null)
  }, [open, defaultEmail, defaultName, defaultPhone])

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

  if (!open || typeof document === 'undefined') return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.fullName.trim()) {
      setError('Ad soyad zorunludur.')
      return
    }
    if (!form.phone.trim()) {
      setError('Telefon zorunludur.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Geçerli bir e-posta adresi girin.')
      return
    }
    if (!form.barAssociation.trim()) {
      setError('Baro bilgisi zorunludur.')
      return
    }

    setSubmitting(true)
    try {
      const result = await saasDemoService.requestMuvekkilKasaDemo({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        barAssociation: form.barAssociation.trim(),
        note: form.note.trim() || undefined,
      })
      setLoginUrl(result.loginUrl)
      setSuccess(true)
    } catch (err) {
      setError(getErrorMessage(err, 'Demo talebi gönderilemedi'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (submitting) return
    onClose()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-stretch justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mk-demo-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Modalı kapat"
        onClick={handleClose}
      />
      <div
        className="relative z-[101] flex max-h-[100dvh] w-full max-w-lg flex-col overflow-hidden rounded-none border-0 bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl sm:border sm:border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 bg-slate-50/90 px-4 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sky-700">
              <Sparkles className="h-4 w-4" aria-hidden />
              7 günlük demo
            </div>
            <h2 id="mk-demo-modal-title" className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
              Demo Talep Et
            </h2>
            {!success ? (
              <p className="mt-1 text-sm text-slate-600">
                Demo erişiminiz 7 gün boyunca aktif olacaktır. Giriş bilgileriniz e-posta adresinize gönderilecektir.
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-800"
            aria-label="Kapat"
            onClick={handleClose}
            disabled={submitting}
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {success ? (
            <div className="space-y-4">
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                Demo erişiminiz oluşturuldu. Giriş bilgileri e-posta adresinize gönderildi.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="button" className="flex-1" onClick={handleClose}>
                  Tamam
                </Button>
                {loginUrl ? (
                  <a
                    href={loginUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Demo paneline git
                  </a>
                ) : (
                  <Link
                    to="/giris"
                    className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    Giriş sayfasına git
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
                  {error}
                </p>
              ) : null}
              <Input
                label="Ad soyad *"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                autoComplete="name"
                required
              />
              <Input
                label="Telefon *"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                autoComplete="tel"
                required
              />
              <Input
                label="E-posta *"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                autoComplete="email"
                required
              />
              <Input
                label="Hangi baroya kayıtlısınız? *"
                value={form.barAssociation}
                onChange={(e) => setForm((f) => ({ ...f, barAssociation: e.target.value }))}
                placeholder="Örn. İstanbul Barosu"
                required
              />
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">Açıklama / not</span>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Opsiyonel"
                />
              </label>
              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={handleClose} disabled={submitting}>
                  Vazgeç
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Gönderiliyor…' : 'Demo erişimi oluştur'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
