import { useEffect, useState } from 'react'
import { AlertTriangle, Check, ChevronDown, KeyRound, Lock, LockOpen } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Woontegra Şifre Kasası ürün sayfasının tanıtım bölümleri (Bilirkişi Hesap ile aynı düzen).
 * Görsel: public/images/woontegra-sifre-kasasi-ekran.png ve ürünün kapak görseli.
 */

export const SIFRE_KASASI_SLUG = 'sifre-kasasi'

/* ---------------------------------------------------------------------------
 * Üst bölümdeki hareketli "kasaya kilitleme" kartı.
 * Sırayla bir kaydın şifresi yazılır, harfler karışıp noktalara dönüşür ve kilit kapanır.
 * Örnek kayıtlarla gösterimdir. "Hareketi azalt" tercihinde kart sabit kalır.
 * ------------------------------------------------------------------------- */
const VAULT_ROWS = [
  { cat: 'Mail', title: 'Büro e-postası', user: 'info@ornekhukuk.com', pass: 'Yaz!2026kasa' },
  { cat: 'Ödeme', title: 'Banka internet şubesi', user: 'ornek.kullanici', pass: 'Dt7#mPq9xL' },
  { cat: 'Sunucu', title: 'Web sitesi paneli', user: 'admin', pass: 'Gz4$wR8!nB' },
]
const SCRAMBLE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!#$%&*?'
const TYPE_MS = 85
const SCRAMBLE_STEPS = 7
const SCRAMBLE_MS = 70
const HOLD_MS = 1500

type Phase = 'type' | 'scramble' | 'locked'

function scrambled(length: number) {
  let out = ''
  for (let i = 0; i < length; i += 1) out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
  return out
}

function strength(count: number, total: number) {
  return Math.round((count / total) * 100)
}

export function SifreVaultAnimation() {
  const [active, setActive] = useState(0)
  const [phase, setPhase] = useState<Phase>('locked')
  const [count, setCount] = useState(0)
  const [step, setStep] = useState(0)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    setRunning(true)
    setPhase('type')
    setCount(0)
  }, [])

  useEffect(() => {
    if (!running) return
    const row = VAULT_ROWS[active]!
    let id = 0
    if (phase === 'type') {
      id = window.setTimeout(() => {
        if (count < row.pass.length) setCount(count + 1)
        else {
          setPhase('scramble')
          setStep(0)
        }
      }, count < row.pass.length ? TYPE_MS : 500)
    } else if (phase === 'scramble') {
      id = window.setTimeout(() => {
        if (step < SCRAMBLE_STEPS) setStep(step + 1)
        else setPhase('locked')
      }, SCRAMBLE_MS)
    } else {
      id = window.setTimeout(() => {
        setActive((active + 1) % VAULT_ROWS.length)
        setPhase('type')
        setCount(0)
      }, HOLD_MS)
    }
    return () => window.clearTimeout(id)
  }, [running, phase, count, step, active])

  return (
    <figure className="mt-6 max-w-[640px] lg:mt-8" aria-label="Şifre Kasası: girilen şifre bilgisayarınızda şifrelenerek saklanır">
      <div className="rounded-xl border border-white/15 bg-white/[0.06] p-3 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <span className="flex items-center gap-2 text-[13px] font-bold text-white sm:text-sm">
            <KeyRound className="h-4 w-4 text-emerald-300" aria-hidden />
            Şifre Kasası
          </span>
          <span className="text-[11px] text-white/55">Otomatik kilit: 10 dk</span>
        </div>
        <ul className="flex flex-col gap-2">
          {VAULT_ROWS.map((row, i) => {
            const isActive = running && i === active
            const isOpen = isActive && phase !== 'locked'
            let shown: string
            if (isActive && phase === 'type') shown = row.pass.slice(0, count)
            else if (isActive && phase === 'scramble') shown = scrambled(row.pass.length)
            else shown = '•'.repeat(row.pass.length)
            const pct = isActive && phase === 'type' ? strength(count, row.pass.length) : 100
            return (
              <li
                key={row.title}
                className={cn(
                  'rounded-lg px-3 py-2.5 transition-colors duration-300 sm:px-4',
                  isOpen ? 'bg-white/[0.12] ring-1 ring-emerald-300/40' : 'bg-white/[0.05]',
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="hidden w-16 shrink-0 rounded-md bg-white/10 px-2 py-1 text-center text-[11px] font-semibold text-white/75 sm:block">
                    {row.cat}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[13px] font-semibold text-white sm:text-sm">{row.title}</span>
                    <span className="truncate text-[11px] text-white/55 sm:text-xs">{row.user}</span>
                  </span>
                  <span
                    className={cn(
                      'min-w-[7.5rem] truncate rounded-md bg-black/25 px-2.5 py-1.5 text-right font-mono text-[13px] tracking-wider sm:min-w-[9rem]',
                      isOpen ? 'text-emerald-200' : 'text-white/70',
                    )}
                  >
                    {shown || ' '}
                    {isActive && phase === 'type' ? <span className="ml-0.5 animate-pulse text-white">|</span> : null}
                  </span>
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors duration-300',
                      isOpen ? 'bg-amber-400/15 text-amber-300' : 'bg-emerald-400/15 text-emerald-300',
                    )}
                  >
                    {isOpen ? <LockOpen className="h-4 w-4" aria-hidden /> : <Lock className="h-4 w-4" aria-hidden />}
                  </span>
                </div>
                {isActive && phase === 'type' ? (
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-white/55">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <span
                        className="block h-full rounded-full bg-emerald-400 transition-[width] duration-150"
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                    Şifre gücü
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
        <p className="mt-3 flex items-center gap-2 px-1 text-[12px] text-white/70">
          <Lock className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
          Bilgisayarınızda şifreli saklanır · Sunucuya gönderilmez
        </p>
      </div>
      <figcaption className="mt-2 px-1 text-[11px] text-white/50">Örnek kayıtlarla gösterimdir.</figcaption>
    </figure>
  )
}

const HIGHLIGHTS = [
  { big: 'Ücretsiz', title: 'Tamamen ücretsiz', desc: 'İndirip hemen kullanmaya başlayın.' },
  { big: 'Yerel', title: 'Veriler sizde', desc: 'Kayıtlar bilgisayarınızda saklanır; Woontegra sunucularına gönderilmez.' },
  { big: 'Şifreli', title: 'Ana şifreyle kilitli', desc: 'Kasa ana şifrenizle şifrelenir ve belirlediğiniz sürede kendiliğinden kilitlenir.' },
  { big: '2 sürüm', title: 'Kurulumlu ve portable', desc: 'İsterseniz bilgisayara kurun, isterseniz kurulum yapmadan çalıştırın.' },
]

const FEATURES = [
  { title: 'Giriş bilgileri', text: 'Giriş adresi, kullanıcı adı, şifre ve not saklama.' },
  { title: 'Şifreli kasa', text: 'Tüm kayıtlar ana şifrenizle şifrelenir.' },
  { title: 'Şifreli yedek', text: 'Kasanın şifreli yedeğini alın, gerektiğinde geri yükleyin.' },
  { title: 'Excel’e aktarma', text: 'Güvenli Excel ve tam Excel dışa aktarım.' },
  { title: 'Kategoriler', text: 'Kayıtlarınızı kategori ve klasörlerle düzenleyin.' },
  { title: 'Şifre üretici', text: 'Güçlü şifre üretin, şifre gücünü anında görün.' },
  { title: 'Otomatik kilitleme', text: 'Bilgisayar başından kalktığınızda kasa kendiliğinden kilitlenir.' },
  { title: 'Hızlı arama', text: 'Başlık, adres, kullanıcı adı veya nota göre arayın.' },
]

const FAQ = [
  { q: 'Şifre Kasası gerçekten ücretsiz mi?', a: 'Evet. Woontegra Şifre Kasası ücretsizdir; indirip hemen kullanabilirsiniz.' },
  {
    q: 'Şifrelerim nerede saklanır?',
    a: 'Kayıtlarınız yalnızca kendi bilgisayarınızda, ana şifrenizle şifrelenmiş olarak saklanır. Woontegra sunucularına gönderilmez.',
  },
  {
    q: 'Ana şifremi unutursam ne olur?',
    a: 'Ana şifre unutulursa kayıtlar kurtarılamaz. Ana şifrenizi güvenli bir yerde not edin ve düzenli olarak şifreli yedek alın.',
  },
  {
    q: 'Kurulumlu ve portable sürüm arasındaki fark nedir?',
    a: 'Kurulumlu sürüm bilgisayarınıza kurulur. Portable sürüm kurulum yapmadan doğrudan çalıştırılır.',
  },
  { q: 'Hangi işletim sistemlerinde çalışır?', a: 'Şifre Kasası Windows bilgisayarlarda çalışır.' },
]

function CheckItem({ children }: { children: string }) {
  return (
    <li className="flex gap-2.5 text-[15px] leading-relaxed text-slate-700">
      <Check className="mt-1 h-4 w-4 shrink-0 text-[#16A34A]" strokeWidth={3} aria-hidden />
      {children}
    </li>
  )
}

export function SifreKasasiShowcase({ coverImage }: { coverImage?: string | null }) {
  const tour = [
    ...(coverImage
      ? [
          {
            img: coverImage,
            kicker: 'Kayıtlar',
            title: 'Tüm giriş bilgileriniz tek kasada',
            desc: 'Giriş adresi, kullanıcı adı, şifre ve notlarınızı saklayın; aradığınız kaydı saniyeler içinde bulun.',
            points: ['Başlık, adres, kullanıcı adı veya nota göre arama', 'Şifre üretici ve şifre gücü göstergesi', 'Otomatik kilitleme'],
          },
        ]
      : []),
    {
      img: '/images/woontegra-sifre-kasasi-ekran.png',
      kicker: 'Kategoriler',
      title: 'Kategorilerle düzenli bir kasa',
      desc: 'Sunucu, domain, pazaryeri, ödeme, mail, proje ve müşteri kategorileri hazır gelir; dilediğiniz kadar yenisini ekleyin.',
      points: ['Yeni kayıt, dışa aktarma ve yedekleme tek tıkla', 'Güvenli Excel ve tam Excel dışa aktarım', 'Şifreli yedek alma ve geri yükleme'],
    },
  ]
  const [openFaq, setOpenFaq] = useState<string | null>(FAQ[0]!.q)

  return (
    <div className="bg-white">
      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {HIGHLIGHTS.map((h) => (
            <li key={h.title} className="flex flex-col gap-2 rounded-xl border border-[#DCEFE2] bg-[#F3FAF5] p-6 sm:p-7">
              <span className="whitespace-nowrap text-3xl font-extrabold tracking-tight text-[#101828] sm:text-4xl">{h.big}</span>
              <span className="text-[17px] font-extrabold text-slate-950">{h.title}</span>
              <span className="text-[15px] leading-relaxed text-slate-600">{h.desc}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-16 px-4 pt-20 sm:gap-24 sm:px-6 sm:pt-28 lg:px-8">
        {tour.map((t, index) => (
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
                alt={`Woontegra Şifre Kasası: ${t.title}`}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full rounded-lg border border-slate-200 shadow-[0_24px_48px_-28px_rgba(16,24,40,0.35)]"
              />
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 sm:pt-28 lg:px-8">
        <h2 className="mb-8 text-3xl font-extrabold tracking-tight text-slate-950 sm:mb-10 sm:text-4xl lg:text-5xl">
          Öne çıkan özellikler
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <li key={f.title} className="flex flex-col gap-1.5 rounded-xl border border-slate-200 bg-white p-6">
              <span className="text-[17px] font-extrabold text-slate-950">{f.title}</span>
              <span className="text-[15px] leading-relaxed text-slate-600">{f.text}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" aria-hidden />
          <div>
            <p className="text-[17px] font-extrabold text-slate-950">Ana şifrenizi unutmayın</p>
            <p className="mt-1 text-[15px] leading-relaxed text-slate-700">
              Ana şifre unutulursa kayıtlar kurtarılamaz. Ana şifrenizi güvenli bir yerde not edin ve düzenli olarak şifreli yedek alın.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-20 sm:px-6 sm:pt-28 lg:flex-row lg:gap-14 lg:px-8">
        <div className="lg:w-1/3 lg:shrink-0">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">Sık sorulan sorular</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Başka bir sorunuz varsa WhatsApp'tan yazabilir ya da bizi arayabilirsiniz.
          </p>
        </div>
        <div className="flex-1 border-t border-slate-200">
          {FAQ.map((f) => {
            const open = openFaq === f.q
            return (
              <div key={f.q} className="border-b border-slate-200 py-5">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 text-left text-[17px] font-bold text-slate-950"
                  aria-expanded={open}
                  onClick={() => setOpenFaq(open ? null : f.q)}
                >
                  {f.q}
                  <ChevronDown className={cn('h-5 w-5 shrink-0 text-slate-400 transition', open && 'rotate-180')} aria-hidden />
                </button>
                {open ? <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{f.a}</p> : null}
              </div>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="flex flex-col gap-6 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#1D6FD8] px-6 py-10 text-white sm:px-12 sm:py-14 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Şifrelerinizi bugün düzene koyun</h2>
            <p className="mt-3 text-base leading-relaxed text-white/85 sm:text-lg">
              Ücretsiz indirin; kayıtlarınız kendi bilgisayarınızda, şifreli olarak kalsın.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-white px-6 py-3 text-[15px] font-bold text-slate-950 transition hover:bg-slate-100 sm:w-auto lg:shrink-0"
          >
            Ücretsiz indirin
          </button>
        </div>
      </section>
    </div>
  )
}
