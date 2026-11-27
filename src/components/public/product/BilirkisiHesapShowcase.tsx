import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Calculator,
  CalendarDays,
  CalendarX,
  Check,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Scale,
  Smartphone,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { BilirkisiDemoRequestModal } from '@/components/public/product/BilirkisiDemoRequestModal'
import { BUILDER_MENU_BH_MODULES } from '@/builder/data/bhModuleBuilderMenu'

/**
 * Bilirkişi Hesap ürün sayfasının tanıtım bölümleri (kurumsal tasarım, Yön C).
 * Görseller: public/images/bilirkisi-hesap-*.webp
 * App Store onaylanınca BH_APP_STORE_URL'ye linki yazmak yeterlidir.
 */
export const BH_GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.woontegra.bilirkisihesap&hl=tr'
export const BH_APP_STORE_URL = ''

function GooglePlayIcon() {
  return (
    <svg viewBox="0 0 16 18" className="h-[22px] w-5 shrink-0" aria-hidden>
      <path fill="#4285F4" d="M.6 1.1C.3 1.5.1 2 .1 2.6v12.8c0 .6.2 1.1.5 1.5l.1.1 7.2-7.2v-.2L.7 1z" />
      <path fill="#34A853" d="m11.4 11.6-3.5-3.5v-.2l3.5-3.5.1.1 4.1 2.3c1.2.7 1.2 1.8 0 2.5l-4.1 2.3z" />
      <path fill="#FBBC04" d="M11.5 11.5 8 8 .7 15.3c.4.4 1 .5 1.6.1l9.2-3.9z" />
      <path fill="#EA4335" d="M11.5 4.5 2.3.6C1.7.2 1.1.3.7 1.1L8 8z" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 18 22" className="h-[22px] w-[18px] shrink-0" aria-hidden>
      <path
        fill="currentColor"
        d="M14.7 11.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.5.8s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.3 2.9 2.3 1.1 0 1.6-.7 3-.7s1.8.7 3 .7 2-.1 2.7-2.2c.8-1.2 1.2-2.4 1.2-2.5-.1 0-2.3-.9-2.3-3.9zM12.4 4.8c.6-.8 1.1-1.8.9-2.9-1 .1-2.1.6-2.8 1.4-.6.7-1.1 1.8-1 2.8 1.1.1 2.1-.5 2.9-1.3z"
      />
    </svg>
  )
}

const HERO_FACTS = ['50+ hesaplama modülü', 'Word, PDF ve UDF olarak kaydetme', 'Web ve mobil uygulama', 'Canlı destek']

/** Ürün üst bölümünde rozetlerin altındaki kısa bilgiler (lacivert zemin). */
export function BhHeroFacts() {
  return (
    <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {HERO_FACTS.map((fact) => (
        <li key={fact} className="flex items-center gap-2.5 text-[15px] font-medium text-white/90">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/10">
            <Check className="h-3.5 w-3.5 text-emerald-300" strokeWidth={3} aria-hidden />
          </span>
          {fact}
        </li>
      ))}
    </ul>
  )
}

/** Mağaza rozetleri. `dark`: lacivert zemin üzerinde (ürün üst bölümü). */
export function BhStoreBadges({ dark = false }: { dark?: boolean }) {
  const soonClass = dark
    ? 'border border-dashed border-white/30 bg-white/[0.06] text-white/75'
    : 'border border-dashed border-slate-400 text-slate-600'
  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={BH_GOOGLE_PLAY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={
          'inline-flex h-[52px] items-center gap-2.5 rounded-lg bg-black px-[18px] text-white transition hover:bg-slate-900' +
          (dark ? ' border border-white/25' : '')
        }
        aria-label="Bilirkişi Hesap uygulamasını Google Play'den indirin"
      >
        <GooglePlayIcon />
        <span className="flex flex-col leading-tight">
          <span className="text-[10px] tracking-wide text-white/75">ŞİMDİ İNDİRİN</span>
          <span className="text-base font-bold">Google Play</span>
        </span>
      </a>
      {BH_APP_STORE_URL ? (
        <a
          href={BH_APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={
            'inline-flex h-[52px] items-center gap-2.5 rounded-lg bg-black px-[18px] text-white transition hover:bg-slate-900' +
            (dark ? ' border border-white/25' : '')
          }
          aria-label="Bilirkişi Hesap uygulamasını App Store'dan indirin"
        >
          <AppleIcon />
          <span className="flex flex-col leading-tight">
            <span className="text-[10px] tracking-wide text-white/75">ŞİMDİ İNDİRİN</span>
            <span className="text-base font-bold">App Store</span>
          </span>
        </a>
      ) : (
        <span className={'inline-flex h-[52px] items-center gap-2.5 rounded-lg px-[18px] ' + soonClass}>
          <AppleIcon />
          <span className="flex flex-col leading-tight">
            <span className="text-[10px] tracking-wide">ÇOK YAKINDA</span>
            <span className="text-base font-bold">App Store</span>
          </span>
        </span>
      )}
    </div>
  )
}

const HIGHLIGHTS = [
  {
    big: '50+',
    title: 'Hesaplama modülü',
    desc: 'Kıdem, ihbar, fazla mesai, yıllık izin, UBGT, kötü niyet, işe başlatmama ve çok daha fazlası tek programda.',
  },
  {
    big: '3 format',
    title: 'Word, PDF ve UDF',
    desc: "Hesaplamanızı Word, PDF veya UYAP'a uygun UDF biçiminde kaydedin.",
  },
  {
    big: 'Yedekle',
    title: 'Kayıtlar sizde',
    desc: 'Kaydettiğiniz hesaplamaları bilgisayarınıza indirin, istediğiniz zaman geri yükleyin.',
  },
  {
    big: 'Canlı destek',
    title: 'Yanınızdayız',
    desc: 'Programın içinden canlı destek, destek talebi ve eğitim videoları.',
  },
]

const TOUR = [
  {
    img: '/images/bilirkisi-hesap-fazla-mesai.webp',
    width: 1400,
    height: 1033,
    kicker: 'Fazla mesai',
    title: 'Her çalışma düzenine uygun hesap',
    desc: 'Fazla mesai tek tip hesaplanmaz. Bilirkişi Hesap, dosyadaki çalışma düzenine uygun hesaplama türünü seçmenizi sağlar; her tür kendi kurallarıyla çalışır.',
    points: [
      'Standart, tanıklı, haftalık karma ve dönemsel çalışma',
      '24 / 48 saat vardiya, gemi adamı, yeraltı ve ev işçileri',
      'PDF, Excel veya CSV puantaj belgesinden hesap',
    ],
  },
  {
    img: '/images/bilirkisi-hesap-hesaplama.webp',
    width: 1400,
    height: 1148,
    kicker: 'Hesaplama ekranı',
    title: 'Bilgileri girin, sonuç anında güncellensin',
    desc: 'Hesaplama ekranı adım adım ilerler. Siz bilgileri girdikçe sağdaki sonuç kutusu anında güncellenir.',
    points: [
      'Yıllık izin, rapor ve UBGT günlerinin düşülmesi',
      '270 saat düşümü, zamanaşımı ve hakkaniyet indirimi',
      'Hesabın yazılı açıklaması; Word, PDF ve UDF olarak kaydetme',
    ],
  },
  {
    img: '/images/bilirkisi-hesap-kayitlar.webp',
    width: 1400,
    height: 1149,
    kicker: 'Kayıtlar',
    title: 'Hesaplarınız kaybolmaz',
    desc: 'Yaptığınız her hesaplamayı adıyla kaydedin, sonra açıp düzenleyin ya da kopyalayarak yeni dosyada kullanın.',
    points: ['Ada veya hesaplama türüne göre arama', 'Tek tıkla kopyalama', 'Bilgisayarınıza yedekleme ve geri yükleme'],
  },
  {
    img: '/images/bilirkisi-hesap-panel.webp',
    width: 1400,
    height: 1150,
    kicker: 'Yönetim paneli',
    title: 'Kaldığınız yerden devam edin',
    desc: 'Panel açıldığında son çalıştığınız hesap, aylık hesaplama sayınız ve sık kullandığınız hesaplama türleri karşınızda.',
    points: ['Hızlı başlat kısayolları', 'Eğitim videoları', 'Canlı destek ve destek talebi'],
  },
]

const PHONES = [
  { img: '/images/bilirkisi-hesap-mobil-ana-sayfa.webp', width: 600, height: 1174, alt: 'Bilirkişi Hesap mobil uygulama ana ekranı', offset: 'sm:mt-10' },
  { img: '/images/bilirkisi-hesap-mobil-hesaplamalar.webp', width: 600, height: 1067, alt: 'Bilirkişi Hesap mobil uygulama hesaplamalar ekranı', offset: '' },
  { img: '/images/bilirkisi-hesap-mobil-kidem.webp', width: 600, height: 1067, alt: 'Bilirkişi Hesap mobil kıdem tazminatı hesabı', offset: 'sm:mt-10' },
]

const STEPS = [
  { title: 'Hesaplama türünü seçin', desc: 'Kıdem, ihbar, fazla mesai veya toplu hesaplama; dosyanıza uygun modülü seçin.' },
  { title: 'Bilgileri girin', desc: 'Tarihleri, ücreti ve düşülecek günleri girin. Sonuç siz yazdıkça güncellenir.' },
  {
    title: 'Kaydedin',
    desc: 'Hesabın yazılı açıklamasıyla birlikte Word, PDF veya UDF olarak kaydedin; hesabı daha sonra kullanmak üzere saklayın.',
  },
]

const FAQ = [
  { q: 'Satın almadan önce deneyebilir miyim?', a: 'Evet. 7 günlük ücretsiz deneme hesabı açabilirsiniz; kredi kartı istenmez.' },
  {
    q: 'Abonelik otomatik yenilenir mi?',
    a: 'Hayır. Abonelik otomatik yenilenmez ve kartınızdan otomatik ödeme alınmaz. Süre bitmeden e-postayla hatırlatma yapılır.',
  },
  {
    q: 'Mobil uygulama için ayrıca ödeme yapmam gerekir mi?',
    a: 'Hayır. Mobil uygulama aboneliğe dahildir; web hesabınızla giriş yaparsınız.',
  },
  {
    q: 'iPhone uygulaması ne zaman çıkacak?',
    a: 'iPhone uygulaması App Store onay sürecindedir. Onaylandığında bu sayfadan duyuracağız.',
  },
  {
    q: 'Hesaplamalarım nerede saklanır?',
    a: 'Kaydettiğiniz hesaplamalar hesabınızda saklanır; dilediğinizde bilgisayarınıza yedekleyip geri yükleyebilirsiniz.',
  },
]

function CheckItem({ children }: { children: string }) {
  return (
    <li className="flex gap-2.5 text-[15px] leading-relaxed text-slate-700">
      <Check className="mt-1 h-4 w-4 shrink-0 text-[#16A34A]" strokeWidth={3} aria-hidden />
      {children}
    </li>
  )
}

export function BilirkisiHesapShowcase() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <div className="bg-white">
      {/* Öne çıkanlar */}
      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {HIGHLIGHTS.map((h) => (
            <li key={h.title} className="flex flex-col gap-2 rounded-xl border border-[#E1E9F4] bg-[#F5F8FC] p-6 sm:p-7">
              <span className="whitespace-nowrap text-3xl font-extrabold tracking-tight text-[#0F2A4A] sm:text-4xl">{h.big}</span>
              <span className="text-[17px] font-extrabold text-slate-950">{h.title}</span>
              <span className="text-[15px] leading-relaxed text-slate-600">{h.desc}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Ekran turu */}
      <section className="mx-auto flex max-w-7xl flex-col gap-16 px-4 pt-20 sm:gap-24 sm:px-6 sm:pt-28 lg:px-8">
        {TOUR.map((t, index) => (
          <div
            key={t.title}
            className={
              'flex flex-col items-center gap-8 lg:gap-14 ' + (index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row')
            }
          >
            <div className="flex w-full flex-col gap-4 lg:w-[38%] lg:shrink-0">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#1D6FD8]">{t.kicker}</p>
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
                alt={`Bilirkişi Hesap: ${t.title}`}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full rounded-lg border border-slate-200 shadow-[0_24px_48px_-28px_rgba(16,24,40,0.35)]"
              />
            </div>
          </div>
        ))}
      </section>

      {/* Hesaplama modülleri */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 sm:pt-28 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">Hesaplama modülleri</h2>
          <p className="max-w-md text-base leading-relaxed text-slate-600 sm:text-right sm:text-lg">
            Bir modüle tıklayın, nasıl hesaplandığını adım adım anlatan rehberi okuyun.
          </p>
        </div>
        <ul className="flex flex-wrap gap-2.5 sm:gap-3">
          {BUILDER_MENU_BH_MODULES.map((m) => (
            <li key={m.slug}>
              <Link
                to={m.path}
                className="group inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-[15px] font-bold text-slate-900 transition hover:border-[#1D6FD8] hover:text-[#1D6FD8] sm:px-5 sm:py-3.5"
              >
                {m.title}
                <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#1D6FD8]" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Mobil uygulama */}
      <section className="mt-20 bg-[#EEF4FF] sm:mt-28">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:flex-row lg:gap-14 lg:px-8">
          <div className="flex w-full flex-col gap-4 lg:w-[40%] lg:shrink-0">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-700">Mobil uygulama</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Bilirkişi Hesap artık cebinizde
            </h2>
            <p className="text-base leading-relaxed text-slate-600 sm:text-[17px]">
              Duruşmada, dosya başında ya da yolda: hesaplamayı telefondan yapın, kayıtlı hesaplarınıza ulaşın. Web
              hesabınızla giriş yaparsınız.
            </p>
            <div className="mt-2">
              <BhStoreBadges />
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
                  width={p.width}
                  height={p.height}
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

      {/* Nasıl çalışır */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 sm:pt-28 lg:px-8">
        <h2 className="mb-8 text-3xl font-extrabold tracking-tight text-slate-950 sm:mb-10 sm:text-4xl lg:text-5xl">
          Nasıl çalışır?
        </h2>
        <ol className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {STEPS.map((s, index) => (
            <li key={s.title} className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
              <span aria-hidden className="text-4xl font-extrabold tracking-tight text-slate-300 sm:text-5xl">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-xl font-extrabold text-slate-950">{s.title}</span>
              <span className="text-[15px] leading-relaxed text-slate-600">{s.desc}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Sık sorulan sorular */}
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-20 sm:px-6 sm:pt-28 lg:flex-row lg:gap-14 lg:px-8">
        <div className="lg:w-1/3 lg:shrink-0">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">Sık sorulan sorular</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Başka bir sorunuz varsa WhatsApp'tan yazabilir ya da bizi arayabilirsiniz.
          </p>
        </div>
        <div className="flex-1 border-t border-slate-200">
          {FAQ.map((f) => (
            <details key={f.q} className="group border-b border-slate-200 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-bold text-slate-950 [&::-webkit-details-marker]:hidden">
                {f.q}
                <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" aria-hidden />
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Ücretsiz deneme */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="flex flex-col gap-6 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#1D6FD8] px-6 py-10 text-white sm:px-12 sm:py-14 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">7 gün boyunca ücretsiz deneyin</h2>
            <p className="mt-3 text-base leading-relaxed text-white/85 sm:text-lg">
              Kredi kartı gerekmez. Deneme sonunda ücretli aboneliğe otomatik geçilmez.
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
      </section>

      <BilirkisiDemoRequestModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Hesaplama akış şeması (ürün üst bölümü, lacivert zemin)
 * Solda girilen bilgiler → ortada Bilirkişi Hesap → sağda kaydetme seçenekleri.
 * Çizgilerdeki akış ve noktalar CSS/SVG ile hareket eder; "hareketi azalt" tercihinde durur.
 * ------------------------------------------------------------------------- */
type FlowNode = { label: string; Icon: LucideIcon; y: number }

const FLOW_INPUTS: FlowNode[] = [
  { label: 'İşe giriş ve çıkış tarihleri', Icon: CalendarDays, y: 52 },
  { label: 'Ücret ve ek ödemeler', Icon: Wallet, y: 132 },
  { label: 'İzin, rapor ve UBGT günleri', Icon: CalendarX, y: 212 },
  { label: 'Puantaj belgesi', Icon: FileSpreadsheet, y: 292 },
]

const FLOW_OUTPUTS: FlowNode[] = [
  { label: 'Word', Icon: FileText, y: 36 },
  { label: 'PDF', Icon: FileText, y: 104 },
  { label: 'UDF (UYAP)', Icon: Scale, y: 172 },
  { label: 'Kayıtlarım', Icon: FolderOpen, y: 240 },
  { label: 'Mobil uygulama', Icon: Smartphone, y: 308 },
]

const VB_W = 840
const VB_H = 344
const CORE = { x: 440, y: 172 }
const IN_X = 262
const OUT_X = 612

function inputPath(y: number) {
  return `M ${IN_X} ${y} C ${IN_X + 60} ${y}, ${CORE.x - 140} ${CORE.y}, ${CORE.x - 78} ${CORE.y}`
}

function outputPath(y: number) {
  return `M ${CORE.x + 78} ${CORE.y} C ${CORE.x + 140} ${CORE.y}, ${OUT_X - 60} ${y}, ${OUT_X} ${y}`
}

function FlowChip({ node, align }: { node: FlowNode; align: 'left' | 'right' }) {
  const { Icon } = node
  return (
    <div
      className="absolute flex -translate-y-1/2 items-center gap-2 rounded-lg border border-white/15 bg-[#13355e]/90 py-1.5 pl-1.5 pr-2.5 text-[13px] font-semibold text-white shadow-[0_12px_24px_-16px_rgba(0,0,0,0.8)] backdrop-blur"
      style={{
        top: `${(node.y / VB_H) * 100}%`,
        ...(align === 'left'
          ? { right: `${100 - (IN_X / VB_W) * 100}%` }
          : { left: `${(OUT_X / VB_W) * 100}%` }),
      }}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/10">
        <Icon className="h-3.5 w-3.5 text-sky-300" aria-hidden />
      </span>
      <span className="whitespace-nowrap">{node.label}</span>
    </div>
  )
}

export function BhFlowDiagram() {
  return (
    <figure className="mt-4 lg:mt-8" aria-label="Bilgileri girin, Bilirkişi Hesap hesaplasın, sonucu istediğiniz biçimde kaydedin">
      {/* Masaüstü: akış şeması */}
      <div className="relative hidden aspect-[840/344] w-full max-w-[840px] lg:block">
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <linearGradient id="bh-flow-out" x1="0" x2="1">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
          </defs>
          {FLOW_INPUTS.map((n) => (
            <g key={n.label}>
              <path d={inputPath(n.y)} fill="none" stroke="#60A5FA" strokeOpacity="0.18" strokeWidth="2" />
              <path d={inputPath(n.y)} fill="none" stroke="#60A5FA" strokeOpacity="0.75" strokeWidth="2" className="bh-flow-line" />
            </g>
          ))}
          {FLOW_OUTPUTS.map((n) => (
            <g key={n.label}>
              <path d={outputPath(n.y)} fill="none" stroke="#34D399" strokeOpacity="0.18" strokeWidth="2" />
              <path d={outputPath(n.y)} fill="none" stroke="url(#bh-flow-out)" strokeOpacity="0.85" strokeWidth="2" className="bh-flow-line" />
            </g>
          ))}
          {FLOW_INPUTS.map((n, i) => (
            <circle key={`dot-in-${n.label}`} r="4" fill="#93C5FD" className="bh-flow-dot">
              <animateMotion dur="2.4s" begin={`${i * 0.45}s`} repeatCount="indefinite" path={inputPath(n.y)} />
            </circle>
          ))}
          {FLOW_OUTPUTS.map((n, i) => (
            <circle key={`dot-out-${n.label}`} r="4" fill="#6EE7B7" className="bh-flow-dot">
              <animateMotion dur="2.4s" begin={`${1.2 + i * 0.4}s`} repeatCount="indefinite" path={outputPath(n.y)} />
            </circle>
          ))}
        </svg>

        {FLOW_INPUTS.map((n) => (
          <FlowChip key={n.label} node={n} align="left" />
        ))}
        {FLOW_OUTPUTS.map((n) => (
          <FlowChip key={n.label} node={n} align="right" />
        ))}

        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${(CORE.x / VB_W) * 100}%`, top: `${(CORE.y / VB_H) * 100}%` }}
        >
          <span aria-hidden className="bh-core-ring absolute inset-0 rounded-xl border-2 border-sky-400/60" />
          <span aria-hidden className="bh-core-ring absolute inset-0 rounded-xl border-2 border-emerald-400/50 [animation-delay:1.2s]" />
          <div className="relative flex h-32 w-[150px] flex-col items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#1D6FD8] text-white shadow-[0_30px_60px_-20px_rgba(29,111,216,0.7)]">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
              <Calculator className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-base font-extrabold">Bilirkişi Hesap</span>
            <span className="text-xs font-semibold text-white/80">50+ hesaplama modülü</span>
          </div>
        </div>
      </div>

      {/* Telefon ve tablet: dikey akış, her kutuya ayrı çizgi */}
      <BhFlowMobile />
    </figure>
  )
}

type Box = { l: number; r: number; t: number; b: number; cx: number; cy: number }
type MobilePaths = { ins: string[]; outs: string[] }

/** Telefon ve tablet: masaüstündeki yatay şemanın küçültülmüş hali; her kutuya ayrı çizgi. */
function BhFlowMobile() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const coreRef = useRef<HTMLDivElement>(null)
  const inRefs = useRef<(HTMLLIElement | null)[]>([])
  const outRefs = useRef<(HTMLLIElement | null)[]>([])
  const [paths, setPaths] = useState<MobilePaths | null>(null)

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const coreEl = coreRef.current
    if (!wrap || !coreEl) return

    const calc = () => {
      const wb = wrap.getBoundingClientRect()
      if (wb.width === 0) return
      const rel = (el: Element): Box => {
        const r = el.getBoundingClientRect()
        return {
          l: r.left - wb.left,
          r: r.right - wb.left,
          t: r.top - wb.top,
          b: r.bottom - wb.top,
          cx: (r.left + r.right) / 2 - wb.left,
          cy: (r.top + r.bottom) / 2 - wb.top,
        }
      }
      const core = rel(coreEl)
      const ins = inRefs.current.flatMap((el) => (el ? [rel(el)] : []))
      const outs = outRefs.current.flatMap((el) => (el ? [rel(el)] : []))
      if (!ins.length || !outs.length) return

      const inPaths = ins.map((c, i) => {
        const endY = core.cy + (i - (ins.length - 1) / 2) * 6
        const mx = (c.r + core.l) / 2
        return `M ${c.r} ${c.cy} C ${mx} ${c.cy}, ${mx} ${endY}, ${core.l} ${endY}`
      })
      const outPaths = outs.map((c, i) => {
        const startY = core.cy + (i - (outs.length - 1) / 2) * 6
        const mx = (core.r + c.l) / 2
        return `M ${core.r} ${startY} C ${mx} ${startY}, ${mx} ${c.cy}, ${c.l} ${c.cy}`
      })
      setPaths({ ins: inPaths, outs: outPaths })
    }

    calc()
    const ro = new ResizeObserver(calc)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [])

  const chipClass =
    'flex items-center gap-1.5 rounded-md border border-white/15 bg-[#143a66] px-2 py-1.5 text-[11px] font-semibold leading-tight text-white'

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto grid w-full max-w-xl grid-cols-[minmax(0,1fr)_auto_minmax(0,0.72fr)] items-center gap-x-6 sm:gap-x-12 lg:hidden"
    >
      {paths ? (
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          {paths.ins.map((d, i) => (
            <g key={`in-${d}`}>
              <path d={d} fill="none" stroke="#60A5FA" strokeOpacity="0.18" strokeWidth="1.5" />
              <path d={d} fill="none" stroke="#60A5FA" strokeOpacity="0.75" strokeWidth="1.5" className="bh-flow-line" />
              <circle r="2.5" fill="#93C5FD" className="bh-flow-dot">
                <animateMotion dur="2s" begin={`${i * 0.45}s`} repeatCount="indefinite" path={d} />
              </circle>
            </g>
          ))}
          {paths.outs.map((d, i) => (
            <g key={`out-${d}`}>
              <path d={d} fill="none" stroke="#34D399" strokeOpacity="0.18" strokeWidth="1.5" />
              <path d={d} fill="none" stroke="#34D399" strokeOpacity="0.8" strokeWidth="1.5" className="bh-flow-line" />
              <circle r="2.5" fill="#6EE7B7" className="bh-flow-dot">
                <animateMotion dur="2s" begin={`${1 + i * 0.4}s`} repeatCount="indefinite" path={d} />
              </circle>
            </g>
          ))}
        </svg>
      ) : null}

      <ul className="relative flex flex-col items-end gap-2">
        {FLOW_INPUTS.map(({ label, Icon }, i) => (
          <li
            key={label}
            ref={(el) => {
              inRefs.current[i] = el
            }}
            className={chipClass}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-sky-300" aria-hidden />
            <span>{label}</span>
          </li>
        ))}
      </ul>

      <div ref={coreRef} className="relative">
        <span aria-hidden className="bh-core-ring absolute inset-0 rounded-lg border-2 border-sky-400/60" />
        <span aria-hidden className="bh-core-ring absolute inset-0 rounded-lg border-2 border-emerald-400/50 [animation-delay:1.2s]" />
        <div className="relative flex w-[78px] flex-col items-center gap-1 rounded-lg bg-gradient-to-br from-[#16A34A] to-[#1D6FD8] px-1.5 py-3 text-center text-white shadow-[0_20px_40px_-18px_rgba(29,111,216,0.7)]">
          <Calculator className="h-5 w-5" aria-hidden />
          <span className="text-[12px] font-extrabold leading-tight">Bilirkişi Hesap</span>
          <span className="text-[9px] font-semibold leading-tight text-white/80">50+ hesaplama modülü</span>
        </div>
      </div>

      <ul className="relative flex flex-col items-start gap-2">
        {FLOW_OUTPUTS.map(({ label, Icon }, i) => (
          <li
            key={label}
            ref={(el) => {
              outRefs.current[i] = el
            }}
            className={chipClass}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-emerald-300" aria-hidden />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
