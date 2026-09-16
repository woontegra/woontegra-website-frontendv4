/**
 * Open-redirect koruması: yalnızca aynı origin internal path'lere izin ver.
 * `//evil.com`, `https://…`, `\…` reddedilir.
 */
export function safeInternalReturnPath(
  raw: string | null | undefined,
  fallback = '/hesabim',
): string {
  if (raw == null) return fallback
  const trimmed = String(raw).trim()
  if (!trimmed.startsWith('/')) return fallback
  if (trimmed.startsWith('//')) return fallback
  if (trimmed.includes('\\')) return fallback
  if (trimmed.includes('://')) return fallback
  return trimmed
}
