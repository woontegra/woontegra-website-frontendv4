import { createContext, useContext, type ReactNode } from 'react'

type BuilderEditContextValue = {
  annotateFields: boolean
}

const BuilderEditContext = createContext<BuilderEditContextValue>({ annotateFields: false })

export function BuilderEditProvider({
  annotateFields,
  children,
}: {
  annotateFields: boolean
  children: ReactNode
}) {
  return (
    <BuilderEditContext.Provider value={{ annotateFields }}>{children}</BuilderEditContext.Provider>
  )
}

export function useBuilderEditContext(): BuilderEditContextValue {
  return useContext(BuilderEditContext)
}
