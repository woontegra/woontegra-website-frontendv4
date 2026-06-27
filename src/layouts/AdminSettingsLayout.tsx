import { NavLink, Outlet } from 'react-router-dom'
import { BarChart3, CreditCard, Mail, Palette, Settings, Users } from 'lucide-react'
import { cn } from '@/lib/cn'

const SECTIONS = [
  { to: '/admin/settings/site', label: 'Site', icon: Settings, end: true },
  { to: '/admin/settings/analytics', label: 'Analytics & Pixel', icon: BarChart3 },
  { to: '/admin/settings/payment', label: 'Ödeme', icon: CreditCard },
  { to: '/admin/settings/email', label: 'E-posta', icon: Mail },
  { to: '/admin/settings/appearance', label: 'Görünüm', icon: Palette },
  { to: '/admin/settings/users', label: 'Kullanıcı', icon: Users },
] as const

export function AdminSettingsLayout() {
  return (
    <div className="w-full min-w-0 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Site Ayarları</h1>
        <p className="mt-1 text-sm text-slate-600">V3 admin ayarları — site, ödeme, e-posta ve kullanıcı yapılandırması.</p>
      </div>

      <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        {SECTIONS.map(({ to, label, icon: Icon, ...rest }) => (
          <NavLink
            key={to}
            to={to}
            end={'end' in rest ? rest.end : false}
            className={({ isActive }) =>
              cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition',
                isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100',
              )
            }
          >
            <Icon className="h-4 w-4 opacity-70" />
            {label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  )
}
