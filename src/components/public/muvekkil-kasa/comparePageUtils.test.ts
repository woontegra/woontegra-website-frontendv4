import { describe, expect, it } from 'vitest'
import {
  mkCompareCardIdForEdition,
  MK_COMPARE_CARD_DESKTOP_ID,
  MK_COMPARE_CARD_SAAS_ID,
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

  it('builds compare hrefs with surum for MK SKUs', () => {
    expect(publicSoftwareDetailHref('muvekkil-kasa-defteri-yazilimi')).toBe(
      '/yazilimlar/muvekkil-kasa-defteri?surum=masaustu',
    )
    expect(publicSoftwareDetailHref('muvekkil-kasa-defteri-web-tabanli')).toBe(
      '/yazilimlar/muvekkil-kasa-defteri?surum=saas',
    )
  })
})
