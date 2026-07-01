import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ChunkErrorFallback } from '@/components/common/ChunkErrorFallback'
import { isChunkLoadError, markChunkReloadAttempted } from '@/lib/chunkLoadError'

type Props = {
  children: ReactNode
}

type State = {
  error: unknown | null
  autoReloading: boolean
}

/** Lazy/Suspense chunk hatalarını route errorElement'ten önce yakalar. */
export class LazyChunkErrorBoundary extends Component<Props, State> {
  state: State = { error: null, autoReloading: false }

  static getDerivedStateFromError(error: unknown): Partial<State> {
    return { error }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('[LazyChunkErrorBoundary]', error, info.componentStack)
    if (isChunkLoadError(error) && markChunkReloadAttempted()) {
      this.setState({ autoReloading: true })
      window.location.reload()
    }
  }

  render() {
    if (this.state.autoReloading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <p className="text-sm text-slate-600">Sayfa güncelleniyor…</p>
        </div>
      )
    }

    if (this.state.error) {
      return <ChunkErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}
