import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { MediaImage } from '@/media/components/MediaImage'
import { pickProductCoverUrl } from '@/lib/publicContentImages'
import { resolveMediaUrl } from '@/media/resolveMediaUrl'
import { cn } from '@/lib/cn'

type Props = {
  name: string
  coverImage?: string | null
  galleryImages?: { id: string; url: string }[]
}

function collectGalleryUrls(coverImage: string | null | undefined, galleryImages: { url: string }[]): string[] {
  const urls: string[] = []
  const cover = pickProductCoverUrl({ coverImage })
  if (cover) urls.push(cover)
  for (const img of galleryImages) {
    const resolved = resolveMediaUrl(img.url)
    if (resolved && !urls.includes(resolved)) urls.push(resolved)
  }
  return urls
}

function wrapIndex(index: number, length: number): number {
  if (length <= 0) return 0
  return (index + length) % length
}

type LightboxProps = {
  images: string[]
  name: string
  activeIndex: number
  onClose: () => void
  onChange: (index: number) => void
}

function ProductGalleryLightbox({ images, name, activeIndex, onClose, onChange }: LightboxProps) {
  const goPrev = useCallback(() => onChange(wrapIndex(activeIndex - 1, images.length)), [activeIndex, images.length, onChange])
  const goNext = useCallback(() => onChange(wrapIndex(activeIndex + 1, images.length)), [activeIndex, images.length, onChange])

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goNext, goPrev, onClose])

  const currentUrl = images[activeIndex] ?? images[0] ?? ''

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`${name} — görsel ${activeIndex + 1} / ${images.length}`}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 sm:right-5 sm:top-5"
        aria-label="Kapat"
      >
        <X className="h-6 w-6" />
      </button>

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              goPrev()
            }}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 sm:left-4"
            aria-label="Önceki görsel"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              goNext()
            }}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 sm:right-4"
            aria-label="Sonraki görsel"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </>
      ) : null}

      <div
        className="relative flex max-h-full max-w-5xl flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <MediaImage
          src={currentUrl}
          alt={name}
          loading="eager"
          className="max-h-[calc(100vh-8rem)] w-full object-contain"
        />
        {images.length > 1 ? (
          <p className="mt-4 text-sm text-white/70">
            {activeIndex + 1} / {images.length}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function ProductGallery({ name, coverImage, galleryImages = [] }: Props) {
  const gallery = useMemo(
    () => collectGalleryUrls(coverImage, galleryImages),
    [coverImage, galleryImages],
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    if (activeIndex >= gallery.length) setActiveIndex(0)
  }, [activeIndex, gallery.length])

  const goTo = useCallback(
    (index: number) => setActiveIndex(wrapIndex(index, gallery.length)),
    [gallery.length],
  )

  if (gallery.length === 0) return null

  const mainUrl = gallery[activeIndex] ?? gallery[0]
  const hasMultiple = gallery.length > 1

  return (
    <>
      <div className="space-y-3">
        <div className="group/main relative overflow-hidden rounded-xl border border-slate-200 bg-white">
          {hasMultiple ? (
            <>
              <button
                type="button"
                onClick={() => goTo(activeIndex - 1)}
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-slate-700 shadow-md opacity-0 transition hover:bg-white group-hover/main:opacity-100 focus:opacity-100 sm:left-3 sm:p-2"
                aria-label="Önceki görsel"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => goTo(activeIndex + 1)}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-slate-700 shadow-md opacity-0 transition hover:bg-white group-hover/main:opacity-100 focus:opacity-100 sm:right-3 sm:p-2"
                aria-label="Sonraki görsel"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}

          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="block w-full cursor-zoom-in overflow-hidden"
            aria-label="Görseli büyüt"
          >
            <MediaImage
              src={mainUrl}
              alt={name}
              loading="eager"
              className="aspect-[4/3] w-full origin-center object-contain transition-transform duration-500 ease-out group-hover/main:scale-110 sm:object-cover"
            />
          </button>

          {hasMultiple ? (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {gallery.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    'h-2 w-2 rounded-full transition',
                    index === activeIndex ? 'bg-emerald-500 scale-110' : 'bg-white/70 hover:bg-white',
                  )}
                  aria-label={`Görsel ${index + 1}`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                />
              ))}
            </div>
          ) : null}
        </div>

        {hasMultiple ? (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {gallery.map((url, index) => (
              <button
                key={url}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'overflow-hidden rounded-lg border bg-white transition',
                  index === activeIndex
                    ? 'border-emerald-500 ring-2 ring-emerald-100'
                    : 'border-slate-200 hover:border-slate-300',
                )}
                aria-label={`Galeri görseli ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
              >
                <MediaImage src={url} alt="" loading="lazy" className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {lightboxOpen ? (
        <ProductGalleryLightbox
          images={gallery}
          name={name}
          activeIndex={activeIndex}
          onClose={() => setLightboxOpen(false)}
          onChange={setActiveIndex}
        />
      ) : null}
    </>
  )
}
