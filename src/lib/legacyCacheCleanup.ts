const LEGACY_CACHE_KEY_PATTERNS = [
  'woontegra',
  'workbox',
  'vite-pwa',
  'precache',
  'app-shell',
  'sw-precache',
] as const

function isWoontegraManagedCache(name: string): boolean {
  const lower = name.toLowerCase()
  return LEGACY_CACHE_KEY_PATTERNS.some((pattern) => lower.includes(pattern))
}

/** Eski deploy'lardan kalan service worker kayıtlarını kaldırır. */
export async function unregisterLegacyServiceWorkers(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))
  } catch (error) {
    console.warn('[legacyCacheCleanup] service worker unregister failed', error)
  }
}

/** Woontegra domain cache storage kayıtlarını temizler. */
export async function clearLegacyAppCaches(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return

  try {
    const keys = await caches.keys()
    await Promise.all(keys.filter(isWoontegraManagedCache).map((key) => caches.delete(key)))
  } catch (error) {
    console.warn('[legacyCacheCleanup] cache storage cleanup failed', error)
  }
}

export async function cleanupLegacyClientCaches(): Promise<void> {
  await unregisterLegacyServiceWorkers()
  await clearLegacyAppCaches()
}
