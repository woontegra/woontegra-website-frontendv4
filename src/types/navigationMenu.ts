export type NavigationMenuItemType = 'CUSTOM_URL' | 'PRODUCT' | 'CATEGORY' | 'PAGE'

export type PublicNavigationMenuItem = {
  id: string
  label: string
  href: string
  resolvedUrl: string
  openInNewTab: boolean
  sortOrder: number
  children: PublicNavigationMenuItem[]
}

export function normalizePublicNavItem(raw: unknown): PublicNavigationMenuItem | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const id = String(row.id ?? '').trim()
  const label = String(row.label ?? '').trim()
  if (!id || !label) return null
  const href = String(row.href ?? row.resolvedUrl ?? '#').trim() || '#'
  const childrenRaw = Array.isArray(row.children) ? row.children : []
  const children = childrenRaw
    .map(normalizePublicNavItem)
    .filter((x): x is PublicNavigationMenuItem => x !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return {
    id,
    label,
    href,
    resolvedUrl: String(row.resolvedUrl ?? href).trim() || href,
    openInNewTab: row.openInNewTab === true,
    sortOrder: Number(row.sortOrder) || 0,
    children,
  }
}

export function normalizePublicNavList(raw: unknown): PublicNavigationMenuItem[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map(normalizePublicNavItem)
    .filter((x): x is PublicNavigationMenuItem => x !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}
