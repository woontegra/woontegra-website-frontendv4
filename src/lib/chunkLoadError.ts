import { CHUNK_RELOAD_SESSION_KEY, clearRecoverySessionState } from '@/lib/recoveryStorage'

export { CHUNK_RELOAD_SESSION_KEY } from '@/lib/recoveryStorage'

const CHUNK_ERROR_PATTERNS = [
  'Failed to fetch dynamically imported module',
  'dynamically imported module',
  'Importing a module script failed',
  'Loading chunk',
  'ChunkLoadError',
  'error loading dynamically imported module',
  'Unable to preload CSS',
  'Failed to load module script',
] as const

const ASSET_URL_PATTERN = /\/assets\/[^\s"'<>]+\.(?:js|css)/i

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

export function isAssetChunkUrl(url: string): boolean {
  return ASSET_URL_PATTERN.test(url)
}

export function isChunkLoadError(error: unknown): boolean {
  const message = collectErrorText(error)
  if (!message) return false
  if (CHUNK_ERROR_PATTERNS.some((pattern) => message.includes(pattern))) return true
  if (ASSET_URL_PATTERN.test(message)) return true
  return false
}

export function clearChunkReloadAttemptFlag(): void {
  clearRecoverySessionState()
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
