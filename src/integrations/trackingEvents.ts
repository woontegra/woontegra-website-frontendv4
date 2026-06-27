import type { PublicAnalyticsConfig, TrackingEventName } from '@/types/analyticsSettings'
import { analyticsConsentGranted, marketingConsentGranted } from '@/lib/cookieConsent'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
    __woontegraTrackingConfig?: PublicAnalyticsConfig | null
  }
}

let cachedConfig: PublicAnalyticsConfig | null = null

export function setTrackingConfig(config: PublicAnalyticsConfig | null) {
  cachedConfig = config
  window.__woontegraTrackingConfig = config
}

function config(): PublicAnalyticsConfig | null {
  return cachedConfig ?? window.__woontegraTrackingConfig ?? null
}

function eventEnabled(name: TrackingEventName): boolean {
  const cfg = config()
  if (!cfg) return false
  return cfg.events[name] !== false
}

function gaActive(): boolean {
  const cfg = config()
  return Boolean(cfg?.googleAnalytics.enabled && cfg.googleAnalytics.measurementId.trim() && analyticsConsentGranted())
}

function metaActive(): boolean {
  const cfg = config()
  return Boolean(cfg?.metaPixel.enabled && cfg.metaPixel.pixelId.trim() && marketingConsentGranted())
}

function logDebug(label: string, payload?: unknown) {
  const cfg = config()
  if (!cfg) return
  if (cfg.googleAnalytics.debugMode || cfg.metaPixel.debugMode) {
    console.info(`[tracking] ${label}`, payload ?? '')
  }
}

function gtagEvent(name: string, params?: Record<string, unknown>) {
  if (!gaActive() || typeof window.gtag !== 'function') return
  window.gtag('event', name, params ?? {})
}

function fbqEvent(name: string, params?: Record<string, unknown>) {
  if (!metaActive() || typeof window.fbq !== 'function') return
  window.fbq('track', name, params ?? {})
}

export function trackPageView(path?: string) {
  if (!eventEnabled('pageView')) return
  if (!analyticsConsentGranted() && !marketingConsentGranted()) return
  const pagePath = path ?? (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/')
  if (analyticsConsentGranted()) gtagEvent('page_view', { page_path: pagePath })
  if (marketingConsentGranted()) fbqEvent('PageView')
  logDebug('page_view', { pagePath })
}

export function trackViewContent(product: { id?: string; name: string; price?: number; currency?: string }) {
  if (!eventEnabled('viewContent')) return
  const params = {
    content_ids: product.id ? [product.id] : undefined,
    content_name: product.name,
    value: product.price,
    currency: product.currency ?? 'TRY',
  }
  gtagEvent('view_item', params)
  fbqEvent('ViewContent', params)
  logDebug('view_content', params)
}

export function trackAddToCart(product: { id?: string; name: string; price?: number; currency?: string; quantity?: number }) {
  if (!eventEnabled('addToCart')) return
  const qty = product.quantity ?? 1
  const params = {
    content_ids: product.id ? [product.id] : undefined,
    content_name: product.name,
    value: product.price != null ? product.price * qty : undefined,
    currency: product.currency ?? 'TRY',
    quantity: qty,
  }
  gtagEvent('add_to_cart', params)
  fbqEvent('AddToCart', params)
  logDebug('add_to_cart', params)
}

export function trackInitiateCheckout(cart?: { value?: number; currency?: string; itemCount?: number }) {
  if (!eventEnabled('initiateCheckout')) return
  const params = {
    value: cart?.value,
    currency: cart?.currency ?? 'TRY',
    num_items: cart?.itemCount,
  }
  gtagEvent('begin_checkout', params)
  fbqEvent('InitiateCheckout', params)
  logDebug('initiate_checkout', params)
}

export function trackPurchase(order: {
  orderNo?: string
  value?: number
  currency?: string
  items?: Array<{ id?: string; name?: string; quantity?: number }>
}) {
  if (!eventEnabled('purchase')) return
  const params = {
    transaction_id: order.orderNo,
    value: order.value,
    currency: order.currency ?? 'TRY',
    items: order.items,
  }
  gtagEvent('purchase', params)
  fbqEvent('Purchase', params)
  logDebug('purchase', params)
}

export function trackLead(data?: { source?: string; email?: string }) {
  if (!eventEnabled('lead')) return
  const params = { source: data?.source ?? 'website' }
  gtagEvent('generate_lead', params)
  fbqEvent('Lead', params)
  logDebug('lead', { ...params, email: data?.email ? '[redacted]' : undefined })
}

export function trackContact(data?: { source?: string }) {
  if (!eventEnabled('contact')) return
  const params = { source: data?.source ?? 'contact_form' }
  gtagEvent('contact', params)
  fbqEvent('Contact', params)
  logDebug('contact', params)
}

export function trackSignUp(data?: { method?: string }) {
  if (!eventEnabled('signUp')) return
  const params = { method: data?.method ?? 'website' }
  gtagEvent('sign_up', params)
  fbqEvent('CompleteRegistration', params)
  logDebug('sign_up', params)
}

export function trackLogin(data?: { method?: string }) {
  if (!eventEnabled('login')) return
  const params = { method: data?.method ?? 'website' }
  gtagEvent('login', params)
  fbqEvent('CompleteRegistration', params)
  logDebug('login', params)
}

export function trackSearch(query: string) {
  if (!eventEnabled('search') || !query.trim()) return
  const params = { search_term: query.trim() }
  gtagEvent('search', params)
  fbqEvent('Search', params)
  logDebug('search', params)
}
