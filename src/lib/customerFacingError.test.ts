import { describe, expect, it } from 'vitest'
import {
  GENERIC_CUSTOMER_ERROR_MESSAGE,
  INVALID_CUSTOMER_SESSION_MESSAGE,
  customerFacingMessage,
  invalidCustomerSessionLoginPath,
  isInvalidCustomerSessionPayload,
} from './customerFacingError'

describe('customer facing errors', () => {
  it('hides the order customer foreign key and keeps a specific checkout fallback', () => {
    expect(customerFacingMessage('Foreign key constraint violated: `Order_customerId_fkey (index)`', 'Sipariş veya ödeme başlatılamadı')).toBe(
      INVALID_CUSTOMER_SESSION_MESSAGE,
    )
    expect(customerFacingMessage('Invalid `prisma.order.create()` invocation', 'Sipariş veya ödeme başlatılamadı')).toBe(
      'Sipariş veya ödeme başlatılamadı',
    )
  })

  it('uses the generic sentence when the caller has no specific fallback', () => {
    expect(customerFacingMessage('syntax error at or near', 'İşlem başarısız')).toBe(GENERIC_CUSTOMER_ERROR_MESSAGE)
  })

  it('keeps an understandable validation message', () => {
    expect(customerFacingMessage('Geçerli bir e-posta girin', 'Kayıt oluşturulamadı')).toBe('Geçerli bir e-posta girin')
  })

  it('sends a deleted session to login without dropping the return path', () => {
    expect(isInvalidCustomerSessionPayload({ code: 'CUSTOMER_SESSION_INVALID', message: 'x' })).toBe(true)
    expect(invalidCustomerSessionLoginPath('/odeme?kupon=YAZ')).toBe(
      '/giris?return=%2Fodeme%3Fkupon%3DYAZ&oturum=gecersiz',
    )
    expect(invalidCustomerSessionLoginPath('/giris?return=%2Fodeme')).toBeNull()
  })
})
