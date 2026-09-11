import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { usePublicTrackingSettings } from '@/hooks/usePublicTrackingSettings'
import { getCookieConsent, hasCookieConsent, onConsentChange } from '@/lib/cookieConsent'
import { applyGoogleConsentMode, initDeniedConsentDefaults } from '@/lib/consentMode'
import { setTrackingConfig, trackPageView } from '@/integrations/trackingEvents'
import type { PublicAnalyticsConfig } from '@/types/analyticsSettings'

const LOADED = {
  ga: false,
  gtm: false,
  meta: false,
}

function upsertMeta(name: string, content: string) {
  if (!content.trim()) return
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content.trim())
}

/** Executable script injection — never use innerHTML for <script> (browsers skip execution). */
function injectExternalScript(id: string, src: string, attrs?: { async?: boolean }) {
  if (document.getElementById(id)) return
  const script = document.createElement('script')
  script.id = id
  script.src = src
  if (attrs?.async !== false) script.async = true
  document.head.appendChild(script)
}

function injectInlineScript(id: string, code: string) {
  if (document.getElementById(id)) return
  const script = document.createElement('script')
  script.id = id
  script.textContent = code
  document.head.appendChild(script)
}

function injectNoscriptIframe(id: string, src: string) {
  if (document.getElementById(id)) return
  const noscript = document.createElement('noscript')
  noscript.id = id
  const iframe = document.createElement('iframe')
  iframe.src = src
  iframe.height = '0'
  iframe.width = '0'
  iframe.style.display = 'none'
  iframe.style.visibility = 'hidden'
  iframe.title = 'Google Tag Manager'
  noscript.appendChild(iframe)
  document.body.prepend(noscript)
}

function loadGa4(cfg: PublicAnalyticsConfig['googleAnalytics']) {
  const id = cfg.measurementId.trim()
  if (!cfg.enabled || !id || LOADED.ga) return

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args)
  }

  injectExternalScript(
    'woontegra-ga4-loader',
    `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`,
  )

  const gaConfig: Record<string, unknown> = { send_page_view: false }
  if (cfg.debugMode) gaConfig.debug_mode = true
  if (cfg.transportUrl.trim()) gaConfig.transport_url = cfg.transportUrl.trim()
  if (cfg.serverContainerUrl.trim()) gaConfig.server_container_url = cfg.serverContainerUrl.trim()

  window.gtag('js', new Date())
  window.gtag('config', id, gaConfig)
  LOADED.ga = true
}

function loadGtm(cfg: PublicAnalyticsConfig['googleTagManager']) {
  const id = cfg.containerId.trim()
  if (!cfg.enabled || !id || LOADED.gtm) return
  const layer = cfg.dataLayerName.trim() || 'dataLayer'

  if (cfg.headScriptEnabled) {
    // Standard GTM bootstrap (layer name + container id escaped for string literals)
    const safeLayer = layer.replace(/[^a-zA-Z0-9_$]/g, '') || 'dataLayer'
    const safeId = id.replace(/[^A-Z0-9-]/gi, '')
    injectInlineScript(
      'woontegra-gtm-head',
      `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','${safeLayer}','${safeId}');`,
    )
  }

  if (cfg.bodyNoscriptEnabled) {
    injectNoscriptIframe(
      'woontegra-gtm-noscript',
      `https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(id)}`,
    )
  }

  LOADED.gtm = true
}

function loadMeta(cfg: PublicAnalyticsConfig['metaPixel']) {
  const id = cfg.pixelId.trim()
  if (!cfg.enabled || !id || LOADED.meta) return
  if (!/^\d+$/.test(id)) return

  // Official Meta Pixel stub + async fbevents.js loader (must execute via textContent).
  injectInlineScript(
    'woontegra-meta-pixel',
    `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');`,
  )

  LOADED.meta = true
}

function bootTracking(config: PublicAnalyticsConfig) {
  const consent = getCookieConsent()

  if (config.googleAnalytics.consentModeEnabled) {
    if (!consent) initDeniedConsentDefaults()
    else applyGoogleConsentMode(consent)
  } else if (consent) {
    applyGoogleConsentMode(consent)
  }

  if (consent?.analytics) {
    loadGa4(config.googleAnalytics)
    loadGtm(config.googleTagManager)
  }

  if (consent?.marketing) {
    loadMeta(config.metaPixel)
  }
}

export function TrackingScripts() {
  const { data: config } = usePublicTrackingSettings()
  const location = useLocation()
  const lastPath = useRef('')
  const ready = useRef(false)

  useEffect(() => {
    setTrackingConfig(config ?? null)
    if (!config) return

    if (config.searchConsole.enabled && config.searchConsole.verificationCode.trim()) {
      upsertMeta('google-site-verification', config.searchConsole.verificationCode)
    }

    if (!hasCookieConsent()) {
      if (config.googleAnalytics.consentModeEnabled) initDeniedConsentDefaults()
      ready.current = false
      return
    }

    bootTracking(config)
    ready.current = true
  }, [config])

  useEffect(() => {
    if (!config) return

    const unsubscribe = onConsentChange(() => {
      if (!config) return
      bootTracking(config)
      ready.current = hasCookieConsent()
      if (!ready.current) {
        lastPath.current = ''
        return
      }
      const path = location.pathname + location.search
      // Reset so this consent-triggered view is the sole PageView for the current path.
      lastPath.current = path
      trackPageView(path)
    })

    return unsubscribe
  }, [config, location.pathname, location.search])

  useEffect(() => {
    if (!config || !ready.current) return
    const path = location.pathname + location.search
    if (path === lastPath.current) return
    lastPath.current = path
    trackPageView(path)
  }, [location.pathname, location.search, config])

  return null
}
