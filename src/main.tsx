import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from '@/app/providers'
import { AppRootErrorBoundary } from '@/components/common/AppRootErrorBoundary'
import { initChunkLoadRecovery } from '@/lib/chunkLoadRecovery'
import { cleanupLegacyClientCaches } from '@/lib/legacyCacheCleanup'
import { showPreReactBootMessage } from '@/lib/cacheBustReload'
import '@/index.css'

initChunkLoadRecovery()

async function bootstrap() {
  await cleanupLegacyClientCaches()

  const rootEl = document.getElementById('root')
  if (!rootEl) return

  try {
    createRoot(rootEl).render(
      <StrictMode>
        <AppRootErrorBoundary>
          <AppProviders />
        </AppRootErrorBoundary>
      </StrictMode>,
    )
  } catch (error) {
    console.error('[bootstrap] root render failed', error)
    showPreReactBootMessage(
      'Site yüklenemedi',
      'Woontegra açılırken bir sorun oluştu. Lütfen sayfayı yenileyin.',
    )
  }
}

void bootstrap()
