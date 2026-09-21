import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  getMuvekkilKasaDesktopTrialDownload,
  isAutoUpdateDistributionUrl,
  isMuvekkilKasaDesktopTrialDownloadReady,
  isPublicWindowsSetupInstallerUrl,
  MUVEKKIL_KASA_DESKTOP_WINDOWS_DOWNLOAD_URL,
} from '@/lib/muvekkilKasaDesktopProduct'
import { KOOPPLUS_WINDOWS_DOWNLOAD_URL } from '@/data/koopplusProduct'

const PUBLIC_SETUP =
  'https://cdn.example.com/public/Woontegra-Muvekkil-Kasa-Defteri-Setup-0.1.11.exe'

const SETUP_FILES = [
  {
    label: 'Kurulum Sürümü',
    downloadPath: PUBLIC_SETUP,
    filename: 'Woontegra-Muvekkil-Kasa-Defteri-Setup-0.1.11.exe',
    type: 'setup' as const,
  },
]

describe('Müvekkil Kasa Desktop trial download', () => {
  it('never hard-codes a public installer URL', () => {
    expect(MUVEKKIL_KASA_DESKTOP_WINDOWS_DOWNLOAD_URL).toBe('')
    expect(getMuvekkilKasaDesktopTrialDownload()).toBeNull()
    expect(isMuvekkilKasaDesktopTrialDownloadReady()).toBe(false)
  })

  it('does not reuse the KoopPlus installer, SaaS demo host, or updater feed', () => {
    expect(MUVEKKIL_KASA_DESKTOP_WINDOWS_DOWNLOAD_URL).not.toBe(KOOPPLUS_WINDOWS_DOWNLOAD_URL)
    expect(MUVEKKIL_KASA_DESKTOP_WINDOWS_DOWNLOAD_URL).not.toContain('muvekkil.woontegra.com')
    expect(MUVEKKIL_KASA_DESKTOP_WINDOWS_DOWNLOAD_URL).not.toContain('/updates/')
    expect(MUVEKKIL_KASA_DESKTOP_WINDOWS_DOWNLOAD_URL).not.toContain('updates.woontegra.com')
  })

  it('accepts the live admin-panel 0.1.11 public installer URL as a setup file', () => {
    const href =
      'https://pub-52796df7e74b467a8f38ec503fb5137f.r2.dev/Woontegra-Muvekkil-Kasa-Defteri-Setup-0.1.11.exe'
    expect(href).not.toContain('/updates/')
    expect(href).not.toContain('updates.woontegra.com')
    expect(isPublicWindowsSetupInstallerUrl(href)).toBe(true)
    expect(
      getMuvekkilKasaDesktopTrialDownload({
        publicDownloadFiles: [
          {
            label: 'Kurulum Sürümü',
            downloadPath: href,
            filename: 'Woontegra-Muvekkil-Kasa-Defteri-Setup-0.1.11.exe',
            type: 'setup',
          },
        ],
      })?.href,
    ).toBe(href)
  })

  it('A: uses publicDownloadFiles setup Windows .exe from the public product API', () => {
    const download = getMuvekkilKasaDesktopTrialDownload({ publicDownloadFiles: SETUP_FILES })
    expect(download).toEqual({
      href: PUBLIC_SETUP,
      filename: 'Woontegra-Muvekkil-Kasa-Defteri-Setup-0.1.11.exe',
    })
    expect(isMuvekkilKasaDesktopTrialDownloadReady({ publicDownloadFiles: SETUP_FILES })).toBe(true)
  })

  it('B: rejects /updates/ URLs and does not fall back to the updater feed', () => {
    const href = 'https://updates.woontegra.com/updates/muvekkil-kasa-defteri/windows/Setup.exe'
    expect(isAutoUpdateDistributionUrl(href)).toBe(true)
    expect(
      getMuvekkilKasaDesktopTrialDownload({
        publicDownloadFiles: [{ label: 'Kurulum', downloadPath: href, filename: 'Setup.exe', type: 'setup' }],
      }),
    ).toBeNull()
  })

  it('C: rejects latest.yml', () => {
    const href = 'https://updates.woontegra.com/updates/muvekkil-kasa-defteri/latest.yml'
    expect(isPublicWindowsSetupInstallerUrl(href)).toBe(false)
    expect(
      getMuvekkilKasaDesktopTrialDownload({
        publicDownloadFiles: [{ label: 'Feed', downloadPath: href, filename: 'latest.yml', type: 'setup' }],
      }),
    ).toBeNull()
  })

  it('D: rejects .blockmap', () => {
    const href =
      'https://cdn.example.com/public/Woontegra-Muvekkil-Kasa-Defteri-Setup-0.1.11.exe.blockmap'
    expect(isPublicWindowsSetupInstallerUrl(href)).toBe(false)
    expect(
      getMuvekkilKasaDesktopTrialDownload({
        publicDownloadFiles: [
          { label: 'Blockmap', downloadPath: href, filename: 'Setup.exe.blockmap', type: 'setup' },
        ],
      }),
    ).toBeNull()
  })

  it('E: missing public installer does not invent a broken href or updater fallback', () => {
    expect(getMuvekkilKasaDesktopTrialDownload({ publicDownloadFiles: [] })).toBeNull()
    expect(
      getMuvekkilKasaDesktopTrialDownload({
        publicDownloadFiles: [{ label: 'Kurulum', downloadPath: '   ', filename: 'x.exe', type: 'setup' }],
      }),
    ).toBeNull()
    expect(
      getMuvekkilKasaDesktopTrialDownload({
        publicDownloadFiles: [
          {
            label: 'Portable',
            downloadPath: PUBLIC_SETUP,
            filename: 'Woontegra-Muvekkil-Kasa-Defteri-Setup-0.1.11.exe',
            type: 'portable',
          },
        ],
      }),
    ).toBeNull()
  })

  it('G: website trial download is a public installer href, not a /trial API call', () => {
    const download = getMuvekkilKasaDesktopTrialDownload({ publicDownloadFiles: SETUP_FILES })
    expect(download?.href).not.toMatch(/\/trial(\/|$|\?)/)
    expect(download?.href).toBe(PUBLIC_SETUP)

    const root = join(dirname(fileURLToPath(import.meta.url)), '..')
    const cards = readFileSync(join(root, 'components/public/muvekkil-kasa/MuvekkilKasaCompareProductCards.tsx'), 'utf8')
    const desktopCard = cards.slice(cards.indexOf('function DesktopCard'), cards.indexOf('function SaasCard'))
    expect(desktopCard).toContain('getMuvekkilKasaDesktopTrialDownload(product)')
    expect(cards).toContain('data-desktop-trial-cta="ready"')
    expect(cards).toContain('data-desktop-trial-cta="pending"')
    expect(desktopCard).not.toMatch(/\/trial/)
    expect(desktopCard).not.toContain('onOpenDemo')
    expect(cards).not.toContain('updates.woontegra.com')
  })
})
