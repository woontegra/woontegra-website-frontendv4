import { useEffect, useState } from 'react'
import { Menu, ShoppingCart, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MobileMenu } from '@/components/public/MobileMenu'
import { SoftwareMegaMenu } from '@/components/public/SoftwareMegaMenu'
import { AccountMenu } from '@/components/public/AccountMenu'
import { isSoftwareNavItem } from '@/data/softwareShowcase'
import { useCart } from '@/hooks/useCart'
import {
  DEFAULT_PUBLIC_SITE_SETTINGS,
  firstPaintLogoUrl,
  usePublicSiteSettings,
} from '@/hooks/usePublicSiteSettings'
import { DEFAULT_NAVBAR_LOGO_WIDTH, NAVBAR_LOGO_MAX_HEIGHT, navbarLogoImgStyle } from '@/lib/logoSize'
import { mergePublicLogoFields, readPublicBootState } from '@/lib/publicBootState'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { cn } from '@/lib/cn'
import { navigationMenuService } from '@/services/navigationMenuService'
import type { PublicNavigationMenuItem } from '@/types/navigationMenu'

function useIsMobileViewport(): boolean {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const onChange = () => setMobile(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return mobile
}

function CartBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
      {count > 99 ? '99+' : count}
    </span>
  )
}

function DesktopNavItem({ item }: { item: PublicNavigationMenuItem }) {
  const hasChildren = item.children.length > 0
  const [open, setOpen] = useState(false)

  if (isSoftwareNavItem(item)) {
    return <SoftwareMegaMenu item={item} />
  }

  if (!hasChildren) {
    const external = item.href.startsWith('http')
    if (external || item.openInNewTab) {
      return (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap rounded-lg px-3 py-2 text-[15px] font-semibold text-slate-800 transition-colors hover:text-emerald-700"
        >
          {item.label}
        </a>
      )
    }
    return (
      <NavLink
        to={item.href}
        className={({ isActive }) =>
          cn(
            'whitespace-nowrap rounded-lg px-3 py-2 text-[15px] font-semibold transition-colors',
            isActive ? 'text-emerald-700' : 'text-slate-800 hover:text-emerald-700',
          )
        }
      >
        {item.label}
      </NavLink>
    )
  }

  return (
    <div className="relative shrink-0" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Link to={item.href} className="whitespace-nowrap rounded-lg px-3 py-2 text-[15px] font-semibold text-slate-800 transition-colors hover:text-emerald-700">
        {item.label} <span className="text-slate-400">▾</span>
      </Link>
      {open ? (
        <div className="absolute left-0 top-full z-[110] pt-0.5">
          <div className="min-w-[240px] rounded-lg border border-slate-200 bg-white py-2 shadow-[0_16px_40px_-16px_rgba(16,24,40,0.28)]">
            {item.children.map((child) => (
              <Link
                key={child.id}
                to={child.href}
                className="block px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-emerald-700"
                onClick={() => setOpen(false)}
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const isMobile = useIsMobileViewport()
  const { count: cartCount } = useCart()
  const { data: settings = DEFAULT_PUBLIC_SITE_SETTINGS } = usePublicSiteSettings()
  const { data: nav = [] } = useQuery({
    queryKey: ['navigation-menu', 'public'],
    queryFn: () => navigationMenuService.listPublic(),
    ...publicQueryOptions,
  })

  const logoFields = mergePublicLogoFields(settings, readPublicBootState())
  const siteName = logoFields.siteName
  const logoUrl = firstPaintLogoUrl(settings)
  const logoWidth = logoFields.navbarLogoWidth || DEFAULT_NAVBAR_LOGO_WIDTH
  const { width: reservedLogoWidth, style: logoStyle } = navbarLogoImgStyle(logoWidth, isMobile)

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-slate-200 bg-white">
      <div aria-hidden className="h-[3px] bg-gradient-to-r from-[#16A34A] to-[#1D6FD8]" />
      <div className="mx-auto flex h-16 max-w-7xl lg:h-[72px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label={`${siteName} Ana Sayfa`} onClick={() => setMenuOpen(false)}>
          <span
            className="flex shrink-0 items-center"
            style={{
              width: reservedLogoWidth,
              minWidth: reservedLogoWidth,
              height: NAVBAR_LOGO_MAX_HEIGHT,
            }}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={siteName}
                width={reservedLogoWidth}
                height={NAVBAR_LOGO_MAX_HEIGHT}
                decoding="async"
                fetchPriority="auto"
                className="block shrink-0 object-contain object-left"
                style={logoStyle}
              />
            ) : null}
          </span>
        </Link>

        <nav aria-label="Ana menü" className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
          {nav.map((item) => (
            <DesktopNavItem key={item.id} item={item} />
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <AccountMenu />
          <Link
            to="/sepet"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:text-slate-900"
            aria-label="Sepet"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden />
            <CartBadge count={cartCount} />
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 lg:hidden"
            aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="max-h-[calc(100dvh-4.25rem)] overflow-y-auto border-t border-slate-200 bg-white lg:hidden">
          <AccountMenu compact onNavigate={() => setMenuOpen(false)} />
          <MobileMenu items={nav} onNavigate={() => setMenuOpen(false)} />
        </div>
      ) : null}
    </header>
  )
}
