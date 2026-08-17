import { formatMkSaasTryMoney } from '@/components/public/product/ProductPurchasePanel'
import { useMkSaasProductPageContextOptional } from '@/components/public/product/MkSaasProductPageProvider'
import type { HeroSettings } from '@/builder/types'

export function HeroProductPrice({ settings }: { settings: HeroSettings }) {
  const ctx = useMkSaasProductPageContextOptional()
  if (!settings.showProductPrice || !ctx?.product) return null

  const suffix = settings.priceSuffix?.trim() || '/ 1 yıl'
  const line = `${formatMkSaasTryMoney(ctx.product.price, ctx.product.currency)} ${suffix}`

  return <p className="mt-4 text-lg font-semibold tabular-nums text-sky-200 sm:text-xl">{line}</p>
}
