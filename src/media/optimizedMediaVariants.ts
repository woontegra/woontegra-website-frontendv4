export type OptimizedVariantMarker = 'opt' | 'optavif'
export type OptimizedMediaFormat = 'jpeg' | 'png' | 'webp' | 'avif'
export type LcpPreloadFormat = 'avif' | 'webp' | 'canonical'

export type ParsedOptimizedMedia = {
  url: string
  fileName: string
  stem: string
  marker: OptimizedVariantMarker
  maxWidth: number
  ext: string
  hasAvif: boolean
  hasWebp: boolean
}

export type PictureSource = {
  type?: string
  srcSet: string
  media?: string
  sizes?: string
}

export {
  OPTIMIZED_MEDIA_MARKER,
  OPTIMIZED_VARIANT_WIDTHS,
  buildOptimizedSrcSet,
  buildOptimizedVariantUrl,
  buildResponsivePictureModel,
  isOptimizedMediaUrl,
  listOptimizedWidths,
  mimeForLcpPreloadFormat,
  parseOptimizedMediaUrl,
  pickLcpPreloadFormat,
  pickOptimizedPreloadUrl,
  pickResponsiveWidth,
  replaceUrlFileName,
} from './optimizedMediaVariants.mjs'
