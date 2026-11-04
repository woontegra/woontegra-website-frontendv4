import { useState } from 'react'
import { BadgeCheck, ChevronLeft, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react'
import { Breadcrumbs } from '@/components/public/Breadcrumbs'
import { SoftwarePlatformPicker } from '@/components/public/product/SoftwarePlatformPicker'
import type { ProductPlatformFamily, SoftwarePlatformId } from '@/components/public/product/softwarePlatforms'
import { cn } from '@/lib/cn'

const MODULE_CHIPS = ['Trafik Yaralanma', 'Trafik Ölüm', 'İş Kazası Yaralanma', 'İş Kazası Ölüm'] as const

const SALES_PLATFORMS = {
  productSlug: 'aktuerya-hesaplama',
  defaultPlatform: 'web',
  platforms: [
    { id: 'web', label: 'WEB', summary: 'Tarayıcıdan kullanım', billingTerms: ['monthly', 'yearly'] },
    { id: 'windows', label: 'WINDOWS', summary: 'Windows masaüstü uygulaması', billingTerms: ['monthly', 'yearly'] },
    { id: 'macos', label: 'macOS', summary: 'Mac masaüstü uygulaması', billingTerms: ['monthly', 'yearly'] },
  ],
} as ProductPlatformFamily

/** Tanıtım vitrini: satın alma ve demo kapalı; fiyat yerine “Çok yakında”. */
export function AktueryaSalesShowcase({
  demoDays,
  demoCredits,
  heroTitle,
  heroHeadline,
  heroLead,
  logoSrc,
  shots,
  heroImageSrc,
}: {
  demoDays: number
  demoCredits: number
  heroTitle: string
  heroHeadline: string
  heroLead: string
  logoSrc: string
  heroImageSrc: string | null
  shots: { id: string; caption: string; alt: string; src: string | null }[]
}) {
  const facts = [
    { label: 'Platformlar', value: 'Web, Windows, macOS' },
    { label: 'Demo', value: `${demoDays} gün / ${demoCredits} hesap kredisi` },
    { label: 'Modüller', value: '4 hesap türü' },
    { label: 'Lisans', value: 'Aylık veya yıllık' },
  ]
  const [platformId, setPlatformId] = useState<SoftwarePlatformId>('web')
  const [plan, setPlan] = useState<'monthly' | 'annual'>('annual')
  const [shotIndex, setShotIndex] = useState(0)
  const shot = shots[shotIndex] ?? shots[0]
  const frameSrc = shot?.src || (shotIndex === 0 ? heroImageSrc : null)

  const goShot = (index: number) => {
    const count = shots.length
    if (count === 0) return
    setShotIndex((index + count) % count)
  }

  return (
    <section id="aktuerya-satin-al" className="relative border-b border-slate-200/60 bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.12),transparent_28%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <Breadcrumbs
          dark
          items={[
            { label: 'Ana Sayfa', href: '/' },
            { label: 'Yazılımlar', href: '/yazilimlar' },
            { label: heroTitle },
          ]}
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-start lg:gap-10">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <img src={logoSrc} alt="" className="h-10 w-auto max-w-[220px] object-contain" />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Aktüerya
              </span>
            </div>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.22em] text-sky-200/90">{heroTitle}</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.65rem] lg:leading-[1.08]">
              {heroHeadline}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">{heroLead}</p>

            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Hesap modülleri">
              {MODULE_CHIPS.map((chip) => (
                <li
                  key={chip}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200"
                >
                  {chip}
                </li>
              ))}
            </ul>

            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              {facts.map((fact) => (
                <div key={fact.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{fact.label}</dt>
                  <dd className="mt-1 text-sm font-semibold text-white">{fact.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-lg bg-white/80 px-4 py-2.5 text-sm font-semibold text-[#123b63] opacity-80"
              >
                Çok yakında
              </button>
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-lg border border-white/40 px-4 py-2.5 text-sm font-semibold text-white opacity-70"
              >
                Çok yakında
              </button>
            </div>

            <div className="relative mt-8 overflow-hidden rounded-[1.35rem] border border-white/10 bg-slate-900/70 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                <span className="ml-2 truncate text-[11px] text-slate-400">{shot?.caption ?? 'Önizleme'}</span>
              </div>
              {frameSrc ? (
                <img src={frameSrc} alt={shot?.alt ?? ''} className="aspect-[16/10] w-full object-cover object-top" />
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center bg-slate-800 text-sm text-slate-400">
                  Ekran görüntüsü yakında
                </div>
              )}
              {shots.length > 1 ? (
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <button
                    type="button"
                    aria-label="Önceki görüntü"
                    onClick={() => goShot(shotIndex - 1)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-slate-950/70 text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Sonraki görüntü"
                    onClick={() => goShot(shotIndex + 1)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-slate-950/70 text-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="lg:sticky lg:top-6">
            <div className="relative overflow-hidden rounded-[1.6rem] border border-white/70 bg-gradient-to-br from-white via-slate-50 to-sky-50 p-5 text-slate-950 shadow-[0_30px_80px_-36px_rgba(15,23,42,0.55)] sm:p-6">
              <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-sky-200/50 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-emerald-200/40 blur-2xl" />

              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Paket seçimi</p>
                  <p className="mt-1 text-lg font-semibold tracking-tight text-slate-950">Çok yakında</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                  Tanıtım
                </span>
              </div>

              <div className="relative mt-5">
                <SoftwarePlatformPicker family={SALES_PLATFORMS} value={platformId} onChange={setPlatformId} />
              </div>

              <div className="relative mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100/90 p-1.5">
                <button
                  type="button"
                  onClick={() => setPlan('monthly')}
                  className={cn(
                    'rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                    plan === 'monthly' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900',
                  )}
                >
                  Aylık
                </button>
                <button
                  type="button"
                  onClick={() => setPlan('annual')}
                  className={cn(
                    'rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                    plan === 'annual' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900',
                  )}
                >
                  Yıllık
                  <span className="ml-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                    Avantajlı
                  </span>
                </button>
              </div>

              <div className="relative mt-5 min-h-[5.5rem]">
                <p className="text-sm font-semibold text-slate-600">{plan === 'monthly' ? 'Aylık' : 'Yıllık'}</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Çok yakında</p>
              </div>

              <div className="relative mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Demo</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {demoDays} gün / {demoCredits} kredi
                  </p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Lisans</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {plan === 'monthly' ? 'Aylık abonelik' : 'Yıllık abonelik'}
                  </p>
                </div>
              </div>

              <p className="relative mt-5 rounded-2xl border border-sky-100/80 bg-sky-50/80 px-4 py-3 text-sm leading-relaxed text-slate-700">
                <ShieldCheck className="mb-0.5 mr-1 inline h-4 w-4 text-sky-600" aria-hidden />
                Online satış ve demo talebi yakında açılacak.
              </p>

              <div className="relative mt-6 grid gap-2">
                <button
                  type="button"
                  disabled
                  className="flex w-full cursor-not-allowed items-center justify-center rounded-2xl bg-slate-300 px-4 py-3.5 text-sm font-semibold text-slate-600"
                >
                  Çok yakında
                </button>
                <button
                  type="button"
                  disabled
                  className="flex w-full cursor-not-allowed items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-500"
                >
                  Çok yakında
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
