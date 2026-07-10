import { markChunkReloadAttempted } from '@/lib/chunkLoadError'
import { performCleanRecoveryReload, stripRecoveryUrlParams } from '@/lib/recoveryStorage'

const CACHE_BUST_PARAM = '__v'

export function cacheBustReload(): boolean {
  if (!markChunkReloadAttempted()) return false

  const url = stripRecoveryUrlParams(new URL(window.location.href))
  url.searchParams.set(CACHE_BUST_PARAM, Date.now().toString())
  window.location.replace(url.toString())
  return true
}

export { performCleanRecoveryReload } from '@/lib/recoveryStorage'

export function mountRecoveryPrompt(title: string, message: string, detail?: string): void {
  const root = document.getElementById('root')
  if (!root) return

  root.replaceChildren()

  const wrap = document.createElement('div')
  wrap.style.cssText =
    'min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f8fafc;padding:24px;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;'

  const card = document.createElement('div')
  card.style.cssText =
    'max-width:28rem;border:1px solid #e2e8f0;border-radius:16px;background:#fff;padding:32px;text-align:center;box-shadow:0 1px 2px rgba(15,23,42,.06);'

  const heading = document.createElement('h1')
  heading.textContent = title
  heading.style.cssText = 'margin:0;font-size:1.25rem;font-weight:700;color:#0f172a;'

  const body = document.createElement('p')
  body.textContent = message
  body.style.cssText = 'margin:12px 0 0;font-size:.875rem;line-height:1.6;color:#475569;'

  card.appendChild(heading)
  card.appendChild(body)

  if (detail) {
    const tech = document.createElement('p')
    tech.textContent = detail
    tech.style.cssText =
      'margin:12px 0 0;font-size:.75rem;line-height:1.5;color:#64748b;word-break:break-word;text-align:left;background:#f8fafc;border-radius:8px;padding:10px;'
    card.appendChild(tech)
  }

  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = 'Sayfayı yenile'
  button.style.cssText =
    'margin-top:24px;border:0;border-radius:10px;background:#059669;color:#fff;padding:10px 16px;font-size:.875rem;font-weight:600;cursor:pointer;'
  button.addEventListener('click', () => performCleanRecoveryReload())

  card.appendChild(button)
  wrap.appendChild(card)
  root.appendChild(wrap)
}
