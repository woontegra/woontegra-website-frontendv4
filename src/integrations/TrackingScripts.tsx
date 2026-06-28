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



function injectScript(id: string, html: string, target: 'head' | 'body' = 'head') {

  if (document.getElementById(id)) return

  const container = document.createElement('div')

  container.innerHTML = html.trim()

  const node = container.firstElementChild

  if (!node) return

  node.id = id

  if (target === 'body') document.body.prepend(node)

  else document.head.appendChild(node)

}



function loadGa4(cfg: PublicAnalyticsConfig['googleAnalytics']) {

  const id = cfg.measurementId.trim()

  if (!cfg.enabled || !id || LOADED.ga) return



  window.dataLayer = window.dataLayer || []

  window.gtag = function gtag(...args: unknown[]) {

    window.dataLayer?.push(args)

  }



  injectScript(

    'woontegra-ga4-loader',

    `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>`,

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

    injectScript(

      'woontegra-gtm-head',

      `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','${layer}','${id}');</script>`,

    )

  }



  if (cfg.bodyNoscriptEnabled) {

    injectScript(

      'woontegra-gtm-noscript',

      `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${id}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`,

      'body',

    )

  }



  LOADED.gtm = true

}



function loadMeta(cfg: PublicAnalyticsConfig['metaPixel']) {

  const id = cfg.pixelId.trim()

  if (!cfg.enabled || !id || LOADED.meta) return



  injectScript(

    'woontegra-meta-pixel',

    `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod? n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');</script>`,

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

      const path = location.pathname + location.search

      lastPath.current = ''

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


