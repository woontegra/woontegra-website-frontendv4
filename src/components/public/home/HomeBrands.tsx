import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MediaImage } from '@/media/components/MediaImage'
import { pickBrandImageUrl } from '@/lib/publicContentImages'
import { enabledBrands, type HomePageContent } from '@/types/homePageContent'

type Props = { brands: HomePageContent['brands'] }

export function HomeBrands({ brands }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  if (!brands.enabled) return null

  const cards = enabledBrands(brands.cards)
  if (!cards.length) return null

  const scroll = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: direction === 'left' ? -350 : 350, behavior: 'smooth' })
  }

  return (
    <section className="overflow-hidden bg-gradient-to-b from-slate-50 to-white py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">{brands.title}</h2>
          {brands.subtitle ? <p className="text-lg text-slate-600">{brands.subtitle}</p> : null}
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg transition hover:border-green-500 hover:bg-green-500 hover:text-white sm:flex"
            aria-label="Önceki"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div ref={scrollRef} className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-1 pb-4 scrollbar-hide">
            {cards.map((brand) => {
              const brandImage = pickBrandImageUrl(brand)
              return (
                <a
                  key={brand.id}
                  href={brand.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-[85vw] min-w-[280px] max-w-[360px] flex-shrink-0 snap-start overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:w-[calc(50%-12px)] lg:min-w-[300px] lg:w-[calc(33.333%-16px)]"
                >
                  <div className="relative h-56 overflow-hidden sm:h-72">
                    {brandImage ? (
                      <MediaImage
                        src={brandImage}
                        alt={brand.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-slate-800 to-emerald-900/80" aria-hidden />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </div>
                  <div className="p-5 sm:p-6">
                    <h3 className="mb-2 text-lg font-bold text-slate-900 sm:text-xl">{brand.name}</h3>
                    <p className="line-clamp-3 text-sm text-slate-600 sm:text-base">{brand.text}</p>
                  </div>
                </a>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg transition hover:border-green-500 hover:bg-green-500 hover:text-white sm:flex"
            aria-label="Sonraki"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  )
}
