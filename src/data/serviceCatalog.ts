import { CANONICAL_PUBLIC_SERVICES } from '@/data/canonicalServices'
import { SERVICE_DETAIL_BY_SLUG } from '@/data/serviceDetailContent'

export type ServiceCatalogEntry = {
  slug: string
  title: string
  menuTitle: string
  path: string
}

export const SERVICE_PAGE_CONTENT_KEY = 'servicePages'

/** Public header ve landing ile hizalı hizmet listesi */
export const SERVICE_CATALOG: ServiceCatalogEntry[] = CANONICAL_PUBLIC_SERVICES.map((s) => ({
  slug: s.slug,
  title: s.title,
  menuTitle: s.title,
  path: s.path,
}))

export function getServiceBySlug(slug: string): ServiceCatalogEntry | undefined {
  return SERVICE_CATALOG.find((s) => s.slug === slug)
}

export function getServiceDetailBySlug(slug: string) {
  return SERVICE_DETAIL_BY_SLUG[slug]
}
