import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { BlockRendererProps } from '@/builder/registry/renderRegistry'
import { BuilderField } from '@/builder/edit/BuilderField'
import { getProductBuilderSeed } from '@/builder/data/productBuilderSeeds'
import { productSeedToPublicDetail } from '@/builder/parity/contentMappers'
import { mergeProductDetailForRender } from '@/builder/parity/productDetailMapper'
import { SoftwareDetailView } from '@/components/public/product/SoftwareDetailView'
import { LoadingState } from '@/components/ui/LoadingState'
import { productsService } from '@/services/productsService'
import type { ProductDetailBlock } from '@/builder/types/productDetail'

export function ProductDetailBlockRenderer({ block }: BlockRendererProps) {
  if (block.type !== 'product-detail') return null
  const b = block as ProductDetailBlock
  if (!b.visibility.enabled) return null

  const slug = b.settings.slug?.trim()
  const {
    data: apiProduct,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['builder-product-detail', slug],
    queryFn: () => productsService.getBySlug(slug!),
    enabled: Boolean(slug),
    staleTime: 60_000,
  })

  const product = useMemo(() => {
    if (apiProduct) return mergeProductDetailForRender(apiProduct, b)
    if (isError && slug) {
      const seed = productSeedToPublicDetail(getProductBuilderSeed(slug))
      return mergeProductDetailForRender(seed, b)
    }
    return null
  }, [apiProduct, b, isError, slug])

  if (!slug) {
    return (
      <section className="w-full bg-white px-4 py-12 text-center text-sm text-slate-500">
        Ürün slug tanımlı değil.
      </section>
    )
  }

  if (isLoading && !product) {
    return (
      <section className="w-full bg-white px-4 py-16">
        <LoadingState label="Ürün detayı yükleniyor…" />
      </section>
    )
  }

  if (!product) {
    return (
      <section className="w-full bg-white px-4 py-12 text-center text-sm text-slate-500">
        Ürün bulunamadı: {slug}
      </section>
    )
  }

  return (
    <BuilderField path="product-detail" label="Ürün detayı" type="card" className="w-full">
      <SoftwareDetailView product={product} />
    </BuilderField>
  )
}
