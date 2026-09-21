export type CatalogMediaFileType = 'IMAGE' | 'DOWNLOAD' | 'DOCUMENT'

export type CatalogImageVariant = {
  width: number
  format: string
  mimeType?: string
  url: string
}

export type CatalogMedia = {
  id: string
  fileName: string
  originalName: string
  mimeType: string
  fileType: CatalogMediaFileType
  fileSize: number
  url: string
  storageKey: string | null
  storageProvider?: string
  bucket?: string | null
  publicUrl?: string | null
  createdAt: string
  updatedAt: string
  width?: number
  height?: number
  format?: string
  variants?: CatalogImageVariant[]
}

export function extractMediaUrl(raw: unknown): string {
  if (typeof raw === 'string') return raw.trim()
  if (!raw || typeof raw !== 'object') return ''

  const o = raw as Record<string, unknown>
  const nested = o.media && typeof o.media === 'object' ? (o.media as Record<string, unknown>) : null

  const candidates = [
    o.publicUrl,
    o.url,
    o.fileUrl,
    o.secureUrl,
    o.imageUrl,
    o.path,
    o.src,
    nested?.publicUrl,
    nested?.url,
    nested?.path,
  ]

  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim()
  }
  return ''
}

function toString(value: unknown, fallback = ''): string {
  return value == null ? fallback : String(value)
}

export function normalizeCatalogMedia(raw: unknown): CatalogMedia | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const id = toString(row.id)
  if (!id) return null
  const fileType = row.fileType
  const ft =
    fileType === 'IMAGE' || fileType === 'DOWNLOAD' || fileType === 'DOCUMENT' ? fileType : 'IMAGE'
  const resolvedUrl = extractMediaUrl(row)
  return {
    id,
    fileName: toString(row.fileName),
    originalName: toString(row.originalName),
    mimeType: toString(row.mimeType),
    fileType: ft,
    fileSize: Number(row.fileSize) || 0,
    url: resolvedUrl,
    storageKey: row.storageKey == null ? null : toString(row.storageKey),
    storageProvider: row.storageProvider == null ? undefined : toString(row.storageProvider),
    bucket: row.bucket == null ? null : toString(row.bucket),
    publicUrl: row.publicUrl == null ? null : toString(row.publicUrl),
    createdAt: toString(row.createdAt),
    updatedAt: toString(row.updatedAt),
    width: typeof row.width === 'number' ? row.width : undefined,
    height: typeof row.height === 'number' ? row.height : undefined,
    format: row.format == null ? undefined : toString(row.format),
    variants: Array.isArray(row.variants)
      ? row.variants.reduce<CatalogImageVariant[]>((list, item) => {
          if (!item || typeof item !== 'object') return list
          const variant = item as Record<string, unknown>
          const url = typeof variant.url === 'string' ? variant.url : ''
          const width = Number(variant.width)
          if (!url || !width) return list
          list.push({
            width,
            format: toString(variant.format),
            mimeType: variant.mimeType == null ? undefined : toString(variant.mimeType),
            url,
          })
          return list
        }, [])
      : undefined,
  }
}

export function normalizeCatalogMediaList(raw: unknown): CatalogMedia[] {
  if (!Array.isArray(raw)) return []
  return raw.map(normalizeCatalogMedia).filter((x): x is CatalogMedia => x !== null)
}

export function catalogMediaPickUrl(media: CatalogMedia): string {
  return media.url || media.publicUrl || ''
}
