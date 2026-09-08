import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearCheckoutIdempotencyKey,
  getOrCreateCheckoutIdempotencyKey,
} from './checkoutIdempotency'

describe('checkoutIdempotency', () => {
  const store = new Map<string, string>()

  beforeEach(() => {
    store.clear()
    vi.stubGlobal('window', {
      sessionStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => {
          store.set(k, v)
        },
        removeItem: (k: string) => {
          store.delete(k)
        },
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reuses the same key for a cart fingerprint', () => {
    const fp = `test-cart-${Date.now()}`
    clearCheckoutIdempotencyKey(fp)
    const a = getOrCreateCheckoutIdempotencyKey(fp)
    const b = getOrCreateCheckoutIdempotencyKey(fp)
    expect(a).toBe(b)
    expect(a.length).toBeGreaterThanOrEqual(16)
    clearCheckoutIdempotencyKey(fp)
    const c = getOrCreateCheckoutIdempotencyKey(fp)
    expect(c).not.toBe(a)
  })
})
