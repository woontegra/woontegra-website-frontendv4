import { BILIRKISI_HESAP_SLUG } from '@/data/canonicalSoftwareProducts'

/** Shared platform ids. A product family lists only the ones it actually sells. */
export type SoftwarePlatformId = 'web' | 'windows' | 'macos' | 'android' | 'ios'

export type PlatformBillingTerm = 'monthly' | 'yearly'

/**
 * `live-web` keeps the current Woontegra web checkout.
 * `not-connected` is a presentation card only: no checkout, order, or price.
 */
export type PlatformCheckoutMode = 'live-web' | 'not-connected'

export type DesktopPlatformPresentation = {
  salesTitle: string
  productTypeLabel: string
  platformLabel: string
  deliveryLabel: string
  licenseLabel: string
  licenseNote: string
  ctaLabel: string
}

export type SoftwarePlatformDefinition = {
  id: SoftwarePlatformId
  label: string
  summary: string
  billingTerms: PlatformBillingTerm[]
  checkout: PlatformCheckoutMode
  presentation?: DesktopPlatformPresentation
  /**
   * true: sekme müşteriye gösterilmez (ürün, fiyat ve satın alma kodu yerinde kalır).
   * Tekrar göstermek için bu satırı silmek veya false yapmak yeterlidir.
   */
  hiddenFromPublic?: boolean
}

export type ProductPlatformFamily = {
  productSlug: string
  defaultPlatform: SoftwarePlatformId
  platforms: SoftwarePlatformDefinition[]
}

const DESKTOP_LICENSE_NOTE =
  'Ödeme sonrası lisans anahtarı ve aktivasyon şifresi e-postanıza gönderilir; programın lisans aktivasyon ekranından etkinleştirilir.'

export const BILIRKISI_PLATFORM_FAMILY: ProductPlatformFamily = {
  productSlug: BILIRKISI_HESAP_SLUG,
  defaultPlatform: 'web',
  platforms: [
    {
      id: 'web',
      label: 'WEB',
      summary: 'Tarayıcıdan kullanım',
      billingTerms: ['monthly', 'yearly'],
      checkout: 'live-web',
    },
    {
      id: 'windows',
      label: 'WINDOWS',
      summary: 'Windows masaüstü uygulaması',
      billingTerms: ['yearly'],
      checkout: 'not-connected',
      hiddenFromPublic: true,
      presentation: {
        salesTitle: 'Bilirkişi Hesap — Windows',
        productTypeLabel: 'Masaüstü Uygulaması',
        platformLabel: 'Windows',
        deliveryLabel: 'Windows uygulaması',
        licenseLabel: 'Yıllık',
        licenseNote: DESKTOP_LICENSE_NOTE,
        ctaLabel: 'Windows için Satın Al',
      },
    },
    {
      id: 'macos',
      label: 'macOS',
      summary: 'Mac masaüstü uygulaması',
      billingTerms: ['yearly'],
      checkout: 'not-connected',
      hiddenFromPublic: true,
      presentation: {
        salesTitle: 'Bilirkişi Hesap — macOS',
        productTypeLabel: 'Masaüstü Uygulaması',
        platformLabel: 'macOS',
        deliveryLabel: 'macOS uygulaması',
        licenseLabel: 'Yıllık',
        licenseNote: DESKTOP_LICENSE_NOTE,
        ctaLabel: 'Mac için Satın Al',
      },
    },
  ],
}

export function getProductPlatformFamily(slug: string): ProductPlatformFamily | null {
  if (slug === BILIRKISI_HESAP_SLUG) return BILIRKISI_PLATFORM_FAMILY
  return null
}

/** Müşteriye gösterilecek sekmeler. `keepId` gizli olsa bile listede kalır (ör. lisans yenileme ile gelinen sekme). */
export function publicPlatforms(
  family: ProductPlatformFamily,
  keepId?: SoftwarePlatformId | null,
): SoftwarePlatformDefinition[] {
  return family.platforms.filter((platform) => !platform.hiddenFromPublic || platform.id === keepId)
}

/** İstenen sekme gizliyse ailenin varsayılan sekmesine döner. */
export function visiblePlatformOrDefault(
  family: ProductPlatformFamily | null | undefined,
  requested: SoftwarePlatformId | null | undefined,
): SoftwarePlatformId {
  const fallback = family?.defaultPlatform ?? 'web'
  if (!requested) return fallback
  const platform = findPlatform(family, requested)
  if (!platform || platform.hiddenFromPublic) return fallback
  return requested
}

export function desktopLicenseLabel(term: 'monthly' | 'yearly', deviceLimit: number | null): string {
  const period = term === 'monthly' ? 'Aylık' : 'Yıllık'
  if (deviceLimit == null || !Number.isInteger(deviceLimit) || deviceLimit < 1) return period
  return `${period} · ${deviceLimit} cihaz`
}

export function desktopPlatformFacts(
  presentation: DesktopPlatformPresentation,
  term: 'monthly' | 'yearly' = 'yearly',
  deviceLimit: number | null = null,
) {
  return [
    { label: 'Ürün tipi', value: presentation.productTypeLabel },
    { label: 'Platform', value: presentation.platformLabel },
    { label: 'Teslimat', value: presentation.deliveryLabel },
    { label: 'Lisans', value: desktopLicenseLabel(term, deviceLimit) },
  ]
}

export function findPlatform(
  family: ProductPlatformFamily | null | undefined,
  platformId: SoftwarePlatformId,
): SoftwarePlatformDefinition | null {
  return family?.platforms.find((platform) => platform.id === platformId) ?? null
}
