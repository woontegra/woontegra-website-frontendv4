import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  getKoopPlusWindowsTrialDownload,
  isKoopPlusMacCheckoutReady,
  isKoopPlusWindowsCheckoutReady,
  isKoopPlusWindowsDownloadReady,
  KOOPPLUS_APP_URL,
  KOOPPLUS_DISTRIBUTION,
  KOOPPLUS_KVKK_CONSENT_VERSION,
  KOOPPLUS_KVKK_PATH,
  KOOPPLUS_LEGACY_PATH,
  KOOPPLUS_LOCAL_DATA,
  KOOPPLUS_MACOS_AVAILABLE,
  KOOPPLUS_PATH,
  KOOPPLUS_PRICE_AMOUNT,
  KOOPPLUS_PRICE_LABEL,
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

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')

describe('KoopPlus website catalog (SaaS)', () => {
  it('keeps Product API slug koopplus and uses the SEO public path', () => {
    expect(KOOPPLUS_SLUG).toBe('koopplus')
    expect(KOOPPLUS_SEO_SLUG).toBe('kooperatif-yonetim-yazilimi')
    expect(KOOPPLUS_PATH).toBe('/yazilimlar/kooperatif-yonetim-yazilimi')
    expect(KOOPPLUS_LEGACY_PATH).toBe('/yazilimlar/koopplus')
    expect(KOOPPLUS_SEO_TOPIC).toBe('Kooperatif Yönetim Yazılımı')
    expect(KOOPPLUS_TAGLINE).toBe('Kooperatif Yönetim Yazılımı')
    expect(KOOPPLUS_SEO.title).toBe('Kooperatif Yönetim Yazılımı | KoopPlus | Woontegra')
    expect(KOOPPLUS_SEO.description).toContain('KoopPlus')
    expect(KOOPPLUS_SEO.description).toContain('7 gün')
    expect(KOOPPLUS_SEO.description.toLowerCase()).not.toContain('masaüstü')
    expect(CANONICAL_SOFTWARE_NAV.some((item) => item.slug === KOOPPLUS_SLUG && item.path === KOOPPLUS_PATH)).toBe(true)
    expect(CANONICAL_SOFTWARE_NAV.some((item) => item.path === KOOPPLUS_LEGACY_PATH)).toBe(false)
  })

  it('declares a Vercel permanent redirect from the legacy KoopPlus URL', () => {
    const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8')) as {
      redirects: Array<{ source: string; destination: string; permanent?: boolean }>
    }
    const hit = vercel.redirects.find((row) => row.source === KOOPPLUS_LEGACY_PATH)
    expect(hit?.destination).toBe(KOOPPLUS_PATH)
    expect(hit?.permanent).toBe(true)
  })

  it('does not invent a catalog price or checkout endpoint', () => {
    expect(KOOPPLUS_PRICE_AMOUNT).toBeNull()
    expect(KOOPPLUS_PRICE_LABEL).toBe('KoopPlus Yıllık')
    expect(KOOPPLUS_WINDOWS_CHECKOUT_PATH).toBeNull()
    expect(isKoopPlusWindowsCheckoutReady()).toBe(false)
  })

  it('keeps the official KoopPlus icon in public + Vite build output', () => {
    const publicIcon = join(root, 'public/images/products/koopplus-icon.optavif-w512.webp')
    expect(existsSync(publicIcon), 'public/images/products/koopplus-icon.optavif-w512.webp').toBe(true)
    const distIcon = join(root, 'dist/images/products/koopplus-icon.png')
    if (existsSync(join(root, 'dist'))) {
      expect(existsSync(distIcon), 'dist/images/products/koopplus-icon.png').toBe(true)
    }
  })

  it('has no desktop installer / download distribution (SaaS only)', () => {
    expect(KOOPPLUS_DISTRIBUTION.saas.appUrl).toBe('https://koopplus.woontegra.com')
    expect(KOOPPLUS_APP_URL).toBe('https://koopplus.woontegra.com')
    expect(KOOPPLUS_WINDOWS_SETUP_FILENAME).toBe('')
    expect(KOOPPLUS_WINDOWS_DOWNLOAD_URL).toBe('')
    expect(isKoopPlusWindowsDownloadReady()).toBe(false)
    expect(getKoopPlusWindowsTrialDownload()).toBeNull()
    expect(KOOPPLUS_MACOS_AVAILABLE).toBe(false)
    expect(isKoopPlusMacCheckoutReady()).toBe(false)
  })

  it('keeps trial copy on the website demo form (no download)', () => {
    expect(KOOPPLUS_TRIAL.title).toBe('7 Gün Ücretsiz Deneyin')
    expect(KOOPPLUS_TRIAL.highlights).toHaveLength(3)
    expect(KOOPPLUS_TRIAL.downloadCta).toBe('7 Gün Ücretsiz Demoyu Başlat')
    expect(KOOPPLUS_TRIAL.trustLine).toContain('Kredi kartı gerekmez')
    expect(JSON.stringify(KOOPPLUS_TRIAL).toLowerCase()).not.toContain('indir')
    expect(KOOPPLUS_LOCAL_DATA.title).toBe('Verileriniz güvende')
    expect(KOOPPLUS_TRIAL.trustLine).toContain('Kurulum gerekmez')
    expect(KOOPPLUS_TRIAL.highlights.map((h) => h.title)).toEqual([
      '7 Gün Ücretsiz',
      'Verileriniz Korunur',
      'Kaldığınız Yerden Devam Edin',
    ])
  })


  it('exposes KVKK consent metadata for the demo form', () => {
    expect(KOOPPLUS_KVKK_PATH).toBe('/kvkk-aydinlatma-metni')
    expect(KOOPPLUS_KVKK_CONSENT_VERSION).toMatch(/^kvkk-demo-/)
  })

  it('lists KoopPlus in the software showcase and nav children', () => {
    expect(SOFTWARE_SHOWCASE_ITEMS.map((item) => item.href)).toContain(KOOPPLUS_PATH)
    expect(buildCanonicalSoftwareNavChildren().some((item) => item.href === KOOPPLUS_PATH)).toBe(true)
  })

  it('binds official square brand icons from product data, not hardcoded menu logic', () => {
    const byId = Object.fromEntries(SOFTWARE_SHOWCASE_ITEMS.map((item) => [item.id, item]))
    expect(byId['bilirkisi-hesap']?.logoSrc).toBe('/images/products/bilirkisi-hesap-icon.optavif-w512.webp')
    expect(byId['muvekkil-kasa-defteri']?.logoSrc).toBe('/images/products/muvekkil-kasa-defteri-icon.optavif-w1254.webp')
    expect(byId.koopplus?.logoSrc).toBe('/images/products/koopplus-icon.optavif-w512.webp')
    expect(byId['sifre-kasasi']?.logoSrc).toBe('/images/products/sifre-kasasi-icon.optavif-w256.webp')
    expect(SOFTWARE_SHOWCASE_ITEMS.every((item) => item.logoSrc)).toBe(true)
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

  it('layout opens the demo modal instead of downloading an installer', () => {
    const src = readFileSync(join(root, 'src/components/public/koopplus/KoopPlusProductLayout.tsx'), 'utf8')
    expect(src).toContain('KoopPlusDemoModal')
    expect(src).toContain('demoOpen')
    expect(src).toContain('resolveKoopPlusBuyAction')
    expect(src).toContain('KDV dahil')
    expect(src).not.toContain('download=')
    expect(src).not.toContain('getKoopPlusWindowsTrialDownload')
    expect(src).not.toContain('KoopPlus for Mac')
    expect(src).not.toMatch(/\b9\.?000\b/)
  })

  it('uses Product galleryImages for the hero screenshot carousel, not a coming-soon placeholder', () => {
    const src = readFileSync(join(root, 'src/components/public/koopplus/KoopPlusProductLayout.tsx'), 'utf8')
    expect(src).toContain('ProductScreenshotCarousel')
    expect(src).toContain('koopPlusScreenshotEntries(product?.galleryImages)')
    expect(src).not.toContain('Ürün ekran görüntüsü yakında eklenecek.')
  })

  it('demo modal posts through the service only (no local persistence) with Turnstile + KVKK metadata', () => {
    const modal = readFileSync(join(root, 'src/components/public/koopplus/KoopPlusDemoModal.tsx'), 'utf8')
    expect(modal).toContain('requestKoopPlusDemo')
    expect(modal).toContain('challenges.cloudflare.com/turnstile/v0/api.js')
    expect(modal).toContain('VITE_TURNSTILE_SITE_KEY')
    expect(modal).toContain('KOOPPLUS_KVKK_CONSENT_VERSION')
    expect(modal).toContain('kvkkConsentAt')
    expect(modal).toContain('TURKEY_PROVINCES')
    expect(modal).toContain('7 Gün Ücretsiz Demoyu Başlat')
    expect(modal).toContain('Rocket')
    expect(modal).toContain('E-postanızı kontrol edin')
    expect(modal).not.toMatch(/localStorage|sessionStorage|indexedDB/)
    const service = readFileSync(join(root, 'src/services/koopplusDemoService.ts'), 'utf8')
    expect(service).not.toMatch(/localStorage|sessionStorage|indexedDB/)
    expect(service).toContain('/koopplus/demo-request')
  })
})
