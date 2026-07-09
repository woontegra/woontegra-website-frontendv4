import { useEffect, useState, type MouseEvent } from 'react'

import { Link } from 'react-router-dom'

import type { PublicProductListItem } from '@/types/product'

import { formatMoney, productTypeLabel } from '@/types/product'
import { formatCampaignDate } from '@/types/campaign'

import { MediaImage } from '@/media/components/MediaImage'

import { CartAddedFeedback } from '@/components/public/CartAddedFeedback'

import { pickProductCoverUrl } from '@/lib/publicContentImages'

import { addToCart } from '@/lib/cartStorage'
import { trackAddToCart } from '@/integrations/trackingEvents'

import {

  buildCartSnapshot,

  canPurchaseProduct,

  isFreeDownloadProduct,

  shouldShowQuoteCta,

} from '@/utils/productPurchase'

import { cn } from '@/lib/cn'
import { getPromotionalSoftwareMeta, isExternalSalesProduct } from '@/lib/publicSoftwareCatalog'



type Props = {

  product: PublicProductListItem

}



function licenseListNote(product: PublicProductListItem): string | null {

  if (product.productType === 'DOWNLOAD') return 'Merkezi lisans destekli'

  if (product.productType === 'SAAS') return 'Abonelik / merkezi lisans'

  return null

}



function hasCompareDiscount(price: number, compareAtPrice: number | null): boolean {

  return compareAtPrice != null && compareAtPrice > price

}



export function ProductCard({ product }: Props) {

  const [feedback, setFeedback] = useState<'added' | 'in-cart' | null>(null)

  const coverUrl = pickProductCoverUrl(product)

  const detailHref = `/yazilimlar/${product.slug}`

  const promotionalMeta = getPromotionalSoftwareMeta(product.slug)

  const isExternalSales = isExternalSalesProduct(product)

  const hasPrice = Number.isFinite(product.price) && product.price > 0

  const canPurchase = canPurchaseProduct(product) && !isExternalSales

  const isFreeDownload = isFreeDownloadProduct(product)

  const showQuote = shouldShowQuoteCta(product) && !isExternalSales

  const licenseNote = licenseListNote(product)

  const onSale = hasCompareDiscount(product.price, product.compareAtPrice)
  const strikePrice =
    product.originalPrice != null && product.originalPrice > product.price
      ? product.originalPrice
      : onSale
        ? product.compareAtPrice
        : null
  const campaignBadge = product.campaign?.badge?.trim() || (product.campaign ? 'Kampanyalı' : null)

  const teklifHref = `/iletisim?konu=${encodeURIComponent(`Teklif: ${product.name}`)}`



  useEffect(() => {

    if (!feedback) return

    const t = window.setTimeout(() => setFeedback(null), 4000)

    return () => window.clearTimeout(t)

  }, [feedback])



  const handleAddToCart = (e: MouseEvent) => {

    e.preventDefault()

    e.stopPropagation()

    if (!canPurchase) return

    const result = addToCart(product.id, 1, { snapshot: buildCartSnapshot(product) })

    setFeedback(result === 'already_in_cart' ? 'in-cart' : 'added')

    if (result === 'added') {
      trackAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        currency: product.currency,
        quantity: 1,
      })
    }

  }



  return (

    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition hover:border-emerald-200 hover:shadow-lg">

      <Link to={detailHref} className="block overflow-hidden">

        {coverUrl ? (

          <MediaImage

            src={coverUrl}

            alt={product.name}

            loading="lazy"
            optimizeWidth={640}

            className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]"

          />

        ) : isExternalSales ? (

          <div className="flex aspect-[4/3] w-full flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-sky-950 to-emerald-900 px-6 text-center">

            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/90">Woontegra Yazılımı</span>

            <p className="mt-3 text-lg font-semibold text-white">{product.name}</p>

            <p className="mt-2 text-sm text-slate-300">Web tabanlı · Harici satış · Resmi sitede lisans</p>

          </div>

        ) : null}

      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">

        <div className="flex flex-wrap items-center gap-2 text-xs">

          {product.isFeatured ? (

            <span className="rounded-full bg-emerald-600 px-2 py-0.5 font-medium text-white">Öne çıkan</span>

          ) : null}

          {promotionalMeta ? (

            promotionalMeta.badges.map((badge) => (

              <span

                key={badge}

                className="rounded-full bg-sky-50 px-2 py-0.5 font-medium text-sky-800 ring-1 ring-sky-100"

              >

                {badge}

              </span>

            ))

          ) : (

            <>

              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">

                {productTypeLabel(product.productType)}

              </span>

              {product.category ? (

                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">{product.category.name}</span>

              ) : null}

            </>

          )}

          {campaignBadge ? (

            <span className="rounded-full bg-rose-600 px-2 py-0.5 font-medium text-white">{campaignBadge}</span>

          ) : null}

        </div>

        <div className="flex-1 min-w-0">

          <Link to={detailHref}>

            <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 transition group-hover:text-emerald-700">

              {product.name}

            </h3>

          </Link>

          {product.shortDescription ? (

            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">{product.shortDescription}</p>

          ) : null}

          {licenseNote ? <p className="mt-2 text-xs text-slate-400">{licenseNote}</p> : null}

        </div>

        <div className="flex flex-wrap items-baseline gap-2 border-t border-slate-100 pt-3">

          {isFreeDownload ? (

            <p className="text-xl font-bold text-emerald-700">Ücretsiz</p>

          ) : promotionalMeta ? (

            <p className="text-sm font-medium text-sky-800">{promotionalMeta.priceNote}</p>

          ) : hasPrice ? (

            <>

              <p className="text-xl font-bold text-slate-900">{formatMoney(product.price, product.currency)}</p>

              {strikePrice != null && strikePrice > product.price ? (

                <p className="text-sm text-slate-400 line-through">

                  {formatMoney(strikePrice, product.currency)}

                </p>

              ) : null}

              {product.campaign?.endsAt ? (

                <p className="w-full text-xs text-rose-600">

                  Kampanya bitiş: {formatCampaignDate(product.campaign.endsAt)}

                </p>

              ) : null}

            </>

          ) : (

            <p className="text-sm font-medium text-slate-500">Fiyat için teklif alın</p>

          )}

        </div>

        {feedback ? (

          <CartAddedFeedback

            message={feedback === 'in-cart' ? 'Bu ürün zaten sepetinizde.' : 'Ürün sepete eklendi.'}

            onContinue={() => setFeedback(null)}

          />

        ) : (

          <div className={cn('grid gap-2', canPurchase || showQuote || isExternalSales ? 'grid-cols-2' : 'grid-cols-1')}>

            <Link

              to={detailHref}

              className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"

            >

              {isExternalSales ? promotionalMeta?.listCtaLabel ?? 'İncele' : isFreeDownload ? 'Detay & İndir' : 'Detay İncele'}

            </Link>

            {canPurchase ? (

              <button

                type="button"

                onClick={handleAddToCart}

                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"

              >

                Sepete Ekle

              </button>

            ) : showQuote ? (

              <Link

                to={teklifHref}

                className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"

              >

                Teklif Al

              </Link>

            ) : isExternalSales && promotionalMeta ? (

              <a

                href={promotionalMeta.officialUrl}

                target="_blank"

                rel="noopener noreferrer"

                className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"

              >

                {promotionalMeta.ctaLabel}

              </a>

            ) : null}

          </div>

        )}

      </div>

    </article>

  )

}


