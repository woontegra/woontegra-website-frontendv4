import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { BilirkisiDemoRequestModal } from '@/components/public/product/BilirkisiDemoRequestModal'
import { useBuilderEditContext } from '@/builder/edit/BuilderEditContext'

type BhModulePageContextValue = {
  onOpenDemo: () => void
  previewSafe: boolean
  /** CMS katalog başlığı — breadcrumb son adımı */
  moduleTitle: string
}

const BhModulePageContext = createContext<BhModulePageContextValue | null>(null)

export function useBhModulePageContextOptional(): BhModulePageContextValue | null {
  return useContext(BhModulePageContext)
}

type ProviderProps = {
  previewSafe?: boolean
  moduleTitle?: string
  children: ReactNode
}

/**
 * BH modül detay sayfaları — Demo Talep Et → mevcut BilirkisiDemoRequestModal.
 * Mk SaaS demo akışından ayrı; BH backend/demo API değişmez.
 */
export function BhModulePageProvider({
  previewSafe = false,
  moduleTitle = '',
  children,
}: ProviderProps) {
  const { annotateFields } = useBuilderEditContext()
  const [demoOpen, setDemoOpen] = useState(false)
  const isPreviewSafe = previewSafe || annotateFields

  const onOpenDemo = useCallback(() => {
    if (isPreviewSafe) return
    setDemoOpen(true)
  }, [isPreviewSafe])

  return (
    <BhModulePageContext.Provider
      value={{ onOpenDemo, previewSafe: isPreviewSafe, moduleTitle: moduleTitle.trim() }}
    >
      {children}
      {!isPreviewSafe ? (
        <BilirkisiDemoRequestModal open={demoOpen} onClose={() => setDemoOpen(false)} />
      ) : null}
    </BhModulePageContext.Provider>
  )
}
