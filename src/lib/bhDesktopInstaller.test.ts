import { describe, expect, it } from 'vitest'
import { bhDesktopInstallerForPlatform } from '@/lib/bhDesktopInstaller'

const product = {
  windowsDownloadUrl: 'https://download.example.test/downloads/bilirkisi-hesap/windows/Bilirkisi-Hesap-Setup-3.6.1.exe',
  windowsVersion: '3.6.1',
  windowsFileSize: '118 MB',
  windowsDownloadButtonLabel: 'Windows kurulumunu indir',
  macosDownloadUrl: 'https://download.example.test/downloads/bilirkisi-hesap/macos/Bilirkisi-Hesap-3.6.1.dmg',
  macosVersion: '3.6.1',
  macosFileSize: '120 MB',
  macosDownloadButtonLabel: 'Mac kurulumunu indir',
}

describe('bhDesktopInstallerForPlatform', () => {
  it('uses the windows installer fields when windows is selected', () => {
    expect(bhDesktopInstallerForPlatform(product, 'windows')).toEqual({
      url: product.windowsDownloadUrl,
      version: '3.6.1',
      fileSize: '118 MB',
      buttonLabel: 'Windows kurulumunu indir',
    })
  })

  it('uses the macos installer fields when macos is selected', () => {
    expect(bhDesktopInstallerForPlatform(product, 'macos')).toEqual({
      url: product.macosDownloadUrl,
      version: '3.6.1',
      fileSize: '120 MB',
      buttonLabel: 'Mac kurulumunu indir',
    })
  })

  it('does not offer an updater feed as the installer', () => {
    expect(
      bhDesktopInstallerForPlatform(
        {
          windowsDownloadUrl: 'https://updates.woontegra.com/updates/bilirkisi-hesap/windows/latest.yml',
          macosDownloadUrl: 'https://download.example.test/setup.dmg.blockmap',
        },
        'windows',
      ),
    ).toBeNull()
    expect(
      bhDesktopInstallerForPlatform(
        { macosDownloadUrl: 'https://updates.woontegra.com/updates/bilirkisi-hesap/macos/latest-mac.yml' },
        'macos',
      ),
    ).toBeNull()
  })
})
