import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const checkoutSource = readFileSync(new URL('./BilirkisiCheckoutPage.tsx', import.meta.url), 'utf8')

function submitSection(source: string): string {
  const start = source.indexOf('setSubmitting(true)')
  const end = source.indexOf('if (success)')
  return source.slice(start, end)
}

describe('Bilirkişi checkout payment route', () => {
  const submit = submitSection(checkoutSource)

  it('sends every Havale/EFT checkout through the central order endpoint', () => {
    expect(submit).toContain("paymentMethod === 'bank_transfer'")
    expect(submit).toContain('bilirkisiHesapService.createCheckoutOrder')
    expect(submit).toContain("paymentProvider: 'BANK_TRANSFER'")
    expect(submit).not.toContain('createBankTransferOrder')
    expect(submit).not.toContain('/bh/payment/bank-transfer-order')
    expect(submit).not.toContain('coupon.quote?.code')
  })

  it('keeps card checkout on the central order plus PayTR start', () => {
    expect(submit).toContain('bilirkisiHesapService.createCheckoutOrder(body)')
    expect(submit).toContain('paymentsService.startPaytr(created.data.orderNo)')
    expect(submit).toContain('https://www.paytr.com/odeme/guvenli/')
  })
})
