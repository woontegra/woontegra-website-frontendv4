import { describe, expect, it } from 'vitest'
import {
  isCentralDesktopLicenseProduct,
  isValidLicenseAppCodeFormat,
} from '@/lib/centralDesktopLicenseProduct'

describe('central desktop license eligibility', () => {
  it('keeps Müvekkil Kasa Desktop eligible', () => {
    expect(
      isCentralDesktopLicenseProduct({
        slug: 'muvekkil-kasa-defteri-yazilimi',
        licenseAppCode: 'MUVEKKIL_KASA_DESKTOP',
        licenseRequired: true,
        productType: 'DOWNLOAD',
      }),
    ).toBe(true)
  })

  it('supports KOOPPLUS_DESKTOP', () => {
    expect(
      isCentralDesktopLicenseProduct({
        slug: 'koopplus',
        licenseAppCode: 'KOOPPLUS_DESKTOP',
        licenseRequired: true,
        productType: 'DOWNLOAD',
      }),
    ).toBe(true)
  })

  it('rejects SaaS products', () => {
    expect(
      isCentralDesktopLicenseProduct({
        slug: 'muvekkil-kasa-defteri-web-tabanli',
        licenseAppCode: 'MUVEKKIL_KASA_SAAS',
        licenseRequired: true,
        productType: 'SAAS',
      }),
    ).toBe(false)
  })

  it('rejects licenseRequired=false', () => {
    expect(
      isCentralDesktopLicenseProduct({
        slug: 'sifre-kasasi',
        licenseAppCode: 'SIFRE_KASASI_DESKTOP',
        licenseRequired: false,
        productType: 'DOWNLOAD',
      }),
    ).toBe(false)
  })

  it('rejects invalid appCode even when the product looks like a desktop license', () => {
    expect(isValidLicenseAppCodeFormat('bad-code')).toBe(false)
    expect(
      isCentralDesktopLicenseProduct({
        slug: 'koopplus',
        licenseAppCode: 'bad-code',
        licenseRequired: true,
        productType: 'DOWNLOAD',
      }),
    ).toBe(false)
  })

  it('treats DOWNLOAD + licenseRequired as desktop-renewal UI eligible without appCode', () => {
    expect(
      isCentralDesktopLicenseProduct({
        slug: 'koopplus',
        licenseRequired: true,
        productType: 'DOWNLOAD',
      }),
    ).toBe(true)
  })
})
