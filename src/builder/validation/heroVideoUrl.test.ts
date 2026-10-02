import { describe, expect, it } from 'vitest'
import { createDefaultHeroBlock } from '@/builder/types'
import {
  firstEnabledHeroVideoError,
  heroVideoUrlProblem,
  HERO_VIDEO_PREVIEW_MESSAGE,
  HERO_YOUTUBE_VIDEO_MESSAGE,
  isDirectHeroVideoUrl,
} from '@/builder/validation/heroVideoUrl'

describe('hero video url', () => {
  it('accepts direct mp4 and webm files', () => {
    expect(isDirectHeroVideoUrl('/uploads/hero/clip.mp4')).toBe(true)
    expect(isDirectHeroVideoUrl('/uploads/hero/clip.webm?v=2')).toBe(true)
    expect(isDirectHeroVideoUrl('https://cdn.example.com/a.mp4')).toBe(true)
    expect(isDirectHeroVideoUrl('https://cdn.example.com/a.WEBM?token=1')).toBe(true)
    expect(heroVideoUrlProblem('https://cdn.example.com/a.mp4')).toBeNull()
  })

  it('rejects youtube and other non-file addresses', () => {
    expect(heroVideoUrlProblem('https://www.youtube.com/watch?v=abc')).toBe('youtube')
    expect(heroVideoUrlProblem('youtu.be/abc')).toBe('youtube')
    expect(heroVideoUrlProblem('https://www.youtube.com/embed/abc')).toBe('youtube')
    expect(heroVideoUrlProblem('https://vimeo.com/123')).toBe('invalid')
    expect(heroVideoUrlProblem('https://cdn.example.com/file.mov')).toBe('invalid')
    expect(heroVideoUrlProblem('')).toBeNull()
    expect(heroVideoUrlProblem('   ')).toBeNull()
  })

  it('blocks save only for an enabled video hero with a bad url', () => {
    const block = createDefaultHeroBlock('hero-1')
    block.settings.mode = 'video'
    block.settings.video = { videoUrl: 'https://www.youtube.com/watch?v=abc' }
    expect(firstEnabledHeroVideoError([block])).toBe(HERO_YOUTUBE_VIDEO_MESSAGE)

    block.settings.video = { videoUrl: 'https://cdn.example.com/page' }
    expect(firstEnabledHeroVideoError([block])).toBe(HERO_VIDEO_PREVIEW_MESSAGE)

    block.settings.video = { videoUrl: 'https://cdn.example.com/a.mp4' }
    expect(firstEnabledHeroVideoError([block])).toBeNull()

    block.visibility.enabled = false
    block.settings.video = { videoUrl: 'https://www.youtube.com/watch?v=abc' }
    expect(firstEnabledHeroVideoError([block])).toBeNull()
  })
})
