import type { CSSProperties, ReactNode } from 'react'
import { Breadcrumbs } from '@/components/public/Breadcrumbs'
import { ProductGallery } from '@/components/public/product/ProductGallery'
import { MuvekkilKasaPlatformPurchasePanel } from '@/components/public/muvekkil-kasa/MuvekkilKasaPlatformPurchasePanel'
import { useMkComparePageContextOptional } from '@/components/public/muvekkil-kasa/MkComparePageProvider'
import { MK_COMPARE_PURCHASE_ID } from '@/components/public/muvekkil-kasa/comparePageUtils'
import type { MkComparePlatform } from '@/components/public/muvekkil-kasa/mkComparePlatform'

type BreadcrumbItem = { label: string; href?: string }

const PLATFORM_FACTS: Record<MkComparePlatform, { label: string; value: string }[]> = {
  web: [
    { label: 'Kullanım', value: 'Tarayıcıdan, kurulum gerektirmez' },
    { label: 'Teslimat', value: 'Erişim bilgileri e-posta ile' },
    { label: 'Lisans', value: 'Yıllık kullanım · 1–10 yıl' },
    { label: 'Demo', value: '7 gün ücretsiz' },
  ],
  windows: [
    { label: 'Kullanım', value: 'Windows bilgisayara kurulum' },
    { label: 'Teslimat', value: 'Dijital indirme' },
    { label: 'Lisans', value: '1 yıl lisans' },
    { label: 'Demo', value: '7 gün ücretsiz' },
  ],
  macos: [
    { label: 'Kullanım', value: 'Mac bilgisayara kurulum' },
    { label: 'Teslimat', value: 'Dijital indirme' },
    { label: 'Lisans', value: '1 yıl lisans' },
    { label: 'Demo', value: '7 gün ücretsiz' },
  ],
}

type Props = {
  breadcrumbs: BreadcrumbItem[]
  /** Sol sütun üst kısmı: rozet, başlık, açıklama, butonlar. */
  intro: ReactNode
  /** Admin hero görseli; galerinin ilk görseli olur. */
  coverImageUrl?: string
  /** Builder alan işaretlemesi için görsel sarmalayıcı. */
  wrapVisual?: (visual: ReactNode) => ReactNode
  sectionStyle?: CSSProperties
  overlay?: ReactNode
}

/**
 * Bilirkişi Hesap ürün sayfası hero düzeni: sol sütunda başlık, açıklama ve ürün görselleri;
 * sağ sütunda WEB / WINDOWS / macOS satış paneli.
 */
export function MuvekkilKasaProductHero({
  breadcrumbs,
  intro,
  coverImageUrl,
  wrapVisual,
  sectionStyle,
  overlay,
}: Props) {
  const ctx = useMkComparePageContextOptional()
  const platform: MkComparePlatform = ctx?.platformTab ?? 'web'
  const product =
    platform === 'web'
      ? ctx?.saasQuery.data
      : platform === 'macos'
        ? (ctx?.macosQuery.data ?? ctx?.desktopQuery.data)
        : ctx?.desktopQuery.data

  const visual = (
    <ProductGallery
      key={`${platform}-${product?.id ?? 'none'}`}
      name={product?.name ?? 'Müvekkil Kasa Defteri'}
      coverImage={coverImageUrl?.trim() || product?.coverImage}
      galleryImages={product?.galleryImages}
      productType={product?.productType ?? 'DOWNLOAD'}
    />
  )

  return (
    <section
      className="relative overflow-hidden border-b border-slate-200/60 bg-slate-950 text-white"
      style={sectionStyle}
      data-mk-product-hero
    >
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
      {overlay}

      <div className="relative z-[2] mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        {breadcrumbs.length > 0 ? <Breadcrumbs dark items={breadcrumbs} /> : null}

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-8">
          <div className="min-w-0 space-y-6">
            <div className="max-w-4xl">{intro}</div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
              {wrapVisual ? wrapVisual(visual) : visual}

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {PLATFORM_FACTS[platform].map((card) => (
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

          {ctx ? (
            <aside id={MK_COMPARE_PURCHASE_ID} className="scroll-mt-24 xl:sticky xl:top-24 xl:self-start">
              <MuvekkilKasaPlatformPurchasePanel />
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  )
}
