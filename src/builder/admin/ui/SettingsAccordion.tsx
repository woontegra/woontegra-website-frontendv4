import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { useSettingsFocus } from '@/builder/edit/SettingsFocusContext'

type AccordionItem = {
  id: string
  title: string
  description?: string
  children: ReactNode
  defaultOpen?: boolean
}

type Props = {
  items: AccordionItem[]
  className?: string
}

export function SettingsAccordion({ items, className }: Props) {
  const focusTarget = useSettingsFocus()

  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    const initial = items.filter((i) => i.defaultOpen).map((i) => i.id)
    return new Set(initial.length > 0 ? initial : [items[0]?.id].filter(Boolean))
  })

  useEffect(() => {
    if (!focusTarget?.sectionId) return
    setOpenIds((prev) => new Set([...prev, focusTarget.sectionId]))
  }, [focusTarget?.sectionId])

  useEffect(() => {
    if (!focusTarget?.settingsFieldId) return
    const timer = window.setTimeout(() => {
      const field = document.querySelector(
        `[data-builder-settings-field="${focusTarget.settingsFieldId}"]`,
      )
      field?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      const input = field?.querySelector('input, textarea, select') as HTMLElement | null
      input?.focus({ preventScroll: true })
    }, 80)
    return () => window.clearTimeout(timer)
  }, [focusTarget?.settingsFieldId, focusTarget?.sectionId])

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className={cn('divide-y divide-slate-100', className)}>
      {items.map((item) => {
        const open = openIds.has(item.id)
        const focusedSection = focusTarget?.sectionId === item.id
        return (
          <section key={item.id}>
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className={cn(
                'flex w-full items-start gap-2 px-4 py-3 text-left transition hover:bg-slate-50/80',
                focusedSection && 'bg-violet-50/50',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 text-slate-400 transition-transform',
                  open && 'rotate-90',
                )}
              >
                ▸
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-slate-800">{item.title}</span>
                {item.description ? (
                  <span className="mt-0.5 block text-xs text-slate-400">{item.description}</span>
                ) : null}
              </span>
            </button>
            {open ? <div className="space-y-3 px-4 pb-4 pt-0">{item.children}</div> : null}
          </section>
        )
      })}
    </div>
  )
}

export function CollapsibleItem({
  title,
  subtitle,
  open,
  onToggle,
  onRemove,
  children,
}: {
  title: string
  subtitle?: string
  open: boolean
  onToggle: () => void
  onRemove?: () => void
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className={cn('text-slate-400 transition-transform', open && 'rotate-90')}>▸</span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-slate-800">{title}</span>
            {subtitle ? (
              <span className="block truncate text-xs text-slate-400">{subtitle}</span>
            ) : null}
          </span>
        </button>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50"
          >
            Sil
          </button>
        ) : null}
      </div>
      {open ? <div className="space-y-3 border-t border-slate-100 px-3 py-3">{children}</div> : null}
    </div>
  )
}
