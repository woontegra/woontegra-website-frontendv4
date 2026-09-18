import { useEffect, useState } from 'react'
import { AlertCircle, Sparkles, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { bilirkisiHesapService } from '@/services/bilirkisiHesapService'
import { getErrorMessage } from '@/api/client'
import { BILIRKISI_HESAP_PANEL_URL } from '@/data/canonicalSoftwareProducts'

type Props = {
  open: boolean
  onClose: () => void
}

type FormState = {
  fullName: string
  phone: string
  email: string
  company: string
}

export function BilirkisiDemoRequestModal({ open, onClose }: Props) {
  const [form, setForm] = useState<FormState>({
    fullName: '',
    phone: '',
    email: '',
    company: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [panelLoginUrl, setPanelLoginUrl] = useState(BILIRKISI_HESAP_PANEL_URL)

  useEffect(() => {
    if (!open) return
    setError(null)
    setSuccess(false)
    setForm({ fullName: '', phone: '', email: '', company: '' })
    bilirkisiHesapService
      .getConfig()
      .then((c) => {
        if (c.panelLoginUrl) setPanelLoginUrl(c.panelLoginUrl)
      })
      .catch(() => undefined)
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

  if (!open || typeof document === 'undefined') return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.fullName.trim()) {
      setError('Ad soyad zorunludur.')
      return
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      setError('Geçerli bir e-posta giriniz.')
      return
    }
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) {
      setError('Geçerli bir cep telefonu giriniz (en az 10 hane).')
      return
    }
    setSubmitting(true)
    try {
      await bilirkisiHesapService.requestDemo({
        name: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        company: form.company.trim() || undefined,
      })
      setSuccess(true)
    } catch (err) {
      setError(getErrorMessage(err, 'Demo talebi gönderilemedi.'))
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/50 p-4 sm:items-center" role="dialog" aria-modal>
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Kapat" onClick={() => !submitting && onClose()} />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Sparkles className="h-4 w-4 text-sky-600" aria-hidden />
            Ücretsiz demo talep et
          </div>
          <button
            type="button"
            onClick={() => !submitting && onClose()}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {success ? (
          <div className="space-y-4 px-5 py-6">
            <p className="text-base font-semibold text-emerald-700">Demo talebiniz alındı.</p>
            <p className="text-sm leading-relaxed text-slate-600">
              7 günlük deneme lisansınız oluşturuldu. Giriş bilgileriniz e-posta adresinize gönderildi. Programa
              aşağıdaki adresten giriş yapabilirsiniz:
            </p>
            <a
              href={panelLoginUrl}
              className="inline-flex break-all text-sm font-semibold text-sky-700 underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {panelLoginUrl}
            </a>
            <p
              className="flex gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm leading-snug text-rose-700"
              role="note"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden />
              <span>E-postayı göremiyorsanız lütfen Spam veya Gereksiz klasörünüzü de kontrol edin.</span>
            </p>
            <Button type="button" className="w-full" onClick={onClose}>
              Tamam
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 px-5 py-5">
            <Input
              label="Ad soyad"
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              required
            />
            <Input
              label="E-posta"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
            <Input
              label="Telefon"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="05xx xxx xx xx"
              required
            />
            <Input
              label="Kurum / Baro (opsiyonel)"
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
            />
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Gönderiliyor…' : 'Demo Başlat'}
            </Button>
            <p className="text-center text-xs text-slate-500">
              Zaten hesabınız var mı?{' '}
              <a href={panelLoginUrl} className="font-medium text-sky-700" target="_blank" rel="noopener noreferrer">
                Panele giriş
              </a>
            </p>
          </form>
        )}
      </div>
    </div>,
    document.body,
  )
}
