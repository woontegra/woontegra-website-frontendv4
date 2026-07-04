import { SOLUTION_DETAIL_BY_SLUG } from '@/data/solutionDetailContent'

/** Siteden kaldırılmış çözüm slug'ları — menü ve builder seçicide görünmez */
export const REMOVED_SOLUTION_SLUGS = new Set(['datca-topikal', 'bilirkisi-hesaplama'])

export const SOLUTION_SLUG_ALIASES: Record<string, string> = {
  'stok-fiyat-yonetimi': 'stok-fiyat-yonetimi',
  'stok-yonetimi': 'stok-fiyat-yonetimi',
}

export function isRemovedSolutionSlug(slug: string): boolean {
  return REMOVED_SOLUTION_SLUGS.has(slug.trim().toLowerCase())
}

export function resolveSolutionSlug(slug: string): string {
  const key = slug.trim().toLowerCase()
  return SOLUTION_SLUG_ALIASES[key] ?? key
}

export function isKnownSolutionSlug(slug: string): boolean {
  const key = resolveSolutionSlug(slug)
  if (!key || isRemovedSolutionSlug(key)) return false
  return Boolean(SOLUTION_DETAIL_BY_SLUG[key])
}

export function canonicalSolutionPath(slug: string): string {
  return `/cozumler/${resolveSolutionSlug(slug)}`
}

export const KNOWN_SOLUTION_SLUGS = new Set(Object.keys(SOLUTION_DETAIL_BY_SLUG))
