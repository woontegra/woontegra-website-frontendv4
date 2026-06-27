import { createContext, useContext, type ReactNode } from 'react'
import type { FieldFocusTarget } from '@/builder/edit/fieldFocus'

const SettingsFocusContext = createContext<FieldFocusTarget | null>(null)

export function SettingsFocusProvider({
  focusTarget,
  children,
}: {
  focusTarget: FieldFocusTarget | null
  children: ReactNode
}) {
  return (
    <SettingsFocusContext.Provider value={focusTarget}>{children}</SettingsFocusContext.Provider>
  )
}

export function useSettingsFocus(): FieldFocusTarget | null {
  return useContext(SettingsFocusContext)
}
