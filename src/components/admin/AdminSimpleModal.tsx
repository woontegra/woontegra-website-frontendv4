import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

type Props = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
  className?: string
}

export function AdminSimpleModal({ open, title, onClose, children, footer, wide, className }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Kapat" onClick={onClose} />
      <div
        className={cn(
          'relative z-[81] flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl',
          wide ? 'max-w-3xl' : 'max-w-lg',
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <Button type="button" size="sm" variant="ghost" onClick={onClose}>
            Kapat
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-5 py-3">{footer}</footer>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
