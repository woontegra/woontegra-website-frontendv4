import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, ChevronDown } from 'lucide-react'
import { SoftwareShowcaseMark } from '@/components/public/SoftwareShowcaseMark'
import { SOFTWARE_SHOWCASE_ITEMS, type SoftwareShowcaseItem } from '@/data/softwareShowcase'
import { AVUKAT_TEMALAR } from '@/data/avukatSiteleriProduct'
import { cn } from '@/lib/cn'

/**
 * Ana sayfa "Ne yapmak istiyorsunuz?" bölümü.
 * Solda ihtiyaçlar, sağda seçilen ürünün kendi renginde tanıtım alanı.
 * Bilgisayarda 6 saniyede bir sıradaki ürüne geçer (fare üstündeyken ya da bölüm ekranda değilken durur).
 * Telefonda kendiliğinden dönmez; dokunulan satır açılır.
 * Aktüerya satışa açılınca PICKS listesine eklenebilir.
 */

type Pick = {
  id: string
  need: string
  label: string
  /** Tanıtım alanının zemin rengi (ürün rengi) */
  color: string
  /** Köşedeki süs halkasının rengi */
  ring: string
  labelColor: string
  textColor: string
  desc: string
  points: string[]
  cta: string
  note?: string
  desktopImg: string
  phoneImg?: string
}

const AVUKAT_TEMA = AVUKAT_TEMALAR[0]

const PICKS: Pick[] = [
  {
    id: 'bilirkisi-hesap',
    need: 'İşçilik alacaklarını hesaplayacağım',
    label: 'Hukuk · Web + Mobil',
    color: '#0F2A4A',
    ring: '#1D6FD8',
    labelColor: '#93C5FD',
    textColor: '#C7D7EC',
    desc: 'İşçilik alacağı hesaplarını hazırlayın; sonucu Word, PDF veya UDF olarak kaydedin.',
    points: ['50+ hesaplama modülü', 'Web ve mobil uygulama', 'Canlı destek'],
    cta: 'Ürünü inceleyin',
    note: '7 gün ücretsiz deneme',
    desktopImg: '/images/bilirkisi-hesap-panel.webp',
    phoneImg: '/images/bilirkisi-hesap-mobil-ana-sayfa.webp',
  },
  {
    id: 'muvekkil-kasa-defteri',
    need: 'Müvekkil paralarını ve taksitleri takip edeceğim',
    label: 'Hukuk · Web + Mobil',
    color: '#14532D',
    ring: '#16A34A',
    labelColor: '#86EFAC',
    textColor: '#D1F0DB',
    desc: "Müvekkil paralarını, taksitleri ve büro kasasını tek yerden takip edin; vadesi gelen taksiti WhatsApp'tan hatırlatın.",
    points: ['Taksit ve tahsilat takibi', 'WhatsApp hatırlatma', 'Web ve mobil uygulama'],
    cta: 'Ürünü inceleyin',
    note: '7 gün ücretsiz deneme',
    desktopImg: '/images/muvekkil-kasa-panel.webp',
    phoneImg: '/images/muvekkil-kasa-mobil-ana-sayfa.webp',
  },
  {
    id: 'koopplus',
    need: 'Kooperatif aidatlarını yöneteceğim',
    label: 'Kooperatif',
    color: '#7C2D12',
    ring: '#F97316',
    labelColor: '#FDBA74',
    textColor: '#FBE3D3',
    desc: 'Kooperatiflerde üye, aidat ve tahsilat süreçlerini tek merkezden yönetin.',
    points: ['Üye ve aidat takibi', 'Kooperatif kasası ve banka hareketleri', 'Web ve mobil erişim'],
    cta: 'Ürünü inceleyin',
    note: '7 gün ücretsiz deneme',
    desktopImg: '/images/products/koopplus-gallery/desktop-yonetim-paneli.webp',
    phoneImg: '/images/products/koopplus-gallery/mobile-yonetim-paneli.webp',
  },
  {
    id: 'avukat-siteleri',
    need: 'Büroma web sitesi istiyorum',
    label: 'Hukuk · Web sitesi',
    color: '#1E3A8A',
    ring: '#3B82F6',
    labelColor: '#93C5FD',
    textColor: '#D6E2FB',
    desc: 'KVKK uyumlu, reklam yasağına uygun hukuk bürosu web sitesi.',
    points: ['10 hazır tema', 'KVKK uyumlu formlar', 'Makale sistemi ve kolay yönetim paneli'],
    cta: 'Temaları inceleyin',
    desktopImg: AVUKAT_TEMA?.masaustu ?? '/avukat-siteleri/prestige-masaustu.webp',
    phoneImg: AVUKAT_TEMA?.telefon,
  },
  {
    id: 'sifre-kasasi',
    need: 'Şifrelerimi güvenle saklayacağım',
    label: 'Ücretsiz',
    color: '#101828',
    ring: '#16A34A',
    labelColor: '#86EFAC',
    textColor: '#D0D5DD',
    desc: 'Şifrelerinizi cihazınızda, ücretsiz ve şifreli olarak saklayın.',
    points: ['Tamamen ücretsiz', 'Şifreler cihazınızda kalır', 'Şifreli saklama'],
    cta: 'Ücretsiz inceleyin',
    desktopImg: '/images/woontegra-sifre-kasasi-ekran.png',
  },
]

const STEP_SECONDS = 6

type Entry = { pick: Pick; item: SoftwareShowcaseItem }

function entries(): Entry[] {
  return PICKS.flatMap((pick) => {
    const item = SOFTWARE_SHOWCASE_ITEMS.find((i) => i.id === pick.id)
    return item ? [{ pick, item }] : []
  })
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia(query)
    const update = () => setMatches(mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [query])
  return matches
}

type Props = {
  /** Sayfada bu bölümden önce bir h1 varsa başlıklar h2/h3 olur. Görsel hero h1 taşımıyorsa başlıklar paragraf kalır; alttaki sayfa h1’i yerinde durur. */
  followsPageTitle?: boolean
}

export function HomeSoftwarePicker({ followsPageTitle = true }: Props) {
  const list = entries()
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [inView, setInView] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const autoplay = isDesktop && !reduceMotion

  useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const obs = new IntersectionObserver(([entry]) => setInView(Boolean(entry?.isIntersecting)), { threshold: 0.25 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Sıradaki ürüne geçiş zamanlayıcısı; durdurulunca kalan süre saklanır.
  const remainingRef = useRef(STEP_SECONDS * 1000)
  const startRef = useRef(0)
  const paused = hovered || !inView
  const count = list.length
  useEffect(() => {
    remainingRef.current = STEP_SECONDS * 1000
  }, [active, autoplay])
  useEffect(() => {
    if (!autoplay || paused || count < 2) return
    startRef.current = performance.now()
    const id = window.setTimeout(() => setActive((a) => (a + 1) % count), remainingRef.current)
    return () => {
      window.clearTimeout(id)
      remainingRef.current = Math.max(0, remainingRef.current - (performance.now() - startRef.current))
    }
  }, [active, autoplay, paused, count])

  if (list.length === 0) return null
  const current = list[Math.min(active, list.length - 1)]
  const TitleTag = followsPageTitle ? 'h2' : 'p'
  const NameTag = followsPageTitle ? 'h3' : 'p'

  return (
    <section
      ref={sectionRef}
      aria-labelledby="home-yazilimlar-baslik"
      className="bg-[#F4F6F9] py-16 sm:py-24"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div className="flex flex-col gap-2 sm:gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">Yazılımlarımız</p>
            <TitleTag
              id="home-yazilimlar-baslik"
              className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl"
            >
              Ne yapmak istiyorsunuz?
            </TitleTag>
          </div>
          <p className="max-w-md text-base leading-relaxed text-slate-600 sm:text-lg lg:text-right">
            İşinizi seçin, size uygun programı gösterelim. Her programı satın almadan önce inceleyebilirsiniz.
          </p>
        </header>

        {/* Bilgisayar: solda ihtiyaçlar, sağda tanıtım alanı */}
        <div className="mt-10 hidden gap-6 lg:flex">
          <div role="tablist" aria-label="Yazılımlar" className="flex w-[400px] shrink-0 flex-col gap-1.5">
            {list.map(({ pick, item }, index) => {
              const selected = index === active
              return (
                <button
                  key={pick.id}
                  type="button"
                  role="tab"
                  id={`home-yazilim-tab-${pick.id}`}
                  aria-selected={selected}
                  aria-controls="home-yazilim-panel"
                  onClick={() => setActive(index)}
                  className={cn(
                    'relative flex items-center gap-4 overflow-hidden rounded-xl px-5 py-5 text-left outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-emerald-600',
                    selected
                      ? 'bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_12px_32px_-16px_rgba(16,24,40,0.25)]'
                      : 'hover:bg-white/70',
                  )}
                >
                  <SoftwareShowcaseMark item={item} size="md" />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className={cn('text-[17px] leading-snug', selected ? 'font-extrabold text-slate-950' : 'font-bold text-slate-700')}>
                      {pick.need}
                    </span>
                    <span className="text-sm text-slate-500">{item.title}</span>
                  </span>
                  {selected ? (
                    <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-slate-200">
                      {autoplay ? (
                        <span
                          key={`progress-${active}`}
                          className="home-picker-progress block h-full origin-left"
                          style={{
                            backgroundColor: pick.ring,
                            animationDuration: `${STEP_SECONDS}s`,
                            animationPlayState: paused ? 'paused' : 'running',
                          }}
                        />
                      ) : (
                        <span className="block h-full w-full" style={{ backgroundColor: pick.ring }} />
                      )}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>

          <div
            id="home-yazilim-panel"
            role="tabpanel"
            aria-labelledby={`home-yazilim-tab-${current.pick.id}`}
            className="relative min-h-[540px] min-w-0 flex-1 overflow-hidden rounded-2xl text-white transition-colors duration-700 motion-reduce:transition-none"
            style={{ backgroundColor: current.pick.color }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-44 -right-36 h-[32rem] w-[32rem] rounded-full border-[72px] opacity-25 transition-colors duration-700"
              style={{ borderColor: current.pick.ring }}
            />
            <StagePanel key={current.pick.id} entry={current} NameTag={NameTag} />
          </div>
        </div>

        {/* Telefon ve tablet: açılır liste */}
        <ul className="mt-8 flex flex-col gap-2 lg:hidden">
          {list.map((entry, index) => {
            const open = index === active
            const { pick, item } = entry
            return (
              <li
                key={pick.id}
                className={cn(
                  'overflow-hidden rounded-xl transition-colors duration-300',
                  open ? 'text-white shadow-[0_16px_32px_-18px_rgba(16,24,40,0.5)]' : 'border border-slate-200 bg-white',
                )}
                style={open ? { backgroundColor: pick.color } : undefined}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`home-yazilim-m-${pick.id}`}
                  onClick={() => setActive(index)}
                  className="flex w-full items-center gap-3 p-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
                >
                  <span className={cn('shrink-0 rounded-lg', open && 'bg-white p-0.5')}>
                    <SoftwareShowcaseMark item={item} size="sm" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className={cn('text-[15px] font-bold leading-snug', open ? 'text-white' : 'text-slate-900')}>{pick.need}</span>
                    <span className="text-xs" style={{ color: open ? pick.labelColor : '#667085' }}>
                      {item.title}
                    </span>
                  </span>
                  <ChevronDown
                    aria-hidden
                    className={cn('h-5 w-5 shrink-0 transition-transform duration-300', open ? 'rotate-180 text-white/70' : 'text-slate-400')}
                  />
                </button>
                <div
                  id={`home-yazilim-m-${pick.id}`}
                  className={cn(
                    'grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
                    open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="mx-3.5 h-44 overflow-hidden rounded-t-lg bg-white/10 sm:h-60">
                      {open ? (
                        <img
                          src={pick.desktopImg}
                          alt={`${item.title} ekranı`}
                          loading="lazy"
                          decoding="async"
                          className="block h-full w-full object-cover object-left-top"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-3 px-4 pb-4 pt-4">
                      <p className="text-sm leading-relaxed" style={{ color: pick.textColor }}>
                        {pick.desc}
                      </p>
                      <Link
                        to={item.href}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-slate-950"
                      >
                        {pick.cta}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                      {pick.note ? <p className="text-center text-xs text-white/70">{pick.note}</p> : null}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/** Sağdaki tanıtım alanının içeriği; ürün değişince yeniden kurulur ve giriş animasyonları oynar. */
function StagePanel({ entry, NameTag }: { entry: Entry; NameTag: 'h3' | 'p' }) {
  const { pick, item } = entry
  return (
    <>
      <div className="relative z-[2] flex w-[46%] flex-col gap-4 py-12 pl-12">
        <p className="home-picker-rise text-xs font-bold uppercase tracking-[0.12em]" style={{ color: pick.labelColor }}>
          {pick.label}
        </p>
        <NameTag className="home-picker-rise text-4xl font-extrabold tracking-tight xl:text-[2.75rem] xl:leading-[1.05]" style={{ animationDelay: '60ms' }}>
          {item.title}
        </NameTag>
        <p className="home-picker-rise text-[17px] leading-relaxed" style={{ color: pick.textColor, animationDelay: '120ms' }}>
          {pick.desc}
        </p>
        <ul className="home-picker-rise mt-1 flex flex-col gap-2.5" style={{ animationDelay: '180ms' }}>
          {pick.points.map((p) => (
            <li key={p} className="flex items-center gap-2.5 text-[15px] text-white/90">
              <Check className="h-4 w-4 shrink-0 text-emerald-300" strokeWidth={3} aria-hidden />
              {p}
            </li>
          ))}
        </ul>
        <div className="home-picker-rise mt-3 flex flex-wrap items-center gap-x-5 gap-y-3" style={{ animationDelay: '240ms' }}>
          <Link
            to={item.href}
            className="group inline-flex min-h-12 items-center gap-2 rounded-lg bg-white px-6 text-[15px] font-bold text-slate-950 transition hover:bg-slate-100"
          >
            {pick.cta}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
          </Link>
          {pick.note ? <span className="text-sm font-semibold text-white/75">{pick.note}</span> : null}
        </div>
      </div>

      <img
        src={pick.desktopImg}
        alt={`${item.title} ekranı`}
        loading="lazy"
        decoding="async"
        className="home-picker-slide absolute left-[52%] top-16 z-[1] w-[640px] max-w-none rounded-lg shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]"
      />
      {pick.phoneImg ? (
        <div className="home-picker-phone absolute bottom-9 left-[47%] z-[3] w-[150px] rounded-[26px] bg-[#0B1220] p-[7px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]">
          <img
            src={pick.phoneImg}
            alt={`${item.title} mobil ekranı`}
            loading="lazy"
            decoding="async"
            className="block aspect-[9/16] w-full rounded-[20px] object-cover object-top"
          />
        </div>
      ) : null}
    </>
  )
}
