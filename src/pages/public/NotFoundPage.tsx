import { Link } from 'react-router-dom'
import { ArrowRight, Home, Mail, Package, Wrench } from 'lucide-react'
import { usePageMeta } from '@/hooks/usePageMeta'

const LINKS = [
  { href: '/', label: 'Ana Sayfa', icon: Home },
  { href: '/hizmetler', label: 'Hizmetler', icon: Wrench },
  { href: '/yazilimlar', label: 'Yazılımlar', icon: Package },
  { href: '/iletisim', label: 'İletişim', icon: Mail },
] as const

export function NotFoundPage() {
  usePageMeta({
    title: 'Sayfa bulunamadı',
    description: 'Aradığınız sayfa mevcut değil veya taşınmış olabilir.',
    noindex: true,
  })

  return (
    <div className="flex min-h-[60vh] items-center bg-gradient-to-b from-slate-50 to-white py-20">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Sayfa bulunamadı
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          Aradığınız adres mevcut değil, kaldırılmış veya geçici olarak kullanılamıyor olabilir.
        </p>
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 text-left transition hover:border-emerald-200 hover:shadow-md"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-700">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-semibold text-slate-900">{label}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
