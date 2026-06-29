import { useEffect, useState } from 'react'
import { preloadImage } from '@/lib/preloadImage'

type PreloadState = 'idle' | 'loading' | 'loaded' | 'error'

/**
 * Görsel URL hazır olunca preload eder; yüklendi veya hata verdiğinde ready=true.
 */
export function usePreloadedImage(url: string | null | undefined) {
  const [state, setState] = useState<PreloadState>(() => (url?.trim() ? 'loading' : 'loaded'))

  useEffect(() => {
    const trimmed = url?.trim()
    if (!trimmed) {
      setState('loaded')
      return
    }

    let cancelled = false
    setState('loading')

    preloadImage(trimmed).then((result) => {
      if (cancelled) return
      setState(result === 'loaded' ? 'loaded' : 'error')
    })

    return () => {
      cancelled = true
    }
  }, [url])

  return {
    ready: state === 'loaded' || state === 'error',
    loaded: state === 'loaded',
    failed: state === 'error',
    loading: state === 'loading',
  }
}
