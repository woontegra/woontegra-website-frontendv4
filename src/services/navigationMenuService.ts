import { publicApi } from '@/api/client'
import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import type { PublicNavigationMenuItem } from '@/types/navigationMenu'
import { normalizePublicNavList } from '@/types/navigationMenu'
import { resolvePublicNavHref } from '@/lib/publicNavUrl'
import { filterRemovedServiceNavItems } from '@/lib/serviceSlugs'

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
    const res = await publicApi.get<ApiSuccess<PublicNavigationMenuItem[]>>('/navigation-menu')
    const data = normalizePublicNavList(unwrapApiData(res.data, 'navigation-menu'))
    return filterRemovedServiceNavItems(data.map(mapPublicItem))
  },
}
