import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

export type BreadcrumbItem = {
  label: string
  href?: string
}

type Props = {
  items: BreadcrumbItem[]
  className?: string
  dark?: boolean
}

export function Breadcrumbs({ items, className, dark = false }: Props) {
  if (!items.length) return null
  return (
    <nav aria-label="Breadcrumb" className={cn('flex flex-wrap items-center gap-1 text-sm', className)}>
      {items.map((crumb, index) => (
        <span key={`${crumb.label}-${index}`} className="inline-flex items-center gap-1">
          {index > 0 ? <span className={dark ? 'text-slate-500' : 'text-slate-400'} aria-hidden>/</span> : null}
          {crumb.href ? (
            <Link
              to={crumb.href}
              className={cn('transition', dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')}
            >
              {crumb.label}
            </Link>
          ) : (
            <span className={cn('font-medium', dark ? 'text-emerald-400' : 'text-emerald-700')}>{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
