import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ProductCard } from '@/components/public/ProductCard'
import { SectionHeader } from '@/components/public/SectionHeader'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { productsService } from '@/services/productsService'

export function HomeFeaturedProducts() {
  const { data } = useQuery({
    queryKey: ['products', 'home-featured'],
    queryFn: () => productsService.list(),
    ...publicQueryOptions,
  })

  const products = (data ?? []).filter((p) => p.isFeatured).slice(0, 3)
  const fallback = (data ?? []).slice(0, 3)
  const items = products.length > 0 ? products : fallback

  if (!items.length) return null

  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Yazılımlar"
          title="Öne Çıkan Ürünler"
          description="İndirilebilir yazılımlar, SaaS ürünleri ve lisans destekli çözümler."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/yazilimlar"
            className="inline-flex rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Tüm Yazılımları Gör
          </Link>
        </div>
      </div>
    </section>
  )
}
