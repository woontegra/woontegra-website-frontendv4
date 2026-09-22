import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

function readSrc(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('white-flash / first-paint wiring', () => {
  it('A: source index.html has branded critical shell, not a white #root lock', () => {
    const html = readSrc('index.html')
    const match = html.match(/<style id="woontegra-critical-boot">([\s\S]*?)<\/style>/)
    expect(match?.[1]).toBeTruthy()
    const css = match?.[1] ?? ''
    const rootRule = css.match(/#root\s*\{[^}]+\}/)?.[0] ?? ''
    expect(rootRule).toContain('#0f172a')
    expect(rootRule).not.toMatch(/#ffffff/)
    expect(css).toContain('.woontegra-boot-header')
    expect(css).toContain('.woontegra-boot-logo')
    expect(css).toContain('.woontegra-boot-hero')
    expect(css).toContain('height: 64px')
    expect(css).not.toContain('spinner')
  })

  it('E/G: createRoot captures hold first; non-home releases; HomePage releases when ready', () => {
    const main = readSrc('src/main.tsx')
    expect(main.indexOf('capturePrerenderHold(rootEl)')).toBeGreaterThan(-1)
    expect(main.indexOf('capturePrerenderHold(rootEl)')).toBeLessThan(main.indexOf('createRoot(rootEl)'))

    const layout = readSrc('src/layouts/SiteLayout.tsx')
    expect(layout).toContain("location.pathname !== '/'")
    expect(layout).toContain('releasePrerenderHold()')

    const home = readSrc('src/pages/public/HomePage.tsx')
    expect(home).toContain('useLayoutEffect')
    expect(home).toContain('releasePrerenderHold()')
  })

  it('H: homepage hero renderer is eager, not behind lazy Suspense', () => {
    const src = readSrc('src/builder/render/PageBlocksRenderer.tsx')
    expect(src).toMatch(/import \{ HeroBlockRenderer \} from '@\/builder\/render\/blocks\/HeroBlockRenderer'/)
    expect(src).toContain("if (block.type === 'hero')")
    expect(src).toContain('<HeroBlockRenderer')
    expect(src).not.toMatch(/lazy\(\s*getBlockRendererLoader\('hero'\)/)
  })

  it('I: homepage skeleton uses banner/mobile hero geometry, not 520px split', () => {
    const home = readSrc('src/pages/public/HomePage.tsx')
    expect(home).toContain('layout="banner"')

    const skeleton = readSrc('src/components/public/home/HomePageHeroSkeleton.tsx')
    expect(skeleton).toContain("if (layout === 'banner')")
    expect(skeleton).toContain('aspect-[3/1]')
    expect(skeleton).toContain('max-[640px]:aspect-[9/16]')
    expect(skeleton).toContain('bg-slate-900')

    const heroImg = readSrc('src/media/components/HeroResponsiveImage.tsx')
    expect(heroImg).toContain("lockAspect?: 'banner'")
    expect(heroImg).toContain('aspect-[3/1] max-[640px]:aspect-[9/16]')

    const carousel = readSrc('src/builder/render/blocks/HeroCarouselSection.tsx')
    expect(carousel).toContain('lockAspect="banner"')
  })

  it('B: PublicHeader never uses text brand as the logo', () => {
    const header = readSrc('src/components/public/PublicHeader.tsx')
    expect(header).toContain('firstPaintLogoUrl')
    expect(header).toContain('<img')
    expect(header).not.toContain('MediaImage')
    expect(header).not.toContain('{siteName}</span>')
    expect(header).not.toContain('text-lg font-semibold tracking-tight text-slate-900">{siteName}')
  })
})
