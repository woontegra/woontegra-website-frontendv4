import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from '@/app/providers'
import { AppRootErrorBoundary } from '@/components/common/AppRootErrorBoundary'
import { mountRecoveryPrompt } from '@/lib/cacheBustReload'
import { clearChunkReloadAttemptFlag } from '@/lib/chunkLoadError'
import { initChunkLoadRecovery } from '@/lib/chunkLoadRecovery'
import { cleanupLegacyClientCaches } from '@/lib/legacyCacheCleanup'
import {
  applyRecoveryBypassOnBoot,
  clearRecoverySessionState,
  registerCleanRecoveryReloadGlobal,
} from '@/lib/recoveryStorage'
import '@/index.css'

applyRecoveryBypassOnBoot()
registerCleanRecoveryReloadGlobal()
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
    clearRecoverySessionState()
    clearChunkReloadAttemptFlag()
  } catch (error) {
    console.error('[bootstrap] root render failed', error)
    const detail = error instanceof Error ? error.message : String(error)
    mountRecoveryPrompt(
      'Site yüklenemedi',
      'Woontegra açılırken bir sorun oluştu. Aşağıdaki düğme recovery bayraklarını temizleyerek yeniden dener.',
      detail,
    )
  }
}

void bootstrap()
