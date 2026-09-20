import type { LucideIcon } from 'lucide-react'
import { Building2, Calculator, Shield, Wallet } from 'lucide-react'
import { KOOPPLUS_BRAND_ICON, KOOPPLUS_PATH } from '@/data/koopplusProduct'
import type { PublicNavigationMenuItem } from '@/types/navigationMenu'

export type SoftwareShowcaseItem = {
  id: string
  title: string
  subtitle?: string
  description: string
  href: string
  ctaLabel: string
  icon: LucideIcon
  /** Resmi kare uygulama ikonu / amblem. Yoksa Lucide fallback. */
  logoSrc: string | null
  /** Logo kendi dolu arka planına sahipse çerçeve kutusunu kapatır. */
  logoFlush?: boolean
}

/** Header mega menü / mobil yazılım vitrini — mevcut ürün URL’leri korunur. */
export const SOFTWARE_SHOWCASE_ITEMS: SoftwareShowcaseItem[] = [
  {
    id: 'bilirkisi-hesap',
    title: 'Bilirkişi Hesap',
    description: 'İş hukuku ve bilirkişilik hesaplamalarını web üzerinden hazırlayın.',
    href: '/yazilimlar/bilirkisi-hesap',
    ctaLabel: 'Ürünü İncele',
    icon: Calculator,
    logoSrc: '/images/products/bilirkisi-hesap-icon.png',
    logoFlush: true,
  },
  {
    id: 'muvekkil-kasa-defteri',
    title: 'Müvekkil Kasa Defteri',
    description: 'Avukat büroları için masaüstü ve web tabanlı kasa defteri.',
    href: '/yazilimlar/muvekkil-kasa-defteri',
    ctaLabel: 'Ürünü İncele',
    icon: Wallet,
    logoSrc: '/images/products/muvekkil-kasa-defteri-icon.png',
  },
  {
    id: 'koopplus',
    title: 'KoopPlus',
    subtitle: 'Kooperatif Yönetim Sistemi',
    description: 'Üye, aidat, tahsilat, faiz, kasa ve banka süreçlerini tek merkezden yönetin.',
    href: KOOPPLUS_PATH,
    ctaLabel: 'KoopPlus’ı İncele',
    icon: Building2,
    logoSrc: KOOPPLUS_BRAND_ICON,
  },
  {
    id: 'sifre-kasasi',
    title: 'Woontegra Şifre Kasası',
    description: 'Şifrelerinizi cihazınızda yerel ve şifreli tutun.',
    href: '/yazilimlar/sifre-kasasi',
    ctaLabel: 'Ücretsiz',
    icon: Shield,
    logoSrc: '/images/products/sifre-kasasi-icon.png',
  },
]

function pathOnly(href: string): string {
  return href.split('?')[0]?.split('#')[0] ?? href
}

export function softwareShowcasePathSet(): Set<string> {
  return new Set(SOFTWARE_SHOWCASE_ITEMS.map((item) => pathOnly(item.href)))
}

export function extraSoftwareNavItems(children: PublicNavigationMenuItem[]): PublicNavigationMenuItem[] {
  const known = softwareShowcasePathSet()
  return children.filter((child) => !known.has(pathOnly(child.href)))
}

export function isSoftwareNavItem(item: Pick<PublicNavigationMenuItem, 'href' | 'label'>): boolean {
  const href = pathOnly(item.href.trim())
  const label = item.label.trim().toLocaleLowerCase('tr-TR')
  return href === '/yazilimlar' || label === 'yazılımlar' || label === 'yazilimlar'
}
