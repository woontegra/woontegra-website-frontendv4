export const AKTUERYA_PRODUCT_SLUG = 'aktuerya-hesaplama'
export const AKTUERYA_SAAS_APP_CODE = 'AKTUERYA_SAAS'
export const AKTUERYA_DESKTOP_APP_CODE = 'AKTUERYA_DESKTOP'

export type AktueryaBillingPlan = 'monthly' | 'yearly'
export type AktueryaSalesChannel = 'web' | 'windows' | 'macos'
export type AktueryaDesktopPlatform = 'WINDOWS' | 'MACOS'

export type AktueryaChannelPrices = {
  monthlyTl: number
  yearlyTl: number
  downloadUrl: string
  deviceLimit: number
}

export type AktueryaProductOffers = {
  web: AktueryaChannelPrices
  windows: AktueryaChannelPrices
  macos: AktueryaChannelPrices
}

export type AktueryaSaleOption = {
  channel: AktueryaSalesChannel
  plan: AktueryaBillingPlan
  priceTl: number
  licenseDays: number
  licenseAppCode: string
  platform: AktueryaDesktopPlatform | null
  slug: string
}

export const AKTUERYA_DEFAULT_OFFERS: AktueryaProductOffers = {
  web: { monthlyTl: 3000, yearlyTl: 30000, downloadUrl: '', deviceLimit: 1 },
  windows: { monthlyTl: 2500, yearlyTl: 25000, downloadUrl: '', deviceLimit: 1 },
  macos: { monthlyTl: 2500, yearlyTl: 25000, downloadUrl: '', deviceLimit: 1 },
}

export function isAktueryaCatalogSlug(slug: string | null | undefined): boolean {
  return slug?.trim().toLowerCase() === AKTUERYA_PRODUCT_SLUG
}

function channelFromApi(raw: unknown, fallback: AktueryaChannelPrices): AktueryaChannelPrices {
  if (!raw || typeof raw !== 'object') return { ...fallback }
  const row = raw as Record<string, unknown>
  const monthly = Number(row.monthlyTl)
  const yearly = Number(row.yearlyTl)
  const deviceLimit = Number(row.deviceLimit)
  return {
    monthlyTl: Number.isFinite(monthly) && monthly >= 0 ? monthly : fallback.monthlyTl,
    yearlyTl: Number.isFinite(yearly) && yearly >= 0 ? yearly : fallback.yearlyTl,
    downloadUrl: typeof row.downloadUrl === 'string' ? row.downloadUrl.trim() : fallback.downloadUrl,
    deviceLimit: Number.isFinite(deviceLimit) && deviceLimit >= 1 ? Math.floor(deviceLimit) : fallback.deviceLimit,
  }
}

/** Kayıtlı teklif yoksa null. Varsayılan fiyatlar yalnız bu null durumunda kullanılır. */
export function readAktueryaOffersFromApi(raw: unknown): AktueryaProductOffers | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const downloadFiles =
    row.downloadFiles && typeof row.downloadFiles === 'object'
      ? (row.downloadFiles as Record<string, unknown>)
      : null
  const stored = row.aktueryaOffers ?? downloadFiles?.aktueryaOffers
  if (!stored || typeof stored !== 'object') return null
  const body = stored as Record<string, unknown>
  if (!body.web && !body.windows && !body.macos) return null
  return {
    web: channelFromApi(body.web, AKTUERYA_DEFAULT_OFFERS.web),
    windows: channelFromApi(body.windows, AKTUERYA_DEFAULT_OFFERS.windows),
    macos: channelFromApi(body.macos, AKTUERYA_DEFAULT_OFFERS.macos),
  }
}

export function aktueryaOfferForSelection(
  channel: AktueryaSalesChannel,
  plan: AktueryaBillingPlan,
  offers: AktueryaProductOffers = AKTUERYA_DEFAULT_OFFERS,
): AktueryaSaleOption {
  const prices = offers[channel]
  const desktop = channel === 'windows' || channel === 'macos'
  return {
    channel,
    plan,
    slug: AKTUERYA_PRODUCT_SLUG,
    priceTl: plan === 'monthly' ? prices.monthlyTl : prices.yearlyTl,
    licenseDays: plan === 'monthly' ? 30 : 365,
    licenseAppCode: desktop ? AKTUERYA_DESKTOP_APP_CODE : AKTUERYA_SAAS_APP_CODE,
    platform: channel === 'windows' ? 'WINDOWS' : channel === 'macos' ? 'MACOS' : null,
  }
}

export function aktueryaPurchaseHref(authed: boolean, returnPath: string): string | null {
  if (authed) return null
  return `/giris?return=${encodeURIComponent(returnPath)}`
}

export function aktueryaLineLabel(channel: AktueryaSalesChannel, plan: AktueryaBillingPlan): string {
  const platform = channel === 'web' ? 'Web' : channel === 'windows' ? 'Windows' : 'macOS'
  return `${platform} ${plan === 'monthly' ? 'Aylık' : 'Yıllık'}`
}
