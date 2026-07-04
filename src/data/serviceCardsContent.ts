import { GRADIENT_OPTIONS, ICON_OPTIONS } from '@/lib/iconRegistry'
import {
  CANONICAL_SERVICE_SLUGS,
  defaultServiceCardsBundle,
  mergeServiceCardsWithCanonical,
  resolvePublicServiceCards,
  serviceSlugFromHref,
} from '@/data/canonicalServices'

export const SERVICE_CARDS_KEY = 'serviceCards'

export type ServiceCardConfig = {
  id: string
  title: string
  description: string
  tag: string
  icon: string
  href: string
  gradient: string
  order: number
  enabled: boolean
}

export type ServiceCardsBundle = { cards: ServiceCardConfig[] }

function normalizeCard(card: ServiceCardConfig, index: number): ServiceCardConfig | null {
  const slug = serviceSlugFromHref(card.href) ?? (CANONICAL_SERVICE_SLUGS.has(card.id) ? card.id : null)
  if (!slug || !CANONICAL_SERVICE_SLUGS.has(slug)) return null

  const icon = ICON_OPTIONS.includes(card.icon as (typeof ICON_OPTIONS)[number]) ? card.icon : 'Globe'
  const gradient = GRADIENT_OPTIONS.includes(card.gradient as (typeof GRADIENT_OPTIONS)[number])
    ? card.gradient
    : GRADIENT_OPTIONS[index % GRADIENT_OPTIONS.length]

  return {
    ...card,
    id: slug,
    icon,
    gradient,
    order: typeof card.order === 'number' ? card.order : index,
    enabled: card.enabled !== false,
  }
}

/** @deprecated Doğrudan kullanmayın — `defaultServiceCardsBundle()` veya `resolvePublicServiceCards` tercih edin */
export const defaultServiceCardsBundleLegacy = defaultServiceCardsBundle()

export { defaultServiceCardsBundle, mergeServiceCardsWithCanonical, resolvePublicServiceCards }

export function mergeServiceCards(
  defaults: ServiceCardsBundle,
  partial?: Partial<ServiceCardsBundle> | null,
): ServiceCardsBundle {
  void defaults
  const normalized = partial?.cards?.length
    ? partial.cards
        .map((card, i) => normalizeCard(card, i))
        .filter((c): c is ServiceCardConfig => c !== null)
    : []
  return { cards: resolvePublicServiceCards(null, { cards: normalized }) }
}

export function getActiveServiceCards(bundle: ServiceCardsBundle): ServiceCardConfig[] {
  return bundle.cards.filter((c) => c.enabled).sort((a, b) => a.order - b.order)
}
