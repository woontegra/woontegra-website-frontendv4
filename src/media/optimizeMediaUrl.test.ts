import { describe, expect, it, vi } from 'vitest'

vi.stubEnv('PROD', true)
vi.stubEnv('VITE_VERCEL_IMAGE_OPTIMIZATION', '')

import {
  buildHeroOptimizedSources,
  buildOptimizedMediaUrl,
  isVercelImageOptimizationEnabled,
} from './optimizeMediaUrl'

const BLOB =
  'https://fm1lntc3pwasdljl.public.blob.vercel-storage.com/website-media/hero/woontegra-slider-1-mobil-jpg-1787414087442-13a511870b.jpeg'

describe('optimizeMediaUrl', () => {
  it('does not emit /_vercel/image unless explicitly enabled', () => {
    expect(isVercelImageOptimizationEnabled()).toBe(false)
    expect(buildOptimizedMediaUrl(BLOB, { width: 768 })).toBe(BLOB)
    expect(buildOptimizedMediaUrl(BLOB)).not.toContain('/_vercel/image')
  })

  it('keeps responsive hero sources on the original host', () => {
    const sources = buildHeroOptimizedSources({
      desktop: BLOB,
      tablet: BLOB,
      mobile: BLOB,
    })
    expect(sources.mobile).toBe(BLOB)
    expect(sources.desktop).toBe(BLOB)
  })
})
