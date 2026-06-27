import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { resolvePublicPageBlocks } from '@/lib/pageBlocksAdapter'
import { pageContentService } from '@/services/pageContentService'
import type { BuilderBlock } from '@/builder/types'

/** Public sayfa — API'den kaydedilmiş builder bloklarını okur */
export function usePublicPageBlocks(contentKey: string, slug?: string) {
  const { data: raw, isPending } = useQuery({
    queryKey: ['page-content', contentKey, slug ?? 'root'],
    queryFn: () => pageContentService.getRawByKey(contentKey),
    ...publicQueryOptions,
  })

  const blocks = useMemo(
    (): BuilderBlock[] | null => resolvePublicPageBlocks(raw ?? null, slug),
    [raw, slug],
  )

  return { blocks, raw, isPending }
}
