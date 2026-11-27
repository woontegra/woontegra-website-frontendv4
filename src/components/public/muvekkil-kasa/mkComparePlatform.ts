import type { ProductPlatformFamily } from '@/components/public/product/softwarePlatforms'
import {
  MK_COMPARE_CARD_DESKTOP_ID,
  MK_COMPARE_CARD_SAAS_ID,
  MK_COMPARE_SLUG,
  type MkCompareEdition,
} from '@/components/public/muvekkil-kasa/comparePageUtils'

export type MkComparePlatform = 'web' | 'windows' | 'macos'

export const MK_COMPARE_PLATFORMS: readonly MkComparePlatform[] = ['web', 'windows', 'macos']
export const MK_COMPARE_DEFAULT_PLATFORM: MkComparePlatform = 'web'
export const MK_COMPARE_CARD_MACOS_ID = 'mk-card-macos'
export const MK_LAUNCH_PRICE_LABEL = 'LANSMANA ÖZEL'

/** Picker yalnız etiket/özet kullanır; satış her üç sekmede de canlıdır. */
export const MUVEKKIL_KASA_PLATFORM_FAMILY: ProductPlatformFamily = {
  productSlug: MK_COMPARE_SLUG,
  defaultPlatform: MK_COMPARE_DEFAULT_PLATFORM,
  platforms: [
    { id: 'web', label: 'WEB', summary: 'Tarayıcıdan kullanım', billingTerms: ['yearly'], checkout: 'live-web' },
    {
      id: 'windows',
      label: 'WINDOWS',
      summary: 'Windows masaüstü uygulaması',
      billingTerms: ['yearly'],
      checkout: 'live-web',
      hiddenFromPublic: true,
    },
    {
      id: 'macos',
      label: 'macOS',
      summary: 'Mac masaüstü uygulaması',
      billingTerms: ['yearly'],
      checkout: 'live-web',
      hiddenFromPublic: true,
    },
  ],
}

/** ?surum= → sekme. saas/masaustu bağlantıları korunur; tanınmayan değer null. */
export function parseMkComparePlatformParam(value: string | null | undefined): MkComparePlatform | null {
  const v = value?.trim().toLowerCase()
  if (!v) return null
  if (v === 'saas' || v === 'web') return 'web'
  if (v === 'masaustu' || v === 'windows') return 'windows'
  if (v === 'macos' || v === 'mac') return 'macos'
  return null
}

/** Sekme müşteriden gizli mi (MUVEKKIL_KASA_PLATFORM_FAMILY içindeki hiddenFromPublic). */
export function isMkComparePlatformHidden(platform: MkComparePlatform): boolean {
  return Boolean(MUVEKKIL_KASA_PLATFORM_FAMILY.platforms.find((p) => p.id === platform)?.hiddenFromPublic)
}

/** Müvekkil Kasa masaüstü ürün sayfalarının (slug) hangi sekmeye ait olduğu. */
const MK_DESKTOP_LISTING_SLUG_PLATFORM: Record<string, MkComparePlatform> = {
  'muvekkil-kasa-defteri-yazilimi': 'windows',
  'muvekkil-kasa-defteri-desktop': 'windows',
  'muvekkil-kasa-defteri-macos': 'macos',
}

/**
 * Ürün, Yazılımlar listesi ve ana sayfa ürün kartlarından gizlensin mi?
 * Sekmesi gizli (hiddenFromPublic) olan masaüstü ürünleri listelenmez; ürün kaydı, satın alma ve
 * "Lisansı Yenile" akışı aynen çalışır. Sekme tekrar açılınca ürün listeye kendiliğinden döner.
 */
export function isProductHiddenFromPublicListing(slug: string | null | undefined): boolean {
  const platform = slug ? MK_DESKTOP_LISTING_SLUG_PLATFORM[slug.trim().toLowerCase()] : undefined
  return platform ? isMkComparePlatformHidden(platform) : false
}

export function isMkComparePlatform(value: string): value is MkComparePlatform {
  return (MK_COMPARE_PLATFORMS as readonly string[]).includes(value)
}

export function mkComparePlatformCardId(platform: MkComparePlatform): string {
  if (platform === 'web') return MK_COMPARE_CARD_SAAS_ID
  if (platform === 'macos') return MK_COMPARE_CARD_MACOS_ID
  return MK_COMPARE_CARD_DESKTOP_ID
}

/** Ürün detay sekmeleri yalnız masaüstü/web ayrımı yapar; macOS masaüstü içeriğini kullanır. */
export function mkCompareEditionForPlatform(platform: MkComparePlatform): MkCompareEdition {
  return platform === 'web' ? 'saas' : 'desktop'
}

export function scrollToComparePlatformCard(platform: MkComparePlatform) {
  document.getElementById(mkComparePlatformCardId(platform))?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
