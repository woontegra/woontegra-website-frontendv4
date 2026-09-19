import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, Check, ChevronDown, Search, Sparkles, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { bilirkisiHesapService } from '@/services/bilirkisiHesapService'
import { getErrorMessage } from '@/api/client'
import { BILIRKISI_HESAP_CHECKOUT_PATH, BILIRKISI_HESAP_PANEL_URL } from '@/data/canonicalSoftwareProducts'
import {
  BH_DEMO_EXPERTISE_AREAS,
  BH_DEMO_PROFESSION_GROUPS,
  normalizeExpertiseSelection,
  type BhDemoProfessionGroupCode,
} from '@/data/bhDemoRequestCatalog'
import { cn } from '@/lib/cn'

type Props = {
  open: boolean
  onClose: () => void
}

type FormState = {
  fullName: string
  phone: string
  email: string
  company: string
  professionGroup: BhDemoProfessionGroupCode | ''
  isExpertWitness: boolean | null
  expertiseCodes: string[]
}

const emptyForm = (): FormState => ({
  fullName: '',
  phone: '',
  email: '',
  company: '',
  professionGroup: '',
  isExpertWitness: null,
  expertiseCodes: [],
})

type PopoverPos = { top: number; left: number; width: number; maxHeight: number }

function ExpertiseMultiSelect({
  value,
  onChange,
  disabled,
}: {
  value: string[]
  onChange: (codes: string[]) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [pos, setPos] = useState<PopoverPos | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const searchId = useId()

  const updatePos = () => {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const gap = 6
    const preferred = 280
    const spaceBelow = window.innerHeight - r.bottom - gap - 12
    const spaceAbove = r.top - gap - 12
    const openUp = spaceBelow < 180 && spaceAbove > spaceBelow
    const maxHeight = Math.max(160, Math.min(preferred, openUp ? spaceAbove : spaceBelow))
    const top = openUp ? Math.max(12, r.top - gap - maxHeight) : r.bottom + gap
    setPos({
      top,
      left: r.left,
      width: r.width,
      maxHeight,
    })
  }

  useLayoutEffect(() => {
    if (!open) return
    updatePos()
    const onWin = () => updatePos()
    window.addEventListener('resize', onWin)
    window.addEventListener('scroll', onWin, true)
    return () => {
      window.removeEventListener('resize', onWin)
      window.removeEventListener('scroll', onWin, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t)) return
      if (panelRef.current?.contains(t)) return
      setOpen(false)
    }
    // click (not mousedown) so the opening click cannot race-close the panel
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [open])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const selected = useMemo(
    () => BH_DEMO_EXPERTISE_AREAS.filter((a) => value.includes(a.code)),
    [value],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR')
    if (!q) return BH_DEMO_EXPERTISE_AREAS
    return BH_DEMO_EXPERTISE_AREAS.filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.name.toLocaleLowerCase('tr-TR').includes(q) ||
        a.shortName.toLocaleLowerCase('tr-TR').includes(q),
    )
  }, [query])

  const toggle = (code: string) => {
    if (value.includes(code)) onChange(value.filter((c) => c !== code))
    else onChange([...value, code])
  }

  const panel =
    open && pos && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={panelRef}
            data-testid="bh-expertise-dropdown"
            className="fixed z-[120] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.width,
              maxHeight: pos.maxHeight,
            }}
          >
            <div className="border-b border-slate-100 p-2">
              <label htmlFor={searchId} className="sr-only">
                Uzmanlık alanında ara
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  id={searchId}
                  data-testid="bh-expertise-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Kod veya başlık ara…"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>
            <ul
              role="listbox"
              aria-multiselectable
              data-testid="bh-expertise-list"
              className="overflow-y-auto overscroll-contain py-1"
              style={{ maxHeight: Math.max(120, pos.maxHeight - 52) }}
            >
              {filtered.length === 0 ? (
                <li className="px-3 py-4 text-center text-xs text-slate-500">Sonuç bulunamadı.</li>
              ) : (
                filtered.map((a) => {
                  const on = value.includes(a.code)
                  return (
                    <li key={a.code}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={on}
                        data-expertise-code={a.code}
                        onClick={() => toggle(a.code)}
                        className={cn(
                          'flex w-full items-start gap-2 px-3 py-2 text-left text-sm transition',
                          on ? 'bg-sky-50 text-sky-950' : 'hover:bg-slate-50',
                        )}
                      >
                        <span
                          className={cn(
                            'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                            on ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300 bg-white',
                          )}
                        >
                          {on ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-medium text-slate-900">
                            {a.code} — {a.shortName}
                          </span>
                          <span className="mt-0.5 block break-words text-[11px] leading-snug text-slate-500">
                            {a.name}
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
          </div>,
          document.body,
        )
      : null

  return (
    <div className="space-y-2">
      {selected.length ? (
        <div className="flex flex-wrap gap-1.5" data-testid="bh-expertise-chips">
          {selected.map((a) => (
            <button
              key={a.code}
              type="button"
              disabled={disabled}
              data-chip-code={a.code}
              onClick={() => toggle(a.code)}
              className="inline-flex max-w-full items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-left text-xs font-medium text-sky-900 transition hover:bg-sky-100"
            >
              <span className="truncate">
                {a.code} · {a.shortName}
              </span>
              <X className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
            </button>
          ))}
        </div>
      ) : null}

      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        data-testid="bh-expertise-trigger"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-left text-sm text-slate-900 shadow-sm outline-none transition',
          'hover:border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100',
          open && 'border-sky-500 ring-2 ring-sky-100',
        )}
      >
        <span className={selected.length ? 'text-slate-700' : 'text-slate-400'}>
          {selected.length ? `${selected.length} alan seçildi` : 'Uzmanlık alanı seçin'}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-slate-400 transition', open && 'rotate-180')} />
      </button>
      {panel}
    </div>
  )
}

export function BilirkisiDemoRequestModal({ open, onClose }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [demoAlreadyUsed, setDemoAlreadyUsed] = useState(false)
  const [success, setSuccess] = useState(false)
  const [panelLoginUrl, setPanelLoginUrl] = useState(BILIRKISI_HESAP_PANEL_URL)

  useEffect(() => {
    if (!open) return
    setError(null)
    setDemoAlreadyUsed(false)
    setSuccess(false)
    setForm(emptyForm())
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
    setDemoAlreadyUsed(false)
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
    if (!form.professionGroup) {
      setError('Meslek grubunuzu seçiniz.')
      return
    }
    if (form.isExpertWitness === null) {
      setError('Bilirkişi olup olmadığınızı seçiniz.')
      return
    }
    if (form.isExpertWitness && form.expertiseCodes.length < 1) {
      setError('En az bir uzmanlık alanı seçiniz.')
      return
    }

    setSubmitting(true)
    try {
      const expertiseAreas = form.isExpertWitness
        ? normalizeExpertiseSelection(form.expertiseCodes)
        : []
      await bilirkisiHesapService.requestDemo({
        name: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        company: form.company.trim() || undefined,
        professionGroup: form.professionGroup,
        isExpertWitness: form.isExpertWitness,
        expertiseAreas,
      })
      setSuccess(true)
    } catch (err) {
      const code = err && typeof err === 'object' && 'code' in err ? String((err as { code?: string }).code) : ''
      if (code === 'DEMO_ALREADY_USED') {
        setDemoAlreadyUsed(true)
        setError(
          getErrorMessage(
            err,
            'Bu e-posta adresi veya telefon numarasıyla daha önce 7 günlük demo kullanılmış. Demo hakkı yalnızca bir kez kullanılabilir. Mevcut hesabınıza giriş yapabilir veya abonelik satın alarak kullanmaya devam edebilirsiniz.',
          ),
        )
      } else {
        setError(getErrorMessage(err, 'Demo talebi gönderilemedi.'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const fieldClass =
    'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100'

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 p-3 sm:items-center sm:p-5"
      role="dialog"
      aria-modal
      aria-labelledby="bh-demo-modal-title"
      data-testid="bh-demo-modal"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Kapat"
        onClick={() => !submitting && onClose()}
      />
      <div
        data-testid="bh-demo-modal-panel"
        className={cn(
          'relative z-10 flex w-full flex-col rounded-3xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/15',
          // Mobile: allow body scroll if needed. Desktop 1080p: grow to fit, no inner scrollbar.
          'max-h-[92vh] max-w-lg overflow-hidden',
          'md:max-h-[min(94vh,880px)] md:max-w-2xl md:overflow-visible',
        )}
      >
        <div className="relative shrink-0 border-b border-slate-100 px-5 py-3.5 md:px-6 md:py-4">
          <div
            className="pointer-events-none absolute inset-0 rounded-t-3xl bg-[radial-gradient(80%_120%_at_0%_0%,rgba(14,165,233,0.12),transparent_55%),linear-gradient(180deg,#fff,rgba(248,250,252,0.9))]"
            aria-hidden
          />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky-700">
                <Sparkles className="h-3 w-3" aria-hidden />
                Bilirkişi Hesap
              </div>
              <h2 id="bh-demo-modal-title" className="text-lg font-semibold tracking-tight text-slate-900 md:text-xl">
                7 Günlük Demo Talep Et
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                Meslek ve uzmanlık bilgileriniz yalnızca kullanıcı kitlesi analizi amacıyla değerlendirilir.
              </p>
            </div>
            <button
              type="button"
              onClick={() => !submitting && onClose()}
              className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Kapat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {success ? (
          <div className="space-y-4 overflow-y-auto px-5 py-6 md:px-6">
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
        ) : demoAlreadyUsed ? (
          <div className="space-y-4 overflow-y-auto px-5 py-6 md:px-6" data-testid="bh-demo-already-used">
            <div
              className="flex gap-3 rounded-xl border border-amber-200/80 bg-amber-50 px-3.5 py-3 text-sm leading-relaxed text-amber-950"
              role="status"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
              <p>
                {error ||
                  'Bu e-posta adresi veya telefon numarasıyla daha önce 7 günlük demo kullanılmış. Demo hakkı yalnızca bir kez kullanılabilir. Mevcut hesabınıza giriş yapabilir veya abonelik satın alarak kullanmaya devam edebilirsiniz.'}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <a
                href={panelLoginUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-700"
                data-testid="bh-demo-cta-panel"
              >
                Panele Giriş
              </a>
              <a
                href={BILIRKISI_HESAP_CHECKOUT_PATH}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                data-testid="bh-demo-cta-purchase"
              >
                Abonelik Satın Al
              </a>
            </div>
            <Button type="button" variant="ghost" className="w-full" onClick={onClose}>
              Kapat
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col md:min-h-0">
            <div
              data-testid="bh-demo-modal-body"
              className={cn(
                'min-h-0 flex-1 space-y-3 px-5 py-3.5 md:space-y-3.5 md:px-6 md:py-4',
                // Scroll only on small viewports; desktop should fit without inner scrollbar
                'overflow-y-auto overscroll-contain md:overflow-visible',
              )}
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-x-4 md:gap-y-3">
                <Input
                  label="Ad Soyad *"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  autoComplete="name"
                  required
                  className="h-10"
                />
                <Input
                  label="Telefon *"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="05xx xxx xx xx"
                  autoComplete="tel"
                  required
                  className="h-10"
                />
                <Input
                  label="E-posta *"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  autoComplete="email"
                  required
                  className="h-10"
                />
                <Input
                  label="Kurum / Baro (opsiyonel)"
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  autoComplete="organization"
                  className="h-10"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-x-4 md:items-end">
                <div className="space-y-1.5">
                  <label htmlFor="bh-demo-profession" className="block text-sm font-medium text-slate-700">
                    Meslek Grubunuz *
                  </label>
                  <select
                    id="bh-demo-profession"
                    value={form.professionGroup}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        professionGroup: e.target.value as BhDemoProfessionGroupCode | '',
                      }))
                    }
                    required
                    className={fieldClass}
                  >
                    <option value="">Meslek grubunuzu seçin</option>
                    {BH_DEMO_PROFESSION_GROUPS.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <fieldset className="space-y-1.5">
                  <legend className="text-sm font-medium text-slate-700">Bilirkişi misiniz? *</legend>
                  <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1">
                    {(
                      [
                        { value: true, label: 'Evet' },
                        { value: false, label: 'Hayır' },
                      ] as const
                    ).map((opt) => {
                      const active = form.isExpertWitness === opt.value
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          aria-pressed={active}
                          data-testid={opt.value ? 'bh-expert-yes' : 'bh-expert-no'}
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              isExpertWitness: opt.value,
                              expertiseCodes: opt.value ? f.expertiseCodes : [],
                            }))
                          }
                          className={cn(
                            'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm transition',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-1',
                            active
                              ? 'border border-brand-500/50 bg-brand-50 font-semibold text-brand-700 shadow-sm shadow-brand-600/10'
                              : 'border border-transparent bg-slate-50/90 font-medium text-slate-600 hover:bg-white hover:text-slate-800',
                          )}
                        >
                          {active ? (
                            <Check className="h-3.5 w-3.5 shrink-0 text-brand-600" strokeWidth={2.75} aria-hidden />
                          ) : null}
                          <span>{opt.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </fieldset>
              </div>

              {form.isExpertWitness === true ? (
                <div className="space-y-1.5" data-testid="bh-expertise-section">
                  <label className="block text-sm font-medium text-slate-700">Uzmanlık Alanınız *</label>
                  <p className="text-xs text-slate-500">Birden fazla alan seçebilirsiniz.</p>
                  <ExpertiseMultiSelect
                    value={form.expertiseCodes}
                    onChange={(codes) => setForm((f) => ({ ...f, expertiseCodes: codes }))}
                    disabled={submitting}
                  />
                </div>
              ) : null}

              {error ? (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="shrink-0 space-y-2 border-t border-slate-100 bg-slate-50/80 px-5 py-3.5 md:px-6 md:py-4">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Gönderiliyor…' : 'Demo Talebini Gönder'}
              </Button>
              <p className="text-center text-xs text-slate-500">
                Zaten hesabınız var mı?{' '}
                <a
                  href={panelLoginUrl}
                  className="font-medium text-sky-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Panele giriş
                </a>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  )
}
