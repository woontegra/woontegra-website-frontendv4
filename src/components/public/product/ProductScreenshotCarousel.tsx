import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { MediaImage } from '@/media/components/MediaImage'
import type { NormalizedGalleryImage } from '@/media/normalizeProductGalleryImages'
import { cn } from '@/lib/cn'
import { galleryIndexFromSwipe, wrapGalleryIndex } from '@/lib/productScreenshots'

type Props = {
  images: NormalizedGalleryImage[]
  productName: string
  className?: string
}

type LightboxProps = {
  images: NormalizedGalleryImage[]
  productName: string
  activeIndex: number
  onClose: () => void
  onChange: (index: number) => void
}

function ScreenshotLightbox({ images, productName, activeIndex, onClose, onChange }: LightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const hasMultiple = images.length > 1

  const goPrev = useCallback(
    () => onChange(wrapGalleryIndex(activeIndex - 1, images.length)),
    [activeIndex, images.length, onChange],
  )
  const goNext = useCallback(
    () => onChange(wrapGalleryIndex(activeIndex + 1, images.length)),
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
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/92 p-3 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`${productName} — ekran görüntüsü ${activeIndex + 1} / ${images.length}`}
      onClick={onClose}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-10 min-h-11 min-w-11 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:right-5 sm:top-5"
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
            className="absolute left-2 top-1/2 z-10 min-h-11 min-w-11 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:left-4"
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
            className="absolute right-2 top-1/2 z-10 min-h-11 min-w-11 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:right-4"
            aria-label="Sonraki ekran görüntüsü"
          >
            <ChevronRight className="h-7 w-7" aria-hidden />
          </button>
        </>
      ) : null}

      <div
        className="relative flex max-h-[min(94vh,960px)] w-full max-w-6xl flex-col items-center"
        onClick={(event) => event.stopPropagation()}
      >
        {current ? (
          <MediaImage
            src={current.url}
            alt={current.alt ?? productName}
            loading="eager"
            fetchPriority="high"
            optimizeWidth={1600}
            className="max-h-[min(86vh,880px)] w-full object-contain"
          />
        ) : null}
        {hasMultiple ? (
          <p className="mt-3 text-sm text-white/70">
            {activeIndex + 1} / {images.length}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function ProductScreenshotCarousel({ images, productName, className }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const pointerStartX = useRef<number | null>(null)
  const didSwipe = useRef(false)

  const hasMultiple = images.length > 1
  const showThumbs = hasMultiple && images.length <= 6

  useEffect(() => {
    if (activeIndex >= images.length) setActiveIndex(0)
  }, [activeIndex, images.length])

  const goTo = useCallback(
    (index: number) => setActiveIndex(wrapGalleryIndex(index, images.length)),
    [images.length],
  )

  if (images.length === 0) return null

  const current = images[activeIndex] ?? images[0]

  return (
    <>
      <div className={cn('w-full', className)}>
        <div
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50 shadow-2xl shadow-emerald-950/40"
          role="region"
          aria-roledescription="carousel"
          aria-label={`${productName} ekran görüntüleri`}
          tabIndex={0}
          onKeyDown={(event) => {
            if (!hasMultiple) return
            if (event.key === 'ArrowLeft') {
              event.preventDefault()
              goTo(activeIndex - 1)
            }
            if (event.key === 'ArrowRight') {
              event.preventDefault()
              goTo(activeIndex + 1)
            }
          }}
          onPointerDown={(event) => {
            pointerStartX.current = event.clientX
            didSwipe.current = false
          }}
          onPointerUp={(event) => {
            const start = pointerStartX.current
            pointerStartX.current = null
            if (start == null) return
            const next = galleryIndexFromSwipe(event.clientX - start, activeIndex, images.length)
            if (next == null) return
            didSwipe.current = true
            goTo(next)
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (didSwipe.current) {
                didSwipe.current = false
                return
              }
              setLightboxOpen(true)
            }}
            className="flex min-h-[220px] w-full cursor-zoom-in items-center justify-center bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.12),transparent_46%)] p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:min-h-[260px] lg:min-h-[300px]"
            aria-label={`${current.alt ?? productName} — büyük görüntüle`}
          >
            <MediaImage
              src={current.url}
              alt={current.alt ?? productName}
              loading="eager"
              fetchPriority="high"
              optimizeWidth={960}
              className="max-h-[min(48vh,420px)] w-full object-contain"
            />
          </button>

          {hasMultiple ? (
            <>
              <button
                type="button"
                onClick={() => goTo(activeIndex - 1)}
                className="absolute left-2 top-1/2 z-10 min-h-11 min-w-11 -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/80 p-2 text-white shadow-lg backdrop-blur transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:left-3"
                aria-label="Önceki ekran görüntüsü"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => goTo(activeIndex + 1)}
                className="absolute right-2 top-1/2 z-10 min-h-11 min-w-11 -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/80 p-2 text-white shadow-lg backdrop-blur transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:right-3"
                aria-label="Sonraki ekran görüntüsü"
              >
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
              <p className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-slate-950/70 px-2.5 py-1 text-xs font-medium text-white/80">
                {activeIndex + 1} / {images.length}
              </p>
            </>
          ) : null}
        </div>

        {hasMultiple ? (
          <div className="mt-3 flex justify-center gap-2" role="tablist" aria-label="Ekran görüntüsü seçimi">
            {images.map((entry, index) => (
              <button
                key={entry.url}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`Ekran ${index + 1}: ${entry.alt ?? productName}`}
                onClick={() => goTo(index)}
                className={cn(
                  'h-2.5 min-h-6 rounded-full px-0.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300',
                  index === activeIndex ? 'w-6 bg-emerald-400' : 'w-2.5 bg-white/35 hover:bg-white/55',
                )}
              />
            ))}
          </div>
        ) : null}

        {showThumbs ? (
          <div className="mt-3 hidden justify-center gap-2 sm:flex sm:flex-wrap">
            {images.map((entry, index) => (
              <button
                key={`thumb-${entry.url}`}
                type="button"
                onClick={() => goTo(index)}
                className={cn(
                  'w-[4.75rem] overflow-hidden rounded-xl border bg-slate-950/40 p-1 transition lg:w-[5.5rem]',
                  index === activeIndex
                    ? 'border-emerald-400 ring-2 ring-emerald-400/30'
                    : 'border-white/10 hover:border-white/30',
                )}
                aria-label={`${entry.alt ?? productName} — slayt ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
              >
                <MediaImage
                  src={entry.url}
                  alt=""
                  loading="lazy"
                  optimizeWidth={240}
                  className="aspect-[16/10] w-full object-contain"
                />
              </button>
            ))}
          </div>
        ) : null}

        <p className="sr-only" aria-live="polite">
          {current.alt ?? productName}
          {hasMultiple ? ` — ${activeIndex + 1} / ${images.length}` : ''}
        </p>
      </div>

      {lightboxOpen ? (
        <ScreenshotLightbox
          images={images}
          productName={productName}
          activeIndex={activeIndex}
          onClose={() => setLightboxOpen(false)}
          onChange={setActiveIndex}
        />
      ) : null}
    </>
  )
}
