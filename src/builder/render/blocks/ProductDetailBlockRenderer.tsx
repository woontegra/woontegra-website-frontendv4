import type { BlockRendererProps } from '@/builder/registry/renderRegistry'
import { BuilderField } from '@/builder/edit/BuilderField'
import { MediaImage } from '@/media/components/MediaImage'
import { resolveMediaUrl } from '@/media/resolveMediaUrl'
import { formatMoney, productTypeLabel } from '@/types/product'
import type { ProductDetailBlock } from '@/builder/types/productDetail'
import { cn } from '@/lib/cn'

export function ProductDetailBlockRenderer({ block }: BlockRendererProps) {
  if (block.type !== 'product-detail') return null
  const b = block as ProductDetailBlock
  if (!b.visibility.enabled) return null

  const s = b.settings
  const gallery = s.gallery.filter((g) => g.url?.trim())
  const mainImage = gallery[0]?.url

  return (
    <section
      className="w-full bg-white"
      style={{
        paddingTop: b.style.paddingTop?.desktop,
        paddingBottom: b.style.paddingBottom?.desktop,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-500" aria-label="Breadcrumb">
          {s.breadcrumbs.map((crumb, i) => (
            <span key={i}>
              {i > 0 ? <span className="mx-2">/</span> : null}
              {crumb}
            </span>
          ))}
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            {gallery.length > 1 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {gallery.map((img) => (
                  <MediaImage
                    key={img.id}
                    src={resolveMediaUrl(img.url)}
                    alt={b.title ?? ''}
                    className="aspect-video w-full rounded-xl border border-slate-200 object-cover"
                  />
                ))}
              </div>
            ) : mainImage ? (
              <BuilderField path="gallery" label="Ürün görseli" type="media">
                <MediaImage
                  src={resolveMediaUrl(mainImage)}
                  alt={b.title ?? ''}
                  className="w-full rounded-xl border border-slate-200 object-cover"
                />
              </BuilderField>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
                Ürün görseli ekleyin
              </div>
            )}
          </div>

          <div>
            <BuilderField path="productType" label="Ürün tipi" type="text" className="mb-2 inline-block">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                {productTypeLabel(s.productType)}
              </span>
            </BuilderField>

            <BuilderField path="title" label="Ürün başlığı" type="text" className="w-fit max-w-full">
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{b.title}</h1>
            </BuilderField>

            <BuilderField path="description" label="Kısa açıklama" type="text" className="mt-3 w-fit max-w-full">
              <p className="text-slate-600">{b.description}</p>
            </BuilderField>

            {s.showPrice !== false ? (
              <BuilderField path="price" label="Fiyat" type="text" className="mt-4 inline-block">
                <p className="text-2xl font-bold text-emerald-700">
                  {s.price > 0 ? formatMoney(s.price, s.currency) : 'Ücretsiz'}
                </p>
              </BuilderField>
            ) : null}

            {s.showYearSelector && s.productType === 'SAAS' ? (
              <div className="mt-4">
                <p className="text-xs font-medium text-slate-500">Kullanım süresi</p>
                <select className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" defaultValue={s.licenseMonths}>
                  <option value={12}>1 yıl</option>
                  <option value={24}>2 yıl</option>
                  <option value={36}>3 yıl</option>
                </select>
              </div>
            ) : null}

            {s.showAddToCart !== false && s.purchaseEnabled ? (
              <BuilderField path="ctaButton" label="Sepete ekle" type="button" className="mt-6 inline-block">
                <span className="inline-flex rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white">
                  {s.ctaButtonLabel || 'Sepete Ekle'}
                </span>
              </BuilderField>
            ) : null}

            <div className="mt-6 space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
              <BuilderField path="deliveryInfo" label="Teslimat" type="text">
                <p>{s.deliveryInfo}</p>
              </BuilderField>
              <BuilderField path="licenseInfo" label="Lisans" type="text">
                <p>{s.licenseInfo}</p>
              </BuilderField>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Açıklama</h2>
            <BuilderField path="longDescription" label="Açıklama" type="text">
              <div
                className="prose prose-slate max-w-none text-sm"
                dangerouslySetInnerHTML={{ __html: s.longDescriptionHtml || '' }}
              />
            </BuilderField>
          </div>
          <div>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Özellikler</h2>
            <ul className="space-y-2">
              {s.featureBullets.map((f) => (
                <li key={f.id} className="flex gap-2 text-sm text-slate-600">
                  <span className="text-emerald-600">✓</span>
                  <BuilderField path={`feature.${f.id}`} label="Özellik" type="text" className="flex-1">
                    {f.text}
                  </BuilderField>
                </li>
              ))}
            </ul>
            <h2 className="mb-2 mt-6 text-lg font-semibold text-slate-900">Sistem gereksinimleri</h2>
            <BuilderField path="systemRequirements" label="Sistem gereksinimleri" type="text">
              <p className="text-sm text-slate-600">{s.systemRequirements}</p>
            </BuilderField>
            <h2 className="mb-2 mt-4 text-lg font-semibold text-slate-900">Sürüm</h2>
            <BuilderField path="version" label="Sürüm" type="text">
              <p className="text-sm text-slate-600">v{s.version}</p>
            </BuilderField>
          </div>
        </div>

        {s.faqItems.length > 0 ? (
          <div className="mt-12">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">SSS / Destek</h2>
            <div className="space-y-3">
              {s.faqItems.map((item) => (
                <details key={item.id} className="rounded-lg border border-slate-200 p-4">
                  <summary className="cursor-pointer font-medium text-slate-800">{item.question}</summary>
                  <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        ) : null}

        {s.supportNote ? (
          <p className={cn('mt-6 text-sm text-slate-500')}>{s.supportNote}</p>
        ) : null}
      </div>
    </section>
  )
}
