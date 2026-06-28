import { Link } from 'react-router-dom'
import { resolvePublicHref } from '@/lib/publicNavUrl'
import type { BlockButton } from '@/builder/types'

function normalizeButtonHref(href: string, label: string): string {
  const h = href.trim()
  if (h === '#hizmetler' || h === '/#hizmetler') return '/cozumler'
  if (!h || h === '#') {
    const lower = label.toLowerCase()
    if (lower.includes('çözüm') || lower.includes('cozum')) return '/cozumler'
    if (lower.includes('iletişim') || lower.includes('iletisim')) return '/iletisim'
    return h
  }
  return h
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')
}

type Props = {
  btn: BlockButton
  className: string
}

/** Builder hero/CTA butonları — public sitede tıklanabilir Link veya anchor. */
export function BlockButtonLink({ btn, className }: Props) {
  const label = (btn.label ?? '').trim()
  const raw = normalizeButtonHref(btn.href ?? '', label)
  if (!label || !raw) return null

  if (raw.startsWith('#')) {
    const id = raw.slice(1)
    return (
      <a
        href={raw}
        className={className}
        onClick={(e) => {
          if (!id) return
          const el = document.getElementById(id)
          if (el) {
            e.preventDefault()
            el.scrollIntoView({ behavior: 'smooth' })
          }
        }}
      >
        {label}
      </a>
    )
  }

  if (isExternalHref(raw)) {
    return (
      <a
        href={raw}
        className={className}
        target={btn.openInNewTab ? '_blank' : undefined}
        rel={btn.openInNewTab ? 'noopener noreferrer' : undefined}
      >
        {label}
      </a>
    )
  }

  const to = resolvePublicHref(raw.startsWith('/') ? raw : `/${raw}`)
  return (
    <Link
      to={to}
      className={className}
      target={btn.openInNewTab ? '_blank' : undefined}
      rel={btn.openInNewTab ? 'noopener noreferrer' : undefined}
    >
      {label}
    </Link>
  )
}
