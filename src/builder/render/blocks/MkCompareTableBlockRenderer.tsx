import { BuilderField } from '@/builder/edit/BuilderField'
import type { BlockRendererProps } from '@/builder/registry/renderRegistry'
import { renderIfText } from '@/builder/render/renderRules'
import { formatMkSaasTryMoney } from '@/components/public/product/ProductPurchasePanel'
import { MuvekkilKasaCompareTable, type Row } from '@/components/public/muvekkil-kasa/MuvekkilKasaCompareTable'
import { useMkComparePageContextOptional } from '@/components/public/muvekkil-kasa/MkComparePageProvider'
import { useMkSaasProductPageContextOptional } from '@/components/public/product/MkSaasProductPageProvider'
import {
  formatDeviceRightsFromApi,
  formatLicenseDurationFromApi,
  MK_COMPARE_SHELL,
} from '@/components/public/muvekkil-kasa/comparePageUtils'
import type { MkCompareTableBlock, MkCompareTableCell, MkCompareValueKey } from '@/builder/types/mkCompareTable'
import type { PublicProductDetail } from '@/types/product'

function resolveValue(
  key: MkCompareValueKey | undefined,
  fallback: string,
  desktop: PublicProductDetail | undefined,
  saas: PublicProductDetail | undefined,
  saasYears: number,
): string {
  if (!key) return fallback
  if (key === 'desktop-license') return desktop ? formatLicenseDurationFromApi(desktop) : fallback
  if (key === 'desktop-devices') return desktop ? formatDeviceRightsFromApi(desktop) : fallback
  if (key === 'desktop-price') {
    return desktop && Number.isFinite(desktop.price) && desktop.price > 0
      ? `${formatMkSaasTryMoney(desktop.price, desktop.currency)} · tek lisans`
      : fallback
  }
  if (key === 'saas-years') return fallback
  if (key === 'saas-price') {
    const saasUnit =
      saas && Number.isFinite(saas.price) && saas.price > 0
        ? formatMkSaasTryMoney(saas.price, saas.currency)
        : null
    const saasTotal =
      saas && Number.isFinite(saas.price) && saas.price > 0
        ? formatMkSaasTryMoney(saas.price * saasYears, saas.currency)
        : null
    if (saasUnit && saasTotal) return `${saasUnit} × ${saasYears} yıl = ${saasTotal}`
    return fallback
  }
  return fallback
}

function toRowCell(
  cell: MkCompareTableCell,
  desktop: PublicProductDetail | undefined,
  saas: PublicProductDetail | undefined,
  saasYears: number,
) {
  return {
    tone: cell.tone,
    text: resolveValue(cell.valueKey, cell.text, desktop, saas, saasYears),
    hint: cell.hint,
  }
}

export function MkCompareTableBlockRenderer({ block }: BlockRendererProps) {
  if (block.type !== 'mk-compare-table') return null
  const table = block as MkCompareTableBlock
  if (!table.visibility.enabled) return null

  const compare = useMkComparePageContextOptional()
  const saasCtx = useMkSaasProductPageContextOptional()
  const desktop = compare?.desktopQuery.data
  const saas = compare?.saasQuery.data
  const saasYears = saasCtx?.webUsageYears ?? 1
  const anchorId = table.settings.anchorId?.trim() || 'surum-karsilastirmasi'

  const rows: Row[] = table.settings.rows.map((row) => ({
    feature: row.feature,
    desktop: toRowCell(row.desktop, desktop, saas, saasYears),
    saas: toRowCell(row.saas, desktop, saas, saasYears),
  }))

  return (
    <section
      id={anchorId}
      className="scroll-mt-24 border-y border-slate-200/80 bg-slate-50 py-16 sm:py-20 lg:py-24"
    >
      <div className={MK_COMPARE_SHELL}>
        {table.visibility.showTitle !== false && renderIfText(table.title) ? (
          <BuilderField path="title" label="Başlık" type="text" className="block w-fit">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{table.title}</h2>
          </BuilderField>
        ) : null}
        {table.visibility.showDescription !== false && renderIfText(table.description) ? (
          <BuilderField path="description" label="Açıklama" type="text" className="mt-3 block w-fit max-w-3xl">
            <p className="text-base leading-relaxed text-slate-600 sm:text-lg">{table.description}</p>
          </BuilderField>
        ) : null}
        <MuvekkilKasaCompareTable
          desktop={desktop}
          saas={saas}
          saasYears={saasYears}
          desktopColumnLabel={table.settings.desktopColumnLabel}
          saasColumnLabel={table.settings.saasColumnLabel}
          rows={rows}
          hideHeader
        />
      </div>
    </section>
  )
}
