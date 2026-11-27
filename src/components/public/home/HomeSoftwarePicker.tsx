import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { SoftwareShowcaseMark } from '@/components/public/SoftwareShowcaseMark'
import { SOFTWARE_SHOWCASE_ITEMS, type SoftwareShowcaseItem } from '@/data/softwareShowcase'
import { cn } from '@/lib/cn'

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

/** Kurumsal tasarım (Yön C): her ürünün kendi rengi ve mozaik yerleşim. */
type TileTheme = {
  label: string
  /** Masaüstü mozaik yerleşimi */
  span: string
  bg: string
  border?: string
  dark: boolean
  labelColor: string
  descColor: string
  large?: boolean
}

const TILE_THEMES: Record<string, TileTheme> = {
  'bilirkisi-hesap': {
    label: 'Hukuk · Web',
    span: 'lg:col-span-2 lg:row-span-2',
    bg: 'bg-[#0F2A4A]',
    dark: true,
    labelColor: 'text-sky-300',
    descColor: 'text-[#C7D7EC]',
    large: true,
  },
  'muvekkil-kasa-defteri': {
    label: 'Hukuk · Web + Mobil',
    span: 'lg:col-span-2',
    bg: 'bg-[#14532D]',
    dark: true,
    labelColor: 'text-green-300',
    descColor: 'text-[#C9E9D3]',
  },
  koopplus: {
    label: 'Kooperatif',
    span: '',
    bg: 'bg-[#FFF4E5]',
    dark: false,
    labelColor: 'text-amber-700',
    descColor: 'text-slate-600',
  },
  'aktuerya-hesaplama': {
    label: 'Hukuk',
    span: '',
    bg: 'bg-[#F2F4F7]',
    dark: false,
    labelColor: 'text-slate-500',
    descColor: 'text-slate-600',
  },
  'avukat-siteleri': {
    label: 'Hukuk · Web sitesi',
    span: 'lg:col-span-2',
    bg: 'bg-[#EEF4FF]',
    dark: false,
    labelColor: 'text-blue-700',
    descColor: 'text-slate-600',
  },
  'sifre-kasasi': {
    label: 'Ücretsiz',
    span: 'sm:col-span-2 lg:col-span-2',
    bg: 'bg-white',
    border: 'border border-slate-200',
    dark: false,
    labelColor: 'text-emerald-700',
    descColor: 'text-slate-600',
  },
}

const FALLBACK_THEME: TileTheme = {
  label: 'Yazılım',
  span: '',
  bg: 'bg-[#F2F4F7]',
  dark: false,
  labelColor: 'text-slate-500',
  descColor: 'text-slate-600',
}

type Props = {
  /** Sayfada bu bölümden önce bir h1 varsa başlıklar h2/h3 olur. Görsel hero h1 taşımıyorsa başlıklar paragraf kalır; alttaki sayfa h1’i yerinde durur. */
  followsPageTitle?: boolean
}

/** Mozaikte gösterim sırası; listede olmayan ürünler sona eklenir. */
const TILE_ORDER = ['bilirkisi-hesap', 'muvekkil-kasa-defteri', 'koopplus', 'avukat-siteleri', 'aktuerya-hesaplama', 'sifre-kasasi']

function orderIndex(id: string): number {
  const i = TILE_ORDER.indexOf(id)
  return i < 0 ? TILE_ORDER.length : i
}

export function HomeSoftwarePicker({ followsPageTitle = true }: Props) {
  const items = cards().sort((a, b) => orderIndex(a.item.id) - orderIndex(b.item.id))
  if (items.length === 0) return null
  const TitleTag = followsPageTitle ? 'h2' : 'p'
  const NameTag = followsPageTitle ? 'h3' : 'p'

  return (
    <section aria-labelledby="home-yazilimlar-baslik" className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <TitleTag
            id="home-yazilimlar-baslik"
            className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl"
          >
            Yazılımlarımız
          </TitleTag>
          <p className="max-w-md text-base leading-relaxed text-slate-600 sm:text-right sm:text-lg">
            Size uygun programı doğrudan seçin ve detaylarını inceleyin.
          </p>
        </header>

        <ul className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:auto-rows-[minmax(15rem,auto)] lg:grid-flow-row-dense lg:grid-cols-4">
          {items.map(({ item, summary, cta }) => {
            const theme = TILE_THEMES[item.id] ?? FALLBACK_THEME
            return (
              <li key={item.id} className={cn('flex', theme.span, theme.large && 'sm:col-span-2')}>
                <Link
                  to={item.href}
                  className={cn(
                    'group relative flex w-full flex-col justify-between gap-5 overflow-hidden rounded-xl p-6 sm:gap-8 outline-none transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-24px_rgba(16,24,40,0.45)] focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-8',
                    theme.bg,
                    theme.border,
                    theme.large && 'lg:p-10',
                  )}
                >
                  {theme.large ? (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full border-[48px] border-[#1D6FD8] opacity-30"
                    />
                  ) : null}
                  <div className="relative flex items-start justify-between gap-4">
                    <span className={cn('text-xs font-bold uppercase tracking-[0.12em]', theme.labelColor)}>
                      {theme.label}
                    </span>
                    <span className="rounded-lg bg-white p-0.5">
                      <SoftwareShowcaseMark item={item} size="sm" />
                    </span>
                  </div>
                  <div className="relative flex flex-col gap-2">
                    <NameTag
                      className={cn(
                        'font-extrabold tracking-tight',
                        theme.dark ? 'text-white' : 'text-slate-950',
                        theme.large ? 'text-3xl sm:text-4xl lg:text-5xl' : 'text-2xl lg:text-[1.75rem]',
                      )}
                    >
                      {item.title}
                    </NameTag>
                    <p className={cn('max-w-md text-[15px] leading-relaxed', theme.descColor, theme.large && 'sm:text-lg')}>
                      {summary}
                    </p>
                    {theme.large ? (
                      <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg bg-white px-5 py-3 text-[15px] font-bold text-[#0F2A4A]">
                        {cta}
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
                      </span>
                    ) : (
                      <span
                        className={cn(
                          'mt-2 inline-flex items-center gap-1.5 text-sm font-bold',
                          theme.dark ? 'text-white' : 'text-emerald-700',
                        )}
                      >
                        {cta}
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
