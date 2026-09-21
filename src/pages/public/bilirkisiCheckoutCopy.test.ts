import { describe, expect, it } from 'vitest'
import {
  bilirkisiCheckoutCopy,
  isLicenseStillActive,
  parsePurchaseContext,
  resolveBilirkisiCheckoutKind,
} from './bilirkisiCheckoutCopy'

const OLD_DEMO_PHRASES = [
  'Demo aboneliğinizi satın alın',
  'Demo yükseltme oturumu',
  'Uzatma paketi',
  'Aboneliğinizi uzatmak için hesabınıza giriş yapın',
  'Ödeme Woontegra hesabınız üzerinden alınır; Bilirkişi Hesap lisansınız aynı kullanıcıda uzatılır.',
]

function joined(copy: ReturnType<typeof bilirkisiCheckoutCopy>): string {
  return [copy.title, copy.subtitle, copy.sessionTitle, copy.guestTitle, copy.guestBody, copy.packageTitle, copy.packageNote]
    .filter(Boolean)
    .join('\n')
}

describe('bilirkisiCheckoutCopy', () => {
  it('keeps renew-token pages in loading until quote context arrives', () => {
    expect(
      resolveBilirkisiCheckoutKind({
        hasRenewToken: true,
        purchaseContext: null,
      }),
    ).toBe('loading')
    const copy = bilirkisiCheckoutCopy('loading')
    expect(copy.title).toBeNull()
    expect(copy.guestTitle).toBeNull()
    for (const phrase of OLD_DEMO_PHRASES) {
      expect(joined(copy)).not.toContain(phrase)
    }
  })

  it('does not treat a failed quote as demo or paid renewal copy', () => {
    expect(
      resolveBilirkisiCheckoutKind({
        hasRenewToken: true,
        purchaseContext: null,
        quoteFailed: true,
      }),
    ).toBe('purchase')
  })

  it('uses conversion copy for active demo after context loads', () => {
    expect(
      resolveBilirkisiCheckoutKind({
        hasRenewToken: true,
        purchaseContext: 'DEMO_CONVERSION',
      }),
    ).toBe('demo')
    const copy = bilirkisiCheckoutCopy('demo', { demoStillActive: true })
    expect(copy.title).toBe('Profesyonel aboneliğe geçin')
    expect(copy.subtitle).toBe(
      'Ödeme sonrası mevcut Bilirkişi Hesap hesabınız profesyonel aboneliğe dönüştürülür. Yeni hesap oluşturulmaz. Kalan demo süreniz satın aldığınız abonelik süresine eklenir.',
    )
    expect(copy.sessionTitle).toBe('Abonelik satın alma işlemi')
    expect(copy.packageTitle).toBe('Abonelik paketi')
    expect(copy.guestTitle).toBe(
      'Satın alma işlemine devam etmek için Woontegra hesabınıza giriş yapın',
    )
    expect(copy.guestBody).toBe(
      'Satın aldığınız abonelik mevcut Bilirkişi Hesap hesabınıza tanımlanır.',
    )
    expect(copy.packageNote).toBe('Satın aldığınız süreye kalan demo günleriniz eklenir.')
    for (const phrase of OLD_DEMO_PHRASES) {
      expect(joined(copy)).not.toContain(phrase)
    }
  })

  it('omits remaining-demo sentences when demo has expired', () => {
    const copy = bilirkisiCheckoutCopy('demo', { demoStillActive: false })
    expect(copy.title).toBe('Profesyonel aboneliğe geçin')
    expect(copy.subtitle).toBe(
      'Ödeme sonrası mevcut Bilirkişi Hesap hesabınız profesyonel aboneliğe dönüştürülür. Yeni hesap oluşturulmaz.',
    )
    expect(copy.subtitle).not.toContain('Kalan demo süreniz')
    expect(copy.packageNote).toBe('Aboneliğiniz ödeme onayından sonra başlatılır.')
    for (const phrase of OLD_DEMO_PHRASES) {
      expect(joined(copy)).not.toContain(phrase)
    }
  })

  it('parses DEMO_CONVERSION from nested quote payloads and demo package labels', () => {
    expect(parsePurchaseContext({ purchaseContext: 'DEMO_CONVERSION' })).toBe('DEMO_CONVERSION')
    expect(
      parsePurchaseContext({
        data: { purchaseContext: 'DEMO_CONVERSION', currentPackage: 'annual' },
      }),
    ).toBe('DEMO_CONVERSION')
    expect(parsePurchaseContext({ currentPackage: 'Demo', licenseType: 'annual' })).toBe(
      'DEMO_CONVERSION',
    )
    expect(parsePurchaseContext({ currentPackage: 'annual' })).toBe('LICENSE_RENEWAL')
  })

  it('treats future expiry as active and past expiry as expired', () => {
    const now = Date.parse('2026-09-21T12:00:00.000Z')
    expect(isLicenseStillActive('2026-09-22T10:00:00.000Z', now)).toBe(true)
    expect(isLicenseStillActive('2026-09-20T10:00:00.000Z', now)).toBe(false)
    expect(isLicenseStillActive(null, now)).toBe(false)
  })
})
