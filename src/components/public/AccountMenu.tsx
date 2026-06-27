import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, Download, KeyRound, LogOut, Package, UserRound } from 'lucide-react'
import { useCustomerSession } from '@/hooks/useCustomerSession'
import { customersService } from '@/services/customersService'
import { cn } from '@/lib/cn'

type Props = {
  compact?: boolean
  onNavigate?: () => void
}

export function AccountMenu({ compact, onNavigate }: Props) {
  const { authed, profile } = useCustomerSession()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const close = () => {
    setOpen(false)
    onNavigate?.()
  }

  const onLogout = () => {
    customersService.logoutLocal()
    close()
    navigate('/giris', { replace: true })
  }

  if (!authed) {
    if (compact) {
      return (
        <div className="space-y-1 border-b border-slate-100 px-4 py-3">
          <p className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Hesabım</p>
          <Link to="/giris" onClick={close} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50">
            Giriş Yap
          </Link>
          <Link to="/kayit" onClick={close} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50">
            Kayıt Ol
          </Link>
          <Link to="/sifremi-unuttum" onClick={close} className="block rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
            Şifremi Unuttum
          </Link>
        </div>
      )
    }

    return (
      <div className="relative hidden lg:block" ref={rootRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <UserRound className="h-5 w-5" aria-hidden />
          <span className="hidden xl:inline">Hesabım</span>
          <ChevronDown className={cn('h-4 w-4 text-slate-400 transition', open && 'rotate-180')} />
        </button>
        {open ? (
          <div className="absolute right-0 top-full z-[110] pt-1">
            <div className="min-w-[200px] rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
              <AccountMenuLink to="/giris" onClick={close}>
                Giriş Yap
              </AccountMenuLink>
              <AccountMenuLink to="/kayit" onClick={close}>
                Kayıt Ol
              </AccountMenuLink>
              <AccountMenuLink to="/sifremi-unuttum" onClick={close} muted>
                Şifremi Unuttum
              </AccountMenuLink>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  const label = profile?.name?.trim() || 'Hesabım'

  if (compact) {
    return (
      <div className="space-y-1 border-b border-slate-100 px-4 py-3">
        <p className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Hesabım</p>
        <p className="truncate px-1 text-sm font-medium text-slate-900">{label}</p>
        <AccountMenuLink to="/hesabim" onClick={close} compact>
          Hesabım
        </AccountMenuLink>
        <AccountMenuLink to="/hesabim/siparisler" onClick={close} compact icon={Package}>
          Siparişlerim
        </AccountMenuLink>
        <AccountMenuLink to="/hesabim/lisanslar" onClick={close} compact icon={KeyRound}>
          Lisanslarım
        </AccountMenuLink>
        <AccountMenuLink to="/hesabim/indirmeler" onClick={close} compact icon={Download}>
          İndirmelerim
        </AccountMenuLink>
        <AccountMenuLink to="/hesabim/profil" onClick={close} compact icon={UserRound}>
          Profilim
        </AccountMenuLink>
        <button type="button" onClick={onLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50">
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </button>
      </div>
    )
  }

  return (
    <div className="relative hidden lg:block" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 max-w-[180px] items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <UserRound className="h-5 w-5 shrink-0 text-emerald-700" aria-hidden />
        <span className="truncate">{label}</span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-slate-400 transition', open && 'rotate-180')} />
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-[110] pt-1">
          <div className="min-w-[220px] rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
            {profile?.email ? (
              <p className="truncate px-4 pb-2 text-xs text-slate-500">{profile.email}</p>
            ) : null}
            <AccountMenuLink to="/hesabim" onClick={close}>
              Hesabım
            </AccountMenuLink>
            <AccountMenuLink to="/hesabim/siparisler" onClick={close} icon={Package}>
              Siparişlerim
            </AccountMenuLink>
            <AccountMenuLink to="/hesabim/lisanslar" onClick={close} icon={KeyRound}>
              Lisanslarım
            </AccountMenuLink>
            <AccountMenuLink to="/hesabim/indirmeler" onClick={close} icon={Download}>
              İndirmelerim
            </AccountMenuLink>
            <AccountMenuLink to="/hesabim/profil" onClick={close} icon={UserRound}>
              Profilim
            </AccountMenuLink>
            <div className="my-1 border-t border-slate-100" />
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Çıkış Yap
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function AccountMenuLink({
  to,
  onClick,
  children,
  muted,
  compact,
  icon: Icon,
}: {
  to: string
  onClick: () => void
  children: ReactNode
  muted?: boolean
  compact?: boolean
  icon?: typeof Package
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 text-sm hover:bg-slate-50',
        compact ? 'rounded-lg px-3 py-2.5 font-medium text-slate-800' : 'px-4 py-2',
        muted ? 'text-slate-600' : 'text-slate-800',
      )}
    >
      {Icon ? <Icon className="h-4 w-4 text-emerald-600" /> : null}
      {children}
    </Link>
  )
}
