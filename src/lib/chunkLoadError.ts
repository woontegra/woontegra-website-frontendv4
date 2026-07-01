export const CHUNK_RELOAD_SESSION_KEY = 'woontegra_chunk_reload_attempted'

const CHUNK_ERROR_PATTERNS = [
  'Failed to fetch dynamically imported module',
  'Importing a module script failed',
  'Loading chunk',
  'ChunkLoadError',
  'dynamically imported module',
] as const

function extractErrorMessage(error: unknown): string {
  if (!error) return ''
  if (typeof error === 'string') return error
  if (error instanceof Error) return `${error.name}: ${error.message}`
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return String(error)
}

export function isChunkLoadError(error: unknown): boolean {
  const message = extractErrorMessage(error)
  return CHUNK_ERROR_PATTERNS.some((pattern) => message.includes(pattern))
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
