import { Monitor, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { Breadcrumbs } from '@/components/public/Breadcrumbs'
import { ProductGallery } from '@/components/public/product/ProductGallery'
import { getPromotionalSoftwareMeta, isExternalSalesProduct } from '@/lib/publicSoftwareCatalog'
import type { PublicProductDetail } from '@/types/product'
import { BhFlowDiagram } from '@/components/public/product/BilirkisiHesapShowcase'
import { BILIRKISI_HESAP_SLUG } from '@/data/canonicalSoftwareProducts'
import { productTypeLabel } from '@/types/product'
import { licenseDisplayLabel } from '@/utils/productPurchase'

type MetaItem = { label: string; value: string }

type Props = {
  product: PublicProductDetail
  lead: string
  isFreeDownload: boolean
  children: ReactNode
  /** When set, replaces the hero fact cards. Omitted keeps the current product facts. */
  metaItems?: MetaItem[]
}

function productMetaItems(product: PublicProductDetail, isFreeDownload: boolean, isExternalSales: boolean) {
  if (isExternalSales) {
    const meta = getPromotionalSoftwareMeta(product.slug)
    return [
      { label: 'Ürün tipi', value: meta?.publicProductTypeLabel ?? 'Web Tabanlı Yazılım' },
      { label: 'Satış', value: 'Woontegra üzerinden' },
      { label: 'Lisans', value: meta?.licenseSummary ?? 'Panel erişimi' },
      { label: 'Demo', value: '7 günlük deneme' },
    ]
  }

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

/** Kurumsal tasarım (Yön C): her ürünün kendi üst bölüm rengi. Ana sayfadaki ürün mozaiğiyle aynı renkler. */
const PRODUCT_HERO_COLORS: Record<string, string> = {
  'bilirkisi-hesap': '#0F2A4A',
  'muvekkil-kasa-defteri': '#14532D',
  'muvekkil-kasa-defteri-web-tabanli': '#14532D',
  'muvekkil-kasa-defteri-yazilimi': '#14532D',
}
const DEFAULT_HERO_COLOR = '#101828'

export function ProductShowcaseHero({ product, lead, isFreeDownload, children, metaItems }: Props) {
  const isExternalSales = isExternalSalesProduct(product)
  const promotionalMeta = getPromotionalSoftwareMeta(product.slug)
  const resolvedMetaItems = metaItems ?? productMetaItems(product, isFreeDownload, isExternalSales)
  /** Bilirkişi Hesap: görseller aşağıdaki tanıtım bölümünde; üstte mağaza rozetleri gösterilir. */
  const isBh = product.slug === BILIRKISI_HESAP_SLUG

  return (
    <section
      className="relative overflow-hidden text-white"
      style={{ backgroundColor: PRODUCT_HERO_COLORS[product.slug] ?? DEFAULT_HERO_COLOR }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full border-[72px] border-[#1D6FD8] opacity-20"
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pb-16 lg:pt-8">
        <Breadcrumbs
          dark
          items={[
            { label: 'Ana Sayfa', href: '/' },
            { label: 'Yazılımlar', href: '/yazilimlar' },
            { label: product.name },
          ]}
        />

        <div className={'grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-8' + (isBh ? ' mt-4 sm:mt-6 xl:items-center' : ' mt-6')}>
          <div className="space-y-6">
            <div className="max-w-4xl">
              <p className={(isBh ? 'text-[11px] sm:text-xs' : 'text-xs') + ' font-bold uppercase tracking-[0.12em] text-sky-300'}>
                {[
                  ...(promotionalMeta
                    ? promotionalMeta.badges
                    : [productTypeLabel(product.productType), licenseDisplayLabel(product)]),
                  ...(product.category ? [product.category.name] : []),
                  ...(isFreeDownload ? ['Ücretsiz'] : []),
                ].join(' · ')}
              </p>

              <h1
                className={
                  (isBh ? 'mt-2 text-[28px] leading-tight sm:mt-4' : 'mt-4 text-4xl') +
                  ' max-w-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.02]'
                }
              >
                {product.name}
              </h1>
              <p
                className={
                  (isBh ? 'mt-2 text-sm sm:mt-4' : 'mt-4 text-base') + ' max-w-3xl leading-relaxed text-white/75 sm:text-lg'
                }
              >
                {lead}
              </p>

              {isBh ? (
                <BhFlowDiagram />
              ) : (
              <div className="mt-5 flex flex-wrap gap-3">
                {isExternalSales ? (
                  <div className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-sm font-medium text-white/90">
                    <ShieldCheck className="h-4 w-4 text-sky-300" aria-hidden />
                    Woontegra geliştirdi · Woontegra üzerinden satış
                  </div>
                ) : isFreeDownload ? (
                  <div className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-sm font-medium text-white/90">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" aria-hidden />
                    Woontegra’nın ücretsiz Windows aracı
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-sm font-medium text-white/90">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" aria-hidden />
                    Woontegra güvenli dijital teslimat
                  </div>
                )}
                {product.productType === 'DOWNLOAD' && product.version?.trim() ? (
                  <div className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-sm font-medium text-white/90">
                    <Monitor className="h-4 w-4 text-sky-300" aria-hidden />
                    Sürüm {product.version.trim()}
                  </div>
                ) : null}
              </div>
              )}
            </div>

            {isBh ? null : (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
              <ProductGallery
                name={product.name}
                coverImage={product.coverImage}
                galleryImages={product.galleryImages}
                productType={product.productType}
                isFreeDownload={isFreeDownload}
              />

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {resolvedMetaItems.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-lg border border-white/15 bg-white/[0.06] px-4 py-4"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/55">{card.label}</p>
                    <p className="mt-2 text-sm font-semibold leading-relaxed text-white">{card.value}</p>
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>

          <aside className="xl:sticky xl:top-24 xl:self-start">{children}</aside>
        </div>
      </div>
    </section>
  )
}
