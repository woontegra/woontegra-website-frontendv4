import { createContext, useContext, type ReactNode } from 'react'

const PreviewSlugContext = createContext<string | null>(null)

/** Builder önizlemesinde useParams yerine sabit slug kullanılır (iç içe Router gerekmez). */
export function PreviewSlugProvider({ slug, children }: { slug: string; children: ReactNode }) {
  return <PreviewSlugContext.Provider value={slug}>{children}</PreviewSlugContext.Provider>
}

export function usePreviewOrParamSlug(paramSlug: string): string {
  const previewSlug = useContext(PreviewSlugContext)
  return previewSlug ?? paramSlug
}
