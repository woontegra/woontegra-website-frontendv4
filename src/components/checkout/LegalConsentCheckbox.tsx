import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type Props = {
  checked: boolean
  onChange: (v: boolean) => void
  children: ReactNode
}

export function LegalConsentCheckbox({ checked, onChange, children }: Props) {
  return (
    <label className="flex gap-2.5 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm leading-relaxed text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 shrink-0 rounded border-slate-300"
      />
      <span>{children}</span>
    </label>
  )
}

export function LegalExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      to={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-800"
    >
      {children}
    </Link>
  )
}

/** Statik sayfa yerine siparişe özel önizleme modalını açan link görünümlü buton. */
export function LegalModalLink({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-800"
    >
      {children}
    </button>
  )
}
