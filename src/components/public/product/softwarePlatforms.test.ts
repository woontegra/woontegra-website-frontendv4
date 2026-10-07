import { describe, expect, it } from 'vitest'
import {
  BILIRKISI_MACOS_COMING_SOON_LABEL,
  BILIRKISI_PLATFORM_FAMILY,
  isBilirkisiMacosComingSoon,
} from './softwarePlatforms'

describe('Bilirkişi macOS satış erişimi', () => {
  it('macOS sekmesini tutar ve satışı kapalı işaretler', () => {
    expect(BILIRKISI_PLATFORM_FAMILY.platforms.map((platform) => platform.id)).toEqual([
      'web',
      'windows',
      'macos',
    ])
    expect(isBilirkisiMacosComingSoon('macos')).toBe(true)
    expect(isBilirkisiMacosComingSoon('MACOS')).toBe(true)
    expect(BILIRKISI_MACOS_COMING_SOON_LABEL).toBe('Çok Yakında')
  })

  it('Windows ve WEB satış kararını değiştirmez', () => {
    expect(isBilirkisiMacosComingSoon('windows')).toBe(false)
    expect(isBilirkisiMacosComingSoon('WINDOWS')).toBe(false)
    expect(isBilirkisiMacosComingSoon('web')).toBe(false)
    expect(isBilirkisiMacosComingSoon(null)).toBe(false)
    const windows = BILIRKISI_PLATFORM_FAMILY.platforms.find((platform) => platform.id === 'windows')
    const web = BILIRKISI_PLATFORM_FAMILY.platforms.find((platform) => platform.id === 'web')
    expect(windows?.presentation?.ctaLabel).toBe('Windows için Satın Al')
    expect(web?.checkout).toBe('live-web')
  })
})
