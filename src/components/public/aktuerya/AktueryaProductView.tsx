import { useEffect, useState } from 'react'
import { Check, ChevronDown, MessageCircle, Phone } from 'lucide-react'
import {
  AKTUERYA_AUDIENCE,
  AKTUERYA_FAQ,
  getDefaultAktueryaPageContent,
  type AktueryaPageContent,
} from '@/data/aktueryaProduct'
import {
  QUICK_CONTACT_PHONE_DISPLAY,
  QUICK_CONTACT_TEL_HREF,
} from '@/lib/quickContact'
import { cn } from '@/lib/cn'

/**
 * Aktüerya Hesaplama tanıtım sayfası (kurumsal tasarım; Bilirkişi Hesap ile aynı düzen).
 * Satış ve demo henüz kapalı: düğmeler "Çok yakında".
 * Görseller: public/images/aktuerya-*.webp
 */

const SHELL = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'
/** Aktüerya ürün rengi (logodaki lacivert) ve vurgu rengi (logodaki turuncu). */
const AKT_COLOR = '#13294B'
const AKT_ACCENT = '#F59E0B'
const WHATSAPP_HREF = 'https://wa.me/905323171755'

type HesapTuru = { title: string; text: string; tag?: 'Yeni' | 'Hazırlanıyor' }

const HESAP_TURLERI: HesapTuru[] = [
  {
    title: 'Trafik Kazası Yaralanma',
    text: 'Taraf bilgileri, kaza tarihi, kusur, maluliyet, gelir ve masraf girişleriyle yaralanma tazminatı.',
  },
  {
    title: 'Trafik Kazası Ölüm',
    text: 'Destekten yoksun kalma: hak sahipleri, destek ilişkileri, kusur ve önceki ödemeler.',
  },
  {
    title: 'İş Kazası Yaralanma',
    text: 'İşçi ücretleri, kusur, kaçınılmazlık, maluliyet, SGK gelirleri ve peşin sermaye değeri.',
    tag: 'Hazırlanıyor',
  },
  {
    title: 'İş Kazası Ölüm',
    text: 'Hak sahipleri, destek ilişkileri, işveren sorumluluğu, SGK ölüm gelirleri ve peşin sermaye değeri.',
    tag: 'Hazırlanıyor',
  },
  {
    title: 'SGK Rücu',
    text: "SGK'nın sigortalıya yaptığı ödemeler için sorumlulara rücu alacağının hesabı.",
    tag: 'Yeni',
  },
  {
    title: 'Denkleştirici Adalet',
    text: 'Geçmişte ödenmiş paranın dava tarihindeki alım gücü: döviz, altın, TÜFE, ÜFE, asgari ücret ve memur maaşı.',
    tag: 'Yeni',
  },
]

const TOUR = [
  {
    img: '/images/aktuerya-panel.webp',
    width: 1400,
    height: 775,
    kicker: 'Yönetim paneli',
    title: 'Tüm hesap türleri tek ekranda',
    desc: 'Panelden hesap türünü seçip başlayın; son çalışmalarınız, taslaklarınız ve tamamlanan hesaplarınız karşınızda.',
    points: ['Son çalışmalar ve taslaklar', 'Toplam ve tamamlanan hesap sayısı', 'Hızlı erişim kısayolları'],
  },
  {
    img: '/images/aktuerya-trafik-yaralanma.webp',
    width: 1400,
    height: 472,
    kicker: 'Trafik kazası yaralanma',
    title: 'Adım adım ilerleyen hesap',
    desc: 'Taraf bilgileri, hesaplama bilgileri, bakiye ömür ve dönem, kontrol ve sonuç: her adım ayrı ekranda, dosya özeti yanda.',
    points: ['Davacı ve davalı bilgileri', 'Sorumlu taraflar ve sigorta şirketleri', 'Taslak otomatik kaydedilir'],
  },
  {
    img: '/images/aktuerya-trafik-olum.webp',
    width: 1400,
    height: 693,
    kicker: 'Trafik kazası ölüm',
    title: 'Destekten yoksun kalma hesabı',
    desc: 'Müteveffa bilgilerinden hak sahiplerine, pay oranlarından sigorta ve önceki ödemelere kadar dokuz adımda.',
    points: ['Hak sahipleri ve pay oranları', 'Evlenme ihtimali ve eğitim gideri indirimi', 'Ölüm öncesi ve cenaze giderleri'],
  },
]

/* ---------------------------------------------------------------------------
 * Üst bölümdeki hareketli "dönem çizelgesi".
 * Kaza tarihinden bakiye ömür sonuna kadar dönemler sırayla dolar,
 * her dönemin tutarı belirir ve toplam tazminat sayarak artar. Örnek değerlerle gösterimdir.
 * ------------------------------------------------------------------------- */
const PERIODS = [
  { key: 'islemis', label: 'İşlemiş dönem', share: 18, color: '#60A5FA', amount: 214_380 },
  { key: 'aktif', label: 'Aktif dönem', share: 52, color: '#34D399', amount: 812_640 },
  { key: 'pasif', label: 'Pasif dönem', share: 30, color: AKT_ACCENT, amount: 257_630 },
] as const
const PERIOD_MARKS = ['Kaza tarihi', 'Hesap tarihi', 'Aktif dönem sonu', 'Bakiye ömür sonu']
const PERIOD_STEP_MS = 1300

function formatTl(value: number) {
  return `${new Intl.NumberFormat('tr-TR').format(value)} ₺`
}

function AktueryaPeriodAnimation() {
  // 0: boş, 1-3: dönemler sırayla dolar, 4-6: bekler, sonra baştan.
  const [phase, setPhase] = useState(3)
  const [total, setTotal] = useState(PERIODS.reduce((s, p) => s + p.amount, 0))

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    setPhase(0)
    const id = window.setInterval(() => setPhase((p) => (p >= 6 ? 0 : p + 1)), PERIOD_STEP_MS)
    return () => window.clearInterval(id)
  }, [])

  const filled = Math.min(phase, 3)
  const target = PERIODS.slice(0, filled).reduce((s, p) => s + p.amount, 0)

  // Toplam tazminat yeni değere doğru sayarak ilerler.
  useEffect(() => {
    const from = total
    if (from === target) return
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 700)
      setTotal(Math.round(from + (target - from) * (1 - (1 - p) ** 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  return (
    <figure className="mt-6 max-w-[640px] lg:mt-8" aria-label="Aktüerya dönem çizelgesi: dönemler sırayla hesaplanır, toplam tazminat oluşur">
      <div className="rounded-xl border border-white/15 bg-white/[0.06] p-4 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-bold text-white sm:text-sm">Dönem çizelgesi</span>
          <span className="flex items-baseline gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/55">Tazminat</span>
            <span className="text-lg font-extrabold tabular-nums text-white sm:text-xl">{formatTl(total)}</span>
          </span>
        </div>

        <div className="mt-4 flex h-4 w-full gap-1 overflow-hidden rounded-md bg-white/10 sm:h-5">
          {PERIODS.map((p, i) => (
            <span key={p.key} className="relative h-full" style={{ width: `${p.share}%` }}>
              <span
                className="absolute inset-y-0 left-0 rounded-[4px] transition-[width] duration-[900ms] ease-out motion-reduce:transition-none"
                style={{ width: i < filled ? '100%' : '0%', backgroundColor: p.color }}
              />
            </span>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-white/55 sm:text-[11px]">
          {PERIOD_MARKS.map((m) => (
            <span key={m} className="max-w-[24%] leading-tight last:text-right">
              {m}
            </span>
          ))}
        </div>

        <ul className="mt-4 grid gap-2 sm:grid-cols-3">
          {PERIODS.map((p, i) => (
            <li
              key={p.key}
              className={cn(
                'flex items-center justify-between gap-2 rounded-lg bg-white/[0.06] px-3 py-2 transition-opacity duration-500 sm:flex-col sm:items-start sm:gap-1',
                i < filled ? 'opacity-100' : 'opacity-35',
              )}
            >
              <span className="flex items-center gap-2 text-[12px] font-semibold text-white/80">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: p.color }} />
                {p.label}
              </span>
              <span className="text-[13px] font-bold tabular-nums text-white">{formatTl(p.amount)}</span>
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="mt-2 px-1 text-[11px] text-white/50">Örnek değerlerle gösterimdir.</figcaption>
    </figure>
  )
}

function SoonBadge({ store }: { store: 'Google Play' | 'App Store' }) {
  return (
    <span className="inline-flex h-[52px] items-center gap-2.5 rounded-lg border border-dashed border-slate-400 px-[18px] text-slate-600">
      <span className="flex flex-col leading-tight">
        <span className="text-[10px] tracking-wide">ÇOK YAKINDA</span>
        <span className="text-base font-bold">{store}</span>
      </span>
    </span>
  )
}

/** Tanıtım sayfası görünümü: sepet, ödeme ve demo isteği yok; düğmeler "Çok yakında". */
export function AktueryaProductView({ content }: { content?: AktueryaPageContent }) {
  const page = content ?? getDefaultAktueryaPageContent()
  const [openFaq, setOpenFaq] = useState<string | null>(AKTUERYA_FAQ[0]?.question ?? null)

  const highlights = [
    { big: '6', title: 'Hesap türü', desc: 'Trafik ve iş kazası, SGK rücu ve denkleştirici adalet tek platformda.' },
    { big: 'Adım adım', title: 'Yönlendirmeli giriş', desc: 'Her hesap türü kendi adımlarıyla ilerler; dosya özeti hep yanda.' },
    { big: 'Taslak', title: 'Otomatik kayıt', desc: 'Yarım kalan hesap taslak olarak saklanır, kaldığınız yerden devam edin.' },
    { big: `${page.demoDays} gün`, title: 'Ücretsiz deneme', desc: `${page.demoCredits} hesap kredisiyle deneme planlanıyor.` },
  ]

  return (
    <div className="overflow-x-clip bg-white text-slate-800">
      {/* Üst bölüm */}
      <section className="relative overflow-hidden text-white" style={{ backgroundColor: AKT_COLOR }}>
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full border-[72px] opacity-20"
          style={{ borderColor: AKT_ACCENT }}
        />
        <div className={`relative ${SHELL} pb-12 pt-6 lg:pb-16 lg:pt-8`}>
          <nav aria-label="Konum" className="flex flex-wrap gap-2 text-sm text-white/60">
            <a href="/" className="hover:text-white">
              Ana Sayfa
            </a>
            <span aria-hidden>/</span>
            <a href="/yazilimlar" className="hover:text-white">
              Yazılımlar
            </a>
            <span aria-hidden>/</span>
            <span className="text-amber-300">{page.heroTitle}</span>
          </nav>
          <div className="mt-4 grid gap-8 sm:mt-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center lg:gap-10">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-amber-300 sm:text-xs">
                Hukuk · Aktüeryal tazminat hesabı
              </p>
              <h1 className="mt-2 max-w-4xl text-[28px] font-extrabold leading-tight tracking-tight sm:mt-4 sm:text-5xl lg:leading-[1.04]">
                {page.heroTitle}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/75 sm:mt-4 sm:text-lg">{page.heroLead}</p>
              <AktueryaPeriodAnimation />
            </div>

            <aside className="rounded-xl bg-white p-6 text-slate-950 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)] sm:p-7">
              <span className="inline-flex rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">Çok yakında</span>
              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">Satışa açılmak üzere</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                Aktüerya Hesaplama çok yakında satışta. Fiyat ve deneme hesabı için bize şimdiden ulaşabilirsiniz.
              </p>
              <ul className="mt-5 flex flex-col gap-2.5">
                {[`${page.demoDays} gün ücretsiz deneme`, `${page.demoCredits} hesap kredisi`, 'Kayıtlı çalışmalar hesabınızda'].map((t) => (
                  <li key={t} className="flex gap-2.5 text-[15px] text-slate-700">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-[#16A34A]" strokeWidth={3} aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-12 cursor-not-allowed items-center justify-center rounded-lg bg-slate-200 px-5 text-[15px] font-bold text-slate-500"
                >
                  Satın al · Çok yakında
                </button>
                <a
                  href={QUICK_CONTACT_TEL_HREF}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 text-[15px] font-bold text-slate-900 transition hover:bg-slate-50"
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  Bizi arayın: {QUICK_CONTACT_PHONE_DISPLAY}
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Öne çıkanlar */}
      <section className={`${SHELL} pt-16 sm:pt-24`}>
        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {highlights.map((h) => (
            <li key={h.title} className="flex flex-col gap-2 rounded-xl border border-[#FDE7C2] bg-[#FFF8EB] p-6 sm:p-7">
              <span className="whitespace-nowrap text-3xl font-extrabold tracking-tight text-[#13294B] sm:text-4xl">{h.big}</span>
              <span className="text-[17px] font-extrabold text-slate-950">{h.title}</span>
              <span className="text-[15px] leading-relaxed text-slate-600">{h.desc}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Ekran turu */}
      {page.sections.gallery ? (
        <section className={`${SHELL} flex flex-col gap-16 pt-20 sm:gap-24 sm:pt-28`}>
          {TOUR.map((t, index) => (
            <div
              key={t.title}
              className={'flex flex-col items-center gap-8 lg:gap-14 ' + (index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row')}
            >
              <div className="flex w-full flex-col gap-4 lg:w-[38%] lg:shrink-0">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-700">{t.kicker}</p>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{t.title}</h2>
                <p className="text-base leading-relaxed text-slate-600 sm:text-[17px]">{t.desc}</p>
                <ul className="mt-1 flex flex-col gap-2.5">
                  {t.points.map((p) => (
                    <li key={p} className="flex gap-2.5 text-[15px] leading-relaxed text-slate-700">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-[#16A34A]" strokeWidth={3} aria-hidden />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full min-w-0 flex-1 rounded-xl bg-slate-100 p-3 sm:p-6">
                <img
                  src={t.img}
                  width={t.width}
                  height={t.height}
                  alt={`Aktüerya Hesaplama: ${t.title}`}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full rounded-lg border border-slate-200 shadow-[0_24px_48px_-28px_rgba(16,24,40,0.35)]"
                />
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {/* Hesap türleri */}
      {page.sections.modules ? (
        <section className={`${SHELL} pt-20 sm:pt-28`} aria-labelledby="aktuerya-moduller">
          <div className="mb-8 flex flex-col gap-3 sm:mb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
            <h2 id="aktuerya-moduller" className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Hesap türleri
            </h2>
            <p className="max-w-md text-base leading-relaxed text-slate-600 sm:text-lg lg:text-right">
              Trafik ve iş kazası dosyalarından SGK rücu ve denkleştirici adalete kadar.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {HESAP_TURLERI.map((h) => (
              <li key={h.title} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-6">
                <span className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[17px] font-extrabold text-slate-950">{h.title}</h3>
                  {h.tag ? (
                    <span
                      className={cn(
                        'rounded-md px-2 py-0.5 text-[11px] font-bold',
                        h.tag === 'Yeni' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600',
                      )}
                    >
                      {h.tag}
                    </span>
                  ) : null}
                </span>
                <p className="text-[15px] leading-relaxed text-slate-600">{h.text}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Kimler için */}
      {page.sections.audience ? (
        <section className={`${SHELL} pt-20 sm:pt-28`} aria-labelledby="aktuerya-kimler">
          <h2 id="aktuerya-kimler" className="mb-8 text-3xl font-extrabold tracking-tight text-slate-950 sm:mb-10 sm:text-4xl lg:text-5xl">
            Kimler için?
          </h2>
          <ol className="grid gap-3 sm:gap-4 md:grid-cols-3">
            {AKTUERYA_AUDIENCE.map((item, index) => (
              <li key={item.title} className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
                <span aria-hidden className="text-4xl font-extrabold tracking-tight text-slate-300">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-xl font-extrabold text-slate-950">{item.title}</span>
                <span className="text-[15px] leading-relaxed text-slate-600">{item.text}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* Mobil uygulama */}
      {page.sections.mobile ? (
        <section className="mt-20 bg-[#FFF8EB] sm:mt-28" aria-labelledby="aktuerya-mobil">
          <div className={`${SHELL} flex flex-col gap-6 py-14 sm:py-16 lg:flex-row lg:items-center lg:justify-between`}>
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-700">Mobil uygulama</p>
              <h2 id="aktuerya-mobil" className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                {page.mobileTitle}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">{page.mobileText}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <SoonBadge store="Google Play" />
              <SoonBadge store="App Store" />
            </div>
          </div>
        </section>
      ) : null}

      {/* Sık sorulan sorular */}
      {page.sections.faq ? (
        <section className={`${SHELL} flex flex-col gap-8 pt-20 sm:pt-28 lg:flex-row lg:gap-14`} aria-labelledby="aktuerya-sss">
          <div className="lg:w-1/3 lg:shrink-0">
            <h2 id="aktuerya-sss" className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Sık sorulan sorular
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Başka bir sorunuz varsa WhatsApp'tan yazabilir ya da bizi arayabilirsiniz.
            </p>
          </div>
          <div className="flex-1 border-t border-slate-200">
            {AKTUERYA_FAQ.map((item) => {
              const open = openFaq === item.question
              return (
                <div key={item.question} className="border-b border-slate-200 py-5">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 text-left text-[17px] font-bold text-slate-950"
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? null : item.question)}
                  >
                    {item.question}
                    <ChevronDown className={cn('h-5 w-5 shrink-0 text-slate-400 transition', open && 'rotate-180')} aria-hidden />
                  </button>
                  {open ? <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{item.answer}</p> : null}
                </div>
              )
            })}
          </div>
        </section>
      ) : null}

      {/* Kapanış */}
      {page.sections.closing ? (
        <section className={`${SHELL} py-20 sm:py-28`} aria-labelledby="aktuerya-kapanis">
          <div className="flex flex-col gap-6 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#1D6FD8] px-6 py-10 text-white sm:px-12 sm:py-14 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 id="aktuerya-kapanis" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Aktüerya Hesaplama çok yakında
              </h2>
              <p className="mt-3 text-base leading-relaxed text-white/85 sm:text-lg">
                Satışa açıldığında ilk siz haberdar olun; fiyat ve deneme için bize ulaşın.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
              <a
                href={QUICK_CONTACT_TEL_HREF}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-[15px] font-bold text-slate-950 transition hover:bg-slate-100"
              >
                <Phone className="h-4 w-4" aria-hidden />
                Bizi arayın
              </a>
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/50 px-6 text-[15px] font-bold text-white transition hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp'tan yazın
              </a>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
