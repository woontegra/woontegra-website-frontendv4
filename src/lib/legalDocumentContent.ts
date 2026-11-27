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

/**
 * Admin paneli için metne eklenmiş iç notları müşteriye göstermez:
 * "Yönetim notu" paragrafı ve "DOWNLOAD/SAAS varyantı —" ara başlıkları (Dijital Teslim Onayı).
 */
export function stripLegalAdminNotes(html: string): string {
  return html
    .replace(/<p[^>]*class="[^"]*legal-admin-note[^"]*"[^>]*>[\s\S]*?<\/p>/gi, '')
    .replace(/<h2[^>]*>\s*(?:DOWNLOAD|SAAS) varyantı\s*—[\s\S]*?<\/h2>/gi, '')
}

export function resolvePublicLegalHtml(type: LegalDocType, content: string | null | undefined): string {
  if (!isPlaceholderLegalHtml(content)) return stripLegalAdminNotes(content!.trim())
  return stripLegalAdminNotes(resolveLegalDocumentHtml(type, content))
}
