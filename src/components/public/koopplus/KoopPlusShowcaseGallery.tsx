import { useEffect, useId, useState, type ReactNode } from 'react'
import { KOOPPLUS_SHOWCASE_GALLERY } from '@/data/koopplusProduct'
import { cn } from '@/lib/cn'

const SHELL = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'

type ShowcaseTab = (typeof KOOPPLUS_SHOWCASE_GALLERY)[number]

function BrowserChrome({ children, urlLabel }: { children: ReactNode; urlLabel: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.45)]">
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-slate-900 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-2 truncate text-[10px] text-slate-400">{urlLabel}</span>
      </div>
      {children}
    </div>
  )
}

function PhoneChrome({ src, alt, onOpen }: { src: string; alt: string; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative mx-auto w-full max-w-[220px] overflow-hidden rounded-[1.75rem] border-[6px] border-slate-900 bg-slate-900 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.55)] transition hover:brightness-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      aria-label={`${alt} — büyüt`}
    >
      <span className="absolute left-1/2 top-1.5 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full bg-slate-700/90" aria-hidden />
      <img src={src} alt={alt} loading="lazy" decoding="async" className="aspect-[9/19] w-full object-cover object-top" />
    </button>
  )
}

function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string
  alt: string
  onClose: () => void
}) {
  const titleId = useId()
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="relative max-h-[92dvh] w-full max-w-6xl overflow-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <h3 id={titleId} className="truncate text-sm font-semibold text-slate-900 sm:text-base">
            {alt}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Kapat
          </button>
        </div>
        <img src={src} alt={alt} className="mx-auto max-h-[80dvh] w-auto max-w-full object-contain" />
      </div>
    </div>
  )
}

export function KoopPlusShowcaseGallery() {
  const [activeId, setActiveId] = useState<ShowcaseTab['id']>(KOOPPLUS_SHOWCASE_GALLERY[0]!.id)
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)
  const active = KOOPPLUS_SHOWCASE_GALLERY.find((t) => t.id === activeId) ?? KOOPPLUS_SHOWCASE_GALLERY[0]!
  const isMobileTab = active.id === 'mobil'
  const isDebt = active.id === 'borc'

  return (
    <section
      id="koopplus-yakinindan"
      className="scroll-mt-24 border-b border-slate-200 bg-gradient-to-b from-white via-slate-50 to-white py-14 sm:py-16 lg:py-20"
      aria-labelledby="koopplus-gallery-heading"
    >
      <div className={SHELL}>
        <div className="max-w-3xl">
          <h2
            id="koopplus-gallery-heading"
            className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
          >
            KoopPlus’ı yakından tanıyın
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
            Gerçek program ekranlarından seçilmiş görünümler — tarayıcıdan, her cihazdan.
          </p>
        </div>

        <div
          className="mt-8 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
          role="tablist"
          aria-label="KoopPlus ekran sekmeleri"
        >
          {KOOPPLUS_SHOWCASE_GALLERY.map((tab) => {
            const selected = tab.id === active.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                id={`koopplus-tab-${tab.id}`}
                aria-controls={`koopplus-panel-${tab.id}`}
                onClick={() => setActiveId(tab.id)}
                className={cn(
                  'shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold transition',
                  selected
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
                )}
              >
                {tab.tab}
              </button>
            )
          })}
        </div>

        <div
          id={`koopplus-panel-${active.id}`}
          role="tabpanel"
          aria-labelledby={`koopplus-tab-${active.id}`}
          className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)] lg:gap-10"
        >
          <div>
            {isMobileTab && 'mobileSrcs' in active && active.mobileSrcs ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {active.mobileSrcs.map((shot) => (
                  <PhoneChrome
                    key={shot.src}
                    src={shot.src}
                    alt={shot.alt}
                    onOpen={() => setLightbox({ src: shot.src, alt: shot.alt })}
                  />
                ))}
              </div>
            ) : 'desktopSrc' in active && active.desktopSrc ? (
              <button
                type="button"
                className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                onClick={() =>
                  setLightbox({
                    src: active.desktopSrc,
                    alt: active.desktopAlt,
                  })
                }
                aria-label={`${active.desktopAlt} — büyüt`}
              >
                <BrowserChrome urlLabel="koopplus.woontegra.com">
                  <img
                    src={active.desktopSrc}
                    alt={active.desktopAlt}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[16/10] w-full object-cover object-top"
                  />
                </BrowserChrome>
              </button>
            ) : null}
          </div>

          <div className={cn(isDebt && 'rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 sm:p-6')}>
            <h3 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">{active.title}</h3>
            <p
              className={cn(
                'mt-3 text-base leading-relaxed',
                isDebt ? 'font-medium text-slate-800' : 'text-slate-600',
              )}
            >
              {active.description}
            </p>
            <ul className="mt-5 space-y-2.5">
              {active.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2.5 text-sm leading-relaxed text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {lightbox ? <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} /> : null}
    </section>
  )
}
