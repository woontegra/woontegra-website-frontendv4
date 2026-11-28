import { Fragment, useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Languages,
  LayoutDashboard,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Scale,
  Shield,
  X,
} from 'lucide-react'
import { Breadcrumbs } from '@/components/public/Breadcrumbs'
import {
  AVUKAT_PHONE_DISPLAY,
  AVUKAT_PHONE_HREF,
  AVUKAT_QUOTE_HREF,
  AVUKAT_SITELERI_NAME,
  AVUKAT_SITELERI_PATH,
  AVUKAT_SITELERI_SEO,
  AVUKAT_TEMALAR,
  AVUKAT_WHATSAPP_HREF,
} from '@/data/avukatSiteleriProduct'
import { usePageMeta } from '@/hooks/usePageMeta'
import { cn } from '@/lib/cn'

const SHELL = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'

type Cell = true | false | string

const COMPARE_ROWS: { group: string; rows: { label: string; b: Cell; p: Cell; k: Cell }[] }[] = [
  {
    group: 'Ödeme modeli',
    rows: [
      { label: 'Tek seferlik kurulum bedeli', b: true, p: true, k: true },
      { label: 'Yıllık hizmet bedeli (alan adı, sunucu, e-posta, destek)', b: true, p: true, k: true },
    ],
  },
  {
    group: 'Tasarım',
    rows: [
      { label: '10 profesyonel tema, tek tıkla tema değiştirme', b: true, p: true, k: true },
      { label: 'Telefon, tablet ve bilgisayara uyumlu tasarım', b: true, p: true, k: true },
      { label: 'Logo, renk ve sekme simgesi ayarı', b: true, p: true, k: true },
      { label: 'Hazır bölüm kütüphanesi, sürükle-bırak sıralama', b: true, p: true, k: true },
      { label: 'Kapakta kaydırmalı görseller (5 görsele kadar)', b: true, p: true, k: true },
      { label: 'Alt bilgi düzenleyici', b: true, p: true, k: true },
      { label: 'Harita bölümü ve yol tarifi', b: true, p: true, k: true },
      { label: 'Duyuru için açılır pencere', b: true, p: true, k: true },
    ],
  },
  {
    group: 'İçerik',
    rows: [
      { label: 'Makale sistemi (Word’den yapıştırma, kapak görseli)', b: true, p: true, k: true },
      { label: 'Ekip ve çalışma alanları sayfaları', b: true, p: true, k: true },
      { label: 'Sık sorulan sorular bölümü', b: true, p: true, k: true },
      { label: 'Video bölümü (KVKK uyumlu, tıklayınca yüklenir)', b: true, p: true, k: true },
      { label: 'Medya kütüphanesi', b: true, p: true, k: true },
      { label: 'Görsel depolama alanı', b: '5 GB', p: '10 GB', k: '20 GB' },
    ],
  },
  {
    group: 'KVKK ve meslek kuralları',
    rows: [
      { label: 'KVKK, gizlilik ve çerez politikası örnek metinleri', b: true, p: true, k: true },
      { label: 'Onay kutulu iletişim formu ve onay zamanı kaydı', b: true, p: true, k: true },
      { label: 'Çerez onay bandı (Kabul / Reddet / Ayarlar)', b: true, p: true, k: true },
      { label: 'Reklam yasağına uygun başlangıç içeriği', b: true, p: true, k: true },
      { label: 'Mesleki uyum ibaresi', b: true, p: true, k: true },
      { label: 'Gelen mesajları silme (KVKK)', b: true, p: true, k: true },
    ],
  },
  {
    group: 'İletişim ve e-posta',
    rows: [
      { label: 'Panelde gelen mesaj kutusu ve okunmamış uyarısı', b: true, p: true, k: true },
      { label: 'Yeni mesajda e-posta bildirimi (3 ek adrese kadar)', b: true, p: true, k: true },
      { label: 'Mesajlara panelden yanıt', b: true, p: true, k: true },
      { label: 'E-posta hesaplarını panelden açma ve yönetme', b: true, p: true, k: true },
      { label: 'Web’den, telefondan ve Outlook’tan e-posta erişimi', b: true, p: true, k: true },
      { label: 'Kurumsal e-posta hesabı', b: '1 hesap', p: '3 hesap', k: '5 hesap' },
      { label: 'Hesap başına e-posta kotası', b: '1 GB', p: '2 GB', k: '3 GB' },
    ],
  },
  {
    group: 'Google ve ziyaretçiler',
    rows: [
      { label: 'SSL sertifikası', b: true, p: true, k: true },
      { label: 'Otomatik site haritası ve robots.txt', b: true, p: true, k: true },
      { label: 'Google için hazır sayfa yapısı ve yapısal veri', b: true, p: true, k: true },
      { label: 'Sayfa başına Google başlığı ve açıklaması', b: true, p: true, k: true },
      { label: 'Search Console doğrulaması', b: true, p: true, k: true },
      { label: 'Adres değişince otomatik yönlendirme', b: true, p: true, k: true },
      { label: 'SEO puanı ve yapılacaklar listesi', b: false, p: true, k: true },
      { label: 'Makalelere özel Google başlığı ve açıklaması', b: false, p: true, k: true },
      { label: 'Google Analytics 4 ve Tag Manager', b: false, p: true, k: true },
      { label: 'Meta Piksel ve Conversions API', b: false, p: true, k: true },
      { label: 'Microsoft Clarity ve Yandex Metrica', b: false, p: true, k: true },
      { label: 'Form, telefon ve WhatsApp tıklama takibi', b: false, p: true, k: true },
      { label: 'Aylık trafik', b: '100 GB', p: '250 GB', k: 'Sınırsız' },
    ],
  },
  {
    group: 'Çoklu dil',
    rows: [
      { label: 'Türkçe, İngilizce ve Almanca site', b: false, p: true, k: true },
      { label: 'Hazır çeviriler ve ziyaretçi için dil seçici', b: false, p: true, k: true },
      { label: 'Makale çevirileri', b: false, p: true, k: true },
      { label: 'Her dil için ayrı Google ayarları', b: false, p: true, k: true },
    ],
  },
  {
    group: 'Ödeme',
    rows: [{ label: 'E-Tahsilat düğmesi (e-Barobirlik POS, Param)', b: false, p: false, k: true }],
  },
  {
    group: 'Hizmet ve destek',
    rows: [
      { label: 'Alan adı tescili ve yıllık yenilemesi', b: true, p: true, k: true },
      { label: 'Barındırma (sunucu)', b: true, p: true, k: true },
      { label: 'Günlük, haftalık ve aylık yedekleme', b: true, p: true, k: true },
      { label: '7/24 kesinti izleme', b: true, p: true, k: true },
      { label: 'Panelden destek talebi, hafta içi destek', b: true, p: true, k: true },
      { label: 'Yardım Merkezi ve “Bana göster” turları', b: true, p: true, k: true },
      { label: 'Alan adı', b: '1', p: '1', k: '1' },
    ],
  },
]

const FAQ = [
  {
    q: 'Alan adım yok, ne yapmalıyım?',
    a: 'Sizin adınıza alıp bağlıyoruz; yıllık yenilemesi hizmet bedeline dahildir. Alan adınız varsa mevcut adınızı bağlarız.',
  },
  {
    q: 'Kurulumdan sonra yıllık bir ödeme var mı?',
    a: 'Evet, yıllık hizmet bedeli alınır. Bu bedel alan adı yenilemesi, sunucu, SSL, kurumsal e-posta, yedekleme ve hafta içi teknik desteği kapsar. Yıllık hizmet bedeli ödenmezse site yayından kaldırılır.',
  },
  {
    q: 'Site KVKK’ya uygun mu?',
    a: 'Örnek metinler, onaylı iletişim formu ve çerez onay bandı hazırdır; metinleri kendi büronuza göre kontrol etmeniz gerekir.',
  },
  {
    q: 'Reklam yasağına takılır mıyım?',
    a: 'Başlangıç içeriği ölçülü yazıldı ve sakıncalı alanlar kapalı gelir. İçeriğin meslek kurallarına uygunluğu yine de avukatın sorumluluğundadır; panel sizi uyarır.',
  },
  {
    q: 'Siteyi kendim güncelleyebilir miyim?',
    a: 'Evet; metin, görsel, makale ve sayfaları panelden değiştirirsiniz; Yardım Merkezi ve “Bana göster” turları her adımı gösterir.',
  },
]

function CellValue({ value }: { value: Cell }) {
  if (value === true) return <Check className="mx-auto h-4 w-4 text-emerald-600" aria-label="Var" />
  if (value === false) return <span className="text-slate-400" aria-label="Yok">—</span>
  return <span className="text-sm font-medium text-slate-800">{value}</span>
}

function ContactButtons({ light = false }: { light?: boolean }) {
  const solid = light
    ? 'bg-white text-slate-950 hover:bg-slate-100'
    : 'bg-[#123b63] text-white hover:bg-[#0e2f50]'
  const outline = light
    ? 'border border-white/50 text-white hover:bg-white/10'
    : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
  return (
    <div className="flex flex-wrap gap-3">
      <a href={AVUKAT_PHONE_HREF} className={cn('inline-flex min-h-12 items-center gap-2 rounded-lg px-5 text-[15px] font-bold', solid)}>
        <Phone className="h-4 w-4" aria-hidden />
        Bizi arayın: {AVUKAT_PHONE_DISPLAY}
      </a>
      <a
        href={AVUKAT_WHATSAPP_HREF}
        target="_blank"
        rel="noreferrer"
        className={cn('inline-flex min-h-12 items-center gap-2 rounded-lg px-5 text-[15px] font-bold', outline)}
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        WhatsApp’tan yazın
      </a>
    </div>
  )
}

/** Avukat Siteleri ürün rengi (lacivert-mavi); ana sayfadaki seçiciyle aynı. */
const AVUKAT_HERO_COLOR = '#1E3A8A'
const THEME_STEP_MS = 3200

/**
 * Üst bölümdeki hareketli tema vitrini: bilgisayar ve telefon çerçevesinde
 * 10 tema sırayla, yumuşak geçişle gösterilir. Fare üstündeyken durur;
 * "hareketi azalt" tercihinde kendiliğinden değişmez.
 */
function ThemeShowcase({ onOpen }: { onOpen: (index: number) => void }) {
  const count = AVUKAT_TEMALAR.length
  const [current, setCurrent] = useState(0)
  const [previous, setPrevious] = useState<number | null>(null)
  const [paused, setPaused] = useState(false)

  const show = (next: number) => {
    setPrevious(current)
    setCurrent(next)
  }

  useEffect(() => {
    if (paused || typeof window === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setTimeout(() => {
      setPrevious(current)
      setCurrent((current + 1) % count)
    }, THEME_STEP_MS)
    return () => window.clearTimeout(id)
  }, [current, paused, count])

  // Sıradaki temanın görsellerini önceden indir; geçişte boşluk görünmesin.
  useEffect(() => {
    const next = AVUKAT_TEMALAR[(current + 1) % count]
    if (!next || typeof Image === 'undefined') return
    const a = new Image()
    a.src = next.masaustu
    const b = new Image()
    b.src = next.telefon
  }, [current, count])

  const tema = AVUKAT_TEMALAR[current]!
  const prevTema = previous != null ? AVUKAT_TEMALAR[previous] : null

  return (
    <div
      className="relative pb-8 pr-6 sm:pb-10 sm:pr-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <button
        type="button"
        onClick={() => onOpen(current)}
        className="block w-full overflow-hidden rounded-xl border border-white/15 bg-slate-950 text-left shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
        aria-label={`${tema.panelAdi} temasını büyüt`}
      >
        <span className="flex items-center gap-1.5 border-b border-white/10 bg-slate-900 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-2 truncate text-[10px] text-slate-400">ornekhukuk.com</span>
        </span>
        <span className="relative block aspect-[16/10] w-full overflow-hidden">
          {prevTema ? (
            <img src={prevTema.masaustu} alt="" className="absolute inset-0 h-full w-full object-cover object-top" />
          ) : null}
          <img
            key={tema.kisaAd}
            src={tema.masaustu}
            alt={`${tema.panelAdi} teması masaüstü görünümü`}
            className="avukat-theme-fade absolute inset-0 h-full w-full object-cover object-top"
          />
        </span>
      </button>

      <div className="absolute bottom-0 right-0 w-[24%] max-w-[150px] rounded-[18px] bg-slate-950 p-1 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] sm:rounded-[24px] sm:p-1.5">
        <span className="relative block aspect-[9/19] w-full overflow-hidden rounded-[14px] sm:rounded-[19px]">
          {prevTema ? (
            <img src={prevTema.telefon} alt="" className="absolute inset-0 h-full w-full object-cover object-top" />
          ) : null}
          <img
            key={`${tema.kisaAd}-tel`}
            src={tema.telefon}
            alt={`${tema.panelAdi} teması telefon görünümü`}
            className="avukat-theme-fade absolute inset-0 h-full w-full object-cover object-top"
          />
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 pr-[26%]">
        <span className="text-sm font-bold text-white">{tema.panelAdi}</span>
        <span className="flex items-center gap-1.5" role="group" aria-label="Temalar">
          {AVUKAT_TEMALAR.map((item, i) => (
            <button
              key={item.kisaAd}
              type="button"
              onClick={() => show(i)}
              aria-label={`${item.panelAdi} temasını göster`}
              aria-current={i === current ? 'true' : undefined}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                i === current ? 'w-5 bg-sky-300' : 'w-2 bg-white/30 hover:bg-white/60',
              )}
            />
          ))}
        </span>
      </div>
    </div>
  )
}

function ThemeLightbox({
  index,
  onIndexChange,
  onClose,
}: {
  index: number
  onIndexChange: (next: number) => void
  onClose: () => void
}) {
  const titleId = useId()
  const tema = AVUKAT_TEMALAR[index]!
  const count = AVUKAT_TEMALAR.length
  const [tab, setTab] = useState<'masaustu' | 'telefon'>('masaustu')
  const [loading, setLoading] = useState(true)
  const src = tab === 'masaustu' ? tema.masaustuTam : tema.telefonTam

  useEffect(() => {
    setLoading(true)
  }, [src])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        onIndexChange((index - 1 + count) % count)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        onIndexChange((index + 1) % count)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [count, index, onClose, onIndexChange])

  const go = (delta: number) => onIndexChange((index + delta + count) % count)

  return (
    <div
      className="fixed inset-0 z-[80] flex bg-slate-950/75 sm:items-center sm:justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="relative flex h-dvh w-full max-w-5xl flex-col bg-white shadow-2xl sm:h-[min(92dvh,920px)] sm:max-h-[92dvh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h3 id={titleId} className="truncate text-base font-semibold text-slate-950 sm:text-lg">
              {tema.panelAdi}
            </h3>
            <p className="mt-0.5 line-clamp-2 text-xs text-slate-600 sm:text-sm">{tema.tarz}</p>
          </div>
          <button
            type="button"
            aria-label="Kapat"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5 sm:px-5">
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setTab('masaustu')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-semibold',
                tab === 'masaustu' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600',
              )}
            >
              Masaüstü
            </button>
            <button
              type="button"
              onClick={() => setTab('telefon')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-semibold',
                tab === 'telefon' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600',
              )}
            >
              Telefon
            </button>
          </div>
          <p className="hidden text-xs text-slate-500 sm:block">
            {index + 1} / {count}
          </p>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-100">
          {loading ? (
            <div
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-slate-100/80"
              aria-live="polite"
              aria-busy="true"
            >
              <Loader2 className="h-8 w-8 animate-spin text-emerald-700" aria-hidden />
              <span className="sr-only">Görsel yükleniyor</span>
            </div>
          ) : null}
          <div
            className={cn(
              'mx-auto px-3 py-4 sm:px-6 sm:py-5',
              tab === 'telefon' ? 'flex justify-center' : 'w-full max-w-4xl',
            )}
          >
            <img
              key={src}
              src={src}
              alt={`${tema.panelAdi} ${tab === 'masaustu' ? 'masaüstü' : 'telefon'} tam sayfa görünümü`}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
              className={cn(
                'block border border-slate-200 bg-white shadow-sm',
                tab === 'masaustu' ? 'w-full rounded-lg' : 'w-full max-w-[390px] rounded-[1.25rem]',
              )}
            />
          </div>
        </div>

        <button
          type="button"
          aria-label="Önceki tema"
          onClick={() => go(-1)}
          className="absolute left-1 top-1/2 z-20 -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 p-2 text-slate-700 shadow-md hover:bg-white sm:left-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Sonraki tema"
          onClick={() => go(1)}
          className="absolute right-1 top-1/2 z-20 -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 p-2 text-slate-700 shadow-md hover:bg-white sm:right-2"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export function AvukatSiteleriPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [openFaq, setOpenFaq] = useState<string | null>(FAQ[0]?.q ?? null)
  const [showAllRows, setShowAllRows] = useState(false)

  usePageMeta({
    title: AVUKAT_SITELERI_SEO.title,
    description: AVUKAT_SITELERI_SEO.description,
    canonicalPath: AVUKAT_SITELERI_PATH,
  })

  return (
    <div className="bg-white text-slate-800">
      <section className="relative overflow-hidden text-white" style={{ backgroundColor: AVUKAT_HERO_COLOR }}>
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full border-[72px] border-[#3B82F6] opacity-20"
        />
        <div className={`relative ${SHELL} pb-12 pt-6 lg:pb-16 lg:pt-8`}>
          <Breadcrumbs
            dark
            items={[
              { label: 'Ana Sayfa', href: '/' },
              { label: 'Yazılımlar', href: '/yazilimlar' },
              { label: AVUKAT_SITELERI_NAME },
            ]}
          />
          <div className="mt-4 grid gap-10 sm:mt-6 lg:grid-cols-2 lg:items-center lg:gap-12">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-sky-300 sm:text-xs">
                Avukatlara ve hukuk bürolarına özel
              </p>
              <h1 className="mt-2 text-[28px] font-extrabold leading-tight tracking-tight sm:mt-4 sm:text-5xl lg:leading-[1.06]">
                Hukuk büronuz için KVKK uyumlu, reklam yasağına uygun web sitesi
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75 sm:mt-4 sm:text-lg">
                10 hazır tema, kolay yönetim paneli, makale sistemi ve kurumsal e-posta. Sitenizi biz kurarız; siz yalnızca
                içeriğinizi girersiniz.
              </p>
              <div className="mt-6">
                <ContactButtons light />
              </div>
              <p className="mt-4 text-sm text-white/60">
                Online satış yoktur. Sizi arayıp ihtiyacınıza uygun paketi birlikte belirliyoruz.
              </p>
            </div>
            <ThemeShowcase onOpen={setOpenIndex} />
          </div>
        </div>
      </section>

      <section className={`${SHELL} pt-16 sm:pt-24`} aria-label="Öne çıkan özellikler">
        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {[
            { big: '10 tema', title: 'Hazır tasarımlar', desc: 'Her biri büronuza uyarlanır; tek tıkla değiştirilir.' },
            { big: 'KVKK', title: 'Hazır sayfalar', desc: 'KVKK, gizlilik ve çerez sayfaları; onay kutulu iletişim formu.' },
            { big: 'E-posta', title: 'Kurumsal e-posta', desc: 'Büronuzun alan adıyla e-posta hesapları, panelden yönetim.' },
            { big: '3 dil', title: 'Türkçe, İngilizce, Almanca', desc: 'Profesyonel ve Kurumsal pakette çok dilli site.' },
          ].map((h) => (
            <li key={h.title} className="flex flex-col gap-2 rounded-xl border border-[#DCE6FB] bg-[#EEF4FF] p-6 sm:p-7">
              <span className="whitespace-nowrap text-3xl font-extrabold tracking-tight text-[#1E3A8A] sm:text-4xl">{h.big}</span>
              <span className="text-[17px] font-extrabold text-slate-950">{h.title}</span>
              <span className="text-[15px] leading-relaxed text-slate-600">{h.desc}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="pt-20 sm:pt-28" aria-labelledby="avukat-ihtiyac">
        <div className={SHELL}>
          <h2 id="avukat-ihtiyac" className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Avukatların ihtiyacına göre tasarlandı
          </h2>
          <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {[
              {
                icon: Shield,
                title: 'KVKK’ya hazır',
                text: 'Örnek metinler, onay kutulu form, çerez onay bandı.',
              },
              {
                icon: Scale,
                title: 'Reklam yasağına uygun içerik',
                text: 'Ölçülü başlangıç metinleri, sakıncalı alanlar kapalı gelir.',
              },
              {
                icon: LayoutDashboard,
                title: 'Kolay yönetim paneli',
                text: '“Bana göster” turları her adımı anlatır.',
              },
              {
                icon: BookOpen,
                title: 'Makale sistemi',
                text: 'Word’den yapıştırma, makaleye özel Google başlığı.',
              },
              {
                icon: Mail,
                title: 'Kurumsal e-posta',
                text: 'Adresleri panelden açma, panelden yanıt.',
              },
              {
                icon: Languages,
                title: 'Çoklu dil ve SEO',
                text: 'İngilizce/Almanca, SEO puanı, Analytics, Search Console.',
              },
            ].map((card) => (
              <li key={card.title} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF4FF] text-[#1E3A8A]">
                  <card.icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="flex flex-col gap-1.5">
                  <h3 className="text-[17px] font-extrabold text-slate-950">{card.title}</h3>
                  <p className="text-[15px] leading-relaxed text-slate-600">{card.text}</p>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="pt-20 sm:pt-28" aria-labelledby="avukat-temalar">
        <div className={SHELL}>
          <h2 id="avukat-temalar" className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            10 tema, her biri büronuza uyarlanır
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
            {AVUKAT_TEMALAR.map((tema, i) => (
              <li key={tema.kisaAd}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(i)}
                  className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition hover:-translate-y-0.5 hover:border-[#3B82F6] hover:shadow-md"
                >
                  <img src={tema.masaustu} alt="" className="aspect-[16/10] w-full object-cover object-top" loading="lazy" />
                  <span className="border-t border-slate-100 p-3">
                    <span className="block text-[15px] font-extrabold text-slate-950 group-hover:text-[#1E3A8A]">{tema.panelAdi}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-slate-600">{tema.tarz}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-sm text-slate-600">
            Temaya tıklayarak sayfanın tamamını masaüstü ve telefon görünümünde inceleyin.
          </p>
        </div>
      </section>

      <section className="pt-20 sm:pt-28" aria-labelledby="avukat-paketler">
        <div className={SHELL}>
          <h2 id="avukat-paketler" className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Paketler
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Kurulum bedeli tek seferliktir. Sitenizin yayında kalması için yıllık hizmet bedeli alınır; alan adı, sunucu,
            kurumsal e-posta ve teknik destek bu bedele dahildir.
          </p>
          <ul className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {[
              {
                name: 'Başlangıç',
                badge: null as string | null,
                forWhom: 'Tek avukatlı bürolar için eksiksiz bir başlangıç',
                priceNote: 'Tek seferlik kurulum bedeli ve yıllık hizmet bedeli · Fiyat için bizimle iletişime geçin',
                items: [
                  '10 tema ve yönetim paneli',
                  'Makale sistemi',
                  'KVKK sayfaları ve çerez bandı',
                  '1 kurumsal e-posta hesabı',
                  '5 GB görsel alanı',
                  'Alan adı, SSL ve yedekleme',
                ],
                cta: 'tel' as const,
              },
              {
                name: 'Profesyonel',
                badge: 'Önerilen',
                forWhom: 'Google’da görünür olmak isteyen bürolar için',
                priceNote: 'Tek seferlik kurulum bedeli ve yıllık hizmet bedeli · Fiyat için bizimle iletişime geçin',
                items: [
                  'Başlangıç’taki her şey',
                  'Türkçe, İngilizce, Almanca site',
                  'SEO puanı ve makale SEO’su',
                  'Analytics, Meta Piksel ve Conversions API',
                  '3 kurumsal e-posta hesabı',
                  '10 GB görsel alanı',
                ],
                cta: 'tel' as const,
              },
              {
                name: 'Kurumsal',
                badge: null,
                forWhom: 'Ekibi büyük ve online tahsilat yapan bürolar için',
                priceNote: 'Tek seferlik kurulum bedeli ve yıllık hizmet bedeli · Fiyat için bizimle iletişime geçin',
                items: [
                  'Profesyonel’deki her şey',
                  'E-Tahsilat düğmesi',
                  '5 kurumsal e-posta hesabı',
                  '20 GB görsel alanı',
                  'Sınırsız trafik (adil kullanım)',
                  'Çoklu dil ve gelişmiş SEO',
                ],
                cta: 'tel' as const,
              },
              {
                name: 'Özel Yazılım',
                badge: null,
                forWhom: 'Hazır paketlerin ötesinde ihtiyacı olan bürolar için',
                priceNote: 'Proje bazlı fiyatlandırma · İhtiyacınızı dinleyip teklif hazırlıyoruz',
                items: [
                  'Kurumsal’daki her şey',
                  'Büronuza özel tasarım',
                  'İhtiyaca göre özel modüller',
                  'Başka sistemlerle entegrasyon',
                  'Mevcut sitenizin içeriğinin taşınması',
                  'Proje boyunca birebir destek',
                ],
                cta: 'quote' as const,
              },
            ].map((pkg) => (
              <li
                key={pkg.name}
                className={cn(
                  'relative flex h-full flex-col rounded-xl border bg-white p-6',
                  pkg.badge ? 'border-[#3B82F6] ring-1 ring-[#3B82F6]/40' : 'border-slate-200',
                )}
              >
                {pkg.badge ? (
                  <span className="absolute -top-3 right-4 rounded-md bg-[#1E3A8A] px-2.5 py-1 text-[11px] font-bold text-white">
                    {pkg.badge}
                  </span>
                ) : null}
                <h3 className="text-xl font-extrabold text-slate-950">{pkg.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{pkg.forWhom}</p>
                <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">{pkg.priceNote}</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {pkg.items.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-slate-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {pkg.cta === 'tel' ? (
                  <a
                    href={AVUKAT_PHONE_HREF}
                    className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#1E3A8A] px-4 text-sm font-bold text-white hover:bg-[#1E40AF]"
                  >
                    <Phone className="h-4 w-4" aria-hidden />
                    Bizimle iletişime geçin
                  </a>
                ) : (
                  <Link
                    to={AVUKAT_QUOTE_HREF}
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-900 hover:bg-slate-50"
                  >
                    Teklif isteyin
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="pt-20 sm:pt-28" aria-labelledby="avukat-karsilastir">
        <div className={SHELL}>
          <h2 id="avukat-karsilastir" className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Tüm özellikleri karşılaştırın
          </h2>
          <div className="relative mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-[640px] w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-sm">
                  <th className="px-4 py-3 font-semibold text-slate-700">Özellik</th>
                  <th className="px-3 py-3 text-center font-semibold text-slate-700">Başlangıç</th>
                  <th className="px-3 py-3 text-center font-semibold text-emerald-800">Profesyonel</th>
                  <th className="px-3 py-3 text-center font-semibold text-slate-700">Kurumsal</th>
                </tr>
              </thead>
              <tbody>
                {(showAllRows ? COMPARE_ROWS : COMPARE_ROWS.slice(0, 2)).map((group) => (
                  <Fragment key={group.group}>
                    <tr className="bg-slate-50/80">
                      <td colSpan={4} className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {group.group}
                      </td>
                    </tr>
                    {group.rows.map((row) => (
                      <tr key={row.label} className="border-t border-slate-100">
                        <td className="px-4 py-2.5 text-sm text-slate-700">{row.label}</td>
                        <td className="px-3 py-2.5 text-center">
                          <CellValue value={row.b} />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <CellValue value={row.p} />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <CellValue value={row.k} />
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
            {showAllRows ? null : (
              <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
            )}
          </div>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAllRows((v) => !v)}
              aria-expanded={showAllRows}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-bold text-slate-900 hover:bg-slate-50"
            >
              {showAllRows ? 'Daha az göster' : `Tüm özellikleri göster (${COMPARE_ROWS.reduce((n, g) => n + g.rows.length, 0)} özellik)`}
              <ChevronDown className={cn('h-4 w-4 transition', showAllRows && 'rotate-180')} aria-hidden />
            </button>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600">
            Fiyat bilgisi için bizi arayın. Kurulum bedeli tek seferliktir; siteniz, yıllık hizmet bedeli ödendiği sürece
            yayında kalır. Size özel ihtiyaçlar için Özel Yazılım seçeneğimizi sorun.
          </p>
        </div>
      </section>

      <section className="pt-20 sm:pt-28" aria-labelledby="avukat-nasil">
        <div className={SHELL}>
          <h2 id="avukat-nasil" className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Nasıl çalışır?
          </h2>
          <ol className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {[
              {
                n: '1',
                title: 'Bizi arayın',
                text: 'İhtiyacınızı dinleyip size uygun paketi ve temayı birlikte seçiyoruz.',
              },
              {
                n: '2',
                title: 'Sitenizi kuruyoruz',
                text: 'Alan adınızı ve kurumsal e-postanızı bağlıyor, panel bilgilerinizi gönderiyoruz.',
              },
              {
                n: '3',
                title: 'İçeriğinizi girin',
                text: 'Logonuzu, ekibinizi ve çalışma alanlarınızı panelden adım adım ekleyin.',
              },
              {
                n: '4',
                title: 'Yayına alın',
                text: 'Hazır olduğunuzda tek tuşla yayınlayın.',
              },
            ].map((step) => (
              <li key={step.n} className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-6">
                <span aria-hidden className="text-4xl font-extrabold tracking-tight text-slate-300">
                  {step.n.padStart(2, '0')}
                </span>
                <h3 className="text-xl font-extrabold text-slate-950">{step.title}</h3>
                <p className="text-[15px] leading-relaxed text-slate-600">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="pt-20 sm:pt-28" aria-labelledby="avukat-sss">
        <div className={`${SHELL} flex flex-col gap-8 lg:flex-row lg:gap-14`}>
          <div className="lg:w-1/3 lg:shrink-0">
            <h2 id="avukat-sss" className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Sık sorulan sorular
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Başka bir sorunuz varsa WhatsApp'tan yazabilir ya da bizi arayabilirsiniz.
            </p>
          </div>
          <div className="flex-1 border-t border-slate-200">
            {FAQ.map((item) => {
              const open = openFaq === item.q
              return (
                <div key={item.q} className="border-b border-slate-200 py-5">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 text-left text-[17px] font-bold text-slate-950"
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? null : item.q)}
                  >
                    {item.q}
                    <ChevronDown className={cn('h-5 w-5 shrink-0 text-slate-400 transition', open && 'rotate-180')} aria-hidden />
                  </button>
                  {open ? <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{item.a}</p> : null}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className={`${SHELL} py-20 sm:py-28`} aria-labelledby="avukat-cta">
        <div className="flex flex-col gap-6 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#1D6FD8] px-6 py-10 text-white sm:px-12 sm:py-14 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 id="avukat-cta" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Büronuzun sitesini birlikte planlayalım
            </h2>
            <p className="mt-3 text-base leading-relaxed text-white/85 sm:text-lg">
              Hafta içi 09.00–18.00 arasında bize ulaşın ya da{' '}
              <Link to={AVUKAT_QUOTE_HREF} className="font-bold underline underline-offset-4">
                teklif isteyin
              </Link>
              .
            </p>
          </div>
          <div className="lg:shrink-0">
            <ContactButtons light />
          </div>
        </div>
      </section>

      {openIndex != null ? (
        <ThemeLightbox index={openIndex} onIndexChange={setOpenIndex} onClose={() => setOpenIndex(null)} />
      ) : null}
    </div>
  )
}
