import { describe, expect, it } from 'vitest'
import { BILIRKISI_HESAP_CHECKOUT_PATH } from '@/data/canonicalSoftwareProducts'
import {
  bilirkisiCheckoutAuthReturnPath,
  customerAuthHref,
} from '@/lib/bilirkisiCheckoutAuthReturn'
import { safeInternalReturnPath } from '@/lib/safeInternalReturnPath'

const CAMPAIGN = 'HUKUKCULAR_DERNEGI_AGRI_IL_TEMSILCILIGI-40'

function roundTrip(page: 'giris' | 'kayit', search: string) {
  const ret = bilirkisiCheckoutAuthReturnPath(search)
  const href = customerAuthHref(page, ret)
  const decoded = new URL(href, 'https://www.woontegra.com').searchParams.get('return')
  return safeInternalReturnPath(decoded, '/hesabim')
}

describe('bilirkisi checkout auth return', () => {
  it('keeps a normal checkout return path without a campaign', () => {
    const back = roundTrip('giris', '')
    expect(back).toBe(BILIRKISI_HESAP_CHECKOUT_PATH)
    expect(new URL(back, 'https://www.woontegra.com').searchParams.get('c')).toBeNull()
  })

  it('returns register to the same normal checkout', () => {
    expect(roundTrip('kayit', '?plan=annual')).toBe(`${BILIRKISI_HESAP_CHECKOUT_PATH}?plan=annual`)
  })

  it('keeps the campaign code through login and does not carry a client discount rate', () => {
    const back = roundTrip(
      'giris',
      `?c=${CAMPAIGN}&plan=annual&discount=40&campaignDiscountRate=40&price=12000&total=12000&couponDiscount=3000`,
    )
    const params = new URL(back, 'https://www.woontegra.com').searchParams
    expect(params.get('c')).toBe(CAMPAIGN)
    expect(params.get('plan')).toBe('annual')
    expect(params.get('discount')).toBeNull()
    expect(params.get('campaignDiscountRate')).toBeNull()
    expect(params.get('price')).toBeNull()
    expect(params.get('total')).toBeNull()
    expect(params.get('couponDiscount')).toBeNull()
  })

  it('keeps the campaign code through register', () => {
    const back = roundTrip('kayit', `?campaign=${CAMPAIGN}`)
    expect(new URL(back, 'https://www.woontegra.com').searchParams.get('c')).toBe(CAMPAIGN)
  })

  it('keeps an invalid campaign code but does not invent a 40 percent rate', () => {
    const back = roundTrip('giris', '?c=EXPIRED_CODE&discount=40&campaignDiscountRate=40')
    const params = new URL(back, 'https://www.woontegra.com').searchParams
    expect(params.get('c')).toBe('EXPIRED_CODE')
    expect(params.get('discount')).toBeNull()
    expect(params.get('campaignDiscountRate')).toBeNull()
  })

  it('rejects external return targets', () => {
    expect(safeInternalReturnPath('https://evil.example/phish', '/hesabim')).toBe('/hesabim')
    expect(safeInternalReturnPath('//evil.example', '/hesabim')).toBe('/hesabim')
    expect(safeInternalReturnPath('javascript:alert(1)', '/hesabim')).toBe('/hesabim')
    expect(safeInternalReturnPath('/\\evil.example', '/hesabim')).toBe('/hesabim')
  })
})
