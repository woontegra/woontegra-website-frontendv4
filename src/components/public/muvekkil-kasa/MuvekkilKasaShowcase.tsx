import { useEffect, useRef, useState } from 'react'
import {
  ArrowUpRight,
  BellRing,
  Building2,
  Check,
  Gavel,
  HandCoins,
  MessageCircle,
  Receipt,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { BhStoreBadges } from '@/components/public/product/BilirkisiHesapShowcase'
import { MkSaasDemoRequestModal } from '@/components/public/product/MkSaasDemoRequestModal'
import { MK_APP_STORE_URL, MK_GOOGLE_PLAY_URL } from '@/components/public/muvekkil-kasa/MuvekkilKasaMobileAppBadges'

/**
 * Müvekkil Kasa Defteri ürün sayfasının tanıtım bölümleri (Bilirkişi Hesap sayfasıyla aynı düzen).
 * Görseller: public/images/muvekkil-kasa-*.webp
 */

/* ---------------------------------------------------------------------------
 * Üst bölümdeki hareketli "kasa hareketleri" kartı.
 * Örnek kayıtlar sırayla en üste eklenir, bakiye her kayıtta güncellenir.
 * "Hareketi azalt" tercihinde kart sabit kalır.
 * ------------------------------------------------------------------------- */
type LedgerTone = 'in' | 'out' | 'warn' | 'wa'

type LedgerEvent = {
  Icon: LucideIcon
  title: string
  meta: string
  amount: string
  tone: LedgerTone
  delta: number
}

const LEDGER_EVENTS: LedgerEvent[] = [
  { Icon: HandCoins, title: 'Vekalet ücreti tahsil edildi', meta: 'Taksit 2 / 5', amount: '+10.000 ₺', tone: 'in', delta: 10000 },
  { Icon: Receipt, title: 'Dosya masrafı', meta: 'Bilirkişi ücreti', amount: '−2.500 ₺', tone: 'out', delta: -2500 },
  { Icon: BellRing, title: 'Taksit vadesi yaklaşıyor', meta: '3 gün kaldı', amount: '7.500 ₺', tone: 'warn', delta: 0 },
  { Icon: MessageCircle, title: 'WhatsApp hatırlatması gönderildi', meta: 'Taksit 3 / 5', amount: 'Gönderildi', tone: 'wa', delta: 0 },
  { Icon: Gavel, title: 'İcra tahsilatı', meta: 'Karşı taraf vekalet ücreti', amount: '+15.000 ₺', tone: 'in', delta: 15000 },
  { Icon: Building2, title: 'Ofis gideri', meta: 'Kira', amount: '−12.000 ₺', tone: 'out', delta: -12000 },
  { Icon: Wallet, title: 'Avans alındı', meta: 'Yeni dosya', amount: '+5.000 ₺', tone: 'in', delta: 5000 },
  { Icon: ArrowUpRight, title: 'Müvekkile ödeme yapıldı', meta: 'Tahsilat aktarımı', amount: '−15.500 ₺', tone: 'out', delta: -15500 },
]

const TONE_CLASS: Record<LedgerTone, { icon: string; amount: string }> = {
  in: { icon: 'bg-emerald-400/15 text-emerald-300', amount: 'text-emerald-300' },
  out: { icon: 'bg-rose-400/15 text-rose-300', amount: 'text-rose-300' },
  warn: { icon: 'bg-amber-400/15 text-amber-300', amount: 'text-amber-200' },
  wa: { icon: 'bg-green-400/15 text-green-300', amount: 'text-green-200' },
}

const VISIBLE_ROWS = 4
const START_BALANCE = 48250
const STEP_MS = 2400

type LedgerRow = { key: number; event: LedgerEvent }

function formatTl(value: number) {
  return `${new Intl.NumberFormat('tr-TR').format(value)} ₺`
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/** Yeni satır yukarıdan kayarak gelir. */
function LedgerRowItem({ row, animate }: { row: LedgerRow; animate: boolean }) {
  const ref = useRef<HTMLLIElement>(null)
  useEffect(() => {
    if (!animate || !ref.current?.animate) return
    ref.current.animate(
      [
        { opacity: 0, transform: 'translateY(-14px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: 450, easing: 'cubic-bezier(.2,.8,.2,1)' },
    )
  }, [animate])
  const { Icon, title, meta, amount, tone } = row.event
  const c = TONE_CLASS[tone]
  return (
    <li ref={ref} className="flex items-center gap-3 rounded-lg bg-[#0F4024] px-3 py-2.5 sm:px-4">
      <span className={'flex h-8 w-8 shrink-0 items-center justify-center rounded-md ' + c.icon}>
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[13px] font-semibold text-white sm:text-sm">{title}</span>
        <span className="truncate text-[11px] text-white/60 sm:text-xs">{meta}</span>
      </span>
      <span className={'shrink-0 text-[13px] font-bold tabular-nums sm:text-sm ' + c.amount}>{amount}</span>
    </li>
  )
}

export function MkLedgerAnimation() {
  const counter = useRef(VISIBLE_ROWS)
  const [rows, setRows] = useState<LedgerRow[]>(() =>
    Array.from({ length: VISIBLE_ROWS }, (_, i) => ({ key: i, event: LEDGER_EVENTS[VISIBLE_ROWS - 1 - i] })),
  )
  const [balance, setBalance] = useState(START_BALANCE)
  const [shownBalance, setShownBalance] = useState(START_BALANCE)
  const [flash, setFlash] = useState(0)

  // Her adımda bir sonraki kayıt en üste eklenir.
  useEffect(() => {
    if (prefersReducedMotion()) return
    const id = window.setInterval(() => {
      const next = LEDGER_EVENTS[counter.current % LEDGER_EVENTS.length]
      counter.current += 1
      setRows((prev) => [{ key: counter.current, event: next }, ...prev].slice(0, VISIBLE_ROWS))
      if (next.delta !== 0) {
        setBalance((b) => b + next.delta)
        setFlash((f) => f + 1)
      }
    }, STEP_MS)
    return () => window.clearInterval(id)
  }, [])

  // Bakiye rakamı yeni değere doğru sayarak ilerler.
  useEffect(() => {
    if (shownBalance === balance) return
    const from = shownBalance
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 600)
      setShownBalance(Math.round(from + (balance - from) * (1 - (1 - p) ** 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance])

  return (
    <figure className="mt-6 max-w-[640px] lg:mt-8" aria-label="Müvekkil Kasa: tahsilatlar, masraflar ve taksit hatırlatmaları tek kasada">
      <div className="rounded-xl border border-white/15 bg-white/[0.06] p-3 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <span className="flex items-center gap-2 text-[13px] font-bold text-white sm:text-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            Kasa hareketleri
          </span>
          <span className="flex items-baseline gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60">Bakiye</span>
            <span
              key={flash}
              className="text-lg font-extrabold tabular-nums text-white transition-colors sm:text-xl"
            >
              {formatTl(shownBalance)}
            </span>
          </span>
        </div>
        <ul className="flex flex-col gap-2">
          {rows.map((row, index) => (
            <LedgerRowItem key={row.key} row={row} animate={index === 0 && row.key >= VISIBLE_ROWS} />
          ))}
        </ul>
      </div>
      <figcaption className="mt-2 px-1 text-[11px] text-white/50">Örnek kayıtlarla gösterimdir.</figcaption>
    </figure>
  )
}

const HIGHLIGHTS = [
  {
    big: 'Kurulumsuz',
    title: 'Web tabanlı',
    desc: 'Tarayıcıdan girin; büro ekibi aynı güncel kayıtları kullansın.',
  },
  {
    big: 'TL · $ · €',
    title: 'Üç para birimi',
    desc: 'Bakiyeler para birimine göre ayrı tutulur; TCMB kurları ekranda.',
  },
  {
    big: 'WhatsApp',
    title: 'Taksit hatırlatma',
    desc: 'Vadesi gelen taksitleri büronuzun WhatsApp Business numarasından iletin.',
  },
  {
    big: '7 gün',
    title: 'Ücretsiz deneme',
    desc: 'Satın almadan önce programı kendi verilerinizle deneyin.',
  },
]

type TourItem = {
  img: string
  width: number
  height: number
  kicker: string
  title: string
  desc: string
  points: string[]
  /** Dikey görsel: kutunun içinde dar ve ortalı gösterilir. */
  portrait?: boolean
}

const TOUR: TourItem[] = [
  {
    img: '/images/muvekkil-kasa-panel.webp',
    width: 1400,
    height: 768,
    kicker: 'Ana panel',
    title: 'Büronuzun kasası tek ekranda',
    desc: 'Program açıldığında vadesi geçmiş taksitler, tahsilat bekleyenler, ofis kasa bakiyesi ve aktif dosyalar karşınızda.',
    points: ['Müvekkili adına, telefonuna veya e-postasına göre bulun', 'TL, USD ve EUR bakiyeleri ayrı ayrı', 'Günlük TCMB döviz kurları'],
  },
  {
    img: '/images/muvekkil-kasa-tahsilat.webp',
    width: 1400,
    height: 695,
    kicker: 'Tahsilat takibi',
    title: 'Taksit tarihleri için ajandaya bakmayın',
    desc: 'Vekalet ücretini taksitlendirin; geciken, bugün ödenecek ve yaklaşan taksitleri tek listede görün.',
    points: ['Kaç gün geciktiği ve kalan tutar', 'Kısmi ödemelerin takibi', "Tek tıkla ödeme alma, WhatsApp'tan gönderme ve ekstre"],
  },
  {
    img: '/images/muvekkil-kasa-ofis-kasasi.webp',
    width: 1400,
    height: 765,
    kicker: 'Ofis kasası',
    title: 'Büronun gelir ve giderleri ayrı defterde',
    desc: 'Dosya dışı gelir ve giderler müvekkil dosya kasasından tamamen ayrı tutulur; yalnızca onaylanan kayıtlar bakiyeye yansır.',
    points: ['Gelir, gider ve düzeltme kayıtları', 'Onay bekleyen işlemler ayrı görünür', 'Her kayıt belge numarasıyla'],
  },
  {
    img: '/images/muvekkil-kasa-kasa-dokumu.webp',
    width: 794,
    height: 926,
    kicker: 'Dönem dökümü',
    title: 'Seçtiğiniz dönemin dökümü hazır',
    desc: 'Dönemi, işlem tipini ve kategoriyi seçin; gelir, gider ve net tutarları hareket listesiyle birlikte yazdırın.',
    points: ['Para birimine göre gelir, gider ve net', 'Tüm hareketler tarih ve belge numarasıyla', 'Yazdırmaya hazır çıktı'],
    portrait: true,
  },
]

const PHONES = [
  { img: '/images/muvekkil-kasa-mobil-ana-sayfa.webp', alt: 'Müvekkil Kasa mobil uygulama ana ekranı', offset: 'sm:mt-10' },
  { img: '/images/muvekkil-kasa-mobil-tahsilat.webp', alt: 'Müvekkil Kasa mobil tahsilat ekranı', offset: '' },
  { img: '/images/muvekkil-kasa-mobil-muvekkil.webp', alt: 'Müvekkil Kasa mobil müvekkil detayı', offset: 'sm:mt-10' },
]

function CheckItem({ children }: { children: string }) {
  return (
    <li className="flex gap-2.5 text-[15px] leading-relaxed text-slate-700">
      <Check className="mt-1 h-4 w-4 shrink-0 text-[#16A34A]" strokeWidth={3} aria-hidden />
      {children}
    </li>
  )
}

/** Öne çıkanlar + ekran turu (satın alma bölümünün hemen altında). */
export function MkShowcaseTour() {
  return (
    <div className="bg-white">
      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {HIGHLIGHTS.map((h) => (
            <li key={h.title} className="flex flex-col gap-2 rounded-xl border border-[#DCEFE2] bg-[#F3FAF5] p-6 sm:p-7">
              <span className="whitespace-nowrap text-3xl font-extrabold tracking-tight text-[#14532D] sm:text-4xl">{h.big}</span>
              <span className="text-[17px] font-extrabold text-slate-950">{h.title}</span>
              <span className="text-[15px] leading-relaxed text-slate-600">{h.desc}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-16 px-4 pb-20 pt-20 sm:gap-24 sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
        {TOUR.map((t, index) => (
          <div
            key={t.title}
            className={'flex flex-col items-center gap-8 lg:gap-14 ' + (index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row')}
          >
            <div className="flex w-full flex-col gap-4 lg:w-[38%] lg:shrink-0">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#15803D]">{t.kicker}</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{t.title}</h2>
              <p className="text-base leading-relaxed text-slate-600 sm:text-[17px]">{t.desc}</p>
              <ul className="mt-1 flex flex-col gap-2.5">
                {t.points.map((p) => (
                  <CheckItem key={p}>{p}</CheckItem>
                ))}
              </ul>
            </div>
            <div className="w-full min-w-0 flex-1 rounded-xl bg-slate-100 p-3 sm:p-6">
              <img
                src={t.img}
                width={t.width}
                height={t.height}
                alt={`Müvekkil Kasa: ${t.title}`}
                loading="lazy"
                decoding="async"
                className={
                  'block h-auto rounded-lg border border-slate-200 shadow-[0_24px_48px_-28px_rgba(16,24,40,0.35)] ' +
                  (t.portrait ? 'mx-auto w-full max-w-[420px]' : 'w-full')
                }
              />
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

/** Mobil uygulama bölümü. */
export function MkShowcaseMobile() {
  return (
    <section className="bg-[#ECF7EF]">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:flex-row lg:gap-14 lg:px-8">
        <div className="flex w-full flex-col gap-4 lg:w-[40%] lg:shrink-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#15803D]">Mobil uygulama</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">Müvekkil Kasa artık cebinizde</h2>
          <p className="text-base leading-relaxed text-slate-600 sm:text-[17px]">
            Adliyede ya da yolda: bekleyen tahsilatları, geciken taksitleri ve müvekkil bakiyelerini telefonunuzdan
            görün. Web hesabınızla giriş yaparsınız.
          </p>
          <div className="mt-2">
            <BhStoreBadges googlePlayUrl={MK_GOOGLE_PLAY_URL} appStoreUrl={MK_APP_STORE_URL} appName="Müvekkil Kasa" />
          </div>
        </div>
        <div className="flex w-full flex-1 justify-center gap-3 sm:gap-5">
          {PHONES.map((p) => (
            <div
              key={p.img}
              className={
                'w-[31%] max-w-[200px] rounded-[22px] bg-slate-900 p-1.5 shadow-[0_30px_60px_-30px_rgba(16,24,40,0.6)] sm:rounded-[30px] sm:p-2 ' +
                p.offset
              }
            >
              <img
                src={p.img}
                width={600}
                height={1202}
                alt={p.alt}
                loading="lazy"
                decoding="async"
                className="block aspect-[9/16] h-auto w-full rounded-[17px] object-cover object-top sm:rounded-[23px]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Sayfa sonundaki ücretsiz deneme kutusu. */
export function MkShowcaseTrial() {
  const [demoOpen, setDemoOpen] = useState(false)
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="flex flex-col gap-6 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#1D6FD8] px-6 py-10 text-white sm:px-12 sm:py-14 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">7 gün boyunca ücretsiz deneyin</h2>
          <p className="mt-3 text-base leading-relaxed text-white/85 sm:text-lg">
            Web sürümünü kurulum yapmadan deneyin; demo hesabınızı lisansladığınızda verileriniz korunur.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDemoOpen(true)}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-white px-6 py-3 text-[15px] font-bold text-slate-950 transition hover:bg-slate-100 sm:w-auto lg:shrink-0"
        >
          Demo talep edin
        </button>
      </div>
      <MkSaasDemoRequestModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </section>
  )
}
