import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { useBuilderEditContext } from '@/builder/edit/BuilderEditContext'
import { resolvePublicHref } from '@/lib/publicNavUrl'
import { cn } from '@/lib/cn'
import type { CardGridItem } from '@/builder/types'

export function resolveCardHref(card: CardGridItem): string {
  const row = card as CardGridItem & { link?: string }
  return (card.href ?? row.link ?? '').trim()
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')
}

function cardAriaLabel(card: CardGridItem): string {
  const title = card.title?.trim()
  if (title) return `${title} sayfasını aç`
  return 'Kart bağlantısını aç'
}

export const CARD_LINK_HOVER_CLASS =
  'cursor-pointer transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500'

type CardLinkShellProps = {
  card: CardGridItem
  className?: string
  children: ReactNode
  /** Link yokken kullanılacak kök etiket */
  as?: 'div' | 'article'
  showExternalIcon?: boolean
}

/**
 * Public modda kartı tıklanabilir yapar; builder edit modunda (annotateFields) div/article kalır.
 */
export function CardLinkShell({
  card,
  className,
  children,
  as: StaticTag = 'article',
  showExternalIcon = true,
}: CardLinkShellProps) {
  const { annotateFields } = useBuilderEditContext()
  const href = resolveCardHref(card)
  const linked = Boolean(href) && !annotateFields
  const ariaLabel = cardAriaLabel(card)

  if (!linked) {
    return <StaticTag className={className}>{children}</StaticTag>
  }

  const linkedClass = cn(className, CARD_LINK_HOVER_CLASS, showExternalIcon && 'group relative')

  if (href.startsWith('#')) {
    const id = href.slice(1)
    return (
      <a
        href={href}
        className={linkedClass}
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

  if (isExternalHref(href)) {
    const newTab = /^https?:\/\//i.test(href)
    return (
      <a
        href={href}
        className={linkedClass}
        aria-label={ariaLabel}
        target={newTab ? '_blank' : undefined}
        rel={newTab ? 'noopener noreferrer' : undefined}
      >
        {children}
        {showExternalIcon && newTab ? (
          <ExternalLink
            className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400 opacity-0 transition group-hover:opacity-100"
            aria-hidden
          />
        ) : null}
      </a>
    )
  }

  const to = resolvePublicHref(href.startsWith('/') ? href : `/${href}`)
  return (
    <Link to={to} className={linkedClass} aria-label={ariaLabel}>
      {children}
    </Link>
  )
}

export function CardButtonLabel({ card, light }: { card: CardGridItem; light?: boolean }) {
  const label = card.buttonLabel?.trim()
  if (!label) return null

  return (
    <span
      className={cn(
        'mt-4 inline-flex items-center text-sm font-semibold group-hover:underline',
        light ? 'text-emerald-400' : 'text-emerald-700',
      )}
    >
      {label} →
    </span>
  )
}
