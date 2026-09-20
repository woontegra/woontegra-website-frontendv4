import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  getKoopPlusWindowsTrialDownload,
  isKoopPlusMacCheckoutReady,
  isKoopPlusWindowsCheckoutReady,
  isKoopPlusWindowsDownloadReady,
  KOOPPLUS_DISTRIBUTION,
  KOOPPLUS_MACOS_AVAILABLE,
  KOOPPLUS_LEGACY_PATH,
  KOOPPLUS_PATH,
  KOOPPLUS_PRICE_AMOUNT,
  KOOPPLUS_SEO,
  KOOPPLUS_SEO_SLUG,
  KOOPPLUS_SEO_TOPIC,
  KOOPPLUS_SLUG,
  KOOPPLUS_TAGLINE,
  KOOPPLUS_TRIAL,
  KOOPPLUS_WINDOWS_CHECKOUT_PATH,
  KOOPPLUS_WINDOWS_DOWNLOAD_URL,
  KOOPPLUS_WINDOWS_SETUP_FILENAME,
} from '@/data/koopplusProduct'
import { CANONICAL_SOFTWARE_NAV } from '@/data/canonicalSoftwareProducts'
import { SOFTWARE_SHOWCASE_ITEMS, isSoftwareNavItem } from '@/data/softwareShowcase'
import { buildCanonicalSoftwareNavChildren } from '@/lib/publicSoftwareCatalog'
import { resolvePublicNavigation } from '@/lib/headerNavigation'

describe('KoopPlus website catalog', () => {
  it('keeps Product API slug koopplus and uses the SEO public path', () => {
    expect(KOOPPLUS_SLUG).toBe('koopplus')
    expect(KOOPPLUS_SEO_SLUG).toBe('kooperatif-yonetim-yazilimi')
    expect(KOOPPLUS_PATH).toBe('/yazilimlar/kooperatif-yonetim-yazilimi')
    expect(KOOPPLUS_LEGACY_PATH).toBe('/yazilimlar/koopplus')
    expect(KOOPPLUS_SEO_TOPIC).toBe('Kooperatif Yönetim Yazılımı')
    expect(KOOPPLUS_TAGLINE).toBe('Kooperatif Yönetim Yazılımı')
    expect(KOOPPLUS_SEO.title).toBe('Kooperatif Yönetim Yazılımı | KoopPlus | Woontegra')
    expect(KOOPPLUS_SEO.description).toContain('Kooperatif yönetim yazılımı')
    expect(KOOPPLUS_SEO.description).toContain('7 gün')
    expect(CANONICAL_SOFTWARE_NAV.some((item) => item.slug === KOOPPLUS_SLUG && item.path === KOOPPLUS_PATH)).toBe(true)
    expect(CANONICAL_SOFTWARE_NAV.some((item) => item.path === KOOPPLUS_LEGACY_PATH)).toBe(false)
  })

  it('declares a Vercel permanent redirect from the legacy KoopPlus URL', () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
    const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8')) as {
      redirects: Array<{ source: string; destination: string; permanent?: boolean }>
    }
    const hit = vercel.redirects.find((row) => row.source === KOOPPLUS_LEGACY_PATH)
    expect(hit?.destination).toBe(KOOPPLUS_PATH)
    expect(hit?.permanent).toBe(true)
  })

  it('does not invent a catalog price or checkout endpoint', () => {
    expect(KOOPPLUS_PRICE_AMOUNT).toBeNull()
    expect(KOOPPLUS_WINDOWS_CHECKOUT_PATH).toBeNull()
    expect(isKoopPlusWindowsCheckoutReady()).toBe(false)
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

  it('points the trial CTA at the recorded KoopPlus Setup EXE, not the update feed', () => {
    expect(KOOPPLUS_DISTRIBUTION.windows.artifacts).toBe('r2')
    expect(KOOPPLUS_DISTRIBUTION.windows.checkoutPath).toBeNull()
    expect(KOOPPLUS_WINDOWS_SETUP_FILENAME).toBe('KoopPlus-Setup-1.0.0.exe')
    expect(KOOPPLUS_WINDOWS_DOWNLOAD_URL).toBe(
      'https://pub-57d992373eaf4ebd92cd37366668fafd.r2.dev/windows/KoopPlus-Setup-1.0.0.exe',
    )
    expect(isKoopPlusWindowsDownloadReady()).toBe(true)
    const trial = getKoopPlusWindowsTrialDownload()
    expect(trial?.filename).toBe('KoopPlus-Setup-1.0.0.exe')
    expect(trial?.href).toBe(KOOPPLUS_WINDOWS_DOWNLOAD_URL)
    expect(trial?.href.endsWith('/windows/KoopPlus-Setup-1.0.0.exe')).toBe(true)
    expect(trial?.href.includes('latest.yml')).toBe(false)
    expect(trial?.href.includes('.blockmap')).toBe(false)
    expect(trial?.href.includes('/updates/koopplus-aidat-takip/')).toBe(false)
  })

  it('keeps trial copy on installer + in-app LicenseGate, not website signup', () => {
    expect(KOOPPLUS_TRIAL.title).toBe('7 Gün Ücretsiz Deneyin')
    expect(KOOPPLUS_TRIAL.eyebrow).toBe('Ücretsiz Deneyin')
    expect(KOOPPLUS_TRIAL.intro).toBe(
      'KoopPlus’ı Windows bilgisayarınıza indirip 7 gün boyunca tüm özellikleriyle deneyin.',
    )
    expect(KOOPPLUS_TRIAL.highlights).toHaveLength(3)
    expect(KOOPPLUS_TRIAL.highlights[0].title).toBe('7 Gün Ücretsiz')
    expect(KOOPPLUS_TRIAL.highlights[1].title).toBe('Verileriniz Güvende')
    expect(KOOPPLUS_TRIAL.highlights[2].title).toBe('Kaldığınız Yerden Devam Edin')
    expect(KOOPPLUS_TRIAL.downloadCta).toBe('Windows için Ücretsiz İndir')
    expect(KOOPPLUS_TRIAL.trustLine).toContain('Kredi kartı gerekmez')
    expect(KOOPPLUS_TRIAL.downloadHint).toBe('Denemeniz uygulama içinde başlar.')
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

  it('renders a Windows trial download CTA instead of navigating to a coming-soon notice', () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
    const view = join(root, 'src/components/public/koopplus/KoopPlusProductLayout.tsx')
    const src = readFileSync(view, 'utf8')
    expect(src).toContain('KoopPlusWindowsTrialDownloadLink')
    expect(src).toContain('getKoopPlusWindowsTrialDownload')
    expect(src).toContain('download={trialDownload.filename}')
    expect(src).toContain('target="_blank"')
    expect(src).toContain('rel="noopener noreferrer"')
    expect(src).not.toMatch(/window\.location\.assign\(url\)/)
    expect(src).not.toContain('Windows indirme bağlantısı yakında açılacaktır.')
  })

  it('uses Product galleryImages for the hero screenshot carousel, not a coming-soon placeholder', () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
    const view = join(root, 'src/components/public/koopplus/KoopPlusProductLayout.tsx')
    const src = readFileSync(view, 'utf8')
    expect(src).toContain('ProductScreenshotCarousel')
    expect(src).toContain('koopPlusScreenshotEntries(product?.galleryImages)')
    expect(src).not.toContain('Ürün ekran görüntüsü yakında eklenecek.')
    expect(src).toContain('download={trialDownload.filename}')
  })
})
