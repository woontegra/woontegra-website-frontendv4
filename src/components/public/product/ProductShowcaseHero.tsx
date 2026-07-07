import { BadgeCheck, Monitor, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { Breadcrumbs } from '@/components/public/Breadcrumbs'
import { ProductGallery } from '@/components/public/product/ProductGallery'
import type { PublicProductDetail } from '@/types/product'
import { productTypeLabel } from '@/types/product'
import { licenseDisplayLabel } from '@/utils/productPurchase'

type Props = {
  product: PublicProductDetail
  lead: string
  isFreeDownload: boolean
  children: ReactNode
}

function productMetaItems(product: PublicProductDetail, isFreeDownload: boolean) {
  return [
    { label: 'Ürün tipi', value: productTypeLabel(product.productType) },
    {
      label: 'Teslimat',
      value: isFreeDownload ? 'Anında erişim' : product.productType === 'SERVICE' ? 'Planlı teslimat' : 'Dijital teslimat',
    },
    { label: 'Lisans', value: licenseDisplayLabel(product) },
    {
      label: 'Galeri',
      value: product.coverImage || product.galleryImages?.length ? `${(product.galleryImages?.length ?? 0) + (product.coverImage ? 1 : 0)} görsel` : 'Özet paneli',
    },
  ]
}

export function ProductShowcaseHero({ product, lead, isFreeDownload, children }: Props) {
  const metaItems = productMetaItems(product, isFreeDownload)

  return (
    <section className="relative overflow-hidden border-b border-slate-200/60 bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.12),transparent_28%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <Breadcrumbs
          dark
          items={[
            { label: 'Ana Sayfa', href: '/' },
            { label: 'Yazılımlar', href: '/yazilimlar' },
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-8">
          <div className="space-y-6">
            <div className="max-w-4xl">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-100 backdrop-blur">
                  {productTypeLabel(product.productType)}
                </span>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-100 backdrop-blur">
                  {licenseDisplayLabel(product)}
                </span>
                {product.isFeatured ? (
                  <span className="rounded-full border border-amber-300/25 bg-amber-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-100 backdrop-blur">
                    Öne çıkan
                  </span>
                ) : null}
                {product.category ? (
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur">
                    {product.category.name}
                  </span>
                ) : null}
                {isFreeDownload ? (
                  <span className="rounded-full border border-emerald-300/30 bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-50 backdrop-blur">
                    Ücretsiz
                  </span>
                ) : null}
              </div>

              <h1 className="mt-5 max-w-4xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.04]">
                {product.name}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">{lead}</p>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-slate-200 backdrop-blur">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" aria-hidden />
                  Güvenli dijital teslimat akışı
                </div>
                {product.productType === 'DOWNLOAD' && product.version?.trim() ? (
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-slate-200 backdrop-blur">
                    <Monitor className="h-4 w-4 text-sky-300" aria-hidden />
                    Sürüm {product.version.trim()}
                  </div>
                ) : null}
                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-slate-200 backdrop-blur">
                  <BadgeCheck className="h-4 w-4 text-violet-300" aria-hidden />
                  Modern ürün sunumu
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
              <ProductGallery
                name={product.name}
                coverImage={product.coverImage}
                galleryImages={product.galleryImages}
                productType={product.productType}
                isFreeDownload={isFreeDownload}
              />

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {metaItems.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-[1.6rem] border border-white/10 bg-white/8 px-4 py-4 shadow-lg shadow-slate-950/10 backdrop-blur-md"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{card.label}</p>
                    <p className="mt-2 text-sm font-semibold leading-relaxed text-white">{card.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="xl:sticky xl:top-24 xl:self-start">{children}</aside>
        </div>
      </div>
    </section>
  )
}
