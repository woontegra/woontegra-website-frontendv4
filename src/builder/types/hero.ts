import type {
  BlockBase,
  BlockButton,
  BlockVisibility,
  ContentAlign,
  MediaRef,
  OverlaySettings,
  ResponsiveValue,
  VerticalAlign,
} from './common'

export type HeroMode = 'single-image' | 'carousel' | 'gradient' | 'video' | 'solid-color'

export type HeroSlide = {
  id: string
  sortOrder: number
  title?: string
  description?: string
  badge?: string
  desktopImage?: MediaRef
  tabletImage?: MediaRef
  mobileImage?: MediaRef
  buttons?: BlockButton[]
  visibility?: Partial<BlockVisibility>
  overlay?: OverlaySettings
  link?: string
  enabled?: boolean
}

export type HeroCarouselSettings = {
  autoplay?: boolean
  intervalMs?: number
  showArrows?: boolean
  showDots?: boolean
}

export type HeroGradientStyle = {
  color1?: string
  color2?: string
  opacity?: number
  blur?: number
  noise?: boolean
}

export type HeroVideoSettings = {
  videoUrl?: string
  posterUrl?: string
  muted?: boolean
  loop?: boolean
  autoplay?: boolean
}

export type HeroBreadcrumb = {
  label: string
  href?: string
}

export type HeroHighlight = {
  id: string
  icon: string
  title: string
  cardClass?: string
  iconClass?: string
}

export type HeroSettings = {
  mode: HeroMode
  /** split = ana sayfa; about = hakkımızda; compact = detay sayfa; centered = klasik tam genişlik */
  layout?: 'split' | 'centered' | 'compact' | 'about'
  badge?: string
  breadcrumbs?: HeroBreadcrumb[]
  showBreadcrumbs?: boolean
  highlights?: HeroHighlight[]
  slides: HeroSlide[]
  gradient?: string
  gradientStyle?: HeroGradientStyle
  desktopImage?: MediaRef
  tabletImage?: MediaRef
  mobileImage?: MediaRef
  buttons?: BlockButton[]
  contentAlign?: ContentAlign
  contentPosition?: ContentAlign
  verticalAlign?: VerticalAlign
  fullscreen?: boolean
  height?: ResponsiveValue<string>
  carousel?: HeroCarouselSettings
  video?: HeroVideoSettings
}

export type HeroBlock = BlockBase & {
  type: 'hero'
  settings: HeroSettings
}

export function createDefaultHeroSlide(sortOrder: number): HeroSlide {
  return {
    id: `slide-${Date.now()}-${sortOrder}`,
    sortOrder,
    enabled: true,
    buttons: [
      { id: `btn-a-${sortOrder}`, label: 'Keşfet', href: '/', visible: true, variant: 'primary' },
      { id: `btn-b-${sortOrder}`, label: 'İletişim', href: '/iletisim', visible: false, variant: 'outline' },
    ],
    overlay: { enabled: false, color: '#000000', opacity: 0.4 },
  }
}

export function createDefaultHeroSettings(): HeroSettings {
  return {
    mode: 'single-image',
    slides: [createDefaultHeroSlide(0)],
    contentAlign: 'left',
    contentPosition: 'left',
    verticalAlign: 'center',
    layout: 'centered',
    badge: '',
    fullscreen: false,
    height: { desktop: '520px', tablet: '440px', mobile: '360px' },
    gradientStyle: { color1: '#1e293b', color2: '#065f46', opacity: 1, blur: 0, noise: false },
    carousel: {
      autoplay: false,
      intervalMs: 5000,
      showArrows: true,
      showDots: true,
    },
    video: { muted: true, loop: true, autoplay: true },
  }
}

export function createDefaultHeroBlock(id: string, sortOrder = 0): HeroBlock {
  return {
    id,
    type: 'hero',
    sortOrder,
    title: 'Hero başlığı',
    description: 'Kısa açıklama metni',
    visibility: {
      enabled: true,
      showTitle: true,
      showDescription: true,
      showImage: true,
      showButton: true,
      showBadge: true,
    },
    style: {
      containerWidth: 'full',
      contentAlign: 'left',
      backgroundColor: '#0f172a',
      overlay: { enabled: false, color: '#000000', opacity: 0.4 },
    },
    settings: createDefaultHeroSettings(),
  }
}

export function heroRequiresImage(settings: HeroSettings): boolean {
  if (settings.mode === 'gradient' || settings.mode === 'solid-color' || settings.mode === 'video') {
    return false
  }
  if (settings.mode === 'carousel') {
    return settings.slides.some(
      (s) =>
        s.enabled !== false &&
        Boolean(s.desktopImage?.url?.trim() || s.mobileImage?.url?.trim()),
    )
  }
  return Boolean(
    settings.desktopImage?.url?.trim() ||
      settings.mobileImage?.url?.trim() ||
      settings.slides[0]?.desktopImage?.url?.trim(),
  )
}

export function buildHeroGradientCss(style?: HeroGradientStyle, fallback?: string): string | undefined {
  if (style?.color1 && style?.color2) {
    const opacity = style.opacity ?? 1
    return `linear-gradient(135deg, ${style.color1}${opacity < 1 ? `${Math.round(opacity * 255).toString(16).padStart(2, '0')}` : ''}, ${style.color2})`
  }
  return fallback
}
