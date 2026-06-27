import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Props = {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

export function CustomerAuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Woontegra Hesabım</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm leading-relaxed text-slate-600">{subtitle}</p> : null}
        </div>
        {children}
        {footer ? <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-600">{footer}</div> : null}
      </div>
      <p className="mt-6 text-center text-xs text-slate-500">
        Sorun mu yaşıyorsunuz?{' '}
        <Link to="/iletisim" className="font-medium text-emerald-700 hover:underline">
          Destek ile iletişime geçin
        </Link>
      </p>
    </div>
  )
}
