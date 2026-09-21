import { describe, expect, it } from 'vitest'
import {
  mkCompareCardIdForEdition,
  MK_COMPARE_CARD_DESKTOP_ID,
  MK_COMPARE_CARD_SAAS_ID,
  MK_COMPARE_DESKTOP_LICENSE_CAPTION,
  MK_COMPARE_SAAS_LICENSE_CAPTION,
  MK_COMPARE_TRIAL_CTA_LABEL,
  parseMkCompareSurumParam,
  publicSoftwareDetailHref,
} from '@/components/public/muvekkil-kasa/comparePageUtils'

describe('mk compare affiliate landing helpers', () => {
  it('maps surum query to edition and card ids', () => {
    expect(parseMkCompareSurumParam('saas')).toBe('saas')
    expect(parseMkCompareSurumParam('masaustu')).toBe('desktop')
    expect(mkCompareCardIdForEdition('desktop')).toBe(MK_COMPARE_CARD_DESKTOP_ID)
    expect(mkCompareCardIdForEdition('saas')).toBe(MK_COMPARE_CARD_SAAS_ID)
  })

  it('keeps desktop license duration copy annual, not lifetime', () => {
    expect(MK_COMPARE_DESKTOP_LICENSE_CAPTION).toBe('KDV dahil · 1 yıl lisans')
    expect(MK_COMPARE_SAAS_LICENSE_CAPTION).toBe('KDV dahil · 1 yıl birim fiyat')
    expect(MK_COMPARE_TRIAL_CTA_LABEL).toBe('7 Gün Ücretsiz Dene')
    expect(MK_COMPARE_DESKTOP_LICENSE_CAPTION).not.toContain('tek lisans')
  })

  it('builds compare hrefs with surum for MK SKUs', () => {
    expect(publicSoftwareDetailHref('muvekkil-kasa-defteri-yazilimi')).toBe(
      '/yazilimlar/muvekkil-kasa-defteri?surum=masaustu',
    )
    expect(publicSoftwareDetailHref('muvekkil-kasa-defteri-web-tabanli')).toBe(
      '/yazilimlar/muvekkil-kasa-defteri?surum=saas',
    )
    expect(publicSoftwareDetailHref('koopplus')).toBe('/yazilimlar/kooperatif-yonetim-yazilimi')
    expect(publicSoftwareDetailHref('kooperatif-yonetim-yazilimi')).toBe(
      '/yazilimlar/kooperatif-yonetim-yazilimi',
    )
  })
})
