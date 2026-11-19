import { adminApi, publicApi } from '@/api/client'
import { formatMoney } from '@/utils/formatMoney'

/**
 * KoopPlus adetli satış fiyatı.
 * - İlk kooperatif: ürün fiyatı (Yönetim → Ürünler)
 * - Her ek kooperatif: “Ek kooperatif fiyatı” (Yönetim → KoopPlus ürün ayarları)
 * Kesin tutarı her zaman sunucu hesaplar.
 */
export type KoopPlusPricing = {
  firstPrice: number | null
  additionalPrice: number
  currency: string
  maxQuantity: number
}

export type KoopPlusPriceQuote = {
  quantity: number
  firstUnits: number
  additionalUnits: number
  firstPrice: number
  additionalPrice: number
  total: number
  currency: string
  reason: 'new_customer' | 'existing_customer' | 'renewal_first' | 'renewal_additional'
  licenseFound: boolean | null
}

export const KOOPPLUS_DEFAULT_MAX_QUANTITY = 20

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) return (payload as { data: T }).data
  return payload as T
}

/** Yeni müşteri için tahmini toplam (ilk + ek × (adet − 1)). */
export function estimateKoopPlusTotal(pricing: Pick<KoopPlusPricing, 'firstPrice' | 'additionalPrice'>, quantity: number): number | null {
  if (pricing.firstPrice == null) return null
  const q = Math.max(1, Math.floor(quantity) || 1)
  return Math.round((pricing.firstPrice + (q - 1) * pricing.additionalPrice) * 100) / 100
}

export const koopplusPricingService = {
  async getPricing(): Promise<KoopPlusPricing> {
    const res = await publicApi.get('/koopplus/pricing')
    return unwrap<KoopPlusPricing>(res.data)
  },

  async quote(input: { quantity: number; licenseKey?: string }): Promise<KoopPlusPriceQuote> {
    const res = await publicApi.post('/koopplus/price-quote', {
      quantity: input.quantity,
      ...(input.licenseKey?.trim() ? { licenseKey: input.licenseKey.trim() } : {}),
    })
    return unwrap<KoopPlusPriceQuote>(res.data)
  },

  async adminGet(): Promise<{ additionalPrice: number; firstPrice: number | null }> {
    const res = await adminApi.get('/admin/koopplus/pricing')
    return unwrap<{ additionalPrice: number; firstPrice: number | null }>(res.data)
  },

  async adminSave(additionalPrice: number): Promise<{ additionalPrice: number }> {
    const res = await adminApi.put('/admin/koopplus/pricing', { additionalPrice })
    return unwrap<{ additionalPrice: number }>(res.data)
  },
}

/** Lisans maddelerindeki {ilkFiyat} / {ekFiyat} yer tutucularını güncel fiyatlarla değiştirir. */
export function fillKoopPlusPriceTokens(
  text: string,
  pricing: Pick<KoopPlusPricing, 'firstPrice' | 'additionalPrice' | 'currency'> | null,
): string {
  if (!/\{(ilkFiyat|ekFiyat)\}/.test(text)) return text
  const first = pricing?.firstPrice != null ? formatMoney(pricing.firstPrice, pricing.currency) : '—'
  const add = pricing ? formatMoney(pricing.additionalPrice, pricing.currency) : '—'
  return text.replace(/\{ilkFiyat\}/g, first).replace(/\{ekFiyat\}/g, add)
}
