import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { SoftwareShowcaseMark } from '@/components/public/SoftwareShowcaseMark'
import { SOFTWARE_SHOWCASE_ITEMS, type SoftwareShowcaseItem } from '@/data/softwareShowcase'

const HOME_SOFTWARE_COPY: Record<string, { summary: string; cta: string; free?: boolean }> = {
  'aktuerya-hesaplama': {
    summary: 'Trafik ve iş kazası tazminat hesaplarını kaydederek yürütün.',
    cta: 'Ürünü İncele',
  },
  'avukat-siteleri': {
    summary: 'KVKK uyumlu, reklam yasağına uygun hukuk bürosu web sitesi.',
    cta: 'Ürünü İncele',
  },
  'bilirkisi-hesap': {
    summary: 'İş hukuku ve bilirkişilik hesaplarını tek ekranda hazırlayın.',
    cta: 'Ürünü İncele',
  },
  'muvekkil-kasa-defteri': {
    summary: 'Avukatlar ve hukuk büroları için kasa, tahsilat ve masraf takibi.',
    cta: 'Ürünü İncele',
  },
  koopplus: {
    summary: 'Kooperatiflerde üye, aidat ve tahsilat süreçlerini tek merkezden yönetin.',
    cta: 'Ürünü İncele',
  },
  'sifre-kasasi': {
    summary: 'Şifrelerinizi cihazınızda, ücretsiz ve şifreli olarak saklayın.',
    cta: 'Ücretsiz İncele',
    free: true,
  },
}

function cards(): { item: SoftwareShowcaseItem; summary: string; cta: string; free: boolean }[] {
  return SOFTWARE_SHOWCASE_ITEMS.flatMap((item) => {
    const copy = HOME_SOFTWARE_COPY[item.id]
    if (!copy) return []
    return [{ item, summary: copy.summary, cta: copy.cta, free: copy.free === true }]
  })
}

type Props = {
  /** Sayfada bu bölümden önce bir h1 varsa başlıklar h2/h3 olur. Görsel hero h1 taşımıyorsa başlıklar paragraf kalır; alttaki sayfa h1’i yerinde durur. */
  followsPageTitle?: boolean
}

export function HomeSoftwarePicker({ followsPageTitle = true }: Props) {
  const items = cards()
  const scrollerRef = useRef<HTMLUListElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const sync = () => {
      setCanPrev(el.scrollLeft > 2)
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
    }
    sync()
    el.addEventListener('scroll', sync, { passive: true })
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', sync)
      observer.disconnect()
    }
  }, [items.length])

  if (items.length === 0) return null
  const TitleTag = followsPageTitle ? 'h2' : 'p'
  const NameTag = followsPageTitle ? 'h3' : 'p'

  const scrollByCard = (direction: -1 | 1) => {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector('li')
    const gap = Number.parseFloat(getComputedStyle(el).columnGap) || 16
    const width = card?.getBoundingClientRect().width ?? el.clientWidth
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: direction * (width + gap), behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <section
      aria-labelledby="home-yazilimlar-baslik"
      className="relative bg-white pb-24 pt-12 sm:pb-32 sm:pt-14"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <TitleTag id="home-yazilimlar-baslik" className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Yazılımlarımız
          </TitleTag>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            Size uygun programı doğrudan seçin ve detaylarını inceleyin.
          </p>
        </header>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            aria-label="Önceki yazılımlar"
            disabled={!canPrev}
            onClick={() => scrollByCard(-1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Sonraki yazılımlar"
            disabled={!canNext}
            onClick={() => scrollByCard(1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <ul
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-4 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map(({ item, summary, cta, free }) => (
            <li
              key={item.id}
              className="flex w-full shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] xl:w-[calc((100%-3rem)/4)]"
            >
              <Link
                to={item.href}
                className="group flex h-full w-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm outline-none transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_18px_40px_-24px_rgba(15,23,42,0.45)] focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <SoftwareShowcaseMark item={item} size="md" />
                  {free ? (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                      Ücretsiz
                    </span>
                  ) : null}
                </div>
                <NameTag className="mt-4 text-base font-semibold text-slate-950">{item.title}</NameTag>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{summary}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                  {cta}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-white to-slate-50 sm:h-20"
      />
    </section>
  )
}
