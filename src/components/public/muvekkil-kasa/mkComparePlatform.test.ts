import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  MK_COMPARE_CARD_DESKTOP_ID,
  MK_COMPARE_CARD_SAAS_ID,
  parseMkCompareSurumParam,
} from '@/components/public/muvekkil-kasa/comparePageUtils'
import {
  isMkComparePlatform,
  MK_COMPARE_CARD_MACOS_ID,
  MK_COMPARE_DEFAULT_PLATFORM,
  MK_LAUNCH_PRICE_LABEL,
  mkCompareEditionForPlatform,
  mkComparePlatformCardId,
  MUVEKKIL_KASA_PLATFORM_FAMILY,
  parseMkComparePlatformParam,
} from '@/components/public/muvekkil-kasa/mkComparePlatform'
import {
  getMuvekkilKasaMacosTrialDownload,
  isMuvekkilKasaMacosSalesSlug,
  isPublicMacosSetupInstallerUrl,
  MK_MACOS_PRODUCT_SLUG,
} from '@/lib/muvekkilKasaDesktopPlatform'
import { getMuvekkilKasaDesktopTrialDownload } from '@/lib/muvekkilKasaDesktopProduct'
import { DEFAULT_MK_COMPARE_MACOS_COPY } from '@/builder/types/mkSaasPurchase'
import { blocksHostPanelInHero } from '@/components/public/muvekkil-kasa/MkComparePageProvider'

const root = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(join(root, rel), 'utf8')
const cardsSrc = read('MuvekkilKasaCompareProductCards.tsx')
const panelSrc = read('MuvekkilKasaPlatformPurchasePanel.tsx')
const heroSrc = read('MuvekkilKasaProductHero.tsx')
const providerSrc = read('MkComparePageProvider.tsx')
const viewSrc = read('MuvekkilKasaCompareView.tsx')
const rendererSrc = read('../../../builder/render/blocks/MkSaasPurchaseBlockRenderer.tsx')
const settingsSrc = read('../../../builder/admin/settings/MkSaasPurchaseSettingsPanel.tsx')
const detailPageSrc = read('../../../pages/public/SoftwareDetailPage.tsx')

const dmgUrl = 'https://download.example.test/muvekkil-kasa/Woontegra-Muvekkil-Kasa-Defteri-0.1.14-arm64.dmg'
const exeUrl = 'https://download.example.test/muvekkil-kasa/Woontegra-Muvekkil-Kasa-Defteri-Setup-0.1.14.exe'
const setupFile = (downloadPath: string) => ({
  publicDownloadFiles: [{ label: 'Kurulum', downloadPath, filename: '', type: 'setup' as const }],
})

describe('MK satış paneli platformları', () => {
  it('WEB / WINDOWS / macOS sekmeleri sırayla ve yayında; Yakında yok', () => {
    expect(MUVEKKIL_KASA_PLATFORM_FAMILY.platforms.map((p) => p.label)).toEqual(['WEB', 'WINDOWS', 'macOS'])
    expect(MUVEKKIL_KASA_PLATFORM_FAMILY.platforms.every((p) => p.checkout === 'live-web')).toBe(true)
    expect(MK_COMPARE_DEFAULT_PLATFORM).toBe('web')
    expect(JSON.stringify(MUVEKKIL_KASA_PLATFORM_FAMILY)).not.toMatch(/yakında/i)
    expect(cardsSrc).not.toMatch(/yakında/i)
  })

  it('?surum= mevcut saas/masaustu bağlantılarını korur ve macos ekler', () => {
    expect(parseMkComparePlatformParam('saas')).toBe('web')
    expect(parseMkComparePlatformParam('masaustu')).toBe('windows')
    expect(parseMkComparePlatformParam('macos')).toBe('macos')
    expect(parseMkComparePlatformParam(' MacOS ')).toBe('macos')
    expect(parseMkComparePlatformParam('')).toBeNull()
    expect(parseMkComparePlatformParam(null)).toBeNull()
    expect(parseMkComparePlatformParam('bilinmeyen')).toBeNull()
    expect(parseMkCompareSurumParam('macos')).toBe('desktop')
    expect(parseMkCompareSurumParam('saas')).toBe('saas')
    expect(isMkComparePlatform('macos')).toBe(true)
    expect(isMkComparePlatform('android')).toBe(false)
  })

  it('sekme kart kimlikleri ve detay sekmesi eşlemesi', () => {
    expect(mkComparePlatformCardId('web')).toBe(MK_COMPARE_CARD_SAAS_ID)
    expect(mkComparePlatformCardId('windows')).toBe(MK_COMPARE_CARD_DESKTOP_ID)
    expect(mkComparePlatformCardId('macos')).toBe(MK_COMPARE_CARD_MACOS_ID)
    expect(mkCompareEditionForPlatform('web')).toBe('saas')
    expect(mkCompareEditionForPlatform('windows')).toBe('desktop')
    expect(mkCompareEditionForPlatform('macos')).toBe('desktop')
  })

  it('bilinmeyen ?surum= değeri önceki gibi masaüstünü vurgular', () => {
    expect(providerSrc).toContain("parseMkComparePlatformParam(surumParam) ?? 'windows'")
  })
})

describe('macOS kurulum dosyası', () => {
  it('yalnız public https .dmg kabul edilir; sahte bağlantı üretilmez', () => {
    expect(MK_MACOS_PRODUCT_SLUG).toBe('muvekkil-kasa-defteri-macos')
    expect(isMuvekkilKasaMacosSalesSlug('muvekkil-kasa-defteri-macos')).toBe(true)
    expect(isMuvekkilKasaMacosSalesSlug('muvekkil-kasa-defteri-yazilimi')).toBe(false)
    expect(isPublicMacosSetupInstallerUrl(dmgUrl)).toBe(true)
    expect(isPublicMacosSetupInstallerUrl(exeUrl)).toBe(false)
    expect(isPublicMacosSetupInstallerUrl(dmgUrl.replace('https:', 'http:'))).toBe(false)
    expect(isPublicMacosSetupInstallerUrl('https://download.example.test/updates/latest-mac.yml')).toBe(false)

    expect(getMuvekkilKasaMacosTrialDownload(setupFile(dmgUrl))).toEqual({
      href: dmgUrl,
      filename: 'Woontegra-Muvekkil-Kasa-Defteri-0.1.14-arm64.dmg',
    })
    expect(getMuvekkilKasaMacosTrialDownload(setupFile(exeUrl))).toBeNull()
    expect(getMuvekkilKasaMacosTrialDownload({ publicDownloadFiles: [] })).toBeNull()
    expect(getMuvekkilKasaMacosTrialDownload(null)).toBeNull()
  })

  it('Windows EXE demo indirmesi değişmedi', () => {
    expect(getMuvekkilKasaDesktopTrialDownload(setupFile(exeUrl))?.href).toBe(exeUrl)
    expect(getMuvekkilKasaDesktopTrialDownload(setupFile(dmgUrl))).toBeNull()
  })
})

describe('tek satış paneli yapısı', () => {
  it('her platform kartında fiyatın hemen üstünde LANSMANA ÖZEL etiketi', () => {
    expect(MK_LAUNCH_PRICE_LABEL).toBe('LANSMANA ÖZEL')
    const desktopCard = cardsSrc.slice(cardsSrc.indexOf('function DesktopCard'), cardsSrc.indexOf('function SaasCard'))
    const saasCard = cardsSrc.slice(cardsSrc.indexOf('function SaasCard'))
    for (const card of [desktopCard, saasCard]) {
      const label = card.indexOf('<LaunchPriceLabel />')
      expect(label).toBeGreaterThan(card.indexOf('{hasPrice ? ('))
      expect(label).toBeLessThan(card.indexOf('formatMkSaasTryMoney('))
    }
  })

  it('macOS ayrı ürün, kendi sepet satırı ve DMG indirmesi kullanır', () => {
    expect(providerSrc).toContain('productsService.getBySlug(MK_MACOS_PRODUCT_SLUG)')
    expect(cardsSrc).toContain("variant.installer === 'dmg'")
    expect(cardsSrc).toContain('getMuvekkilKasaMacosTrialDownload(product)')
    expect(cardsSrc).toContain('getMuvekkilKasaDesktopTrialDownload(product)')
    expect(cardsSrc).toContain("installer: 'dmg'")
    expect(panelSrc).toContain('query={ctx.macosQuery}')
    expect(panelSrc).toContain('variant={MACOS_CARD_VARIANT}')
    expect(cardsSrc).toContain('addToCart(product.id, 1, { snapshot, replaceLine: true })')
    expect(DEFAULT_MK_COMPARE_MACOS_COPY.title).toContain('macOS')
  })

  it('WEB sekmesi süre seçimi olmadan 1 yıllık fiyatı gösterir, demo ve sepet akışını korur', () => {
    const saasCard = cardsSrc.slice(cardsSrc.indexOf('function SaasCard'))
    expect(saasCard).not.toContain('Kullanım süresi')
    expect(saasCard).not.toContain('Array.from({ length: 10 }')
    expect(saasCard).not.toContain('webUsageYears')
    expect(saasCard).toContain('formatMkSaasTryMoney(unitPrice, product.currency)')
    expect(saasCard).toContain('{MK_COMPARE_SAAS_LICENSE_CAPTION}')
    expect(saasCard).toContain('onClick={ctx.onOpenDemo}')
    expect(saasCard).toContain('ctx.onAddToCart()')
  })

  it('builder bloğu ve yedek görünüm aynı hero panelini macOS ile kullanır', () => {
    expect(panelSrc).toContain('<SoftwarePlatformPicker')
    expect(panelSrc).toContain('copy ?? ctx.panelCopy')
    expect(rendererSrc).toContain('macos: purchase.settings.compareMacos')
    expect(viewSrc).toContain('<MuvekkilKasaProductHero')
    expect(settingsSrc).toContain('patchMacos')
  })

  it('satış paneli BH hero grid’inde sağ sütunda, tek kez', () => {
    expect(heroSrc).toContain('xl:grid-cols-[minmax(0,1fr)_380px]')
    expect(heroSrc).toContain('xl:grid-cols-[minmax(0,1fr)_280px]')
    expect(heroSrc).toContain('<aside id={MK_COMPARE_PURCHASE_ID}')
    expect(heroSrc).toContain('xl:sticky xl:top-24')
    expect(heroSrc).toContain('<ProductGallery')
    expect(heroSrc.match(/<MuvekkilKasaPlatformPurchasePanel/g)?.length).toBe(1)
    expect(viewSrc).not.toContain('MuvekkilKasaPlatformPurchasePanel')
  })

  it('panel hero’dayken satın alma bloğu ikinci panel çizmez', () => {
    const hero = { id: 'h', type: 'hero', visibility: { enabled: true }, settings: { layout: 'compare' } }
    const purchase = { id: 'p', type: 'mk-saas-purchase', visibility: { enabled: true }, settings: { layout: 'compare' } }
    const asBlocks = (list: unknown[]) => list as Parameters<typeof blocksHostPanelInHero>[0]
    expect(blocksHostPanelInHero(asBlocks([hero, purchase]))).toBe(true)
    expect(blocksHostPanelInHero(asBlocks([{ ...hero, visibility: { enabled: false } }, purchase]))).toBe(false)
    expect(blocksHostPanelInHero(asBlocks([{ ...hero, settings: { layout: 'split' } }, purchase]))).toBe(false)
    expect(blocksHostPanelInHero(asBlocks([purchase]))).toBe(false)
    expect(blocksHostPanelInHero(null)).toBe(false)
  })

  it('macOS ürün sayfası birleşik sayfaya ?surum=macos ile yönlenir', () => {
    expect(detailPageSrc).toContain('?surum=macos')
    expect(detailPageSrc).toContain('isMuvekkilKasaMacosSalesSlug(slug)')
  })
})
