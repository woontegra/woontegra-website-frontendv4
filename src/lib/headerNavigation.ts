import { DEFAULT_PUBLIC_NAV } from '@/data/defaultHeaderNav'
import {
  CANONICAL_PUBLIC_SERVICES,
  CANONICAL_SERVICE_BY_SLUG,
  findServicesNavItem,
  serviceSlugFromHref,
} from '@/data/canonicalServices'
import { resolvePublicNavHref } from '@/lib/publicNavUrl'
import type { PublicNavigationMenuItem } from '@/types/navigationMenu'

function normalizeLabel(label: string): string {
  return label.trim().toLocaleLowerCase('tr-TR')
}

function isBrokenHref(href: string): boolean {
  const value = href.trim()
  return !value || value === '#'
}

function canonicalPathForServiceChild(child: PublicNavigationMenuItem): string | null {
  const byLabel = CANONICAL_PUBLIC_SERVICES.find(
    (service) => normalizeLabel(service.title) === normalizeLabel(child.label),
  )
  if (byLabel) return byLabel.path

  const href = resolvePublicNavHref(child.resolvedUrl || child.href)
  const slug = serviceSlugFromHref(href)
  if (slug && CANONICAL_SERVICE_BY_SLUG[slug]) {
    return CANONICAL_SERVICE_BY_SLUG[slug].path
  }

  return null
}

function fixServiceChild(child: PublicNavigationMenuItem): PublicNavigationMenuItem | null {
  const canonicalPath = canonicalPathForServiceChild(child)
  const href = canonicalPath ?? resolvePublicNavHref(child.resolvedUrl || child.href)
  if (isBrokenHref(href)) return null

  return {
    ...child,
    href,
    resolvedUrl: href,
    children: [],
  }
}

function restoreServicesDropdown(item: PublicNavigationMenuItem): PublicNavigationMenuItem {
  const fixedChildren = item.children
    .map(fixServiceChild)
    .filter((child): child is PublicNavigationMenuItem => child !== null)

  const bySlug = new Map<string, PublicNavigationMenuItem>()
  for (const child of fixedChildren) {
    const slug = serviceSlugFromHref(child.href)
    if (slug) bySlug.set(slug, child)
  }

  for (const service of CANONICAL_PUBLIC_SERVICES) {
    if (!bySlug.has(service.slug)) {
      bySlug.set(service.slug, {
        id: `canonical-${service.slug}`,
        label: service.title,
        href: service.path,
        resolvedUrl: service.path,
        openInNewTab: false,
        sortOrder: service.order,
        children: [],
      })
    } else {
      const existing = bySlug.get(service.slug)!
      bySlug.set(service.slug, {
        ...existing,
        href: service.path,
        resolvedUrl: service.path,
      })
    }
  }

  const children = [...bySlug.values()].sort((a, b) => a.sortOrder - b.sortOrder)

  return {
    ...item,
    href: '/hizmetler',
    resolvedUrl: '/hizmetler',
    children: children.length ? children : DEFAULT_PUBLIC_NAV.find((n) => n.id === 'services')!.children,
  }
}

function mapNavItem(item: PublicNavigationMenuItem): PublicNavigationMenuItem | null {
  const href = resolvePublicNavHref(item.resolvedUrl || item.href)
  const label = item.label.trim()
  if (!label) return null

  const isServices =
    href === '/hizmetler' ||
    normalizeLabel(label) === 'hizmetler' ||
    Boolean(findServicesNavItem([item]))

  if (isServices) {
    return restoreServicesDropdown({ ...item, href: '/hizmetler', resolvedUrl: '/hizmetler' })
  }

  if (isBrokenHref(href) && !item.children.length) return null

  const children = item.children
    .map(mapNavItem)
    .filter((child): child is PublicNavigationMenuItem => child !== null)

  return {
    ...item,
    href: isBrokenHref(href) ? item.href : href,
    resolvedUrl: isBrokenHref(href) ? item.resolvedUrl : href,
    children,
  }
}

/** API menüsünü canonical public route'larla birleştirir; bozuk hizmet linklerini düzeltir. */
export function resolvePublicNavigation(items: PublicNavigationMenuItem[]): PublicNavigationMenuItem[] {
  if (!items.length) return DEFAULT_PUBLIC_NAV

  const resolved = items
    .map(mapNavItem)
    .filter((item): item is PublicNavigationMenuItem => item !== null)

  return resolved.length ? resolved : DEFAULT_PUBLIC_NAV
}
