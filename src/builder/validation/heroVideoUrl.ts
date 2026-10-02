import type { BuilderBlock, HeroBlock } from '@/builder/types'

export const HERO_VIDEO_URL_HINT =
  'Doğrudan MP4/WebM video dosyası adresi girin veya video yükleyin. YouTube bağlantısı desteklenmez.'

export const HERO_YOUTUBE_VIDEO_MESSAGE =
  'YouTube bağlantısı bu alanda çalışmaz. Lütfen MP4/WebM video dosyası yükleyin veya doğrudan video dosyası URL’i girin.'

export const HERO_VIDEO_PREVIEW_MESSAGE =
  'Video önizlenemiyor. Lütfen doğrudan MP4/WebM video adresi girin.'

export type HeroVideoUrlProblem = 'youtube' | 'invalid'

const VIDEO_FILE_EXT = /\.(mp4|webm)$/i

function hostnameOf(raw: string): string | null {
  const value = raw.trim()
  if (!value) return null
  const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`
  try {
    return new URL(withProtocol).hostname.replace(/^www\./i, '').toLowerCase()
  } catch {
    return null
  }
}

export function isYouTubeVideoUrl(raw: string | null | undefined): boolean {
  const host = hostnameOf(raw ?? '')
  if (!host) return false
  return (
    host === 'youtu.be' ||
    host === 'youtube.com' ||
    host === 'youtube-nocookie.com' ||
    host.endsWith('.youtube.com') ||
    host.endsWith('.youtube-nocookie.com')
  )
}

function videoPathname(raw: string): string | null {
  const value = raw.trim()
  if (!value || isYouTubeVideoUrl(value)) return null

  if (value.startsWith('/')) {
    const path = value.split(/[?#]/)[0]
    return path || null
  }

  if (!/^https?:\/\//i.test(value)) return null

  try {
    const url = new URL(value)
    return decodeURIComponent(url.pathname)
  } catch {
    return null
  }
}

/** Doğrudan MP4/WebM dosyası veya /uploads altındaki video dosyası. */
export function isDirectHeroVideoUrl(raw: string | null | undefined): boolean {
  const path = videoPathname(raw ?? '')
  if (!path) return false
  return VIDEO_FILE_EXT.test(path)
}

export function heroVideoUrlProblem(raw: string | null | undefined): HeroVideoUrlProblem | null {
  const value = raw?.trim() ?? ''
  if (!value) return null
  if (isYouTubeVideoUrl(value)) return 'youtube'
  if (!isDirectHeroVideoUrl(value)) return 'invalid'
  return null
}

export function heroVideoUrlMessage(problem: HeroVideoUrlProblem): string {
  return problem === 'youtube' ? HERO_YOUTUBE_VIDEO_MESSAGE : HERO_VIDEO_PREVIEW_MESSAGE
}

export function firstEnabledHeroVideoError(blocks: BuilderBlock[]): string | null {
  for (const block of blocks) {
    if (!block.visibility.enabled || block.type !== 'hero') continue
    const hero = block as HeroBlock
    if (hero.settings.mode !== 'video') continue
    const problem = heroVideoUrlProblem(hero.settings.video?.videoUrl)
    if (problem) return heroVideoUrlMessage(problem)
  }
  return null
}
