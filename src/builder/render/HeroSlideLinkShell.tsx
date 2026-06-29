import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useBuilderEditContext } from '@/builder/edit/BuilderEditContext'
import { resolvePublicHref } from '@/lib/publicNavUrl'
import { cn } from '@/lib/cn'

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')
}

type Props = {
  href?: string | null
  className?: string
  children: ReactNode
  ariaLabel?: string
}

/**
 * Carousel slide görsel linki — public sitede tıklanabilir;
 * builder edit modunda (annotateFields) div kalır, navigate olmaz.
 */
export function HeroSlideLinkShell({ href, className, children, ariaLabel }: Props) {
  const { annotateFields } = useBuilderEditContext()
  const raw = href?.trim() ?? ''
  const linked = Boolean(raw) && !annotateFields

  if (!linked) {
    return <div className={className}>{children}</div>
  }

  if (raw.startsWith('#')) {
    const id = raw.slice(1)
    return (
      <a
        href={raw}
        className={cn(className, 'cursor-pointer')}
        aria-label={ariaLabel}
        onClick={(e) => {
          if (!id) return
          const el = document.getElementById(id)
          if (el) {
            e.preventDefault()
            el.scrollIntoView({ behavior: 'smooth' })
          }
        }}
      >
        {children}
      </a>
    )
  }

  if (isExternalHref(raw)) {
    const newTab = /^https?:\/\//i.test(raw)
    return (
      <a
        href={raw}
        className={cn(className, 'cursor-pointer')}
        aria-label={ariaLabel}
        target={newTab ? '_blank' : undefined}
        rel={newTab ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    )
  }

  const to = resolvePublicHref(raw.startsWith('/') ? raw : `/${raw}`)
  return (
    <Link to={to} className={cn(className, 'cursor-pointer')} aria-label={ariaLabel}>
      {children}
    </Link>
  )
}
