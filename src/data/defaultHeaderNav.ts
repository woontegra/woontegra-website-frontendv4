import { CANONICAL_PUBLIC_SERVICES } from '@/data/canonicalServices'
import { buildCanonicalSoftwareNavChildren } from '@/lib/publicSoftwareCatalog'
import type { PublicNavigationMenuItem } from '@/types/navigationMenu'

/** API menüsü eksik/bozuk olduğunda kullanılan header menüsü */
export const DEFAULT_PUBLIC_NAV: PublicNavigationMenuItem[] = [
  {
    id: 'home',
    label: 'Ana Sayfa',
    href: '/',
    resolvedUrl: '/',
    openInNewTab: false,
    sortOrder: 0,
    children: [],
  },
  {
    id: 'about',
    label: 'Hakkımızda',
    href: '/hakkimizda',
    resolvedUrl: '/hakkimizda',
    openInNewTab: false,
    sortOrder: 1,
    children: [],
  },
  {
    id: 'services',
    label: 'Hizmetler',
    href: '/hizmetler',
    resolvedUrl: '/hizmetler',
    openInNewTab: false,
    sortOrder: 2,
    children: CANONICAL_PUBLIC_SERVICES.map((service, index) => ({
      id: `svc-${service.slug}`,
      label: service.title,
      href: service.path,
      resolvedUrl: service.path,
      openInNewTab: false,
      sortOrder: index,
      children: [],
    })),
  },
  {
    id: 'solutions',
    label: 'Çözümler',
    href: '/cozumler',
    resolvedUrl: '/cozumler',
    openInNewTab: false,
    sortOrder: 3,
    children: [],
  },
  {
    id: 'software',
    label: 'Yazılımlar',
    href: '/yazilimlar',
    resolvedUrl: '/yazilimlar',
    openInNewTab: false,
    sortOrder: 4,
    children: buildCanonicalSoftwareNavChildren(),
  },
  {
    id: 'blog',
    label: 'Blog',
    href: '/blog',
    resolvedUrl: '/blog',
    openInNewTab: false,
    sortOrder: 5,
    children: [],
  },
  {
    id: 'contact',
    label: 'İletişim',
    href: '/iletisim',
    resolvedUrl: '/iletisim',
    openInNewTab: false,
    sortOrder: 6,
    children: [],
  },
]
