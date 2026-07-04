import type { PublicNavigationMenuItem } from '@/types/navigationMenu'
import { resolvePublicHref } from '@/lib/publicNavUrl'
import { isRemovedServiceSlug, resolveServiceSlug } from '@/lib/serviceSlugs'
import type { ServiceCardConfig, ServiceCardsBundle } from '@/data/serviceCardsContent'

export type CanonicalService = {
  slug: string
  title: string
  path: string
  description: string
  tag: string
  icon: string
  gradient: string
  order: number
}

/** Header dropdown ve /hizmetler landing — tek kaynak (sıra önemli) */
export const CANONICAL_PUBLIC_SERVICES: CanonicalService[] = [
  {
    slug: 'saas',
    title: 'SaaS Ürün Geliştirme',
    path: '/hizmetler/saas',
    description: 'Abonelik modeliyle çalışan, ölçeklenebilir ve çok kiracılı SaaS ürünleri geliştiriyoruz.',
    tag: 'SaaS',
    icon: 'Cloud',
    gradient: 'from-sky-500 to-blue-600',
    order: 0,
  },
  {
    slug: 'web-tasarim',
    title: 'Web Tasarım',
    path: '/hizmetler/web-tasarim',
    description: 'Modern, hızlı ve dönüşüm odaklı kurumsal web siteleri ile güçlü dijital vitrinler.',
    tag: 'Kurumsal',
    icon: 'Globe',
    gradient: 'from-blue-500 to-cyan-500',
    order: 1,
  },
  {
    slug: 'yazilim-gelistirme',
    title: 'Yazılım Geliştirme',
    path: '/hizmetler/yazilim-gelistirme',
    description: 'İşletmenize özel panel, entegrasyon ve operasyon yazılımları geliştiriyoruz.',
    tag: 'Yazılım',
    icon: 'Code2',
    gradient: 'from-slate-700 to-slate-900',
    order: 2,
  },
  {
    slug: 'e-ticaret',
    title: 'E-Ticaret Çözümleri',
    path: '/hizmetler/e-ticaret',
    description: 'Satış odaklı, yönetilebilir ve ölçeklenebilir e-ticaret altyapıları kuruyoruz.',
    tag: 'Satış',
    icon: 'ShoppingCart',
    gradient: 'from-emerald-500 to-teal-500',
    order: 3,
  },
  {
    slug: 'marka-patent-vekilligi',
    title: 'Marka & Patent Vekilliği',
    path: '/hizmetler/marka-patent-vekilligi',
    description: 'Marka tescili, patent ve fikri mülkiyet süreçlerinde profesyonel vekil desteği.',
    tag: 'Hukuk',
    icon: 'Shield',
    gradient: 'from-violet-500 to-purple-500',
    order: 4,
  },
]

export const CANONICAL_SERVICE_BY_SLUG: Record<string, CanonicalService> = Object.fromEntries(
  CANONICAL_PUBLIC_SERVICES.map((s) => [s.slug, s]),
)

export const CANONICAL_SERVICE_SLUGS = new Set(CANONICAL_PUBLIC_SERVICES.map((s) => s.slug))

export function serviceSlugFromHref(href: string): string | null {
  const path = resolvePublicHref(href).split('?')[0]?.split('#')[0] ?? ''
  const match = path.match(/^\/hizmetler\/([^/]+)/i)
  if (!match?.[1]) return null
  const slug = resolveServiceSlug(match[1])
  if (isRemovedServiceSlug(slug) || !CANONICAL_SERVICE_SLUGS.has(slug)) return null
  return slug
}

export function findServicesNavItem(nav: PublicNavigationMenuItem[]): PublicNavigationMenuItem | undefined {
  return nav.find(
    (item) =>
      item.href === '/hizmetler' ||
      item.resolvedUrl === '/hizmetler' ||
      item.label.trim().toLowerCase() === 'hizmetler',
  )
}

function cmsOverridesBySlug(bundle: ServiceCardsBundle | null | undefined): Map<string, Partial<ServiceCardConfig>> {
  const map = new Map<string, Partial<ServiceCardConfig>>()
  if (!bundle?.cards?.length) return map
  for (const card of bundle.cards) {
    const slug = serviceSlugFromHref(card.href) ?? (CANONICAL_SERVICE_SLUGS.has(card.id) ? card.id : null)
    if (slug && CANONICAL_SERVICE_SLUGS.has(slug)) {
      map.set(slug, card)
    }
  }
  return map
}

function cardFromCanonical(service: CanonicalService, override?: Partial<ServiceCardConfig>, order?: number): ServiceCardConfig {
  return {
    id: service.slug,
    title: override?.title?.trim() || service.title,
    description: override?.description?.trim() || service.description,
    tag: override?.tag?.trim() || service.tag,
    icon: override?.icon?.trim() || service.icon,
    href: service.path,
    gradient: override?.gradient?.trim() || service.gradient,
    order: order ?? service.order,
    enabled: override?.enabled !== false,
  }
}

/** Header menü çocukları + CMS açıklama override → landing kartları */
export function resolvePublicServiceCards(
  nav?: PublicNavigationMenuItem[] | null,
  cmsBundle?: ServiceCardsBundle | null,
): ServiceCardConfig[] {
  const overrides = cmsOverridesBySlug(cmsBundle)
  const servicesNav = nav?.length ? findServicesNavItem(nav) : undefined
  const navChildren = servicesNav?.children?.filter((c) => serviceSlugFromHref(c.href)) ?? []

  if (navChildren.length > 0) {
    return navChildren
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((child, index) => {
        const slug = serviceSlugFromHref(child.href)!
        const base = CANONICAL_SERVICE_BY_SLUG[slug]
        const override = overrides.get(slug)
        return cardFromCanonical(
          { ...base, title: child.label.trim() || base.title, path: resolvePublicHref(child.href) },
          override,
          index,
        )
      })
      .filter((c) => c.enabled)
  }

  return CANONICAL_PUBLIC_SERVICES.map((service) =>
    cardFromCanonical(service, overrides.get(service.slug)),
  ).filter((c) => c.enabled)
}

export function defaultServiceCardsBundle(): ServiceCardsBundle {
  return { cards: resolvePublicServiceCards(null, null) }
}

export function mergeServiceCardsWithCanonical(
  cmsPartial?: Partial<ServiceCardsBundle> | null,
  nav?: PublicNavigationMenuItem[] | null,
): ServiceCardsBundle {
  const cmsBundle: ServiceCardsBundle = cmsPartial?.cards?.length
    ? { cards: cmsPartial.cards }
    : { cards: [] }
  return { cards: resolvePublicServiceCards(nav, cmsBundle) }
}
