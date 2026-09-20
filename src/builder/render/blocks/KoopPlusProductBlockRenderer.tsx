import { useQuery } from '@tanstack/react-query'
import type { BlockRendererProps } from '@/builder/registry/renderRegistry'
import { parseKoopPlusProductBlock } from '@/builder/types/koopplusProduct'
import { KoopPlusProductLayout } from '@/components/public/koopplus/KoopPlusProductLayout'
import { KOOPPLUS_SLUG } from '@/data/koopplusProduct'
import { productsService } from '@/services/productsService'

export function KoopPlusProductBlockRenderer({ block }: BlockRendererProps) {
  const productQuery = useQuery({
    queryKey: ['products', KOOPPLUS_SLUG],
    queryFn: () => productsService.getBySlug(KOOPPLUS_SLUG),
    staleTime: 60_000,
    enabled: block.type === 'koopplus-product' && block.visibility.enabled !== false,
  })

  if (block.type !== 'koopplus-product' || block.visibility.enabled === false) return null

  const parsed = parseKoopPlusProductBlock(block)

  return (
    <KoopPlusProductLayout
      content={parsed.ok ? parsed.content : undefined}
      product={productQuery.data ?? null}
      productLoading={productQuery.isPending}
    />
  )
}
