import { useEffect, useState } from 'react'
import { Menu, ShoppingCart, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MobileMenu } from '@/components/public/MobileMenu'
import { AccountMenu } from '@/components/public/AccountMenu'
import { useCart } from '@/hooks/useCart'
import { DEFAULT_PUBLIC_SITE_SETTINGS, siteLogoUrl, usePublicSiteSettings } from '@/hooks/usePublicSiteSettings'
import { DEFAULT_NAVBAR_LOGO_WIDTH, navbarLogoImgStyle } from '@/lib/logoSize'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { cn } from '@/lib/cn'
import { navigationMenuService } from '@/services/navigationMenuService'
import { MediaImage } from '@/media/components/MediaImage'
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

  if (!hasChildren) {
    const external = item.href.startsWith('http')
    if (external || item.openInNewTab) {
      return (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900"
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
            'whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors',
            isActive ? 'text-emerald-700' : 'text-slate-700 hover:text-slate-900',
          )
        }
      >
        {item.label}
      </NavLink>
    )
  }

  return (
    <div className="relative shrink-0" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Link to={item.href} className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-700">
        {item.label} <span className="text-slate-400">▾</span>
      </Link>
      {open ? (
        <div className="absolute left-0 top-full z-[110] pt-0.5">
          <div className="min-w-[240px] rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
            {item.children.map((child) => (
              <Link
                key={child.id}
                to={child.href}
                className="block rounded-lg px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
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

  const siteName = settings.siteName?.trim() || DEFAULT_PUBLIC_SITE_SETTINGS.siteName
  const logoUrl = siteLogoUrl(settings)
  const logoWidth = settings.navbarLogoWidth ?? DEFAULT_NAVBAR_LOGO_WIDTH
  const { style: logoStyle } = navbarLogoImgStyle(logoWidth, isMobile)

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-slate-100 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label={`${siteName} Ana Sayfa`} onClick={() => setMenuOpen(false)}>
          {logoUrl ? (
            <MediaImage
              src={logoUrl}
              alt={siteName}
              loading="eager"
              className="block shrink-0 object-contain object-left"
              style={logoStyle}
            />
          ) : (
            <span className="text-lg font-semibold tracking-tight text-slate-900">{siteName}</span>
          )}
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
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-slate-200 bg-white lg:hidden">
          <AccountMenu compact onNavigate={() => setMenuOpen(false)} />
          <MobileMenu items={nav} onNavigate={() => setMenuOpen(false)} />
        </div>
      ) : null}
    </header>
  )
}
