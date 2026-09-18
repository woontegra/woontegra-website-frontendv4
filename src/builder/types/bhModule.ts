import type { PublishStatus } from './common'
import type { BuilderBlock } from './blocks'

/** CMS contentKey — BH modül detay sayfaları (Woontegra Page Builder) */
export const BH_MODULE_PAGES_CONTENT_KEY = 'bhModulePages'

export const BH_MODULES_INDEX_PATH = '/yazilimlar/bilirkisi-hesap/moduller'

export function bhModuleDetailPath(slug: string): string {
  return `${BH_MODULES_INDEX_PATH}/${slug}`
}

/** BH `code` → Woontegra SEO public slug */
export const BH_CODE_TO_SEO_SLUG: Record<string, string> = {
  kidem: 'kidem-tazminati-nasil-hesaplanir',
  ihbar: 'ihbar-tazminati-nasil-hesaplanir',
  'fazla-mesai': 'fazla-mesai-nasil-hesaplanir',
  'yillik-izin': 'yillik-izin-ucreti-nasil-hesaplanir',
  ubgt: 'ubgt-ucreti-nasil-hesaplanir',
  'hafta-tatili': 'hafta-tatili-ucreti-nasil-hesaplanir',
  ucret: 'ucret-alacagi-nasil-hesaplanir',
  bakiye: 'bakiye-ucret-alacagi-nasil-hesaplanir',
  'kotu-niyet': 'kotu-niyet-tazminati-nasil-hesaplanir',
  'ise-baslatmama': 'ise-baslatmama-tazminati-nasil-hesaplanir',
  'bosta-gecen': 'bosta-gecen-sure-ucreti-nasil-hesaplanir',
  ayrimcilik: 'ayrimcilik-tazminati-nasil-hesaplanir',
  prim: 'prim-alacagi-nasil-hesaplanir',
  'haksiz-fesih': 'haksiz-fesih-tazminati-nasil-hesaplanir',
}

/** Local alias: eski kısa slug → canonical SEO slug (production redirect yok) */
export const BH_MODULE_SLUG_ALIASES: Record<string, string> = Object.fromEntries(
  Object.entries(BH_CODE_TO_SEO_SLUG).map(([code, seo]) => [code, seo]),
)

export function resolveBhModuleCanonicalSlug(slug: string): string {
  const raw = String(slug || '').trim()
  if (!raw) return raw
  return BH_MODULE_SLUG_ALIASES[raw] || raw
}

export type BhModuleCatalogFields = {
  title: string
  slug: string
  shortDescription: string
  category: string
  /** Kart görseli URL (admin medya) */
  cardImage?: string
  /** Lucide ikon adı veya serbest etiket */
  iconName?: string
  sortOrder: number
  published: boolean
  /** Ana BH ürün sayfasında modül grid’inde göster */
  showOnBhProductPage: boolean
  seoTitle?: string
  seoDescription?: string
  status?: PublishStatus
}

export type BhModulePageContent = BhModuleCatalogFields & {
  blocks?: BuilderBlock[]
}

export type BhModulePagesDocument = {
  pages: Record<string, BhModulePageContent>
}

export function bhModuleBuilderPageKey(slug: string): string {
  return `bh-module:${slug}`
}

export function isBhModuleBuilderPageKey(key: string): boolean {
  return key.startsWith('bh-module:')
}

export function parseBhModuleSlugFromPageKey(key: string): string | null {
  if (!isBhModuleBuilderPageKey(key)) return null
  return key.slice('bh-module:'.length) || null
}

export function normalizeBhModuleCatalog(row: unknown, fallbackSlug = ''): BhModuleCatalogFields {
  const r = row && typeof row === 'object' ? (row as Record<string, unknown>) : {}
  const slug = String(r.slug ?? fallbackSlug).trim() || fallbackSlug
  return {
    title: String(r.title ?? '').trim() || slug,
    slug,
    shortDescription: String(r.shortDescription ?? r.description ?? '').trim(),
    category: String(r.category ?? 'İşçilik alacağı').trim() || 'İşçilik alacağı',
    cardImage: String(r.cardImage ?? '').trim() || undefined,
    iconName: String(r.iconName ?? '').trim() || undefined,
    sortOrder: Number.isFinite(Number(r.sortOrder)) ? Number(r.sortOrder) : 0,
    published: r.published !== false && r.status !== 'draft',
    showOnBhProductPage: r.showOnBhProductPage === true,
    seoTitle: String(r.seoTitle ?? '').trim() || undefined,
    seoDescription: String(r.seoDescription ?? '').trim() || undefined,
    status: r.status === 'draft' ? 'draft' : 'published',
  }
}

export function listPublishedBhModules(raw: unknown): BhModuleCatalogFields[] {
  if (!raw || typeof raw !== 'object') return []
  const pages = (raw as Record<string, unknown>).pages
  if (!pages || typeof pages !== 'object') return []
  return Object.entries(pages as Record<string, unknown>)
    .map(([slug, row]) => normalizeBhModuleCatalog(row, slug))
    .filter((m) => m.published && m.slug)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, 'tr'))
}

/** Ana BH ürün sayfası — yalnızca showOnBhProductPage=true kayıtlar */
export function listBhProductPageModules(raw: unknown): BhModuleCatalogFields[] {
  return listPublishedBhModules(raw).filter((m) => m.showOnBhProductPage)
}

export function collectBhModuleCategories(modules: BhModuleCatalogFields[]): string[] {
  const set = new Set<string>()
  for (const m of modules) {
    const cat = m.category.trim()
    if (cat) set.add(cat)
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'tr'))
}

export function filterBhModules(
  modules: BhModuleCatalogFields[],
  opts: { query?: string; category?: string | null },
): BhModuleCatalogFields[] {
  const q = String(opts.query || '')
    .trim()
    .toLocaleLowerCase('tr')
  const category = opts.category?.trim() || null
  return modules.filter((m) => {
    if (category && m.category !== category) return false
    if (!q) return true
    const hay = `${m.title} ${m.shortDescription} ${m.category} ${m.slug}`.toLocaleLowerCase('tr')
    return hay.includes(q)
  })
}

export function getBhModulePageFromRaw(raw: unknown, slug: string): BhModulePageContent | null {
  if (!raw || typeof raw !== 'object' || !slug) return null
  const pages = (raw as Record<string, unknown>).pages
  if (!pages || typeof pages !== 'object') return null
  const row = (pages as Record<string, unknown>)[slug]
  if (!row || typeof row !== 'object') return null
  const catalog = normalizeBhModuleCatalog(row, slug)
  const blocks = Array.isArray((row as { blocks?: unknown }).blocks)
    ? ((row as { blocks: BuilderBlock[] }).blocks)
    : undefined
  return { ...catalog, blocks }
}
