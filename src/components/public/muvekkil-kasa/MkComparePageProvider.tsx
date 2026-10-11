import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { MkSaasProductPageProvider } from '@/components/public/product/MkSaasProductPageProvider'
import {
  MK_DESKTOP_CANONICAL_SLUG,
  parseMkCompareSurumParam,
  scrollToCompareDetails,
  type MkCompareEdition,
} from '@/components/public/muvekkil-kasa/comparePageUtils'
import {
  MK_COMPARE_DEFAULT_PLATFORM,
  parseMkComparePlatformParam,
  scrollToComparePlatformCard,
  type MkComparePlatform,
} from '@/components/public/muvekkil-kasa/mkComparePlatform'
import { clearAffiliateLanding, readRecentAffiliateLanding } from '@/lib/affiliateLandingMarker'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { MK_MACOS_PRODUCT_SLUG } from '@/lib/muvekkilKasaDesktopPlatform'
import { MK_SAAS_CANONICAL_SLUG } from '@/lib/muvekkilKasaSaasProduct'
import { productsService } from '@/services/productsService'
import type { PublicProductDetail } from '@/types/product'
import type { BuilderBlock, HeroBlock, MkSaasPurchaseBlock } from '@/builder/types'
import type { MkComparePurchaseCardCopy } from '@/builder/types/mkSaasPurchase'

type ProductQuery = UseQueryResult<PublicProductDetail, Error>

export type MkComparePanelCopy = {
  desktop?: MkComparePurchaseCardCopy
  saas?: MkComparePurchaseCardCopy
  macos?: MkComparePurchaseCardCopy
}

function findComparePurchaseBlock(blocks: readonly BuilderBlock[] | null | undefined): MkSaasPurchaseBlock | null {
  const match = blocks?.find(
    (b) => b.type === 'mk-saas-purchase' && (b as MkSaasPurchaseBlock).settings?.layout === 'compare',
  )
  return (match as MkSaasPurchaseBlock | undefined) ?? null
}

function comparePanelCopy(blocks: readonly BuilderBlock[] | null | undefined): MkComparePanelCopy {
  const settings = findComparePurchaseBlock(blocks)?.settings
  return {
    desktop: settings?.compareDesktop,
    saas: settings?.compareSaas,
    macos: settings?.compareMacos,
  }
}

/** Görünür compare hero varsa satış paneli hero'nun sağ sütununda çizilir. */
export function blocksHostPanelInHero(blocks: readonly BuilderBlock[] | null | undefined): boolean {
  return Boolean(
    blocks?.some(
      (b) => b.type === 'hero' && b.visibility.enabled && (b as HeroBlock).settings?.layout === 'compare',
    ),
  )
}

type MkComparePageContextValue = {
  desktopQuery: ProductQuery
  saasQuery: ProductQuery
  macosQuery: ProductQuery
  detailTab: MkCompareEdition
  setDetailTab: (tab: MkCompareEdition) => void
  showProductDetails: (edition: MkCompareEdition) => void
  /** Satış panelinde açık sekme (WEB / WINDOWS / macOS). */
  platformTab: MkComparePlatform
  setPlatformTab: (platform: MkComparePlatform) => void
  /**
   * `?surum=` ile seçilen platform (sekme + kaydırma).
   * Parametre yoksa null.
   */
  highlightedPlatform: MkComparePlatform | null
  /** Yalnızca /r/:code iş ortağı yönlendirmesiyle gelindiyse hedef platform; aksi halde null. */
  referralPlatform: MkComparePlatform | null
  /** Builder satın alma bloğundaki kart metinleri (admin). */
  panelCopy: MkComparePanelCopy
  /** true: panel hero'da; satın alma bloğu paneli ikinci kez çizmez. */
  panelInHero: boolean
}

const MkComparePageContext = createContext<MkComparePageContextValue | null>(null)

export function useMkComparePageContext(): MkComparePageContextValue {
  const ctx = useContext(MkComparePageContext)
  if (!ctx) {
    throw new Error('useMkComparePageContext yalnızca MkComparePageProvider içinde kullanılabilir')
  }
  return ctx
}

export function useMkComparePageContextOptional(): MkComparePageContextValue | null {
  return useContext(MkComparePageContext)
}

type Props = {
  previewSafe?: boolean
  /** Yayınlanan / düzenlenen builder blokları; yedek görünümde yoktur. */
  blocks?: readonly BuilderBlock[] | null
  children: ReactNode
}

export function MkComparePageProvider({ previewSafe = false, blocks = null, children }: Props) {
  const [searchParams] = useSearchParams()
  const surumParam = searchParams.get('surum')
  const hasSurumParam = surumParam != null && surumParam.trim() !== ''
  // Önceden saas dışındaki her ?surum= değeri masaüstünü vurguluyordu; bu korunur.
  const highlightedPlatform: MkComparePlatform | null = hasSurumParam
    ? (parseMkComparePlatformParam(surumParam) ?? 'windows')
    : null
  const [fromAffiliateLanding] = useState(readRecentAffiliateLanding)
  useEffect(() => {
    if (fromAffiliateLanding) clearAffiliateLanding()
  }, [fromAffiliateLanding])
  const referralPlatform = fromAffiliateLanding ? highlightedPlatform : null
  const [detailTab, setDetailTab] = useState<MkCompareEdition>(() => parseMkCompareSurumParam(surumParam))
  const [platformTab, setPlatformTab] = useState<MkComparePlatform>(
    () => highlightedPlatform ?? MK_COMPARE_DEFAULT_PLATFORM,
  )

  useEffect(() => {
    setDetailTab(parseMkCompareSurumParam(surumParam))
    if (highlightedPlatform) setPlatformTab(highlightedPlatform)
  }, [surumParam, highlightedPlatform])

  const showProductDetails = (edition: MkCompareEdition) => {
    setDetailTab(edition)
    requestAnimationFrame(() => {
      scrollToCompareDetails()
    })
  }

  const desktopQuery = useQuery({
    queryKey: ['products', MK_DESKTOP_CANONICAL_SLUG],
    queryFn: () => productsService.getBySlug(MK_DESKTOP_CANONICAL_SLUG),
    ...publicQueryOptions,
  })

  const saasQuery = useQuery({
    queryKey: ['products', MK_SAAS_CANONICAL_SLUG],
    queryFn: () => productsService.getBySlug(MK_SAAS_CANONICAL_SLUG),
    ...publicQueryOptions,
  })

  const macosQuery = useQuery({
    queryKey: ['products', MK_MACOS_PRODUCT_SLUG],
    queryFn: () => productsService.getBySlug(MK_MACOS_PRODUCT_SLUG),
    ...publicQueryOptions,
  })

  // ?surum= ile gelince ilgili sekmeye kaydır (vurgu sayfa açık kaldığı sürece kalır).
  const highlightedQuery =
    highlightedPlatform === 'web' ? saasQuery : highlightedPlatform === 'macos' ? macosQuery : desktopQuery
  useEffect(() => {
    if (!highlightedPlatform) return
    if (highlightedQuery.isPending) return

    const scrollTimer = window.setTimeout(() => {
      scrollToComparePlatformCard(highlightedPlatform)
    }, 80)

    return () => window.clearTimeout(scrollTimer)
  }, [highlightedPlatform, highlightedQuery.isPending, highlightedQuery.dataUpdatedAt])

  const value: MkComparePageContextValue = {
    desktopQuery,
    saasQuery,
    macosQuery,
    detailTab,
    setDetailTab,
    showProductDetails,
    platformTab,
    setPlatformTab,
    highlightedPlatform,
    referralPlatform,
    panelCopy: comparePanelCopy(blocks),
    panelInHero: blocksHostPanelInHero(blocks),
  }

  return (
    <MkComparePageContext.Provider value={value}>
      <MkSaasProductPageProvider product={saasQuery.data ?? null} previewSafe={previewSafe}>
        {children}
      </MkSaasProductPageProvider>
    </MkComparePageContext.Provider>
  )
}
