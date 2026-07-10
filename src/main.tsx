import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from '@/app/providers'
import { AppRootErrorBoundary } from '@/components/common/AppRootErrorBoundary'
import { cleanupLegacyClientCaches } from '@/lib/legacyCacheCleanup'
import '@/index.css'

declare global {
  interface Window {
    __woontegraAppMounted?: boolean
  }
}

const rootEl = document.getElementById('root')

function showBootstrapError(error: unknown): void {
  if (!rootEl) return
  const detail = error instanceof Error ? error.message : String(error)
  console.error('[bootstrap] root render failed', error)
  rootEl.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f8fafc;padding:24px;font-family:system-ui,sans-serif;">
      <div style="max-width:28rem;border:1px solid #e2e8f0;border-radius:16px;background:#fff;padding:32px;text-align:center;">
        <h1 style="margin:0;font-size:1.125rem;font-weight:700;color:#0f172a;">Site yüklenirken hata oluştu</h1>
        <p style="margin:12px 0 0;font-size:.875rem;color:#475569;">Lütfen sayfayı yenileyin.</p>
        <p style="margin:12px 0 0;font-size:.75rem;color:#64748b;word-break:break-word;">${detail}</p>
        <button type="button" onclick="window.location.reload()" style="margin-top:20px;border:0;border-radius:8px;background:#059669;color:#fff;padding:10px 16px;font-size:.875rem;cursor:pointer;">Sayfayı yenile</button>
      </div>
    </div>
  `
}

if (!rootEl) {
  console.error('[bootstrap] #root element not found')
} else {
  try {
    createRoot(rootEl).render(
      <StrictMode>
        <AppRootErrorBoundary>
          <AppProviders />
        </AppRootErrorBoundary>
      </StrictMode>,
    )
    window.__woontegraAppMounted = true
    void cleanupLegacyClientCaches().catch((error) => {
      console.warn('[legacyCacheCleanup] background cleanup failed', error)
    })
  } catch (error) {
    showBootstrapError(error)
  }
}
