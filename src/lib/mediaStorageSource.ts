import type { CatalogMedia } from '@/types/catalogMedia'
import { catalogMediaPickUrl } from '@/types/catalogMedia'

export type MediaStorageSource =
  | 'vercel-blob'
  | 'r2-legacy'
  | 'uploads-legacy'
  | 'images-static'
  | 'unknown'

const SOURCE_LABELS: Record<MediaStorageSource, string> = {
  'vercel-blob': 'Vercel Blob',
  'r2-legacy': 'R2 legacy',
  'uploads-legacy': 'Uploads legacy',
  'images-static': 'Images static',
  unknown: 'Bilinmeyen',
}

export function catalogMediaStorageSource(media: CatalogMedia): MediaStorageSource {
  const url = catalogMediaPickUrl(media)

  if (
    media.bucket === 'vercel-blob' ||
    media.storageKey?.startsWith('website-media/') ||
    /\.blob\.vercel-storage\.com/i.test(url)
  ) {
    return 'vercel-blob'
  }

  if (media.storageProvider === 'R2' || /r2\.dev/i.test(url)) {
    return 'r2-legacy'
  }

  if (url.startsWith('/uploads/') || url.includes('/uploads/')) {
    return 'uploads-legacy'
  }

  if (url.startsWith('/images/') || url.startsWith('/logo') || url.startsWith('/favicon')) {
    return 'images-static'
  }

  return 'unknown'
}

export function mediaStorageSourceLabel(source: MediaStorageSource): string {
  return SOURCE_LABELS[source]
}

export function mediaStorageSourceBadgeClass(source: MediaStorageSource): string {
  switch (source) {
    case 'vercel-blob':
      return 'bg-violet-100 text-violet-800'
    case 'r2-legacy':
      return 'bg-amber-100 text-amber-900'
    case 'uploads-legacy':
      return 'bg-slate-100 text-slate-700'
    case 'images-static':
      return 'bg-emerald-100 text-emerald-800'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}
