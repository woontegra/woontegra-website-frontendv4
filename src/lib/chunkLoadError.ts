export const CHUNK_RELOAD_SESSION_KEY = 'woontegra_chunk_reload_attempted'

const CHUNK_ERROR_PATTERNS = [
  'Failed to fetch dynamically imported module',
  'dynamically imported module',
  'Importing a module script failed',
  'Loading chunk',
  'ChunkLoadError',
  'error loading dynamically imported module',
  'Unable to preload CSS',
] as const

function collectErrorText(error: unknown): string {
  const parts: string[] = []
  if (typeof error === 'string') {
    parts.push(error)
  } else if (error instanceof Error) {
    parts.push(error.name, error.message)
    if (error.stack) parts.push(error.stack)
  } else if (typeof error === 'object' && error !== null) {
    if ('message' in error) parts.push(String((error as { message: unknown }).message))
    if ('statusText' in error) parts.push(String((error as { statusText: unknown }).statusText))
  } else if (error != null) {
    parts.push(String(error))
  }
  return parts.filter(Boolean).join(' ')
}

export function isChunkLoadError(error: unknown): boolean {
  const message = collectErrorText(error)
  if (!message) return false
  if (CHUNK_ERROR_PATTERNS.some((pattern) => message.includes(pattern))) return true
  return /\/assets\/[^?\s"']+\.js/i.test(message)
}

export function clearChunkReloadAttemptFlag(): void {
  try {
    sessionStorage.removeItem(CHUNK_RELOAD_SESSION_KEY)
  } catch {
    /* ignore */
  }
}

/** İlk denemede true döner ve flag set eder; daha önce denendiyse false. */
export function markChunkReloadAttempted(): boolean {
  try {
    if (sessionStorage.getItem(CHUNK_RELOAD_SESSION_KEY) === '1') return false
    sessionStorage.setItem(CHUNK_RELOAD_SESSION_KEY, '1')
    return true
  } catch {
    return false
  }
}
