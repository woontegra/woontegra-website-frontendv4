/**
 * Affiliate partner form product picker helpers.
 * Data still comes from /admin/products (Woontegra catalog) — this only
 * excludes known non-assignable synthetic rows and dedupes by product id/slug.
 */

/** Local-only FAZ seed slug — not a real catalog assignment target. */
export const BILIRKISI_HESAP_LOCAL_TEST_SLUG = 'test-bilirkisi-hesap-dev'

export function isAffiliatePickerExcludedSlug(slug: string | null | undefined): boolean {
  return String(slug || '').trim().toLowerCase() === BILIRKISI_HESAP_LOCAL_TEST_SLUG
}

export type AffiliatePickerProduct = {
  id: string
  slug: string
  name: string
  isActive?: boolean
}

/**
 * existingWoontegraProducts + Bilirkişi Hesap, without synthetic TEST BH duplicate.
 * Stable identity: product id, then slug. Never dedupe by display name.
 *
 * @param keepProductIds — already-assigned rows stay selectable on edit so rates are not blanked.
 */
export function filterAffiliateAssignableProducts<T extends AffiliatePickerProduct>(
  products: T[],
  keepProductIds: Iterable<string> = [],
): T[] {
  const keep = new Set(
    Array.from(keepProductIds)
      .map((id) => String(id || '').trim())
      .filter(Boolean),
  )
  const byId = new Map<string, T>()
  const bySlug = new Map<string, T>()

  for (const p of products) {
    if (!p?.id || !p?.slug) continue
    const kept = keep.has(p.id)
    if (!kept && isAffiliatePickerExcludedSlug(p.slug)) continue

    if (byId.has(p.id)) continue
    const slugKey = p.slug.trim().toLowerCase()
    if (bySlug.has(slugKey)) continue

    byId.set(p.id, p)
    bySlug.set(slugKey, p)
  }

  return Array.from(byId.values())
}
