/** Ortak builder tipleri — tüm bloklar bu yapı taşlarına dayanır. */

export type PublishStatus = 'draft' | 'published'

export type ContentAlign = 'left' | 'center' | 'right'
export type VerticalAlign = 'top' | 'center' | 'bottom'
export type ContainerWidth = 'narrow' | 'default' | 'wide' | 'full'
export type ButtonVariant = 'primary' | 'secondary' | 'outline'

export type ResponsiveValue<T> = {
  desktop?: T
  tablet?: T
  mobile?: T
}

export type BlockVisibility = {
  enabled: boolean
  showTitle?: boolean
  showDescription?: boolean
  showImage?: boolean
  showButton?: boolean
  showBadge?: boolean
}

export type OverlaySettings = {
  enabled: boolean
  color?: string
  opacity?: number
}

export type BlockStyle = {
  backgroundColor?: string
  backgroundImage?: string
  backgroundGradient?: string
  overlay?: OverlaySettings
  containerWidth?: ContainerWidth
  contentAlign?: ContentAlign
  paddingTop?: ResponsiveValue<string>
  paddingBottom?: ResponsiveValue<string>
  customClass?: string
}

export type BlockButton = {
  id: string
  label?: string
  href?: string
  variant?: ButtonVariant
  visible?: boolean
  openInNewTab?: boolean
}

export type MediaRef = {
  url?: string
  alt?: string
  mediaId?: string
}

export type BlockBase = {
  id: string
  type: string
  sortOrder: number
  title?: string
  description?: string
  visibility: BlockVisibility
  style: BlockStyle
  responsiveSettings?: Record<string, unknown>
  publishStatus?: PublishStatus
}

