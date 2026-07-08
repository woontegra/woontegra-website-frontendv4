import { ExternalLink, Globe, ShieldCheck } from 'lucide-react'
import type { PublicProductDetail } from '@/types/product'
import { getPromotionalSoftwareMeta } from '@/lib/publicSoftwareCatalog'

type Props = {
  product: PublicProductDetail
}

export function ExternalProductPurchasePanel({ product }: Props) {
  const meta = getPromotionalSoftwareMeta(product.slug)
  if (!meta) return null

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/92 p-5 shadow-[0_28px_80px_-38px_rgba(15,23,42,0.5)] ring-1 ring-slate-900/5 backdrop-blur-xl sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/75 to-transparent" />
      <div className="relative flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
        <Globe className="h-4 w-4" aria-hidden />
        Harici satış
      </div>

      <div className="relative mt-5">
        <p className="text-2xl font-bold tracking-tight text-slate-950">{meta.priceNote}</p>
        <p className="mt-2 text-sm text-slate-500">Fiyat ve lisans işlemleri resmi sitede yürütülür.</p>
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Satış kanalı</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">Resmi site</p>
        </div>
        <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Lisans</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">Resmi sitede</p>
        </div>
      </div>

      <p className="relative mt-5 rounded-2xl border border-sky-100/80 bg-sky-50/80 px-4 py-3 text-sm leading-relaxed text-slate-700">
        <ShieldCheck className="mb-0.5 mr-1 inline h-4 w-4 text-sky-600" aria-hidden />
        {meta.disclaimer}
      </p>

      <div className="relative mt-6">
        <a
          href={meta.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 via-sky-500 to-emerald-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:brightness-105"
        >
          {meta.ctaLabel}
          <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </div>
  )
}
