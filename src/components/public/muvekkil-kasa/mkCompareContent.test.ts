import { describe, expect, it } from 'vitest'
import {
  getMkCompareDetailOverview,
  MK_COMPARE_DESKTOP_COLUMN,
  MK_COMPARE_LEGACY_TABLE_FEATURES,
  MK_COMPARE_TABLE_ROWS,
  MK_COMPARE_WEB_COLUMN,
} from '@/components/public/muvekkil-kasa/mkCompareContent'

const bannedTerms = [
  'Merkezi lisans',
  'Yıllık SaaS',
  'SaaS',
  'SaaS / Web',
  'svg',
  'license model',
  'activation',
  'AppCode',
  'cihaz hakkı',
  'Lisans modeli',
  'Kurulum',
  'Kullanım süresi',
  'Fiyatlandırma',
  'Ücretsiz demo',
  'Ürün detayını inceleyin',
]

const requiredFeatures = [
  'Müvekkil kasa takibi',
  'Büro içi ekip kullanımı',
  'Yetkili kullanıcılar',
  'Personel ve prim takibi',
  'Otomatik hatırlatmalar',
  'WhatsApp / iletişim kolaylığı',
  'Raporlama ve kontrol',
  'Her yerden erişim',
  'Veri düzeni ve yedekleme',
  'Kimler için uygun?',
]

describe('mk compare customer content', () => {
  it('does not expose technical or sales terms in comparison rows', () => {
    const texts = MK_COMPARE_TABLE_ROWS.flatMap((row) => [
      row.feature,
      row.desktop.text,
      row.saas.text,
      row.desktop.hint ?? '',
      row.saas.hint ?? '',
    ])
    const haystack = texts.join(' ').toLowerCase()
    for (const term of bannedTerms) {
      expect(haystack.includes(term.toLowerCase())).toBe(false)
    }
  })

  it('does not include legacy technical comparison rows', () => {
    const features = MK_COMPARE_TABLE_ROWS.map((row) => row.feature)
    for (const legacy of MK_COMPARE_LEGACY_TABLE_FEATURES) {
      expect(features).not.toContain(legacy)
    }
  })

  it('includes all operational comparison rows', () => {
    const features = MK_COMPARE_TABLE_ROWS.map((row) => row.feature)
    expect(features).toEqual(requiredFeatures)
  })

  it('shows staff/prim tracking only on web column', () => {
    const staffRow = MK_COMPARE_TABLE_ROWS.find((row) => row.feature === 'Personel ve prim takibi')
    expect(staffRow?.desktop.text).toBe('Yok')
    expect(staffRow?.saas.text).toContain('prim takibi')
  })

  it('uses customer-facing column labels', () => {
    expect(MK_COMPARE_DESKTOP_COLUMN).toBe('Masaüstü Sürüm')
    expect(MK_COMPARE_WEB_COLUMN).toBe('Web Tabanlı Sürüm')
  })

  it('structures detail overview with intro and three bullet groups', () => {
    for (const edition of ['desktop', 'saas'] as const) {
      const overview = getMkCompareDetailOverview(edition)
      expect(overview.intro.split('.').filter((s) => s.trim()).length).toBeGreaterThanOrEqual(2)
      expect(overview.canDo.length).toBeGreaterThanOrEqual(3)
      expect(overview.suitableFor.length).toBeGreaterThanOrEqual(3)
      expect(overview.advantages.length).toBeGreaterThanOrEqual(3)
      const haystack = [overview.intro, ...overview.canDo, ...overview.suitableFor, ...overview.advantages]
        .join(' ')
        .toLowerCase()
      expect(haystack.includes('saas')).toBe(false)
    }
  })

  it('keeps desktop and web overview messaging distinct', () => {
    const desktop = getMkCompareDetailOverview('desktop')
    const web = getMkCompareDetailOverview('saas')
    expect(desktop.intro).not.toBe(web.intro)
    expect(desktop.intro.toLowerCase()).toContain('masaüstü')
    expect(web.intro.toLowerCase()).toContain('tarayıcı')
    expect(web.canDo.some((item) => item.toLowerCase().includes('yetkili'))).toBe(true)
    expect(desktop.advantages.some((item) => item.toLowerCase().includes('lisans'))).toBe(true)
  })
})
