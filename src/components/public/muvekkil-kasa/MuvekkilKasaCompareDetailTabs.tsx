import { useId, useRef, type KeyboardEvent } from 'react'
import { Sparkles } from 'lucide-react'
import { ProductContentSections } from '@/components/public/product/ProductContentSections'
import { MuvekkilKasaSaasDetailSections } from '@/components/public/muvekkil-kasa/MuvekkilKasaSaasDetailSections'
import { ErrorState } from '@/components/public/ErrorState'
import { useMkSaasProductPageContext } from '@/components/public/product/MkSaasProductPageProvider'
import { isFreeDownloadProduct } from '@/utils/productPurchase'
import { getErrorMessage } from '@/api/client'
import type { PublicProductDetail } from '@/types/product'
import type { UseQueryResult } from '@tanstack/react-query'
import {
  featureBulletsFromProduct,
  MK_COMPARE_SHELL,
  scrollToComparePurchase,
  scrollToCompareTable,
  type MkCompareEdition,
} from '@/components/public/muvekkil-kasa/comparePageUtils'

type TabId = MkCompareEdition
type Query = UseQueryResult<PublicProductDetail, Error>

const TABS: { id: TabId; label: string }[] = [
  { id: 'desktop', label: 'Masaüstü Detayları' },
  { id: 'saas', label: 'SaaS/Web Detayları' },
]

type Props = {
  desktopQuery: Query
  saasQuery: Query
  tab: TabId
  onTabChange: (tab: TabId) => void
}

export function MuvekkilKasaCompareDetailTabs({ desktopQuery, saasQuery, tab, onTabChange }: Props) {
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({ desktop: null, saas: null })
  const tablistId = useId()
  const saasCtx = useMkSaasProductPageContext()

  const focusTab = (id: TabId) => {
    onTabChange(id)
    tabRefs.current[id]?.focus()
  }

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, current: TabId) => {
    const ids = TABS.map((t) => t.id)
    const index = ids.indexOf(current)
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      focusTab(ids[(index + 1) % ids.length])
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      focusTab(ids[(index - 1 + ids.length) % ids.length])
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusTab(ids[0])
    } else if (event.key === 'End') {
      event.preventDefault()
      focusTab(ids[ids.length - 1])
    }
  }

  const desktop = desktopQuery.data
  const saas = saasQuery.data

  return (
    <section className="min-w-0">
      <div className={MK_COMPARE_SHELL}>
        <div
          id={tablistId}
          role="tablist"
          aria-label="Ürün detayları"
          className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-2"
        >
          {TABS.map((item) => {
            const selected = tab === item.id
            const activeClass =
              item.id === 'desktop'
                ? 'bg-emerald-50 text-emerald-950 shadow-[inset_0_-3px_0_0_#10b981]'
                : 'bg-sky-50 text-sky-950 shadow-[inset_0_-3px_0_0_#0ea5e9]'
            return (
              <button
                key={item.id}
                ref={(el) => {
                  tabRefs.current[item.id] = el
                }}
                type="button"
                role="tab"
                id={`${tablistId}-${item.id}`}
                aria-selected={selected}
                aria-controls={`${tablistId}-panel-${item.id}`}
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

      <div
        role="tabpanel"
        id={`${tablistId}-panel-desktop`}
        aria-labelledby={`${tablistId}-desktop`}
        hidden={tab !== 'desktop'}
        className="mt-8"
      >
        {tab === 'desktop' ? (
          desktopQuery.isError || (!desktopQuery.isPending && !desktop) ? (
            <div className={MK_COMPARE_SHELL}>
              <ErrorState
                title="Masaüstü detayları yüklenemedi"
                message={getErrorMessage(desktopQuery.error, 'Masaüstü ürün içeriği alınamadı.')}
                action={
                  <button
                    type="button"
                    onClick={() => desktopQuery.refetch()}
                    className="text-sm font-semibold text-emerald-700"
                  >
                    Tekrar dene
                  </button>
                }
              />
            </div>
          ) : desktop ? (
            <div>
              <ProductContentSections
                product={desktop}
                bullets={featureBulletsFromProduct(desktop)}
                isFreeDownload={isFreeDownloadProduct(desktop)}
                variant="compare"
              />
              <div className={`${MK_COMPARE_SHELL} flex flex-col gap-3 pb-2 sm:flex-row`}>
                <button
                  type="button"
                  onClick={scrollToComparePurchase}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto"
                >
                  Satın Alma Alanına Dön
                </button>
                <button
                  type="button"
                  onClick={scrollToCompareTable}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 sm:w-auto"
                >
                  SaaS ile Karşılaştır
                </button>
              </div>
            </div>
          ) : (
            <div className={`${MK_COMPARE_SHELL} h-40 animate-pulse rounded-2xl bg-slate-100`} />
          )
        ) : null}
      </div>

      <div
        role="tabpanel"
        id={`${tablistId}-panel-saas`}
        aria-labelledby={`${tablistId}-saas`}
        hidden={tab !== 'saas'}
        className="mt-8"
      >
        {tab === 'saas' ? (
          saasQuery.isError || (!saasQuery.isPending && !saas) ? (
            <div className={MK_COMPARE_SHELL}>
              <ErrorState
                title="SaaS detayları yüklenemedi"
                message={getErrorMessage(saasQuery.error, 'SaaS ürün içeriği alınamadı.')}
                action={
                  <button
                    type="button"
                    onClick={() => saasQuery.refetch()}
                    className="text-sm font-semibold text-sky-700"
                  >
                    Tekrar dene
                  </button>
                }
              />
            </div>
          ) : saas ? (
            <div>
              <div className="[&>div]:bg-transparent [&_.max-w-7xl]:!max-w-[1180px]">
                <MuvekkilKasaSaasDetailSections />
              </div>
              <div className={`${MK_COMPARE_SHELL} flex flex-col gap-3 py-10 sm:flex-row sm:flex-wrap`}>
                <button
                  type="button"
                  onClick={scrollToComparePurchase}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-sky-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 sm:w-auto"
                >
                  Satın Alma Alanına Dön
                </button>
                <button
                  type="button"
                  onClick={scrollToCompareTable}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 sm:w-auto"
                >
                  Masaüstü ile Karşılaştır
                </button>
                <button
                  type="button"
                  onClick={saasCtx.onOpenDemo}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-5 py-3.5 text-sm font-semibold text-sky-900 transition hover:bg-sky-100 sm:w-auto"
                >
                  <Sparkles className="h-4 w-4" aria-hidden />
                  7 Gün Ücretsiz Dene
                </button>
              </div>
            </div>
          ) : (
            <div className={`${MK_COMPARE_SHELL} h-40 animate-pulse rounded-2xl bg-slate-100`} />
          )
        ) : null}
      </div>
    </section>
  )
}
