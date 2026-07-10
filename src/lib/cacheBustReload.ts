import { markChunkReloadAttempted } from '@/lib/chunkLoadError'

const CACHE_BUST_PARAM = '__v'

export function cacheBustReload(): boolean {
  if (!markChunkReloadAttempted()) return false

  const url = new URL(window.location.href)
  url.searchParams.delete(CACHE_BUST_PARAM)
  url.searchParams.set(CACHE_BUST_PARAM, Date.now().toString())
  window.location.replace(url.toString())
  return true
}

export function showPreReactBootMessage(title: string, message: string): void {
  const root = document.getElementById('root')
  if (!root) return

  root.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f8fafc;padding:24px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="max-width:28rem;border:1px solid #e2e8f0;border-radius:16px;background:#fff;padding:32px;text-align:center;box-shadow:0 1px 2px rgba(15,23,42,.06);">
        <h1 style="margin:0;font-size:1.25rem;font-weight:700;color:#0f172a;">${title}</h1>
        <p style="margin:12px 0 0;font-size:.875rem;line-height:1.6;color:#475569;">${message}</p>
        <button type="button" onclick="window.location.reload()" style="margin-top:24px;border:0;border-radius:10px;background:#059669;color:#fff;padding:10px 16px;font-size:.875rem;font-weight:600;cursor:pointer;">
          Sayfayı yenile
        </button>
      </div>
    </div>
  `
}
