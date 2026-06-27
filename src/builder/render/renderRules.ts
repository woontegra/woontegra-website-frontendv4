/**
 * Public renderer kuralları:
 * - Boş alan render edilmez
 * - Gri placeholder yok
 * - Kırık görsel ikonu yok
 */

export function hasText(value?: string | null): boolean {
  return Boolean(value?.trim())
}

export function hasMedia(ref?: { url?: string | null } | null): boolean {
  return Boolean(ref?.url?.trim())
}

export function renderIfText(value?: string | null): string | null {
  const t = value?.trim()
  return t ? t : null
}

export function renderIfMediaUrl(url?: string | null): string | null {
  const t = url?.trim()
  return t ? t : null
}

export function shouldShowField(
  visible: boolean | undefined,
  value: unknown,
  checkEmpty: (v: unknown) => boolean = (v) => !v,
): boolean {
  if (visible === false) return false
  return !checkEmpty(value)
}
