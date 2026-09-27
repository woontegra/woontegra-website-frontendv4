import { describe, expect, it } from 'vitest'
import {
  parseCachedBhProduct,
  productToKeepOnPriceError,
} from './bhPublicProductPriceCache'

const saved = { id: 1, name: 'Bilirkişi Hesap', price: 2_000_000, priceMonthly: 2_000 }

describe('bh public product price cache', () => {
  it('keeps the last successful price only on 429', () => {
    expect(productToKeepOnPriceError(429, saved)?.price).toBe(2_000_000)
    expect(productToKeepOnPriceError(429, saved)?.priceMonthly).toBe(2_000)
    expect(productToKeepOnPriceError(500, saved)).toBeNull()
    expect(productToKeepOnPriceError(429, null)).toBeNull()
  })

  it('rejects cached payloads that are not a real product price', () => {
    expect(parseCachedBhProduct(JSON.stringify({ price: 2000 }))?.price).toBe(2000)
    expect(parseCachedBhProduct('{"price":"2000"}')).toBeNull()
    expect(parseCachedBhProduct('not-json')).toBeNull()
    expect(parseCachedBhProduct(null)).toBeNull()
  })
})
