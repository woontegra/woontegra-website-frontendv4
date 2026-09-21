import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { MK_COMPARE_DESKTOP_LICENSE_CAPTION, MK_COMPARE_TRIAL_CTA_LABEL } from '@/components/public/muvekkil-kasa/comparePageUtils'
import { DEFAULT_MK_COMPARE_DESKTOP_COPY, DEFAULT_MK_COMPARE_SAAS_COPY } from '@/builder/types/mkSaasPurchase'

const root = join(dirname(fileURLToPath(import.meta.url)))
const cardsSrc = readFileSync(join(root, 'MuvekkilKasaCompareProductCards.tsx'), 'utf8')
const rendererSrc = readFileSync(
  join(root, '../../../builder/render/blocks/MkSaasPurchaseBlockRenderer.tsx'),
  'utf8',
)

describe('Müvekkil Kasa compare product cards', () => {
  it('keeps desktop license caption and trial CTA copy', () => {
    expect(MK_COMPARE_DESKTOP_LICENSE_CAPTION).toBe('KDV dahil · 1 yıl lisans')
    expect(MK_COMPARE_TRIAL_CTA_LABEL).toBe('7 Gün Ücretsiz Dene')
    expect(DEFAULT_MK_COMPARE_DESKTOP_COPY.demoButtonLabel).toBe('7 Gün Ücretsiz Dene')
    expect(cardsSrc).toContain('MK_COMPARE_DESKTOP_LICENSE_CAPTION')
    expect(cardsSrc).toContain('MK_COMPARE_TRIAL_CTA_LABEL')
  })

  it('F: SaaS demo CTA still uses onOpenDemo, independent of desktop installer CTA', () => {
    expect(DEFAULT_MK_COMPARE_SAAS_COPY.demoButtonLabel).toBe('7 Gün Ücretsiz Dene')
    expect(cardsSrc).toContain('onClick={ctx.onOpenDemo}')
    const desktopCard = cardsSrc.slice(cardsSrc.indexOf('function DesktopCard'), cardsSrc.indexOf('function SaasCard'))
    const saasCard = cardsSrc.slice(cardsSrc.indexOf('function SaasCard'))
    expect(desktopCard).not.toContain('onOpenDemo')
    expect(saasCard).toContain('onClick={ctx.onOpenDemo}')
  })

  it('uses the same compare cards in public fallback and builder render', () => {
    expect(rendererSrc).toContain("import { MuvekkilKasaCompareProductCards }")
    expect(rendererSrc).toContain('purchase.settings.layout === \'compare\'')
    expect(rendererSrc).toContain('<MuvekkilKasaCompareProductCards')
    expect(rendererSrc).toContain('desktopCopy={purchase.settings.compareDesktop}')
    expect(rendererSrc).toContain('saasCopy={purchase.settings.compareSaas}')
  })
})
