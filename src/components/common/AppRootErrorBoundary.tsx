import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ChunkErrorFallback } from '@/components/common/ChunkErrorFallback'
import { cacheBustReload } from '@/lib/cacheBustReload'
import { isChunkLoadError } from '@/lib/chunkLoadError'

type Props = {
  children: ReactNode
}

type State = {
  error: unknown | null
  autoReloading: boolean
}

/** React root seviyesinde yakalanmayan render hataları — tam beyaz ekranı engeller. */
export class AppRootErrorBoundary extends Component<Props, State> {
  state: State = { error: null, autoReloading: false }

  static getDerivedStateFromError(error: unknown): Partial<State> {
    return { error }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('[AppRootErrorBoundary]', error, info.componentStack)
    if (isChunkLoadError(error) && cacheBustReload()) {
      this.setState({ autoReloading: true })
    }
  }

  render() {
    if (this.state.autoReloading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <p className="text-sm text-slate-600">Sayfa yenileniyor…</p>
        </div>
      )
    }

    if (this.state.error) {
      return <ChunkErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}
