import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Globe, ImageIcon, Layers3, MonitorSmartphone, X } from 'lucide-react'
import { MediaImage } from '@/media/components/MediaImage'
import { pickProductCoverUrl } from '@/lib/publicContentImages'
import { resolveMediaUrl } from '@/media/resolveMediaUrl'
import { cn } from '@/lib/cn'
import type { ProductType } from '@/types/product'

type Props = {
  name: string
  coverImage?: string | null
  galleryImages?: { id: string; url: string }[]
  productType: ProductType
  isFreeDownload?: boolean
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

export function ProductGallery({ name, coverImage, galleryImages = [], productType, isFreeDownload = false }: Props) {
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

  if (gallery.length === 0) {
    return <ProductGalleryPlaceholder name={name} productType={productType} isFreeDownload={isFreeDownload} />
  }

  const mainUrl = gallery[activeIndex] ?? gallery[0]
  const hasMultiple = gallery.length > 1

  return (
    <>
      <div className="space-y-4">
        <div className="relative rounded-[2rem] bg-gradient-to-br from-emerald-500/20 via-sky-500/10 to-violet-500/15 p-[1px] shadow-[0_30px_80px_-40px_rgba(15,23,42,0.5)]">
          <div className="pointer-events-none absolute inset-6 rounded-[1.75rem] bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_44%)] blur-2xl" />
          <div className="group/main relative overflow-hidden rounded-[calc(2rem-1px)] border border-white/70 bg-white/90 backdrop-blur-xl">
          {hasMultiple ? (
            <>
              <button
                type="button"
                onClick={() => goTo(activeIndex - 1)}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/70 bg-white/85 p-2 text-slate-700 shadow-lg shadow-slate-900/10 opacity-0 backdrop-blur transition hover:bg-white group-hover/main:opacity-100 focus:opacity-100 sm:left-5"
                aria-label="Önceki görsel"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => goTo(activeIndex + 1)}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/70 bg-white/85 p-2 text-slate-700 shadow-lg shadow-slate-900/10 opacity-0 backdrop-blur transition hover:bg-white group-hover/main:opacity-100 focus:opacity-100 sm:right-5"
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
              className="aspect-[4/3] w-full origin-center bg-[linear-gradient(180deg,rgba(248,250,252,0.86),rgba(226,232,240,0.55))] object-contain p-5 transition-transform duration-500 ease-out group-hover/main:scale-[1.04] sm:object-cover sm:p-0"
            />
          </button>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/35 via-slate-900/5 to-transparent" />
          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur sm:left-5 sm:top-5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
            Ürün önizleme
          </div>

          {hasMultiple ? (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full border border-white/15 bg-slate-950/35 px-3 py-2 backdrop-blur">
              {gallery.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    'h-2 w-2 rounded-full transition',
                    index === activeIndex ? 'scale-110 bg-emerald-400' : 'bg-white/70 hover:bg-white',
                  )}
                  aria-label={`Görsel ${index + 1}`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                />
              ))}
            </div>
          ) : null}
        </div>
        </div>

        {hasMultiple ? (
          <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-5 sm:overflow-visible sm:pb-0">
            {gallery.map((url, index) => (
              <button
                key={url}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'min-w-[88px] overflow-hidden rounded-2xl border bg-white/90 shadow-sm transition backdrop-blur sm:min-w-0',
                  index === activeIndex
                    ? 'border-emerald-400 ring-2 ring-emerald-100 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-200/80 hover:-translate-y-0.5 hover:border-slate-300',
                )}
                aria-label={`Galeri görseli ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
              >
                <MediaImage src={url} alt="" loading="lazy" className="aspect-square w-full bg-slate-50 object-cover" />
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

function PlaceholderIcon({ productType, isFreeDownload }: { productType: ProductType; isFreeDownload: boolean }) {
  if (isFreeDownload) return <Download className="h-6 w-6" aria-hidden />
  if (productType === 'SAAS') return <Globe className="h-6 w-6" aria-hidden />
  if (productType === 'SERVICE') return <Layers3 className="h-6 w-6" aria-hidden />
  return <MonitorSmartphone className="h-6 w-6" aria-hidden />
}

function ProductGalleryPlaceholder({
  name,
  productType,
  isFreeDownload,
}: {
  name: string
  productType: ProductType
  isFreeDownload: boolean
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5 backdrop-blur sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.10),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.10),transparent_34%)]" />
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
            <ImageIcon className="h-4 w-4 text-emerald-600" aria-hidden />
            Görsel önizleme hazırlanıyor
          </div>
          <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">Ürün ekran görüntüsü henüz eklenmemiş</h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            {name} için ürün görseli bulunmuyor. Satın alma, indirme ve lisans akışı aynı şekilde çalışır; görsel alan bu nedenle dengeli bir ürün özeti olarak gösteriliyor.
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.96))] p-5 shadow-sm">
          <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-500 text-white shadow-lg shadow-emerald-500/20">
              <PlaceholderIcon productType={productType} isFreeDownload={isFreeDownload} />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-900">
              {isFreeDownload ? 'Ücretsiz araç önizlemesi' : productType === 'SAAS' ? 'Web arayüz önizlemesi' : 'Ürün önizlemesi'}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Gerçek ekran görüntüsü eklendiğinde burada premium galeri alanı görünecek.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
