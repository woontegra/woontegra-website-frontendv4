export type ConsentDefault = 'granted' | 'denied'

export type TrackingEventName =
  | 'pageView'
  | 'viewContent'
  | 'addToCart'
  | 'initiateCheckout'
  | 'purchase'
  | 'lead'
  | 'contact'
  | 'signUp'
  | 'login'
  | 'search'

export type TrackingEventToggles = Record<TrackingEventName, boolean>

export type GoogleAnalyticsSettings = {
  enabled: boolean
  measurementId: string
  measurementProtocolEnabled: boolean
  apiSecretConfigured: boolean
  apiSecretPreview: string
  debugMode: boolean
  serverContainerUrl: string
  transportUrl: string
  consentModeEnabled: boolean
  defaultConsent: ConsentDefault
}

export type GoogleTagManagerSettings = {
  enabled: boolean
  containerId: string
  dataLayerName: string
  headScriptEnabled: boolean
  bodyNoscriptEnabled: boolean
}

export type SearchConsoleSettings = {
  enabled: boolean
  verificationCode: string
}

export type MetaPixelSettings = {
  enabled: boolean
  pixelId: string
  advancedMatchingEnabled: boolean
  conversionApiEnabled: boolean
  accessTokenConfigured: boolean
  accessTokenPreview: string
  testEventCode: string
  deduplicationEnabled: boolean
  debugMode: boolean
}

export type AnalyticsSettings = {
  googleAnalytics: GoogleAnalyticsSettings
  googleTagManager: GoogleTagManagerSettings
  searchConsole: SearchConsoleSettings
  metaPixel: MetaPixelSettings
  events: TrackingEventToggles
}

/** Public-safe subset (no secrets) — stored in analyticsPublicJson for GET /settings/tracking */
export type PublicAnalyticsConfig = {
  googleAnalytics: Omit<GoogleAnalyticsSettings, 'apiSecretConfigured' | 'apiSecretPreview'>
  googleTagManager: GoogleTagManagerSettings
  searchConsole: SearchConsoleSettings
  metaPixel: Omit<MetaPixelSettings, 'accessTokenConfigured' | 'accessTokenPreview'>
  events: TrackingEventToggles
}

export const ANALYTICS_SECRET_MASK = '••••••••••••••••'

export const DEFAULT_TRACKING_EVENTS: TrackingEventToggles = {
  pageView: true,
  viewContent: true,
  addToCart: true,
  initiateCheckout: true,
  purchase: true,
  lead: true,
  contact: true,
  signUp: true,
  login: true,
  search: true,
}

export const DEFAULT_ANALYTICS_SETTINGS: AnalyticsSettings = {
  googleAnalytics: {
    enabled: false,
    measurementId: '',
    measurementProtocolEnabled: false,
    apiSecretConfigured: false,
    apiSecretPreview: '',
    debugMode: false,
    serverContainerUrl: '',
    transportUrl: '',
    consentModeEnabled: false,
    defaultConsent: 'denied',
  },
  googleTagManager: {
    enabled: false,
    containerId: '',
    dataLayerName: 'dataLayer',
    headScriptEnabled: true,
    bodyNoscriptEnabled: true,
  },
  searchConsole: {
    enabled: false,
    verificationCode: '',
  },
  metaPixel: {
    enabled: false,
    pixelId: '',
    advancedMatchingEnabled: false,
    conversionApiEnabled: false,
    accessTokenConfigured: false,
    accessTokenPreview: '',
    testEventCode: '',
    deduplicationEnabled: true,
    debugMode: false,
  },
  events: { ...DEFAULT_TRACKING_EVENTS },
}

function bool(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

function str(value: unknown, fallback = ''): string {
  if (value == null) return fallback
  return String(value).trim()
}

function parseEvents(raw: unknown): TrackingEventToggles {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_TRACKING_EVENTS }
  const o = raw as Record<string, unknown>
  const out = { ...DEFAULT_TRACKING_EVENTS }
  for (const key of Object.keys(DEFAULT_TRACKING_EVENTS) as TrackingEventName[]) {
    if (key in o) out[key] = bool(o[key], out[key])
  }
  return out
}

export function parseGoogleSiteVerificationInput(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''
  const metaMatch = trimmed.match(/content=["']([^"']+)["']/i)
  if (metaMatch?.[1]) return metaMatch[1].trim()
  return trimmed
}

export function validateGa4MeasurementId(id: string): string | null {
  const v = id.trim()
  if (!v) return null
  if (v.startsWith('UA-')) return 'Universal Analytics artık desteklenmiyor. GA4 Measurement ID kullanın.'
  if (!/^G-[A-Z0-9]+$/i.test(v)) return 'GA4 Measurement ID G- ile başlamalıdır (ör. G-XXXXXXXXXX).'
  return null
}

export function validateGtmContainerId(id: string): string | null {
  const v = id.trim()
  if (!v) return null
  if (!/^GTM-[A-Z0-9]+$/i.test(v)) return 'GTM Container ID GTM- ile başlamalıdır (ör. GTM-XXXXXXX).'
  return null
}

export function validateMetaPixelId(id: string): string | null {
  const v = id.trim()
  if (!v) return null
  if (!/^\d+$/.test(v)) return 'Meta Pixel ID yalnızca rakamlardan oluşmalıdır.'
  return null
}

export function analyticsFromAdminRaw(raw: Record<string, unknown>): AnalyticsSettings {
  let events = { ...DEFAULT_TRACKING_EVENTS }
  if (raw.trackingEventsJson) {
    try {
      events = parseEvents(JSON.parse(String(raw.trackingEventsJson)))
    } catch {
      events = { ...DEFAULT_TRACKING_EVENTS }
    }
  }

  const gaId = str(raw.googleAnalyticsId)
  const gtmId = str(raw.googleTagManagerId)
  const pixelId = str(raw.metaPixelId) || str(raw.facebookPixelId)

  return {
    googleAnalytics: {
      enabled: bool(raw.googleAnalyticsEnabled, Boolean(gaId)),
      measurementId: gaId,
      measurementProtocolEnabled: bool(raw.gaMeasurementProtocolEnabled),
      apiSecretConfigured: bool(raw.gaMeasurementApiSecretConfigured),
      apiSecretPreview: str(raw.gaMeasurementApiSecretPreview),
      debugMode: bool(raw.gaDebugMode),
      serverContainerUrl: str(raw.gaServerContainerUrl),
      transportUrl: str(raw.gaTransportUrl),
      consentModeEnabled: bool(raw.gaConsentModeEnabled),
      defaultConsent: str(raw.gaDefaultConsent, 'denied') === 'granted' ? 'granted' : 'denied',
    },
    googleTagManager: {
      enabled: bool(raw.gtmEnabled, Boolean(gtmId)),
      containerId: gtmId,
      dataLayerName: str(raw.gtmDataLayerName, 'dataLayer') || 'dataLayer',
      headScriptEnabled: bool(raw.gtmHeadScriptEnabled, true),
      bodyNoscriptEnabled: bool(raw.gtmBodyNoscriptEnabled, true),
    },
    searchConsole: {
      enabled: bool(raw.googleSearchConsoleEnabled, Boolean(raw.googleSiteVerification)),
      verificationCode: str(raw.googleSiteVerification),
    },
    metaPixel: {
      enabled: bool(raw.metaBrowserPixelEnabled, Boolean(pixelId)),
      pixelId,
      advancedMatchingEnabled: bool(raw.metaAdvancedMatchingEnabled),
      conversionApiEnabled: bool(raw.metaConversionsApiEnabled),
      accessTokenConfigured: bool(raw.metaConversionsAccessTokenConfigured),
      accessTokenPreview: str(raw.metaConversionsAccessTokenPreview),
      testEventCode: str(raw.metaTestEventCode),
      deduplicationEnabled: bool(raw.metaDeduplicationEnabled, true),
      debugMode: bool(raw.metaPixelDebugMode),
    },
    events,
  }
}

export function toPublicAnalyticsConfig(settings: AnalyticsSettings): PublicAnalyticsConfig {
  const { apiSecretConfigured: _a, apiSecretPreview: _b, ...ga } = settings.googleAnalytics
  const { accessTokenConfigured: _c, accessTokenPreview: _d, ...meta } = settings.metaPixel
  return {
    googleAnalytics: ga,
    googleTagManager: settings.googleTagManager,
    searchConsole: settings.searchConsole,
    metaPixel: meta,
    events: settings.events,
  }
}

export type AnalyticsSettingsSaveInput = AnalyticsSettings & {
  gaApiSecretInput?: string
  metaAccessTokenInput?: string
}

export function buildAnalyticsFlatPatch(input: AnalyticsSettingsSaveInput): Record<string, unknown> {
  const ga = input.googleAnalytics
  const gtm = input.googleTagManager
  const sc = input.searchConsole
  const meta = input.metaPixel

  const patch: Record<string, unknown> = {
    googleAnalyticsEnabled: ga.enabled,
    googleAnalyticsId: ga.enabled ? ga.measurementId.trim() : '',
    gaMeasurementProtocolEnabled: ga.measurementProtocolEnabled,
    gaDebugMode: ga.debugMode,
    gaServerContainerUrl: ga.serverContainerUrl.trim(),
    gaTransportUrl: ga.transportUrl.trim(),
    gaConsentModeEnabled: ga.consentModeEnabled,
    gaDefaultConsent: ga.defaultConsent,
    gtmEnabled: gtm.enabled,
    googleTagManagerId: gtm.enabled ? gtm.containerId.trim() : '',
    gtmDataLayerName: gtm.dataLayerName.trim() || 'dataLayer',
    gtmHeadScriptEnabled: gtm.headScriptEnabled,
    gtmBodyNoscriptEnabled: gtm.bodyNoscriptEnabled,
    googleSearchConsoleEnabled: sc.enabled,
    googleSiteVerification: sc.enabled ? parseGoogleSiteVerificationInput(sc.verificationCode) : '',
    metaBrowserPixelEnabled: meta.enabled,
    metaPixelId: meta.enabled ? meta.pixelId.trim() : '',
    metaAdvancedMatchingEnabled: meta.advancedMatchingEnabled,
    metaConversionsApiEnabled: meta.conversionApiEnabled,
    metaTestEventCode: meta.testEventCode.trim(),
    metaDeduplicationEnabled: meta.deduplicationEnabled,
    metaPixelDebugMode: meta.debugMode,
    trackingEventsJson: JSON.stringify(input.events),
    analyticsPublicJson: JSON.stringify(toPublicAnalyticsConfig(input)),
  }

  const gaSecret = input.gaApiSecretInput?.trim()
  if (gaSecret) patch.gaMeasurementApiSecret = gaSecret

  const metaToken = input.metaAccessTokenInput?.trim()
  if (metaToken) patch.metaConversionsAccessToken = metaToken

  return patch
}

export function parsePublicAnalyticsConfig(raw: unknown): PublicAnalyticsConfig | null {
  if (!raw || typeof raw !== 'object') return null
  const base = analyticsFromAdminRaw(raw as Record<string, unknown>)
  return toPublicAnalyticsConfig(base)
}

export function parsePublicAnalyticsJsonString(json: string | undefined | null): PublicAnalyticsConfig | null {
  if (!json?.trim()) return null
  try {
    return parsePublicAnalyticsConfig(JSON.parse(json))
  } catch {
    return null
  }
}
