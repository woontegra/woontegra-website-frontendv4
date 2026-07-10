import { Link, Outlet, useLocation } from 'react-router-dom'
import '@/admin.css'
import {
  Cloud,
  Download,
  ImageIcon,
  KeyRound,
  LayoutDashboard,
  Megaphone,
  Package,
  Settings,
  ShoppingBag,
  Users,
  Wallet,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { usePrivatePageMeta } from '@/hooks/usePageMeta'
import { cn } from '@/lib/cn'

type NavItem = {
  to: string
  label: string
  end?: boolean
}

type NavGroup = {
  title: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Panel',
    items: [{ to: '/admin', label: 'Dashboard', end: true }],
  },
  {
    title: 'Satış',
    items: [
      { to: '/admin/orders', label: 'Siparişler' },
      { to: '/admin/payments', label: 'Ödemeler' },
      { to: '/admin/customers', label: 'Müşteriler' },
    ],
  },
  {
    title: 'Lisans & Erişim',
    items: [
      { to: '/admin/saas-subscriptions', label: 'SaaS Abonelikleri' },
      { to: '/admin/saas-subscriptions/new', label: 'Manuel Abonelik Oluştur' },
      { to: '/admin/licenses', label: 'Masaüstü Lisans Özetleri' },
    ],
  },
  {
    title: 'Katalog',
    items: [
      { to: '/admin/products', label: 'Ürünler / Yazılımlar' },
      { to: '/admin/download-stats', label: 'İndirme İstatistikleri' },
      { to: '/admin/media', label: 'Medya Kütüphanesi' },
    ],
  },
  {
    title: 'Pazarlama',
    items: [{ to: '/admin/campaigns', label: 'Kampanyalar' }],
  },
  {
    title: 'Site',
    items: [
      { to: '/admin/builder', label: 'Page Builder' },
      { to: '/admin/settings', label: 'Site Ayarları' },
    ],
  },
]

function groupIcon(label: string) {
  if (label === 'Siparişler') return ShoppingBag
  if (label === 'Ödemeler') return Wallet
  if (label === 'Müşteriler') return Users
  if (label.includes('SaaS')) return Cloud
  if (label.includes('İndirme')) return Download
  if (label.includes('Lisans')) return KeyRound
  if (label.includes('Ürün')) return Package
  if (label.includes('Medya')) return ImageIcon
  if (label.includes('Kampanya')) return Megaphone
  if (label.includes('Builder')) return LayoutDashboard
  if (label.includes('Ayar')) return Settings
  return LayoutDashboard
}

function isNavActive(pathname: string, to: string, end?: boolean): boolean {
  if (end) return pathname === to
  return pathname === to || pathname.startsWith(`${to}/`)
}

export function AdminLayout() {
  usePrivatePageMeta('Woontegra Admin')
  const location = useLocation()
  const clearSession = useAuthStore((s) => s.clearAdminSession)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-56 shrink-0 border-r border-slate-200 bg-white p-4">
        <p className="mb-6 text-sm font-bold text-slate-900">Woontegra Admin</p>
        <nav className="space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isNavActive(location.pathname, item.to, item.end)
                  const Icon = groupIcon(item.label)
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
                        active
                          ? 'bg-emerald-50 font-medium text-emerald-800'
                          : 'text-slate-600 hover:bg-slate-50',
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 opacity-70" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => {
            clearSession()
            window.location.assign('/admin/giris')
          }}
          className="mt-8 text-sm text-slate-500 hover:text-slate-800"
        >
          Çıkış
        </button>
      </aside>
      <div className="min-w-0 flex-1 p-6">
        <Outlet />
      </div>
    </div>
  )
}
