import { describe, expect, it } from 'vitest'
import { BILIRKISI_PLATFORM_FAMILY } from './softwarePlatforms'

describe('Bilirkişi macOS satış erişimi', () => {
  it('macOS sekmesini tutar ve yıllık satın alma metnini gösterir', () => {
    expect(BILIRKISI_PLATFORM_FAMILY.platforms.map((platform) => platform.id)).toEqual([
      'web',
      'windows',
      'macos',
    ])
    const macos = BILIRKISI_PLATFORM_FAMILY.platforms.find((platform) => platform.id === 'macos')
    expect(macos?.presentation?.ctaLabel).toBe('Mac için Satın Al')
    expect(macos?.billingTerms).toEqual(['yearly'])
    expect(macos?.presentation?.licenseLabel).toBe('Yıllık')
  })

  it('Windows ve WEB satış kararını değiştirmez', () => {
    const windows = BILIRKISI_PLATFORM_FAMILY.platforms.find((platform) => platform.id === 'windows')
    const web = BILIRKISI_PLATFORM_FAMILY.platforms.find((platform) => platform.id === 'web')
    expect(windows?.presentation?.ctaLabel).toBe('Windows için Satın Al')
    expect(windows?.checkout).toBe('not-connected')
    expect(web?.checkout).toBe('live-web')
    expect(web?.billingTerms).toEqual(['monthly', 'yearly'])
  })

  it('Windows ve macOS aynı lisans etkinleştirme açıklamasını gösterir, WEB göstermez', () => {
    const [web, windows, macos] = BILIRKISI_PLATFORM_FAMILY.platforms
    expect(windows.presentation?.licenseNote).toBe(macos.presentation?.licenseNote)
    expect(macos.presentation?.licenseNote).toContain('aktivasyon şifresi')
    expect(macos.presentation?.licenseNote).not.toContain('hesabınıza tanımlanır')
    expect(web.presentation).toBeUndefined()
  })
})
