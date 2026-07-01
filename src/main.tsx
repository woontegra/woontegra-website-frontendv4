import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from '@/app/providers'
import { initChunkLoadRecovery } from '@/lib/chunkLoadRecovery'
import '@/index.css'

initChunkLoadRecovery()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>,
)
