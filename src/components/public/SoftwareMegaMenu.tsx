import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { extraSoftwareNavItems, SOFTWARE_SHOWCASE_ITEMS } from '@/data/softwareShowcase'
import { SoftwareShowcaseMark } from '@/components/public/SoftwareShowcaseMark'
import { cn } from '@/lib/cn'
import type { PublicNavigationMenuItem } from '@/types/navigationMenu'

type Props = {
  item: PublicNavigationMenuItem
}

export function SoftwareMegaMenu({ item }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number | null>(null)
  const panelId = useId()
  const extras = extraSoftwareNavItems(item.children)

  const clearCloseTimer = () => {
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const openMenu = () => {
    clearCloseTimer()
    setOpen(true)
  }

  const closeMenu = () => {
    clearCloseTimer()
    setOpen(false)
  }

  const scheduleClose = () => {
    clearCloseTimer()
    closeTimer.current = window.setTimeout(() => setOpen(false), 120)
  }

  useEffect(() => () => clearCloseTimer(), [])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMenu()
        const trigger = rootRef.current?.querySelector<HTMLButtonElement>('button[aria-haspopup="true"]')
        trigger?.focus()
      }
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) closeMenu()
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [open])

  return (
    <div
      ref={rootRef}
      className="relative shrink-0"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={cn(
          'whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-700 transition-colors',
          open ? 'text-emerald-700' : 'hover:text-slate-900',
        )}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={panelId}
        onClick={() => (open ? closeMenu() : openMenu())}
      >
        {item.label} <span className="text-slate-400">▾</span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-label="Yazılımlar menüsü"
        className={cn(
          'absolute left-1/2 top-full z-[110] w-[min(44rem,calc(100vw-2rem))] -translate-x-1/2 pt-2 transition duration-150',
          open ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0',
        )}
        aria-hidden={!open}
        inert={!open || undefined}
      >
        <div className="overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-[0_18px_50px_-24px_rgba(15,23,42,0.35)]">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Yazılımlarımız</p>
              <p className="mt-1 text-sm text-slate-500">İş süreçlerinizi hızlandıran Woontegra çözümleri</p>
            </div>
            <Link
              to="/yazilimlar"
              className="shrink-0 text-sm font-medium text-emerald-700 hover:text-emerald-800"
              onClick={closeMenu}
            >
              Tümünü gör
            </Link>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2">
            {SOFTWARE_SHOWCASE_ITEMS.map((product) => {
              return (
                <Link
                  key={product.id}
                  to={product.href}
                  onClick={closeMenu}
                  className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <SoftwareShowcaseMark item={product} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{product.title}</p>
                      {product.subtitle ? (
                        <p className="mt-0.5 text-xs font-medium text-emerald-700">{product.subtitle}</p>
                      ) : null}
                      <p className="mt-1 line-clamp-2 text-sm leading-snug text-slate-600">{product.description}</p>
                      <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
                        {product.ctaLabel}
                        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {extras.length > 0 ? (
            <div className="border-t border-slate-100 px-4 py-3">
              {extras.map((child) => (
                <Link
                  key={child.id}
                  to={child.href}
                  className="block rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={closeMenu}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
