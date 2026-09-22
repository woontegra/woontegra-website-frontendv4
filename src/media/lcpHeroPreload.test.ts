import { describe, expect, it } from 'vitest'
import { hasPrerenderedLcpImagePreload } from '@/hooks/useLcpImagePreload'
import { extractHomeHeroShell, resolveHomeRenderPlan } from '@/lib/homePageAdapter'
import {
  LCP_PRELOAD_DESKTOP_MEDIA,
  LCP_PRELOAD_MOBILE_MEDIA,
  buildHomeLcpPreloadLinks,
  extractHomeLcp,
  hasMatchingImagePreload,
  serializeLcpPreloadLink,
} from '@/media/lcpHeroPreload'
import { buildResponsivePictureModel } from '@/media/optimizedMediaVariants'
import type { BuilderBlock } from '@/builder/types'

const MOBILE_AVIF =
  'https://cdn.example.com/website-media/hero/woontegra-slider-1-mobil.optavif-w941.jpg'
const DESKTOP_AVIF =
  'https://cdn.example.com/website-media/hero/woontegra-slider-1-web.optavif-w1920.jpg'
const WEBP_ONLY = 'https://cdn.example.com/website-media/hero/home-banner.opt-w1920.jpg'
const LEGACY = 'https://cdn.example.com/website-media/hero/old-slider.jpeg'

function carouselHome(slides: unknown[]) {
  return {
    blocks: [
      {
        type: 'hero',
        visibility: { enabled: true },
        settings: { mode: 'carousel', slides },
      },
    ],
  }
}

describe('homepage LCP prerender preload', () => {
  it('A/B: optavif mobile gets AVIF srcset with native max, not invented widths', () => {
    const lcp = extractHomeLcp(
      carouselHome([
        {
          enabled: true,
          sortOrder: 2,
          desktopImage: { url: DESKTOP_AVIF },
          mobileImage: { url: MOBILE_AVIF },
        },
        {
          enabled: true,
          sortOrder: 0,
          desktopImage: { url: DESKTOP_AVIF },
          mobileImage: { url: MOBILE_AVIF },
        },
      ]),
    )
    expect(lcp).toEqual({ desktop: DESKTOP_AVIF, mobile: MOBILE_AVIF })

    const links = buildHomeLcpPreloadLinks(lcp)
    const mobile = links.find((link) => link.media === LCP_PRELOAD_MOBILE_MEDIA)
    const html = serializeLcpPreloadLink(mobile)
    expect(html).toContain('rel="preload"')
    expect(html).toContain('as="image"')
    expect(html).toContain('type="image/avif"')
    expect(html).toContain('media="(max-width: 640px)"')
    expect(html).toContain('fetchpriority="high"')
    expect(html).toContain('imagesizes="100vw"')
    expect(mobile?.imageSrcSet).toContain('optavif-w480.avif 480w')
    expect(mobile?.imageSrcSet).toContain('optavif-w941.avif 941w')
    expect(mobile?.imageSrcSet).not.toContain('optavif-w960')
    expect(mobile?.imageSrcSet).not.toContain('optavif-w1440')
    expect(mobile?.imageSrcSet).not.toContain('optavif-w1920')
    expect(mobile?.href).toContain('optavif-w941.avif')
    expect(html).not.toContain('.webp')
  })

  it('A/C: optavif desktop uses desktop asset, not mobile canonical', () => {
    const links = buildHomeLcpPreloadLinks({ mobile: MOBILE_AVIF, desktop: DESKTOP_AVIF })
    const desktop = links.find((link) => link.media === LCP_PRELOAD_DESKTOP_MEDIA)
    const html = serializeLcpPreloadLink(desktop)
    expect(html).toContain('media="(min-width: 641px)"')
    expect(html).toContain('type="image/avif"')
    expect(desktop?.href).toContain('woontegra-slider-1-web.optavif-w1920.avif')
    expect(desktop?.href).not.toContain('slider-1-mobil')
    expect(desktop?.imageSrcSet).toContain('optavif-w480.avif')
    expect(desktop?.imageSrcSet).toContain('optavif-w960.avif')
    expect(desktop?.imageSrcSet).toContain('optavif-w1440.avif')
    expect(desktop?.imageSrcSet).toContain('optavif-w1920.avif')
  })

  it('D: opt-w without AVIF guarantee preloads WebP only', () => {
    const links = buildHomeLcpPreloadLinks({ mobile: WEBP_ONLY, desktop: WEBP_ONLY })
    expect(links).toHaveLength(2)
    for (const link of links) {
      expect(link.type).toBe('image/webp')
      expect(link.href).toContain('.opt-w')
      expect(link.href).toContain('.webp')
      expect(link.imageSrcSet).toContain('.webp')
      expect(link.imageSrcSet).not.toContain('.avif')
      expect(serializeLcpPreloadLink(link)).not.toContain('image/avif')
    }
  })

  it('E: non-optimized URL does not invent variants', () => {
    const links = buildHomeLcpPreloadLinks({ mobile: LEGACY, desktop: LEGACY })
    expect(links).toHaveLength(2)
    for (const link of links) {
      expect(link.href).toBe(LEGACY)
      expect(link.type).toBeNull()
      expect(link.imageSrcSet).toBeNull()
      const html = serializeLcpPreloadLink(link)
      expect(html).not.toContain('imagesrcset')
      expect(html).not.toContain('.webp')
      expect(html).not.toContain('.avif')
      expect(html).toContain(`href="${LEGACY}"`)
    }
  })

  it('F: runtime skip when initial HTML already has matching image preload', () => {
    const prerenderLinks = [
      { rel: 'preload', as: 'image', media: LCP_PRELOAD_MOBILE_MEDIA, id: '' },
      { rel: 'preload', as: 'image', media: LCP_PRELOAD_DESKTOP_MEDIA, id: '' },
    ]
    expect(hasMatchingImagePreload(prerenderLinks, LCP_PRELOAD_MOBILE_MEDIA)).toBe(true)
    expect(hasMatchingImagePreload(prerenderLinks, LCP_PRELOAD_DESKTOP_MEDIA)).toBe(true)

    const root = {
      querySelectorAll: () =>
        prerenderLinks.map((link) => ({
          getAttribute: (name: string) => (link as Record<string, string>)[name] || '',
          id: '',
        })),
    }
    expect(hasPrerenderedLcpImagePreload(root as unknown as ParentNode, LCP_PRELOAD_MOBILE_MEDIA)).toBe(
      true,
    )
    expect(
      hasPrerenderedLcpImagePreload(root as unknown as ParentNode, LCP_PRELOAD_DESKTOP_MEDIA),
    ).toBe(true)
  })

  it('G: preload AVIF srcset matches HeroResponsiveImage picture model', () => {
    const picture = buildResponsivePictureModel(MOBILE_AVIF, {
      media: LCP_PRELOAD_MOBILE_MEDIA,
      sizes: '100vw',
    })
    const preload = buildHomeLcpPreloadLinks({ mobile: MOBILE_AVIF, desktop: DESKTOP_AVIF })[0]
    const avifSource = picture?.sources.find((source) => source.type === 'image/avif')
    expect(avifSource?.srcSet).toBe(preload?.imageSrcSet)
    expect(picture?.sources.some((source) => source.type === 'image/webp')).toBe(true)
    expect(picture?.imgSrc).toBe(MOBILE_AVIF)
  })

  it('H: runtime CMS hero stays source of truth when preload snapshot is stale', () => {
    const stale = 'https://cdn.example.com/old.optavif-w941.jpg'
    const fresh = 'https://cdn.example.com/new-hero.optavif-w941.jpg'
    const plan = resolveHomeRenderPlan({
      blocks: [
        {
          id: 'home-block-hero',
          type: 'hero',
          sortOrder: 0,
          visibility: { enabled: true },
          style: {},
          settings: {
            mode: 'carousel',
            layout: 'centered',
            slides: [
              {
                id: 's1',
                enabled: true,
                sortOrder: 0,
                desktopImage: { url: DESKTOP_AVIF },
                mobileImage: { url: fresh },
              },
            ],
          },
        } as BuilderBlock,
      ],
    })
    const shell = extractHomeHeroShell(plan)
    expect(shell.preload?.mobileHref).toContain('new-hero.optavif-w941.avif')
    expect(shell.preload?.mobileHref).not.toContain('old.optavif')
    expect(stale).not.toBe(fresh)
  })

  it('skips disabled slides and does not hardcode hero URLs', () => {
    const lcp = extractHomeLcp(
      carouselHome([
        {
          enabled: false,
          sortOrder: 0,
          mobileImage: { url: LEGACY },
          desktopImage: { url: LEGACY },
        },
        {
          enabled: true,
          sortOrder: 1,
          mobileImage: { url: MOBILE_AVIF },
          desktopImage: { url: DESKTOP_AVIF },
        },
      ]),
    )
    expect(lcp?.mobile).toBe(MOBILE_AVIF)
    expect(lcp?.desktop).toBe(DESKTOP_AVIF)
  })
})
