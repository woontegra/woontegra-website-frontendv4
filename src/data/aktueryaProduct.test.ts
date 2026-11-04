import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  AKTUERYA_DEMO_CREDITS,
  AKTUERYA_DEMO_DAYS,
  AKTUERYA_MONTHLY_TL,
  AKTUERYA_PATH,
  AKTUERYA_YEARLY_TL,
} from '@/data/aktueryaProduct'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')

describe('Aktüerya tanıtım sayfası (satış kapalı)', () => {
  it('uses the existing software route and package constants', () => {
    expect(AKTUERYA_PATH).toBe('/yazilimlar/aktuerya-hesaplama')
    expect(AKTUERYA_MONTHLY_TL).toBe(3000)
    expect(AKTUERYA_YEARLY_TL).toBe(30000)
    expect(AKTUERYA_DEMO_DAYS).toBe(7)
    expect(AKTUERYA_DEMO_CREDITS).toBe(10)
  })

  it('keeps purchase and demo closed with disabled Çok yakında controls', () => {
    const page = readFileSync(join(root, 'src/pages/public/AktueryaProductPage.tsx'), 'utf8')
    const view = readFileSync(join(root, 'src/components/public/aktuerya/AktueryaProductView.tsx'), 'utf8')
    const showcase = readFileSync(join(root, 'src/components/public/aktuerya/AktueryaSalesShowcase.tsx'), 'utf8')
    const combined = `${page}\n${view}\n${showcase}`
    expect(combined).not.toMatch(/addToCart|cartStorage|\/sepet|requestAktueryaDemo|aktueryaDemoService/)
    expect(combined).not.toContain('AktueryaDemoRequestModal')
    expect(view).toContain('Çok yakında')
    expect(showcase).toContain('Çok yakında')
    expect(showcase).toContain('disabled')
    expect(readFileSync(join(root, 'src/routes/router.tsx'), 'utf8')).toContain(
      "path: 'yazilimlar/aktuerya-hesaplama'",
    )
  })
})
