import type { ReactNode } from 'react'
import { Breadcrumbs, type BreadcrumbItem } from '@/components/public/Breadcrumbs'
import { cn } from '@/lib/cn'

type Props = {
  breadcrumbs?: BreadcrumbItem[]
  title?: string
  description?: string
  children: ReactNode
  className?: string
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '6xl'
}

const WIDTH = {
  md: 'max-w-2xl',
  lg: 'max-w-3xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-5xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
} as const

/** İşlem / içerik odaklı sayfalar için sade üst alan (dev hero yok). */
export function PageShell({
  breadcrumbs,
  title,
  description,
  children,
  className,
  maxWidth = '4xl',
}: Props) {
  return (
    <div className={cn('bg-white', className)}>
      <div className={cn('mx-auto px-4 py-6 sm:px-6 sm:py-8', WIDTH[maxWidth])}>
        {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} /> : null}
        {title ? (
          <h1
            className={cn(
              'text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl',
              breadcrumbs?.length ? 'mt-4' : '',
            )}
          >
            {title}
          </h1>
        ) : null}
        {description ? <p className="mt-2 text-sm text-slate-600 sm:text-base">{description}</p> : null}
        <div className={title || description ? 'mt-6' : breadcrumbs?.length ? 'mt-6' : ''}>{children}</div>
      </div>
    </div>
  )
}
