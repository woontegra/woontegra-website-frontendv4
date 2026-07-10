import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

export type PaymentResultAction = {
  to?: string
  label: string
  variant?: 'primary' | 'secondary' | 'ghost'
  icon?: LucideIcon
  onClick?: () => void
  disabled?: boolean
}

export type PaymentResultTrustCard = {
  icon: LucideIcon
  title: string
  description: string
}

type Props = {
  tone: 'success' | 'failure'
  icon: LucideIcon
  eyebrow?: string
  title: string
  description: ReactNode
  children?: ReactNode
  trustCards?: PaymentResultTrustCard[]
  actions: PaymentResultAction[]
}

const ACTION_STYLES = {
  primary:
    'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 focus-visible:ring-emerald-500',
  secondary:
    'border border-slate-200 bg-white text-slate-800 hover:border-emerald-200 hover:bg-emerald-50/50 focus-visible:ring-emerald-500',
  ghost: 'text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400',
} as const

function ResultAction({ to, label, variant = 'primary', icon: Icon, onClick, disabled }: PaymentResultAction) {
  const className = cn(
    'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-auto',
    ACTION_STYLES[variant],
    disabled && 'pointer-events-none opacity-60',
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} disabled={disabled} className={className}>
        {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden /> : null}
        {label}
      </button>
    )
  }

  return (
    <Link to={to ?? '/'} className={className}>
      {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden /> : null}
      {label}
    </Link>
  )
}

export function PaymentResultLayout({
  tone,
  icon: Icon,
  eyebrow,
  title,
  description,
  children,
  trustCards,
  actions,
}: Props) {
  const isSuccess = tone === 'success'

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        isSuccess
          ? 'bg-gradient-to-b from-emerald-50/80 via-slate-50 to-white'
          : 'bg-gradient-to-b from-amber-50/60 via-slate-50 to-white',
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full blur-3xl',
          isSuccess ? 'bg-emerald-200/40' : 'bg-amber-200/35',
        )}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 top-32 h-64 w-64 rounded-full bg-sky-200/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-48 w-[32rem] -translate-x-1/2 rounded-full bg-indigo-100/25 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[min(72vh,880px)] max-w-4xl flex-col justify-center px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-sm sm:p-8 lg:p-10">
          <div className="text-center">
            {eyebrow ? (
              <p
                className={cn(
                  'text-xs font-bold uppercase tracking-[0.2em]',
                  isSuccess ? 'text-emerald-600' : 'text-amber-700',
                )}
              >
                {eyebrow}
              </p>
            ) : null}

            <div
              className={cn(
                'mx-auto mt-4 flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg sm:h-24 sm:w-24',
                isSuccess
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/25'
                  : 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/25',
              )}
            >
              <Icon className="h-10 w-10 sm:h-11 sm:w-11" strokeWidth={1.75} aria-hidden />
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              {title}
            </h1>
            <div className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600">{description}</div>
          </div>

          {children ? <div className="mt-8">{children}</div> : null}

          {trustCards?.length ? (
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {trustCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 text-left transition hover:border-emerald-200/80 hover:bg-white"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200/80">
                    <card.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-slate-900">{card.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{card.description}</p>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {actions.map((action) => (
              <ResultAction key={`${action.to ?? 'action'}-${action.label}`} {...action} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PaymentResultPanel({
  title,
  children,
  className,
}: {
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5', className)}>
      {title ? <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h2> : null}
      <div className={title ? 'mt-3' : undefined}>{children}</div>
    </div>
  )
}

export function PaymentResultSteps({ items }: { items: string[] }) {
  return (
    <ol className="space-y-3">
      {items.map((item, i) => (
        <li key={item} className="flex gap-3 text-sm text-slate-700">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
            {i + 1}
          </span>
          <span className="pt-0.5 leading-relaxed">{item}</span>
        </li>
      ))}
    </ol>
  )
}
