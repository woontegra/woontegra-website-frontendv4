import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { PageShell } from '@/components/public/PageShell'
import { EmptyState } from '@/components/public/EmptyState'
import { MediaImage } from '@/media/components/MediaImage'
import {
  maxQuantityForLine,
  readCart,
  removeFromCart,
  setLineQuantity,
  type CartLine,
} from '@/lib/cartStorage'
import { mergeCartWithPreview } from '@/lib/cartMerge'
import { isSaasSubscriptionProduct } from '@/utils/productPurchase'
import { formatMoney } from '@/types/product'
import { checkoutService } from '@/services/checkoutService'
import { usePageMeta } from '@/hooks/usePageMeta'

function QuantityControl({
  line,
  onChange,
}: {
  line: CartLine
  onChange: (qty: number) => void
}) {
  const max = maxQuantityForLine(line)
  const min = 1
  const value = line.quantity
  const singleQty = max === 1

  if (singleQty) {
    return <p className="text-sm text-slate-500">Adet: 1</p>
  }

  const bump = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta))
    if (next !== value) onChange(next)
  }

  const label = isSaasSubscriptionProduct(line.snapshot?.productType ?? 'DOWNLOAD') ? 'Yıl' : 'Adet'

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <div className="inline-flex items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white">
        <button
          type="button"
          aria-label="Azalt"
          disabled={value <= min}
          onClick={() => bump(-1)}
          className="flex h-10 w-10 items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="flex h-10 min-w-[2.5rem] items-center justify-center border-x border-slate-200 px-2 text-sm font-semibold tabular-nums">
          {value}
        </span>
        <button
          type="button"
          aria-label="Artır"
          disabled={value >= max}
          onClick={() => bump(1)}
          className="flex h-10 w-10 items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function CartPage() {
  const [lines, setLines] = useState<CartLine[]>(() => readCart())

  useEffect(() => {
    const sync = () => setLines(readCart())
    sync()
    window.addEventListener('woontegra-cart', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('woontegra-cart', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  usePageMeta({ title: 'Sepet', description: 'Alışveriş sepetiniz.' })

  const productIds = useMemo(() => lines.map((l) => l.productId), [lines])

  const previewQuery = useQuery({
    queryKey: ['cart', 'preview', productIds.join(',')],
    queryFn: () => checkoutService.cartPreview(productIds),
    enabled: productIds.length > 0,
  })

  const mergedRows = useMemo(
    () => mergeCartWithPreview(lines, previewQuery.data ?? []),
    [lines, previewQuery.data],
  )

  const total = useMemo(() => mergedRows.reduce((sum, row) => sum + row.lineTotal, 0), [mergedRows])
  const totalDiscount = useMemo(
    () =>
      mergedRows.reduce((sum, row) => {
        if (row.originalPrice != null && row.originalPrice > row.price) {
          return sum + (row.originalPrice - row.price) * row.quantity
        }
        return sum
      }, 0),
    [mergedRows],
  )
  const currency = mergedRows[0]?.currency ?? lines[0]?.snapshot?.currency ?? 'TRY'

  return (
    <PageShell
      breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Sepet' }]}
      title="Alışveriş Sepetiniz"
      description="Ürünleri inceleyin, adetleri güncelleyin ve ödeme adımına geçin."
      maxWidth="4xl"
    >
      {lines.length === 0 ? (
        <EmptyState
          title="Sepetiniz boş"
          description="Yazılımlar sayfasından ürün ekleyebilirsiniz."
          action={
            <Link to="/yazilimlar" className="text-sm font-semibold text-emerald-700 hover:underline">
              Yazılımlara git
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {mergedRows.map((row) => (
            <div
              key={row.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
            >
              <div className="h-24 w-full shrink-0 overflow-hidden rounded-lg sm:w-32">
                {row.coverImage ? (
                  <MediaImage src={row.coverImage} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{row.name}</h3>
                  {row.slug ? (
                    <Link to={`/yazilimlar/${row.slug}`} className="text-xs text-emerald-700 hover:underline">
                      Ürün detayı
                    </Link>
                  ) : null}
                  {row.campaign ? (
                    <p className="mt-1 text-xs font-medium text-rose-600">{row.campaign.name}</p>
                  ) : null}
                  <div className="mt-1 flex flex-wrap items-baseline gap-2">
                    <p className="font-bold text-slate-900">{formatMoney(row.lineTotal, row.currency)}</p>
                    {row.originalPrice != null && row.originalPrice > row.price ? (
                      <p className="text-sm text-slate-400 line-through">
                        {formatMoney(row.originalPrice * row.quantity, row.currency)}
                      </p>
                    ) : null}
                  </div>
                </div>
                <QuantityControl
                  line={lines.find((l) => l.productId === row.id) ?? { productId: row.id, quantity: row.quantity }}
                  onChange={(qty) => {
                    setLineQuantity(row.id, qty)
                    setLines(readCart())
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  removeFromCart(row.id)
                  setLines(readCart())
                }}
                className="self-start rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 sm:self-center"
                aria-label="Kaldır"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {totalDiscount > 0 ? (
            <div className="flex items-center justify-between rounded-2xl border border-rose-100 bg-rose-50 px-6 py-3 text-sm">
              <span className="font-medium text-rose-800">Kampanya indirimi</span>
              <span className="font-semibold text-rose-800">-{formatMoney(totalDiscount, currency)}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4">
            <span className="font-medium text-slate-700">Toplam</span>
            <span className="text-xl font-bold text-slate-900">{formatMoney(total, currency)}</span>
          </div>
          {previewQuery.isFetching ? (
            <p className="text-center text-xs text-slate-400">Fiyatlar sunucudan doğrulanıyor…</p>
          ) : null}
          <Link
            to="/odeme"
            className="block rounded-lg bg-emerald-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Ödemeye Geç
          </Link>
        </div>
      )}
    </PageShell>
  )
}
