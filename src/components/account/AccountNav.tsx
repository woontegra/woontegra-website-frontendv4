import {
  Cloud,
  CreditCard,
  Download,
  HeadphonesIcon,
  KeyRound,
  LayoutGrid,
  LogOut,
  Package,
  Shield,
  UserRound,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { customersService } from '@/services/customersService'
import { getCustomerProfile } from '@/lib/customerAuth'
import { cn } from '@/lib/cn'

const NAV = [
  { to: '/hesabim', end: true, label: 'Genel Bakış', icon: LayoutGrid },
  { to: '/hesabim/siparisler', label: 'Siparişlerim', icon: Package },
  { to: '/hesabim/lisanslar', label: 'Lisanslarım', icon: KeyRound },
  { to: '/hesabim/uyelikler', label: 'Üyelikler', icon: Cloud },
  { to: '/hesabim/indirmeler', label: 'İndirmelerim', icon: Download },
  { to: '/hesabim/profil', label: 'Profil Bilgilerim', icon: UserRound },
  { to: '/hesabim/fatura', label: 'Fatura Bilgilerim', icon: CreditCard },
  { to: '/hesabim/guvenlik', label: 'Güvenlik', icon: Shield },
  { to: '/hesabim/destek', label: 'Destek', icon: HeadphonesIcon },
] as const

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all lg:w-full',
    isActive
      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
  )

export function AccountNav() {
  const navigate = useNavigate()
  const profile = getCustomerProfile()

  const onLogout = () => {
    customersService.logoutLocal()
    navigate('/giris', { replace: true })
  }

  return (
    <aside className="min-w-0 lg:sticky lg:top-24">
      {profile ? (
        <div className="mb-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm lg:hidden">
          <p className="text-sm font-semibold text-slate-900">{profile.name}</p>
          <p className="truncate text-xs text-slate-500">{profile.email}</p>
        </div>
      ) : null}

      <nav
        className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200/90 bg-white p-2 shadow-sm [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col lg:gap-1 lg:overflow-visible lg:p-2.5 [&::-webkit-scrollbar]:hidden"
        aria-label="Hesap menüsü"
      >
        {NAV.map(({ to, label, icon: Icon, ...rest }) => (
          <NavLink key={to} to={to} className={linkClass} {...rest}>
            <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
            {label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={onLogout}
          className="flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 lg:w-full"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden />
          Çıkış Yap
        </button>
      </nav>
    </aside>
  )
}
