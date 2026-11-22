/** Ertelenmiş (henüz yüklenmemiş) blokların hepsini hemen yükletir — sayfa içi #bölüm linkleri için. */
export const MOUNT_DEFERRED_BLOCKS_EVENT = 'builder:mount-deferred-blocks'

/**
 * #id hedefini bulup kaydırır. Hedef henüz yüklenmemiş bir bloktaysa önce tüm blokları yükletir,
 * hedef görünene kadar kısa süre bekler (en fazla ~4 sn).
 */
export function scrollToPageAnchor(id: string): void {
  if (!id) return
  const existing = document.getElementById(id)
  if (existing) {
    existing.scrollIntoView({ behavior: 'smooth' })
    return
  }
  window.dispatchEvent(new Event(MOUNT_DEFERRED_BLOCKS_EVENT))
  const startedAt = Date.now()
  const timer = window.setInterval(() => {
    const el = document.getElementById(id)
    if (el) {
      window.clearInterval(timer)
      // Yeni yüklenen blokların yerleşmesi için bir kare bekle.
      window.requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth' }))
    } else if (Date.now() - startedAt > 4000) {
      window.clearInterval(timer)
    }
  }, 100)
}
