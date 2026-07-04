import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { mergeServiceCardsWithCanonical } from '@/data/canonicalServices'
import { SERVICE_CARDS_KEY, type ServiceCardConfig } from '@/data/serviceCardsContent'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { navigationMenuService } from '@/services/navigationMenuService'
import { pageContentService } from '@/services/pageContentService'

/** Header menüsü ile aynı hizmet kart listesi — /hizmetler landing için */
export function usePublicServiceCards() {
  const navQuery = useQuery({
    queryKey: ['navigation-menu', 'public'],
    queryFn: () => navigationMenuService.listPublic(),
    ...publicQueryOptions,
  })

  const cmsQuery = useQuery({
    queryKey: ['page-content', SERVICE_CARDS_KEY],
    queryFn: async () => {
      const raw = await pageContentService.getRawByKey(SERVICE_CARDS_KEY)
      return raw as { cards?: ServiceCardConfig[] } | null
    },
    ...publicQueryOptions,
  })

  const cards = useMemo(
    () => mergeServiceCardsWithCanonical(cmsQuery.data, navQuery.data).cards,
    [cmsQuery.data, navQuery.data],
  )

  return {
    cards,
    isLoading: navQuery.isPending && cmsQuery.isPending,
  }
}
