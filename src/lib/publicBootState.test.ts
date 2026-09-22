import { describe, expect, it } from 'vitest'
import {
  BOOT_LOGO_HEIGHT,
  buildPublicLogoUrl,
  clampBootLogoWidth,
  extractPublicLogoBoot,
  isUsablePublicLogoUrl,
  serializePublicBootScript,
} from '@/lib/publicBootState'

const CMS_LOGO =
  'https://fm1lntc3pwasdljl.public.blob.vercel-storage.com/website-media/logo/logo1-1782748944772-1203f41253.png'

describe('public logo boot', () => {
  it('rejects /logo.png and placeholder SVG', () => {
    expect(isUsablePublicLogoUrl('/logo.png')).toBe(false)
    expect(isUsablePublicLogoUrl('https://www.woontegra.com/logo.png')).toBe(false)
    expect(isUsablePublicLogoUrl('/images/woontegra-logo.svg')).toBe(false)
    expect(isUsablePublicLogoUrl('')).toBe(false)
    expect(isUsablePublicLogoUrl(CMS_LOGO)).toBe(true)
  })

  it('extracts only public logo fields from settings', () => {
    const boot = extractPublicLogoBoot({
      siteName: 'Woontegra',
      logo: CMS_LOGO,
      logoUpdatedAt: '1782748944772',
      navbarLogoWidth: 185,
      contactEmail: 'secret-should-not-matter',
      smtpPassword: 'nope',
    })
    expect(boot).toEqual({
      siteName: 'Woontegra',
      logo: CMS_LOGO,
      logoUpdatedAt: '1782748944772',
      navbarLogoWidth: 185,
    })
    expect(JSON.stringify(boot)).not.toContain('smtp')
    expect(JSON.stringify(boot)).not.toContain('secret-should-not-matter')
  })

  it('ignores placeholder defaults in settings', () => {
    expect(extractPublicLogoBoot({ logo: '/logo.png', navbarLogoWidth: 185 })).toBeNull()
    expect(extractPublicLogoBoot({ logo: '/images/woontegra-logo.svg' })).toBeNull()
  })

  it('builds cache-busted CMS url without inventing aspect ratio', () => {
    const url = buildPublicLogoUrl(CMS_LOGO, '1782748944772')
    expect(url.startsWith(CMS_LOGO)).toBe(true)
    expect(url).toContain('v=1782748944772')
    expect(clampBootLogoWidth(185)).toBe(185)
    expect(BOOT_LOGO_HEIGHT).toBe(52)
  })

  it('serializes a tiny public boot script', () => {
    const html = serializePublicBootScript({
      siteName: 'Woontegra',
      logo: CMS_LOGO,
      logoUpdatedAt: '1',
      navbarLogoWidth: 185,
    })
    expect(html).toContain('__WOONTEGRA_PUBLIC_BOOTSTRAP__')
    expect(html).toContain(CMS_LOGO)
    expect(html).toContain('"navbarLogoWidth":185')
    expect(html).not.toContain('/logo.png')
    expect(html).not.toContain('contactEmail')
  })
})
