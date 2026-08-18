import { useId, type KeyboardEvent } from 'react'
import { Sparkles } from 'lucide-react'
import type { UseQueryResult } from '@tanstack/react-query'
import { BuilderField } from '@/builder/edit/BuilderField'
import type { BlockRendererProps } from '@/builder/registry/renderRegistry'
import { renderIfText } from '@/builder/render/renderRules'
import { ProductContentSections } from '@/components/public/product/ProductContentSections'
import { ErrorState } from '@/components/public/ErrorState'
import { MediaImage } from '@/media/components/MediaImage'
import { useMkComparePageContextOptional } from '@/components/public/muvekkil-kasa/MkComparePageProvider'
import { useMkSaasProductPageContextOptional } from '@/components/public/product/MkSaasProductPageProvider'
import {
  featureBulletsFromProduct,
  MK_COMPARE_SHELL,
  scrollToComparePurchase,
  scrollToCompareTable,
  type MkCompareEdition,
} from '@/components/public/muvekkil-kasa/comparePageUtils'
import { isFreeDownloadProduct } from '@/utils/productPurchase'
import { getErrorMessage } from '@/api/client'
import type { MkCompareDetailsBlock, MkCompareDetailsPanel } from '@/builder/types/mkCompareDetails'
import type { PublicProductDetail } from '@/types/product'

function applyPanelOverrides(product: PublicProductDetail, panel: MkCompareDetailsPanel): PublicProductDetail {
  return {
    ...product,
    description: panel.useProductDescription ? product.description : panel.descriptionHtml,
    featureBullets: panel.useProductFeatures ? product.featureBullets : panel.features.filter((item) => item.trim()).join('\n'),
  }
}

export function MkCompareDetailsBlockRenderer({ block }: BlockRendererProps) {
  if (block.type !== 'mk-compare-details') return null
  const details = block as MkCompareDetailsBlock
  if (!details.visibility.enabled) return null

  const compare = useMkComparePageContextOptional()
  const saasCtx = useMkSaasProductPageContextOptional()
  const tablistId = useId()
  const tab = compare?.detailTab ?? 'desktop'
  const onTabChange = compare?.setDetailTab ?? (() => undefined)
  const anchorId = details.settings.anchorId?.trim() || 'urun-detaylari'
  const tabs: { id: MkCompareEdition; label: string }[] = [
    { id: 'desktop', label: details.settings.desktop.tabLabel || 'Masaüstü Detayları' },
    { id: 'saas', label: details.settings.saas.tabLabel || 'SaaS/Web Detayları' },
  ]

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, current: MkCompareEdition) => {
    const ids = tabs.map((item) => item.id)
    const index = ids.indexOf(current)
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      onTabChange(ids[(index + 1) % ids.length])
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      onTabChange(ids[(index - 1 + ids.length) % ids.length])
    }
  }

  return (
    <section
      id={anchorId}
      className="scroll-mt-24 bg-[linear-gradient(180deg,#ffffff_0%,#f0fdfa_48%,#f8fafc_100%)] py-16 sm:py-20 lg:py-24"
    >
      <div className={MK_COMPARE_SHELL}>
        {details.visibility.showTitle !== false && renderIfText(details.title) ? (
          <BuilderField path="title" label="Başlık" type="text" className="block w-fit">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{details.title}</h2>
          </BuilderField>
        ) : null}
        {details.visibility.showDescription !== false && renderIfText(details.description) ? (
          <BuilderField path="description" label="Açıklama" type="text" className="mt-3 block w-fit max-w-3xl">
            <p className="text-base leading-relaxed text-slate-600 sm:text-lg">{details.description}</p>
          </BuilderField>
        ) : null}

        <div
          id={tablistId}
          role="tablist"
          aria-label="Ürün detayları"
          className="mt-8 grid overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-2"
        >
          {tabs.map((item) => {
            const selected = tab === item.id
            const activeClass =
              item.id === 'desktop'
                ? 'bg-emerald-50 text-emerald-950 shadow-[inset_0_-3px_0_0_#10b981]'
                : 'bg-sky-50 text-sky-950 shadow-[inset_0_-3px_0_0_#0ea5e9]'
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => onTabChange(item.id)}
                onKeyDown={(e) => onTabKeyDown(e, item.id)}
                className={`px-4 py-4 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:text-base ${
                  selected ? activeClass : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      <Panel
        visible={tab === 'desktop'}
        query={compare?.desktopQuery}
        panel={details.settings.desktop}
        errorTitle="Masaüstü detayları yüklenemedi"
        errorFallback="Masaüstü ürün içeriği alınamadı."
        retryClass="text-emerald-700"
        primaryClass="bg-emerald-600 hover:bg-emerald-700"
        onPrimary={scrollToComparePurchase}
        onSecondary={scrollToCompareTable}
      />
      <Panel
        visible={tab === 'saas'}
        query={compare?.saasQuery}
        panel={details.settings.saas}
        errorTitle="SaaS detayları yüklenemedi"
        errorFallback="SaaS ürün içeriği alınamadı."
        retryClass="text-sky-700"
        primaryClass="bg-sky-600 hover:bg-sky-700"
        onPrimary={scrollToComparePurchase}
        onSecondary={scrollToCompareTable}
        onDemo={saasCtx?.onOpenDemo}
      />
    </section>
  )
}

function Panel({
  visible,
  query,
  panel,
  errorTitle,
  errorFallback,
  retryClass,
  primaryClass,
  onPrimary,
  onSecondary,
  onDemo,
}: {
  visible: boolean
  query: UseQueryResult<PublicProductDetail, Error> | undefined
  panel: MkCompareDetailsPanel
  errorTitle: string
  errorFallback: string
  retryClass: string
  primaryClass: string
  onPrimary: () => void
  onSecondary: () => void
  onDemo?: () => void
}) {
  if (!visible) return null
  if (!query) {
    return <div className={`${MK_COMPARE_SHELL} mt-8 h-40 animate-pulse rounded-2xl bg-slate-100`} />
  }
  if (query.isError || (!query.isPending && !query.data)) {
    return (
      <div className={`${MK_COMPARE_SHELL} mt-8`}>
        <ErrorState
          title={errorTitle}
          message={getErrorMessage(query.error, errorFallback)}
          action={
            <button type="button" onClick={() => query.refetch()} className={`text-sm font-semibold ${retryClass}`}>
              Tekrar dene
            </button>
          }
        />
      </div>
    )
  }
  if (!query.data) {
    return <div className={`${MK_COMPARE_SHELL} mt-8 h-40 animate-pulse rounded-2xl bg-slate-100`} />
  }

  const product = applyPanelOverrides(query.data, panel)
  const bullets = featureBulletsFromProduct(product)
  const imageUrl = panel.image?.url?.trim()

  return (
    <div className="mt-8">
      {imageUrl ? (
        <div className={`${MK_COMPARE_SHELL} mb-6`}>
          <MediaImage src={imageUrl} alt={panel.image?.alt || product.name} className="w-full rounded-2xl object-contain" optimizeWidth={1200} />
        </div>
      ) : null}
      <ProductContentSections
        product={product}
        bullets={bullets}
        isFreeDownload={isFreeDownloadProduct(product)}
        variant="compare"
        headings={{
          overviewEyebrow: panel.overviewEyebrow,
          overviewTitle: panel.overviewTitle,
          featuresEyebrow: panel.featuresEyebrow,
          featuresTitle: panel.featuresTitle,
        }}
      />
      <div className={`${MK_COMPARE_SHELL} flex flex-col gap-3 pb-2 sm:flex-row sm:flex-wrap`}>
        {panel.primaryCtaLabel.trim() ? (
          <button
            type="button"
            onClick={onPrimary}
            className={`inline-flex w-full items-center justify-center rounded-xl ${primaryClass} px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition sm:w-auto`}
          >
            {panel.primaryCtaLabel}
          </button>
        ) : null}
        {panel.secondaryCtaLabel.trim() ? (
          <button
            type="button"
            onClick={onSecondary}
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 sm:w-auto"
          >
            {panel.secondaryCtaLabel}
          </button>
        ) : null}
        {panel.demoCtaLabel?.trim() && onDemo ? (
          <button
            type="button"
            onClick={onDemo}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-5 py-3.5 text-sm font-semibold text-sky-900 transition hover:bg-sky-100 sm:w-auto"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            {panel.demoCtaLabel}
          </button>
        ) : null}
      </div>
    </div>
  )
}
