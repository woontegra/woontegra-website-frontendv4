import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mergeCartWithPreview } from '@/lib/cartMerge'
import { maxQuantityForLine, type CartLine } from '@/lib/cartStorage'
import { MK_SAAS_RENEWAL_TOKEN_KEY } from '@/lib/mkSaasLicensePurchase'
import { isMkSaasSingleYearPurchase } from '@/lib/mkSaasPurchaseYears'
import { MK_SAAS_CANONICAL_SLUG } from '@/lib/muvekkilKasaSaasProduct'
import type { CartPreviewRow } from '@/types/checkout'

const root = dirname(fileURLToPath(import.meta.url))

const mkSaasPreview: CartPreviewRow = {
  id: 'mk-saas',
  name: 'Müvekkil Kasa Defteri Web Tabanlı',
  slug: MK_SAAS_CANONICAL_SLUG,
  productType: 'SAAS',
  price: 4000,
  currency: 'TRY',
  coverImage: null,
  hasDownload: false,
}

const otherSaasPreview: CartPreviewRow = {
  ...mkSaasPreview,
  id: 'other-saas',
  name: 'Başka SaaS',
  slug: 'baska-saas',
}

function line(productId: string, quantity: number, slug?: string): CartLine {
  return {
    productId,
    quantity,
    snapshot: slug
      ? { name: 'x', slug, price: 4000, currency: 'TRY', productType: 'SAAS', coverImage: null }
      : undefined,
  }
}

function withRenewalToken(token: string | null) {
  const store = new Map<string, string>()
  if (token) store.set(MK_SAAS_RENEWAL_TOKEN_KEY, token)
  vi.stubGlobal('sessionStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
    removeItem: (k: string) => store.delete(k),
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Müvekkil Kasa SaaS yeni satın alma süresi', () => {
  it('yenileme bağlantısı yokken Müvekkil Kasa SaaS tek yıllıktır', () => {
    withRenewalToken(null)
    expect(isMkSaasSingleYearPurchase({ slug: MK_SAAS_CANONICAL_SLUG })).toBe(true)
    expect(isMkSaasSingleYearPurchase({ slug: 'baska-saas' })).toBe(false)
  })

  it('sepette kalmış eski çok yıllık değer checkout satırına 1 yıl olarak taşınır', () => {
    withRenewalToken(null)
    const [row] = mergeCartWithPreview([line('mk-saas', 3)], [mkSaasPreview])
    expect(row.quantity).toBe(1)
    expect(row.lineTotal).toBe(4000)
  })

  it('snapshot olmasa da ürün kaydının slug bilgisiyle 1 yıla indirilir', () => {
    withRenewalToken(null)
    const [row] = mergeCartWithPreview([line('mk-saas', 5)], [mkSaasPreview])
    expect(row.quantity).toBe(1)
  })

  it('sepet adet sınırı Müvekkil Kasa SaaS için 1, diğer SaaS ürünleri için 10 kalır', () => {
    withRenewalToken(null)
    expect(maxQuantityForLine(line('mk-saas', 1, MK_SAAS_CANONICAL_SLUG))).toBe(1)
    expect(maxQuantityForLine(line('other-saas', 1, 'baska-saas'))).toBe(10)
    const [other] = mergeCartWithPreview([line('other-saas', 3)], [otherSaasPreview])
    expect(other.quantity).toBe(3)
  })

  it('lisans yenileme bağlantısıyla gelinen oturumda mevcut yenileme davranışı değişmez', () => {
    withRenewalToken('renewal-token')
    expect(isMkSaasSingleYearPurchase({ slug: MK_SAAS_CANONICAL_SLUG })).toBe(false)
    expect(maxQuantityForLine(line('mk-saas', 1, MK_SAAS_CANONICAL_SLUG))).toBe(10)
    const [row] = mergeCartWithPreview([line('mk-saas', 3)], [mkSaasPreview])
    expect(row.quantity).toBe(3)
  })

  it('Müvekkil Kasa SaaS sayfa eylemleri sepete her zaman 1 yıl ekler', () => {
    const hookSrc = readFileSync(join(root, '../hooks/useMkSaasProductPageActions.ts'), 'utf8')
    expect(hookSrc).toContain('const MK_SAAS_PURCHASE_YEARS = 1')
    expect(hookSrc).toContain('const webUsageYears = MK_SAAS_PURCHASE_YEARS')
    expect(hookSrc).not.toContain('useState(1)')
  })
})
