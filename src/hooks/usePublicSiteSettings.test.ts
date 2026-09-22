import { describe, expect, it } from 'vitest'
import { DEFAULT_PUBLIC_SITE_SETTINGS, firstPaintLogoUrl, siteLogoUrl } from '@/hooks/usePublicSiteSettings'
import { mergePublicLogoFields } from '@/lib/publicBootState'

const CMS_LOGO =
  'https://fm1lntc3pwasdljl.public.blob.vercel-storage.com/website-media/logo/logo1-example.png'

describe('public header logo URL', () => {
  it('does not fall back to /logo.png', () => {
    expect(DEFAULT_PUBLIC_SITE_SETTINGS.logo).toBe('')
    expect(siteLogoUrl()).toBe('')
    expect(siteLogoUrl({ logo: '' })).toBe('')
    expect(siteLogoUrl({ logo: '/logo.png' })).toBe('')
    expect(siteLogoUrl({ logo: '/images/woontegra-logo.svg' })).toBe('')
  })

  it('uses the CMS logo on first paint data and can switch to a new CMS URL', () => {
    const first = siteLogoUrl({ logo: CMS_LOGO, logoUpdatedAt: '1' })
    expect(first).toContain(CMS_LOGO)
    expect(first).toContain('v=1')
    expect(first).not.toContain('/logo.png')

    const next = siteLogoUrl({
      logo: 'https://cdn.example.com/website-media/logo/logo2.png',
      logoUpdatedAt: '2',
    })
    expect(next).toContain('logo2.png')
    expect(next).toContain('v=2')
    expect(next).not.toBe(first)
  })

  it('E/F: empty query settings still use boot URL; same CMS URL stays stable', () => {
    const boot = {
      siteName: 'Woontegra',
      logo: CMS_LOGO,
      logoUpdatedAt: '1',
      navbarLogoWidth: 185,
    }
    const fromBoot = siteLogoUrl(mergePublicLogoFields({ logo: '' }, boot))
    expect(fromBoot).toContain(CMS_LOGO)
    expect(fromBoot).not.toContain('/logo.png')

    const afterRefresh = siteLogoUrl(
      mergePublicLogoFields({ logo: CMS_LOGO, logoUpdatedAt: '1', navbarLogoWidth: 185 }, boot),
    )
    expect(afterRefresh).toBe(fromBoot)

    expect(firstPaintLogoUrl({ logo: CMS_LOGO, logoUpdatedAt: '1' })).toContain(CMS_LOGO)
  })
})
