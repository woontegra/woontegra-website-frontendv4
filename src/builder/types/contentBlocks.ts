import type { BlockBase, BlockStyle, BlockVisibility } from './common'

function baseStyle(): BlockStyle {
  return {
    containerWidth: 'default',
    contentAlign: 'left',
    paddingTop: { desktop: '48px', mobile: '32px' },
    paddingBottom: { desktop: '48px', mobile: '32px' },
  }
}

function baseVisibility(): BlockVisibility {
  return {
    enabled: true,
    showTitle: true,
    showDescription: true,
    showImage: true,
    showButton: true,
  }
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export type VideoEmbedBlock = BlockBase & {
  type: 'video-embed'
  settings: {
    youtubeUrl?: string
    /** Optional caption under embed */
    caption?: string
  }
}

export type CalloutTone = 'info' | 'warning' | 'note'

export type CalloutBlock = BlockBase & {
  type: 'callout'
  settings: {
    tone?: CalloutTone
    /** Body uses same HTML rules as rich-text when HTML; plain otherwise */
    body?: string
  }
}

export type GalleryImage = {
  id: string
  url: string
  alt?: string
}

export type GalleryBlock = BlockBase & {
  type: 'gallery'
  settings: {
    columns?: 2 | 3 | 4
    images: GalleryImage[]
  }
}

export function createDefaultVideoEmbedBlock(sortOrder: number): VideoEmbedBlock {
  return {
    id: uid('video-embed'),
    type: 'video-embed',
    sortOrder,
    title: '',
    description: '',
    visibility: { ...baseVisibility(), showTitle: true, showDescription: true },
    style: baseStyle(),
    settings: { youtubeUrl: '', caption: '' },
  }
}

export function createDefaultCalloutBlock(sortOrder: number): CalloutBlock {
  return {
    id: uid('callout'),
    type: 'callout',
    sortOrder,
    title: 'Bilgi',
    description: '',
    visibility: baseVisibility(),
    style: baseStyle(),
    settings: { tone: 'info', body: '' },
  }
}

export function createDefaultGalleryBlock(sortOrder: number): GalleryBlock {
  return {
    id: uid('gallery'),
    type: 'gallery',
    sortOrder,
    title: 'Galeri',
    description: '',
    visibility: baseVisibility(),
    style: baseStyle(),
    settings: { columns: 3, images: [] },
  }
}
