import { describe, expect, it } from 'vitest'
import {
  affiliateCommissionStatusLabel,
  affiliatePackageDisplayName,
  affiliatePaymentMethodLabel,
  affiliatePayoutStatusLabel,
  affiliateSaleTypeLabel,
} from './affiliateUiLabels'

describe('affiliateUiLabels', () => {
  it('maps sale types', () => {
    expect(affiliateSaleTypeLabel('FIRST_SALE')).toBe('İlk Satış')
    expect(affiliateSaleTypeLabel('RENEWAL')).toBe('Yenileme')
  })

  it('maps commission statuses', () => {
    expect(affiliateCommissionStatusLabel('EARNED')).toBe('Hak Edildi')
    expect(affiliateCommissionStatusLabel('PARTIALLY_PAID')).toBe('Kısmen Ödendi')
    expect(affiliateCommissionStatusLabel('PAID')).toBe('Ödendi')
    expect(affiliateCommissionStatusLabel('CANCELLED')).toBe('İptal Edildi')
    expect(affiliateCommissionStatusLabel('REVERSED')).toBe('İptal Edildi')
  })

  it('maps payout and payment method codes', () => {
    expect(affiliatePayoutStatusLabel('PENDING')).toBe('Beklemede')
    expect(affiliatePaymentMethodLabel('BANK_TRANSFER')).toBe('Banka havalesi')
    expect(affiliatePackageDisplayName(null, 'DOWNLOAD')).toBe('Masaüstü')
  })
})
