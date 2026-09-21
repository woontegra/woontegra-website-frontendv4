import { describe, expect, it } from 'vitest'
import type { BuilderBlock } from '@/builder/types'
import { extractHomeHeroShell, resolveHomeRenderPlan } from './homePageAdapter'

describe('homePageAdapter LCP/CLS shell', () => {
  it('maps centered carousel to banner shell and first-slide preload', () => {
    const blocks: BuilderBlock[] = [
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
              desktopImage: { url: 'https://cdn.example/web.jpeg' },
              mobileImage: { url: 'https://cdn.example/mobil.jpeg' },
            },
          ],
        },
      } as BuilderBlock,
    ]

    const plan = resolveHomeRenderPlan({ blocks })
    expect(plan.mode).toBe('builder')
    const shell = extractHomeHeroShell(plan)
    expect(shell.layout).toBe('banner')
    expect(shell.preload?.mobileHref).toContain('mobil.jpeg')
    expect(shell.preload?.desktopHref).toContain('web.jpeg')
    expect(shell.preload?.href).not.toContain('/_vercel/image')
  })
})
