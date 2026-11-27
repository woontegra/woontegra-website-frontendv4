import { useCallback, useEffect, useRef, useState } from 'react'

/** Demo formları için Cloudflare Turnstile (robot doğrulaması). KoopPlus demo formuyla aynı site anahtarını kullanır. */
const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string
  reset: (widgetId?: string) => void
  remove: (widgetId?: string) => void
}

function getApi(): TurnstileApi | undefined {
  return (window as unknown as { turnstile?: TurnstileApi }).turnstile
}

let loadPromise: Promise<TurnstileApi> | null = null

function loadTurnstile(): Promise<TurnstileApi> {
  const ready = getApi()
  if (ready) return Promise.resolve(ready)
  if (loadPromise) return loadPromise
  loadPromise = new Promise<TurnstileApi>((resolve, reject) => {
    const done = () => {
      const api = getApi()
      if (api) resolve(api)
      else reject(new Error('turnstile unavailable'))
    }
    const existing = document.querySelector<HTMLScriptElement>('script[src^="https://challenges.cloudflare.com/turnstile/"]')
    if (existing) {
      existing.addEventListener('load', done, { once: true })
      existing.addEventListener('error', () => reject(new Error('turnstile load failed')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = TURNSTILE_SRC
    script.async = true
    script.defer = true
    script.onload = done
    script.onerror = () => reject(new Error('turnstile load failed'))
    document.head.appendChild(script)
  }).catch((err) => {
    loadPromise = null
    throw err
  })
  return loadPromise
}

export function useDemoTurnstile(active: boolean) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [token, setToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const siteKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined)?.trim() || ''

  useEffect(() => {
    if (!active) return
    setToken('')
    setError(null)
    if (!siteKey) {
      setError('Güvenlik doğrulaması yapılandırılmamış. Lütfen daha sonra tekrar deneyin.')
      return
    }
    let cancelled = false
    void loadTurnstile()
      .then((api) => {
        if (cancelled || !hostRef.current) return
        if (widgetIdRef.current) {
          api.remove(widgetIdRef.current)
          widgetIdRef.current = null
        }
        widgetIdRef.current = api.render(hostRef.current, {
          sitekey: siteKey,
          theme: 'light',
          callback: (t: string) => {
            setToken(t)
            setError(null)
          },
          'expired-callback': () => setToken(''),
          'error-callback': () => {
            setToken('')
            setError('Güvenlik doğrulaması yüklenemedi. Sayfayı yenileyip tekrar deneyin.')
          },
        })
      })
      .catch(() => {
        if (!cancelled) setError('Güvenlik doğrulaması yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin.')
      })
    return () => {
      cancelled = true
      const api = getApi()
      if (widgetIdRef.current && api) {
        try {
          api.remove(widgetIdRef.current)
        } catch {
          /* ignore */
        }
      }
      widgetIdRef.current = null
    }
  }, [active, siteKey])

  const reset = useCallback(() => {
    setToken('')
    const api = getApi()
    if (widgetIdRef.current && api) {
      try {
        api.reset(widgetIdRef.current)
      } catch {
        /* ignore */
      }
    }
  }, [])

  return { hostRef, token, error, reset }
}
