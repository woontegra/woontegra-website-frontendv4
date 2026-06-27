/**
 * Hero blok JSON şeması referansı — Aşama 4 builder formları bu yapıyı kullanacak.
 * Kod deploy olmadan yeni slide/visibility alanları settings içine eklenebilir.
 */
export const HERO_BLOCK_SCHEMA_VERSION = 1

export type HeroBlockSchemaRef = {
  version: typeof HERO_BLOCK_SCHEMA_VERSION
  requiredForPublishWhen: {
    imageRequiredUnless: ['gradient', 'showImage:false']
  }
  optionalFields: string[]
}

export const heroBlockSchemaRef: HeroBlockSchemaRef = {
  version: HERO_BLOCK_SCHEMA_VERSION,
  requiredForPublishWhen: {
    imageRequiredUnless: ['gradient', 'showImage:false'],
  },
  optionalFields: [
    'title',
    'description',
    'badge',
    'buttons',
    'slides',
    'desktopImage',
    'mobileImage',
    'overlay',
    'height.desktop',
    'height.tablet',
    'height.mobile',
    'carousel.autoplay',
    'carousel.showArrows',
    'carousel.showDots',
  ],
}
