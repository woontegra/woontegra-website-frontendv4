import { describe, expect, it } from 'vitest'
import { estimateKoopPlusTotal, fillKoopPlusPriceTokens } from '@/services/koopplusPricingService'

describe('KoopPlus adetli fiyat', () => {
  it('yeni müşteri tahmini: ilk + ek × (adet − 1)', () => {
    const p = { firstPrice: 9000, additionalPrice: 5000 }
    expect(estimateKoopPlusTotal(p, 1)).toBe(9000)
    expect(estimateKoopPlusTotal(p, 3)).toBe(19000)
    expect(estimateKoopPlusTotal({ firstPrice: null, additionalPrice: 5000 }, 2)).toBeNull()
  })

  it('metindeki {ilkFiyat}/{ekFiyat} yer tutucuları doldurulur', () => {
    const text = 'İlk {ilkFiyat}, ek {ekFiyat}'
    const out = fillKoopPlusPriceTokens(text, { firstPrice: 9000, additionalPrice: 5000, currency: 'TRY' })
    expect(out).not.toContain('{')
    expect(out).toContain('9.000')
    expect(out).toContain('5.000')
    expect(fillKoopPlusPriceTokens('Sabit metin', null)).toBe('Sabit metin')
  })
})
