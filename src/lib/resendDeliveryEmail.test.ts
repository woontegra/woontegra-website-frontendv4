import { describe, expect, it } from 'vitest'
import { canResendPaidDeliveryEmail } from './resendDeliveryEmail'

describe('canResendPaidDeliveryEmail', () => {
  it('ödenmiş siparişte açıktır', () => {
    expect(canResendPaidDeliveryEmail({ status: 'PAID' })).toBe(true)
  })

  it('bekleyen ve başarısız ödemede kapalıdır', () => {
    expect(canResendPaidDeliveryEmail({ status: 'PENDING' })).toBe(false)
    expect(canResendPaidDeliveryEmail({ status: 'FAILED', paymentStatus: 'FAILED' })).toBe(false)
    expect(canResendPaidDeliveryEmail({ status: 'CANCELLED' })).toBe(false)
    expect(canResendPaidDeliveryEmail({ status: 'PROCESSING', paymentStatus: 'PENDING' })).toBe(false)
  })

  it('onaylanmış işleme alınmış siparişte açıktır', () => {
    expect(canResendPaidDeliveryEmail({ status: 'PROCESSING', paymentConfirmedAt: '2026-10-07T07:26:07.345Z' })).toBe(true)
    expect(canResendPaidDeliveryEmail({ status: 'PROCESSING', paymentStatus: 'SUCCESS' })).toBe(true)
  })
})
