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
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { MK_SAAS_CANONICAL_SLUG } from '@/lib/muvekkilKasaSaasProduct'
import { productsService } from '@/services/productsService'
import type { PublicProductDetail } from '@/types/product'

type ProductQuery = UseQueryResult<PublicProductDetail, Error>

type MkComparePageContextValue = {
  desktopQuery: ProductQuery
  saasQuery: ProductQuery
  detailTab: MkCompareEdition
  setDetailTab: (tab: MkCompareEdition) => void
  showProductDetails: (edition: MkCompareEdition) => void
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
  children: ReactNode
}

export function MkComparePageProvider({ previewSafe = false, children }: Props) {
  const [searchParams] = useSearchParams()
  const surumParam = searchParams.get('surum')
  const [detailTab, setDetailTab] = useState<MkCompareEdition>(() => parseMkCompareSurumParam(surumParam))

  useEffect(() => {
    setDetailTab(parseMkCompareSurumParam(surumParam))
  }, [surumParam])

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

  const value: MkComparePageContextValue = {
    desktopQuery,
    saasQuery,
    detailTab,
    setDetailTab,
    showProductDetails,
  }

  return (
    <MkComparePageContext.Provider value={value}>
      <MkSaasProductPageProvider product={saasQuery.data ?? null} previewSafe={previewSafe}>
        {children}
      </MkSaasProductPageProvider>
    </MkComparePageContext.Provider>
  )
}
