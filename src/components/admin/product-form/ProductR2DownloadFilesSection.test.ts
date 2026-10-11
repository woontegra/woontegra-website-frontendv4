import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ProductR2DownloadFilesSection } from '@/components/admin/product-form/ProductR2DownloadFilesSection'
import { downloadFilesForApi, emptyDownloadFilesConfig, type ProductDownloadFilesConfig } from '@/lib/productDownloadFiles'
import { getMuvekkilKasaMacosTrialDownload, isPublicMacosSetupInstallerUrl } from '@/lib/muvekkilKasaDesktopPlatform'

const DMG = 'https://pub-52796df7e74b467a8f38ec503fb5137f.r2.dev/Woontegra-Muvekkil-Kasa-Defteri-0.1.14-arm64.dmg'
const EXE = 'https://pub-52796df7e74b467a8f38ec503fb5137f.r2.dev/Woontegra-Muvekkil-Kasa-Defteri-Setup-0.1.11.exe'

function config(setupUrl: string, portableUrl = ''): ProductDownloadFilesConfig {
  const base = emptyDownloadFilesConfig()
  return {
    ...base,
    files: [
      { ...base.files[0], url: setupUrl },
      { ...base.files[1], url: portableUrl },
    ],
  }
}

function render(productSlug: string, value: ProductDownloadFilesConfig): string {
  return renderToStaticMarkup(
    createElement(ProductR2DownloadFilesSection, { value, onChange: () => {}, productSlug }),
  )
}

describe('Admin R2 indirme dosyaları — platforma göre alanlar', () => {
  it('macOS ürününde Portable sürüm alanı gizlenir, Kurulum alanı kalır', () => {
    const html = render('muvekkil-kasa-defteri-macos', config(DMG))
    expect(html).toContain('Kurulum sürümü')
    expect(html).not.toContain('Portable sürüm')
    expect(html).toContain('…dmg')
    expect(html).not.toContain('data-r2-url-warning')
  })

  it('Windows Müvekkil Kasa ürününde Kurulum ve Portable alanları aynen kalır', () => {
    const html = render('muvekkil-kasa-defteri-yazilimi', config(EXE))
    expect(html).toContain('Kurulum sürümü')
    expect(html).toContain('Portable sürüm')
    expect(html).toContain(EXE)
    expect(html).not.toContain('data-r2-url-warning')
  })

  it('diğer ürünlerde iki alan da gösterilir', () => {
    for (const slug of ['koopplus', 'muvekkil-kasa-defteri-desktop', '']) {
      const html = render(slug, config(''))
      expect(html).toContain('Kurulum sürümü')
      expect(html).toContain('Portable sürüm')
    }
  })

  it('macOS Kurulum alanı public https .dmg kabul eder, diğerlerinde uyarı gösterir', () => {
    expect(isPublicMacosSetupInstallerUrl(DMG)).toBe(true)
    for (const bad of [
      EXE,
      'http://pub-x.r2.dev/Woontegra-Muvekkil-Kasa-Defteri-0.1.14.dmg',
      'https://updates.woontegra.com/updates/muvekkil-kasa-defteri/mac/latest-mac.yml',
      'https://pub-x.r2.dev/updates/Woontegra-Muvekkil-Kasa-Defteri-0.1.14.dmg',
    ]) {
      expect(isPublicMacosSetupInstallerUrl(bad)).toBe(false)
      expect(render('muvekkil-kasa-defteri-macos', config(bad))).toContain('data-r2-url-warning')
    }
  })

  it('macOS DMG kayıt yüküne Kurulum olarak girer ve public indirme bağlantısı üretir', () => {
    const payload = downloadFilesForApi(config(DMG))
    expect(payload?.files).toEqual([
      expect.objectContaining({ type: 'setup', url: DMG }),
    ])
    expect(
      getMuvekkilKasaMacosTrialDownload({
        publicDownloadFiles: [
          { label: 'Kurulum Sürümü', downloadPath: DMG, filename: 'x.dmg', type: 'setup' },
        ],
      })?.href,
    ).toBe(DMG)
  })

  it('daha önce kaydedilmiş Portable değeri gizlense de kaybolmaz', () => {
    const payload = downloadFilesForApi(config(DMG, EXE))
    expect(payload?.files.map((f) => f.type)).toEqual(['setup', 'portable'])
  })
})
