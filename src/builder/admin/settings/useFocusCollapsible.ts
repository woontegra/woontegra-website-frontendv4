import { useEffect } from 'react'
import { useSettingsFocus } from '@/builder/edit/SettingsFocusContext'

export function useFocusCollapsible(setOpenId: (id: string | null) => void): void {
  const focus = useSettingsFocus()

  useEffect(() => {
    if (focus?.collapsibleId) setOpenId(focus.collapsibleId)
  }, [focus?.collapsibleId, setOpenId])
}
