import type { CookieConsentCategories } from '@/lib/cookieConsent'

function ensureGtag(): void {
  window.dataLayer = window.dataLayer || []
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args)
    }
  }
}

export function applyGoogleConsentMode(consent: CookieConsentCategories | null): void {
  ensureGtag()

  const analytics = consent?.analytics === true
  const marketing = consent?.marketing === true

  window.gtag?.('consent', consent ? 'update' : 'default', {
    analytics_storage: analytics ? 'granted' : 'denied',
    ad_storage: marketing ? 'granted' : 'denied',
    ad_user_data: marketing ? 'granted' : 'denied',
    ad_personalization: marketing ? 'granted' : 'denied',
    ...(consent ? {} : { wait_for_update: 500 }),
  })
}

export function initDeniedConsentDefaults(): void {
  applyGoogleConsentMode(null)
}
