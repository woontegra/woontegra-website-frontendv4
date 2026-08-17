import { createContext, useContext, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MkSaasDemoRequestModal } from '@/components/public/product/MkSaasDemoRequestModal'
import { useMkSaasProductPageActions } from '@/hooks/useMkSaasProductPageActions'
import { useBuilderEditContext } from '@/builder/edit/BuilderEditContext'
import { MK_SAAS_CANONICAL_SLUG } from '@/lib/muvekkilKasaSaasProduct'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { productsService } from '@/services/productsService'
import type { PublicProductDetail } from '@/types/product'
import { useCustomerSession } from '@/hooks/useCustomerSession'

type MkSaasProductPageContextValue = ReturnType<typeof useMkSaasProductPageActions> & {
  previewSafe: boolean
}

const MkSaasProductPageContext = createContext<MkSaasProductPageContextValue | null>(null)

export function useMkSaasProductPageContext(): MkSaasProductPageContextValue {
  const ctx = useContext(MkSaasProductPageContext)
  if (!ctx) {
    throw new Error('useMkSaasProductPageContext yalnızca MkSaasProductPageProvider içinde kullanılabilir')
  }
  return ctx
}

export function useMkSaasProductPageContextOptional(): MkSaasProductPageContextValue | null {
  return useContext(MkSaasProductPageContext)
}

type ProviderProps = {
  product?: PublicProductDetail | null
  previewSafe?: boolean
  children: ReactNode
}

export function MkSaasProductPageProvider({ product: productProp, previewSafe = false, children }: ProviderProps) {
  const { annotateFields } = useBuilderEditContext()
  const { authed, profile } = useCustomerSession()
  const actions = useMkSaasProductPageActions(productProp)
  const isPreviewSafe = previewSafe || annotateFields

  const value: MkSaasProductPageContextValue = {
    ...actions,
    previewSafe: isPreviewSafe,
    onAddToCart: isPreviewSafe ? () => undefined : actions.onAddToCart,
    onOpenDemo: isPreviewSafe ? () => undefined : actions.onOpenDemo,
  }

  return (
    <MkSaasProductPageContext.Provider value={value}>
      {children}
      {!isPreviewSafe && productProp ? (
        <MkSaasDemoRequestModal
          open={actions.demoOpen}
          onClose={actions.onCloseDemo}
          defaultEmail={authed ? profile?.email ?? '' : ''}
          defaultName={authed ? profile?.name ?? '' : ''}
          defaultPhone={authed ? profile?.phone ?? '' : ''}
        />
      ) : null}
    </MkSaasProductPageContext.Provider>
  )
}

/** Admin builder önizlemesi — ürünü API'den yükler */
export function MkSaasBuilderPreviewProvider({ children }: { children: ReactNode }) {
  const { data: product } = useQuery({
    queryKey: ['products', MK_SAAS_CANONICAL_SLUG],
    queryFn: () => productsService.getBySlug(MK_SAAS_CANONICAL_SLUG),
    ...publicQueryOptions,
  })

  return (
    <MkSaasProductPageProvider product={product ?? null} previewSafe>
      {children}
    </MkSaasProductPageProvider>
  )
}
