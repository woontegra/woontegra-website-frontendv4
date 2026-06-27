import { resolveLegalDocumentHtml } from '@/data/legalDocumentApiFallbacks'
import type { LegalDocType } from '@/types/legalDocuments'

const PLACEHOLDER_MARKERS = [
  'varsayılan metin tanımlı değildir',
  'Metin henüz yüklenemedi veya özelleştirilmedi',
  'Metin henüz yüklenemedi',
]

export function isPlaceholderLegalHtml(html: string | null | undefined): boolean {
  const body = html?.trim() ?? ''
  if (!body || body.length < 20) return true
  return PLACEHOLDER_MARKERS.some((marker) => body.includes(marker))
}

export function resolvePublicLegalHtml(type: LegalDocType, content: string | null | undefined): string {
  if (!isPlaceholderLegalHtml(content)) return content!.trim()
  return resolveLegalDocumentHtml(type, content)
}
