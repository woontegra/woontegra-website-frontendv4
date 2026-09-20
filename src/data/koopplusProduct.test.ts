import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  isKoopPlusMacCheckoutReady,
  isKoopPlusWindowsCheckoutReady,
  isKoopPlusWindowsDownloadReady,
  KOOPPLUS_DISTRIBUTION,
  KOOPPLUS_MACOS_AVAILABLE,
  KOOPPLUS_PATH,
  KOOPPLUS_PRICE_AMOUNT,
  KOOPPLUS_SLUG,
  KOOPPLUS_WINDOWS_CHECKOUT_PATH,
  KOOPPLUS_WINDOWS_DOWNLOAD_URL,
} from '@/data/koopplusProduct'
import { CANONICAL_SOFTWARE_NAV } from '@/data/canonicalSoftwareProducts'
import { SOFTWARE_SHOWCASE_ITEMS, isSoftwareNavItem } from '@/data/softwareShowcase'
import { buildCanonicalSoftwareNavChildren } from '@/lib/publicSoftwareCatalog'
import { resolvePublicNavigation } from '@/lib/headerNavigation'

describe('KoopPlus website catalog', () => {
  it('uses the canonical /yazilimlar/koopplus route', () => {
    expect(KOOPPLUS_SLUG).toBe('koopplus')
    expect(KOOPPLUS_PATH).toBe('/yazilimlar/koopplus')
    expect(CANONICAL_SOFTWARE_NAV.some((item) => item.slug === KOOPPLUS_SLUG && item.path === KOOPPLUS_PATH)).toBe(true)
  })

  it('does not invent a price, checkout endpoint, or installer URL', () => {
    expect(KOOPPLUS_PRICE_AMOUNT).toBeNull()
    expect(KOOPPLUS_WINDOWS_CHECKOUT_PATH).toBeNull()
    expect(KOOPPLUS_WINDOWS_DOWNLOAD_URL).toBeNull()
    expect(isKoopPlusWindowsCheckoutReady()).toBe(false)
    expect(isKoopPlusWindowsDownloadReady()).toBe(false)
  })

  it('keeps the official KoopPlus icon in public + Vite build output', () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
    const publicIcon = join(root, 'public/images/products/koopplus-icon.png')
    expect(existsSync(publicIcon), 'public/images/products/koopplus-icon.png').toBe(true)
    const distIcon = join(root, 'dist/images/products/koopplus-icon.png')
    if (existsSync(join(root, 'dist'))) {
      expect(existsSync(distIcon), 'dist/images/products/koopplus-icon.png').toBe(true)
    }
  })

  it('reserves Windows artifacts for R2 without a live download URL', () => {
    expect(KOOPPLUS_DISTRIBUTION.windows.artifacts).toBe('r2')
    expect(KOOPPLUS_DISTRIBUTION.windows.downloadUrl).toBeNull()
    expect(KOOPPLUS_DISTRIBUTION.windows.checkoutPath).toBeNull()
  })

  it('keeps macOS sales behind a manual flag', () => {
    expect(KOOPPLUS_MACOS_AVAILABLE).toBe(false)
    expect(isKoopPlusMacCheckoutReady()).toBe(false)
  })

  it('lists KoopPlus in the software showcase and nav children', () => {
    expect(SOFTWARE_SHOWCASE_ITEMS.map((item) => item.href)).toContain(KOOPPLUS_PATH)
    expect(buildCanonicalSoftwareNavChildren().some((item) => item.href === KOOPPLUS_PATH)).toBe(true)
  })

  it('binds official square brand icons from product data, not hardcoded menu logic', () => {
    const byId = Object.fromEntries(SOFTWARE_SHOWCASE_ITEMS.map((item) => [item.id, item]))
    expect(byId['bilirkisi-hesap']?.logoSrc).toBe('/images/products/bilirkisi-hesap-icon.png')
    expect(byId['muvekkil-kasa-defteri']?.logoSrc).toBe('/images/products/muvekkil-kasa-defteri-icon.png')
    expect(byId.koopplus?.logoSrc).toBe('/images/products/koopplus-icon.png')
    expect(byId['sifre-kasasi']?.logoSrc).toBe('/images/products/sifre-kasasi-icon.png')
    expect(SOFTWARE_SHOWCASE_ITEMS.every((item) => item.logoSrc)).toBe(true)
    const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
    for (const item of SOFTWARE_SHOWCASE_ITEMS) {
      const rel = item.logoSrc!.replace(/^\//, '')
      expect(existsSync(join(root, 'public', rel)), `${item.id} missing ${rel}`).toBe(true)
    }
  })

  it('merges KoopPlus into Yazılımlar even if the API omits it', () => {
    const resolved = resolvePublicNavigation([
      {
        id: 'software',
        label: 'Yazılımlar',
        href: '/yazilimlar',
        resolvedUrl: '/yazilimlar',
        openInNewTab: false,
        sortOrder: 0,
        children: [
          {
            id: 'bh',
            label: 'Bilirkişi Hesap',
            href: '/yazilimlar/bilirkisi-hesap',
            resolvedUrl: '/yazilimlar/bilirkisi-hesap',
            openInNewTab: false,
            sortOrder: 0,
            children: [],
          },
        ],
      },
    ])
    const software = resolved.find((item) => isSoftwareNavItem(item))
    expect(software?.children.some((child) => child.href === KOOPPLUS_PATH)).toBe(true)
    expect(software?.children.some((child) => child.href === '/yazilimlar/bilirkisi-hesap')).toBe(true)
    expect(software?.children.some((child) => child.href === '/yazilimlar/muvekkil-kasa-defteri')).toBe(true)
    expect(software?.children.some((child) => child.href === '/yazilimlar/sifre-kasasi')).toBe(true)
  })
})
