import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { SiteFaviconEffect, siteLogoUrl, usePublicSiteSettings } from '@/hooks/usePublicSiteSettings'
import { partnerPortalService } from '@/services/partnerPortalService'

/**
 * İş Ortağı Portalı — ana site Header/Footer/sepet/hesap yok.
 * Bilirkişi PartnerLayout ile aynı mantık: sade üst bar + max-w-7xl içerik.
 */
export function PartnerLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: settings } = usePublicSiteSettings()
  const logoUrl = siteLogoUrl(settings)
  const isAuthRoute = location.pathname.startsWith('/is-ortagi/giris')

  const onLogout = async () => {
    try {
      await partnerPortalService.logout()
    } catch {
      /* ignore */
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7f8]">
      <SiteFaviconEffect />
      <header className="border-b border-[#e4ebf0] bg-white">
        <div className="mx-auto flex min-h-[3.25rem] max-w-7xl items-center justify-between gap-3 px-4 py-1.5 sm:min-h-[3.5rem] sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Woontegra"
                className="h-9 w-auto max-w-[10rem] object-contain sm:h-10 sm:max-w-[12rem]"
                decoding="async"
              />
            ) : (
              <span className="text-base font-bold tracking-tight text-slate-900">Woontegra</span>
            )}
            <p className="hidden truncate text-[11px] font-normal text-[#8a9aaa] sm:block sm:border-l sm:border-[#e4ebf0] sm:pl-2.5">
              İş Ortağı Portalı
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2.5">
            <p className="text-[10px] font-normal text-[#8a9aaa] sm:hidden">İş Ortağı Portalı</p>
            {!isAuthRoute ? (
              <button
                type="button"
                onClick={() => void onLogout()}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#e4ebf0] bg-white px-2.5 py-1.5 text-[11px] font-normal text-[#5c6b7a] hover:bg-[#f7faf9] hover:text-[#1e2a3a]"
              >
                <LogOut className="h-3.5 w-3.5 opacity-70" />
                Çıkış
              </button>
            ) : (
              <Link
                to="/"
                className="text-[11px] font-normal text-[#8a9aaa] underline-offset-2 hover:text-slate-800 hover:underline"
              >
                Ana site
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 sm:px-6 sm:py-5">
        <Outlet />
      </main>
      <footer className="border-t border-[#eef2f5] py-3 text-center text-[10px] font-normal text-[#9aa8b5]">
        İş Ortağı Portalı
      </footer>
    </div>
  )
}
