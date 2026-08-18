import { Check, CircleHelp, Globe, Info, Monitor } from 'lucide-react'
import type { PublicProductDetail } from '@/types/product'
import { formatMkSaasTryMoney } from '@/components/public/product/ProductPurchasePanel'
import {
  formatDeviceRightsFromApi,
  formatLicenseDurationFromApi,
} from '@/components/public/muvekkil-kasa/comparePageUtils'

type Tone = 'check' | 'neutral' | 'saas' | 'info'

export type Cell = {
  tone: Tone
  text: string
  hint?: string
}

export type Row = {
  feature: string
  desktop: Cell
  saas: Cell
}

function CellView({ cell }: { cell: Cell }) {
  const icon =
    cell.tone === 'check' ? (
      <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
    ) : cell.tone === 'saas' ? (
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden />
    ) : (
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" aria-hidden />
    )

  const wrapClass =
    cell.tone === 'check'
      ? 'text-slate-800'
      : cell.tone === 'saas'
        ? 'text-sky-900'
        : 'text-slate-700'

  const badge =
    cell.tone === 'saas' ? (
      <span className="inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800">
        SaaS özelliği
      </span>
    ) : null

  return (
    <div className={`flex items-start gap-2.5 text-[15px] leading-relaxed ${wrapClass}`}>
      {icon}
      <div className="min-w-0">
        {badge ? <div className="mb-1.5">{badge}</div> : null}
        <span>{cell.text}</span>
        {cell.hint ? (
          <span className="ml-1 inline-flex align-middle text-slate-500" title={cell.hint}>
            <CircleHelp className="inline h-4 w-4" aria-label={cell.hint} />
          </span>
        ) : null}
      </div>
    </div>
  )
}

type Props = {
  desktop: PublicProductDetail | undefined
  saas: PublicProductDetail | undefined
  saasYears: number
  title?: string
  description?: string
  desktopColumnLabel?: string
  saasColumnLabel?: string
  rows?: Row[]
  hideHeader?: boolean
}

export function MuvekkilKasaCompareTable({
  desktop,
  saas,
  saasYears,
  title = 'Sürüm karşılaştırması',
  description = 'Yalnızca bu sitede doğrulanan kullanım, lisans ve satış farkları. Doğrulanmayan iddialar tabloda yer almaz.',
  desktopColumnLabel = 'Masaüstü',
  saasColumnLabel = 'SaaS / Web',
  rows: rowsProp,
  hideHeader = false,
}: Props) {
  const desktopDuration = desktop ? formatLicenseDurationFromApi(desktop) : 'Ürün yüklenince gösterilir'
  const desktopDevices = desktop ? formatDeviceRightsFromApi(desktop) : 'Ürün yüklenince gösterilir'
  const desktopPrice = desktop && Number.isFinite(desktop.price) && desktop.price > 0
    ? `${formatMkSaasTryMoney(desktop.price, desktop.currency)} · tek lisans`
    : 'API fiyatı · tek lisans'
  const saasUnit = saas && Number.isFinite(saas.price) && saas.price > 0
    ? formatMkSaasTryMoney(saas.price, saas.currency)
    : 'API birim fiyatı'
  const saasTotal =
    saas && Number.isFinite(saas.price) && saas.price > 0
      ? formatMkSaasTryMoney(saas.price * saasYears, saas.currency)
      : null

  const rows: Row[] = rowsProp ?? [
    {
      feature: 'Kullanım şekli',
      desktop: { tone: 'check', text: 'Bilgisayara kurulan masaüstü programı' },
      saas: { tone: 'check', text: 'Tarayıcı üzerinden web erişimi' },
    },
    {
      feature: 'Kurulum',
      desktop: { tone: 'neutral', text: 'Kurulum gerektirir' },
      saas: { tone: 'check', text: 'Kurulum gerektirmez' },
    },
    {
      feature: 'Lisans modeli',
      desktop: { tone: 'check', text: 'Merkezi lisans' },
      saas: { tone: 'check', text: 'Yıllık SaaS üyeliği' },
    },
    {
      feature: 'Kullanım süresi',
      desktop: { tone: 'info', text: desktopDuration },
      saas: { tone: 'check', text: '1–10 yıl seçilebilir' },
    },
    {
      feature: 'Cihaz hakkı',
      desktop: { tone: 'info', text: desktopDevices },
      saas: { tone: 'check', text: 'Tarayıcı erişimi' },
    },
    {
      feature: 'Çoklu kullanıcı',
      desktop: {
        tone: 'neutral',
        text: 'Bilgi için ürün detayını inceleyin',
        hint: 'Bu özellik masaüstü uygulama kodunda bu siteden doğrulanmadı.',
      },
      saas: { tone: 'check', text: 'Desteklenir' },
    },
    {
      feature: 'WhatsApp Business bağlantısı',
      desktop: { tone: 'saas', text: 'Web sürümünde sunulur' },
      saas: { tone: 'check', text: 'Desteklenir' },
    },
    {
      feature: 'Otomatik WhatsApp hatırlatmaları',
      desktop: { tone: 'saas', text: 'Web sürümünde sunulur' },
      saas: { tone: 'check', text: 'Desteklenir' },
    },
    {
      feature: 'Ücretsiz demo',
      desktop: { tone: 'neutral', text: 'Bulunmuyor' },
      saas: { tone: 'check', text: '7 gün' },
    },
    {
      feature: 'Fiyatlandırma',
      desktop: { tone: 'info', text: desktopPrice },
      saas: {
        tone: 'info',
        text: saasTotal
          ? `${saasUnit} × ${saasYears} yıl = ${saasTotal}`
          : `${saasUnit} × seçilen yıl`,
      },
    },
  ]

  return (
    <section aria-labelledby="mk-compare-table-heading" className="min-w-0">
      {hideHeader ? null : (
        <>
          <h2 id="mk-compare-table-heading" className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {description}
          </p>
        </>
      )}

      <div className="mt-8 space-y-4 lg:hidden">
        {rows.map((row) => (
          <div key={row.feature} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-base font-bold text-slate-950">{row.feature}</p>
            <dl className="mt-4 space-y-4">
              <div className="rounded-xl bg-emerald-50/70 px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-800">{desktopColumnLabel}</dt>
                <dd className="mt-2">
                  <CellView cell={row.desktop} />
                </dd>
              </div>
              <div className="rounded-xl bg-sky-50/80 px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-sky-800">{saasColumnLabel}</dt>
                <dd className="mt-2">
                  <CellView cell={row.saas} />
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <div className="mt-8 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
        <table className="w-full table-fixed border-collapse text-left">
          <colgroup>
            <col className="w-[34%]" />
            <col className="w-[33%]" />
            <col className="w-[33%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th scope="col" className="px-6 py-4 text-base font-semibold text-slate-700">
                Özellik
              </th>
              <th scope="col" className="px-6 py-4 text-base font-semibold text-emerald-800">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Monitor className="h-4 w-4" aria-hidden />
                  </span>
                  {desktopColumnLabel}
                </span>
              </th>
              <th scope="col" className="px-6 py-4 text-base font-semibold text-sky-800">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                    <Globe className="h-4 w-4" aria-hidden />
                  </span>
                  {saasColumnLabel}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.feature} className="border-b border-slate-100 last:border-0 even:bg-slate-50/60">
                <th scope="row" className="h-14 px-6 py-4 align-middle text-[15px] font-semibold text-slate-900">
                  {row.feature}
                </th>
                <td className="px-6 py-4 align-middle">
                  <CellView cell={row.desktop} />
                </td>
                <td className="px-6 py-4 align-middle">
                  <CellView cell={row.saas} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
