import { useEffect, useMemo } from 'react'
import { useQuery, type QueryClient } from '@tanstack/react-query'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { resolvePublicPageBlocks } from '@/lib/pageBlocksAdapter'
import { pageContentService } from '@/services/pageContentService'
import type { BuilderBlock } from '@/builder/types'

/**
 * Page Builder içeriği tarayıcıda saklanır: sayfa tekrar açıldığında içerik anında hazırdır,
 * arka planda sunucudan güncellenir. Böylece içerik beklenirken eski "yedek" tasarım görünmez.
 */
const CACHE_PREFIX = 'woontegra:page-content:v1:'

type RawContent = Record<string, unknown> | null

function readCachedContent(contentKey: string): RawContent | undefined {
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + contentKey)
    if (!raw) return undefined
    const parsed: unknown = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : undefined
  } catch {
    return undefined
  }
}

function writeCachedContent(contentKey: string, data: RawContent): void {
  try {
    if (data == null) window.localStorage.removeItem(CACHE_PREFIX + contentKey)
    else window.localStorage.setItem(CACHE_PREFIX + contentKey, JSON.stringify(data))
  } catch {
    // Depolama dolu/kapalı olabilir; içerik yine sunucudan gelir.
  }
}

function pageContentQueryKey(contentKey: string) {
  return ['page-content-raw', contentKey] as const
}

/** Sayfa kodu yüklenirken içeriği paralel olarak istemeye başlar (uygulama açılışında çağrılır). */
export function prefetchPublicPageContent(queryClient: QueryClient, contentKey: string): void {
  void queryClient.prefetchQuery({
    queryKey: pageContentQueryKey(contentKey),
    queryFn: () => pageContentService.getRawByKey(contentKey),
    ...publicQueryOptions,
  })
}

/** Public sayfa — API'den kaydedilmiş builder bloklarını okur */
export function usePublicPageBlocks(contentKey: string, slug?: string) {
  const cached = useMemo(() => readCachedContent(contentKey), [contentKey])
  const { data: raw, isPending, isFetchedAfterMount, dataUpdatedAt } = useQuery({
    queryKey: pageContentQueryKey(contentKey),
    queryFn: () => pageContentService.getRawByKey(contentKey),
    ...publicQueryOptions,
    // Saklanan içerik hemen kullanılır; 0 zaman damgası sayesinde sunucudan yine de güncellenir.
    ...(cached !== undefined ? { initialData: cached, initialDataUpdatedAt: 0 } : {}),
  })

  useEffect(() => {
    if (dataUpdatedAt > 0 && raw !== undefined) writeCachedContent(contentKey, raw ?? null)
  }, [contentKey, raw, dataUpdatedAt])

  const blocks = useMemo(
    (): BuilderBlock[] | null => resolvePublicPageBlocks(raw ?? null, slug),
    [raw, slug],
  )

  return { blocks, raw, isPending, isFetchedAfterMount }
}
