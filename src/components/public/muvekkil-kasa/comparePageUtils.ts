import type { PublicProductDetail } from '@/types/product'
import {
  MK_COMPARE_DESKTOP_DELIVERY_NOTE,
  MK_COMPARE_WEB_DELIVERY_NOTE,
} from '@/components/public/muvekkil-kasa/mkCompareContent'
import { isMuvekkilKasaDesktopSalesSlug } from '@/lib/muvekkilKasaDesktopProduct'
import { isMuvekkilKasaSaasProduct } from '@/lib/muvekkilKasaSaasProduct'

export const MK_DESKTOP_CANONICAL_SLUG = 'muvekkil-kasa-defteri-yazilimi'
export const MK_COMPARE_PATH = '/yazilimlar/muvekkil-kasa-defteri'
/** Page Builder / productPages slug for the unified sales page. Not a commerce SKU. */
export const MK_COMPARE_SLUG = 'muvekkil-kasa-defteri'

export function isMuvekkilKasaCompareSlug(slug?: string | null): boolean {
  return slug?.trim().toLowerCase() === MK_COMPARE_SLUG
}

export function isMkCompareBuilderPageKey(pageKey?: string | null): boolean {
  return pageKey?.trim().toLowerCase() === `product-${MK_COMPARE_SLUG}`
}
export const MK_COMPARE_PURCHASE_ID = 'urun-secimi'
export const MK_COMPARE_TABLE_ID = 'surum-karsilastirmasi'
export const MK_COMPARE_DETAILS_ID = 'urun-detaylari'
/** Satış kartı kimlikleri — tanıtım bağlantısı ?surum= ile kaydırma/vurgu */
export const MK_COMPARE_CARD_DESKTOP_ID = 'mk-card-masaustu'
export const MK_COMPARE_CARD_SAAS_ID = 'mk-card-saas'
export const MK_COMPARE_SHELL = 'mx-auto w-full max-w-[1180px] px-4 sm:px-6'

export type MkCompareEdition = 'desktop' | 'saas'

export function parseMkCompareSurumParam(value: string | null | undefined): MkCompareEdition {
  return value?.trim().toLowerCase() === 'saas' ? 'saas' : 'desktop'
}

export function mkCompareCardIdForEdition(edition: MkCompareEdition): string {
  return edition === 'saas' ? MK_COMPARE_CARD_SAAS_ID : MK_COMPARE_CARD_DESKTOP_ID
}

export function publicSoftwareDetailHref(slug: string): string {
  const normalized = slug.trim().toLowerCase()
  if (isMuvekkilKasaDesktopSalesSlug(normalized)) {
    return `${MK_COMPARE_PATH}?surum=masaustu`
  }
  if (isMuvekkilKasaSaasProduct({ slug: normalized })) {
    return `${MK_COMPARE_PATH}?surum=saas`
  }
  return `/yazilimlar/${slug}`
}

export function formatLicenseDurationFromApi(product: PublicProductDetail): string {
  if (product.licenseDays != null && product.licenseDays > 0) {
    return `${product.licenseDays} gün`
  }
  return 'Ürün detayında belirtilir'
}

export function formatDeviceRightsFromApi(product: PublicProductDetail): string {
  if (product.licenseMaxDevices != null && product.licenseMaxDevices > 0) {
    return `${product.licenseMaxDevices} cihaz`
  }
  return 'Ürün detayında belirtilir'
}

export function desktopDeliveryNotes(product: PublicProductDetail): string[] {
  const notes: string[] = [MK_COMPARE_DESKTOP_DELIVERY_NOTE]
  if (product.hasDownload) {
    notes.push('Dijital indirme bağlantısı ödeme onayı sonrası paylaşılır.')
  }
  return notes
}

export function webDeliveryNotes(): string[] {
  return [MK_COMPARE_WEB_DELIVERY_NOTE]
}

export function scrollToComparePurchase() {
  document.getElementById(MK_COMPARE_PURCHASE_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function scrollToCompareEditionCard(edition: MkCompareEdition) {
  const el = document.getElementById(mkCompareCardIdForEdition(edition))
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

export function scrollToCompareTable() {
  document.getElementById(MK_COMPARE_TABLE_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function scrollToCompareDetails() {
  document.getElementById(MK_COMPARE_DETAILS_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function featureBulletsFromProduct(product: PublicProductDetail): string[] {
  return (product.featureBullets ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}
