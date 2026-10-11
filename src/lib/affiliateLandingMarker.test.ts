import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AFFILIATE_LANDING_MARKER_KEY,
  AFFILIATE_LANDING_MARKER_MAX_AGE_MS,
  clearAffiliateLanding,
  markAffiliateLanding,
  readRecentAffiliateLanding,
} from './affiliateLandingMarker'

const root = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(join(root, rel), 'utf8')

describe('affiliateLandingMarker', () => {
  let store: Map<string, string>

  beforeEach(() => {
    store = new Map()
    vi.stubGlobal('window', {
      sessionStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        removeItem: (k: string) => void store.delete(k),
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('işaret yoksa iş ortağı girişi sayılmaz (?surum= tek başına yetmez)', () => {
    expect(readRecentAffiliateLanding()).toBe(false)
  })

  it('/r/:code işareti kısa süre içinde okunur, sonra temizlenir', () => {
    markAffiliateLanding(1_000)
    expect(store.get(AFFILIATE_LANDING_MARKER_KEY)).toBe('1000')
    expect(readRecentAffiliateLanding(1_000 + 5_000)).toBe(true)
    clearAffiliateLanding()
    expect(readRecentAffiliateLanding(1_000 + 5_000)).toBe(false)
  })

  it('süresi geçmiş işaret vurgu üretmez', () => {
    markAffiliateLanding(1_000)
    expect(readRecentAffiliateLanding(1_000 + AFFILIATE_LANDING_MARKER_MAX_AGE_MS + 1)).toBe(false)
  })

  it('depolama erişilemezse hata vermez', () => {
    vi.stubGlobal('window', {
      sessionStorage: {
        getItem: () => {
          throw new Error('blocked')
        },
        setItem: () => {
          throw new Error('blocked')
        },
        removeItem: () => {
          throw new Error('blocked')
        },
      },
    })
    expect(() => markAffiliateLanding()).not.toThrow()
    expect(readRecentAffiliateLanding()).toBe(false)
    expect(() => clearAffiliateLanding()).not.toThrow()
  })

  it('iş ortağı rozeti ?surum= yerine /r/:code işaretine bağlı', () => {
    const redirectSrc = read('../pages/public/AffiliateReferralRedirectPage.tsx')
    const providerSrc = read('../components/public/muvekkil-kasa/MkComparePageProvider.tsx')
    const panelSrc = read('../components/public/muvekkil-kasa/MuvekkilKasaPlatformPurchasePanel.tsx')
    expect(redirectSrc).toContain('markAffiliateLanding()')
    expect(providerSrc).toContain('fromAffiliateLanding ? highlightedPlatform : null')
    expect(panelSrc).toContain("ctx.referralPlatform === target ? 'target' : 'none'")
    expect(panelSrc).not.toContain('ctx.highlightedPlatform === target')
  })
})
