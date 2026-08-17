import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { MediaImage } from '@/media/components/MediaImage'
import {
  buildProductGalleryEntries,
  type NormalizedGalleryImage,
} from '@/media/normalizeProductGalleryImages'
import { cn } from '@/lib/cn'

type HeroCarouselProduct = {
  name: string
  coverImage?: unknown
  galleryImages?: unknown
}

type Props = {
  product: HeroCarouselProduct
  extraImages?: NormalizedGalleryImage[]
  /** false: yalnızca extraImages (Page Builder slaytları). varsayılan true: ürün galerisi */
  includeProductGallery?: boolean
}

function wrapIndex(index: number, length: number): number {
  if (length <= 0) return 0
  return (index + length) % length
}

function buildHeroCarouselImages(product: HeroCarouselProduct) {
  const galleryOnly = buildProductGalleryEntries({
    galleryImages: product.galleryImages,
    fallbackAlt: product.name,
  })

  if (galleryOnly.length > 0) return galleryOnly

  return buildProductGalleryEntries({
    coverImage: product.coverImage,
    fallbackAlt: product.name,
  })
}

type LightboxProps = {
  images: NormalizedGalleryImage[]
  productName: string
  activeIndex: number
  onClose: () => void
  onChange: (index: number) => void
}

function CarouselLightbox({ images, productName, activeIndex, onClose, onChange }: LightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const hasMultiple = images.length > 1

  const goPrev = useCallback(
    () => onChange(wrapIndex(activeIndex - 1, images.length)),
    [activeIndex, images.length, onChange],
  )
  const goNext = useCallback(
    () => onChange(wrapIndex(activeIndex + 1, images.length)),
    [activeIndex, images.length, onChange],
  )

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft' && hasMultiple) goPrev()
      if (event.key === 'ArrowRight' && hasMultiple) goNext()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goNext, goPrev, hasMultiple, onClose])

  const current = images[activeIndex] ?? images[0]

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`${productName} — ekran görüntüsü ${activeIndex + 1} / ${images.length}`}
      onClick={onClose}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:right-5 sm:top-5"
        aria-label="Lightbox’ı kapat"
      >
        <X className="h-6 w-6" aria-hidden />
      </button>

      {hasMultiple ? (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              goPrev()
            }}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:left-4"
            aria-label="Önceki ekran görüntüsü"
          >
            <ChevronLeft className="h-7 w-7" aria-hidden />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              goNext()
            }}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:right-4"
            aria-label="Sonraki ekran görüntüsü"
          >
            <ChevronRight className="h-7 w-7" aria-hidden />
          </button>
        </>
      ) : null}

      <div
        className="relative flex max-h-[min(90vh,900px)] w-full max-w-6xl flex-col items-center"
        onClick={(event) => event.stopPropagation()}
      >
        {current ? (
          <MediaImage
            src={current.url}
            alt={
              hasMultiple
                ? `${current.alt ?? productName} — ekran ${activeIndex + 1} / ${images.length}`
                : (current.alt ?? productName)
            }
            className="max-h-[min(90vh,900px)] w-full object-contain"
          />
        ) : null}
        {hasMultiple ? (
          <p className="mt-4 text-sm text-white/70">
            {activeIndex + 1} / {images.length}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function mergeHeroCarouselImages(
  product: HeroCarouselProduct,
  extraImages?: NormalizedGalleryImage[],
  includeProductGallery = true,
): NormalizedGalleryImage[] {
  const seen = new Set<string>()
  const out: NormalizedGalleryImage[] = []

  const push = (entry: NormalizedGalleryImage | null | undefined) => {
    const url = entry?.url?.trim()
    if (!url || seen.has(url)) return
    seen.add(url)
    out.push({ ...entry, url })
  }

  for (const entry of extraImages ?? []) push(entry)
  if (includeProductGallery) {
    for (const entry of buildHeroCarouselImages(product)) push(entry)
  }
  return out
}

export function MkSaasHeroScreenCarousel({
  product,
  extraImages,
  includeProductGallery = true,
}: Props) {
  const images = useMemo(
    () => mergeHeroCarouselImages(product, extraImages, includeProductGallery),
    [extraImages, includeProductGallery, product],
  )

  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const hasMultiple = images.length > 1

  useEffect(() => {
    if (activeIndex >= images.length) setActiveIndex(0)
  }, [activeIndex, images.length])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setPrefersReducedMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const goTo = useCallback(
    (index: number) => setActiveIndex(wrapIndex(index, images.length)),
    [images.length],
  )

  useEffect(() => {
    if (!hasMultiple || paused || prefersReducedMotion || lightboxOpen) return
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => wrapIndex(prev + 1, images.length))
    }, 5000)
    return () => window.clearInterval(timer)
  }, [hasMultiple, images.length, lightboxOpen, paused, prefersReducedMotion])

  if (images.length === 0) {
    return (
      <div className="w-full rounded-xl px-6 py-10 text-center text-sm text-slate-400">
        Ürün ekran görüntüsü henüz eklenmemiş.
      </div>
    )
  }

  const current = images[activeIndex] ?? images[0]

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          if (!containerRef.current?.contains(event.relatedTarget as Node)) setPaused(false)
        }}
      >
        <div
          className="relative w-full"
          role="region"
          aria-roledescription="carousel"
          aria-label={`${product.name} ekran görüntüleri`}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            aria-label={`${current.alt ?? product.name} — büyük görüntüle`}
          >
            <MediaImage
              src={current.url}
              alt={
                hasMultiple
                  ? `${current.alt ?? product.name} — ekran ${activeIndex + 1} / ${images.length}`
                  : (current.alt ?? product.name)
              }
              loading="eager"
              fetchPriority="high"
              className="block h-auto w-full object-contain object-center"
            />
          </button>

          {hasMultiple ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  goTo(activeIndex - 1)
                }}
                className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/80 p-2 text-white shadow-lg backdrop-blur transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:left-3"
                aria-label="Önceki ekran görüntüsü"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  goTo(activeIndex + 1)
                }}
                className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/80 p-2 text-white shadow-lg backdrop-blur transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:right-3"
                aria-label="Sonraki ekran görüntüsü"
              >
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            </>
          ) : null}
        </div>

        {hasMultiple ? (
          <>
            <div
              className="mt-4 flex justify-center gap-2"
              role="tablist"
              aria-label="Ekran görüntüsü seçimi"
            >
              {images.map((entry, index) => (
                <button
                  key={entry.url}
                  type="button"
                  role="tab"
                  aria-selected={index === activeIndex}
                  aria-label={`Ekran ${index + 1}: ${entry.alt ?? product.name}`}
                  onClick={() => goTo(index)}
                  className={cn(
                    'h-2.5 rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400',
                    index === activeIndex ? 'w-6 bg-sky-400' : 'w-2.5 bg-white/40 hover:bg-white/60',
                  )}
                />
              ))}
            </div>
            <p className="sr-only" aria-live="polite">
              {current.alt ?? product.name} — {activeIndex + 1} / {images.length}
            </p>
          </>
        ) : null}
      </div>

      {lightboxOpen ? (
        <CarouselLightbox
          images={images}
          productName={product.name}
          activeIndex={activeIndex}
          onClose={() => setLightboxOpen(false)}
          onChange={setActiveIndex}
        />
      ) : null}
    </>
  )
}
