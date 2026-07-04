import { publicApi } from '@/api/client'
import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import { DEFAULT_PUBLIC_NAV } from '@/data/defaultHeaderNav'
import { resolvePublicNavigation } from '@/lib/headerNavigation'
import { resolvePublicNavHref } from '@/lib/publicNavUrl'
import { filterRemovedServiceNavItems } from '@/lib/serviceSlugs'
import type { PublicNavigationMenuItem } from '@/types/navigationMenu'
import { normalizePublicNavList } from '@/types/navigationMenu'

function mapPublicItem(item: PublicNavigationMenuItem): PublicNavigationMenuItem {
  const href = resolvePublicNavHref(item.resolvedUrl || item.href)
  return {
    ...item,
    href,
    resolvedUrl: href,
    children: (item.children ?? []).map(mapPublicItem),
  }
}

export const navigationMenuService = {
  async listPublic(): Promise<PublicNavigationMenuItem[]> {
    try {
      const res = await publicApi.get<ApiSuccess<PublicNavigationMenuItem[]>>('/navigation-menu')
      const data = normalizePublicNavList(unwrapApiData(res.data, 'navigation-menu'))
      const mapped = filterRemovedServiceNavItems(data.map(mapPublicItem))
      return resolvePublicNavigation(mapped)
    } catch {
      return DEFAULT_PUBLIC_NAV
    }
  },
}
