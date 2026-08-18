import { Monitor, Globe } from 'lucide-react'
import { MediaImage } from '@/media/components/MediaImage'
import { pickProductCoverUrl } from '@/lib/publicContentImages'
import type { PublicProductDetail } from '@/types/product'

function Frame({
  product,
  overrideUrl,
  label,
  accent,
  className,
}: {
  product?: PublicProductDetail
  overrideUrl?: string
  label: string
  accent: 'desktop' | 'saas'
  className?: string
}) {
  const cover = overrideUrl?.trim() || (product ? pickProductCoverUrl(product) : '')
  const badgeClass =
    accent === 'desktop'
      ? 'border-emerald-300/40 bg-emerald-500/20 text-emerald-50'
      : 'border-sky-300/40 bg-sky-500/20 text-sky-50'

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-xl shadow-slate-950/40 backdrop-blur-md">
        <div className="flex items-center justify-between px-3 py-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badgeClass}`}>
            {accent === 'desktop' ? <Monitor className="h-3 w-3" aria-hidden /> : <Globe className="h-3 w-3" aria-hidden />}
            {label}
          </span>
        </div>
        <div className="aspect-video bg-slate-950/35 px-2 pb-2">
          {cover ? (
            <MediaImage
              src={overrideUrl?.trim() || undefined}
              input={overrideUrl?.trim() ? undefined : product}
              alt={product?.name ?? label}
              className="h-full w-full rounded-lg object-contain"
              optimizeWidth={640}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs text-white/50">
              {label}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

type Props = {
  desktop?: PublicProductDetail
  saas?: PublicProductDetail
  desktopImageUrl?: string
  saasImageUrl?: string
}

export function MuvekkilKasaCompareHeroVisual({ desktop, saas, desktopImageUrl, saasImageUrl }: Props) {
  return (
    <div className="relative mx-auto h-[280px] w-full max-w-[500px] lg:h-[320px]">
      <div className="absolute inset-0 rounded-[1.75rem] border border-white/12 bg-white/5 shadow-2xl shadow-slate-950/30 backdrop-blur-sm" />
      <Frame
        product={saas}
        overrideUrl={saasImageUrl}
        label="SaaS/Web"
        accent="saas"
        className="absolute right-3 top-5 z-10 w-[62%] rotate-[3deg] lg:right-4 lg:top-6"
      />
      <Frame
        product={desktop}
        overrideUrl={desktopImageUrl}
        label="Masaüstü"
        accent="desktop"
        className="absolute bottom-5 left-3 z-20 w-[64%] -rotate-[2deg] lg:bottom-6 lg:left-4"
      />
    </div>
  )
}
