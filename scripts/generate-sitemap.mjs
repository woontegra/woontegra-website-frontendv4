/**
 * Public sitemap generator — build-time, API optional with short timeout + static fallback.
 * Output: public/sitemap.xml (copied to dist root by Vite)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  BH_MODULE_SEO_SLUGS,
  bhModuleDetailPath,
  isCanonicalBhModuleSeoSlug,
} from './lib/bhModuleSeoSlugs.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'public', 'sitemap.xml')

const SITE = 'https://www.woontegra.com'
const API_BASE = (() => {
  const raw =
    process.env.SITEMAP_API_URL?.trim() ||
    process.env.VITE_API_URL?.trim() ||
    'https://websitebackend-production-ab6e.up.railway.app/api'
  const normalized = raw.replace(/\/+$/, '')
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`
})()

const API_TIMEOUT_MS = 5_000

const SERVICE_SLUGS = ['saas', 'web-tasarim', 'yazilim-gelistirme', 'e-ticaret']

const SOLUTION_SLUGS = [
  'e-ticaret-altyapisi',
  'pazaryeri-entegrasyonu',
  'siparis-yonetimi',
  'stok-fiyat-yonetimi',
  'dijital-operasyon',
  'ozel-yazilim-surecleri',
]

/** Indexlenmesi gereken statik public sayfalar (canonical path'ler) */
const STATIC_ENTRIES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/hakkimizda', priority: '0.9', changefreq: 'monthly' },
  { path: '/hizmetler', priority: '0.9', changefreq: 'weekly' },
  ...SERVICE_SLUGS.map((slug) => ({
    path: `/hizmetler/${slug}`,
    priority: '0.8',
    changefreq: 'monthly',
  })),
  { path: '/cozumler', priority: '0.8', changefreq: 'monthly' },
  ...SOLUTION_SLUGS.map((slug) => ({
    path: `/cozumler/${slug}`,
    priority: '0.7',
    changefreq: 'monthly',
  })),
  { path: '/yazilimlar', priority: '0.9', changefreq: 'weekly' },
  { path: '/yazilimlar/muvekkil-kasa-defteri', priority: '0.8', changefreq: 'monthly' },
  { path: '/yazilimlar/kooperatif-yonetim-yazilimi', priority: '0.8', changefreq: 'monthly' },
  { path: '/yazilimlar/sifre-kasasi', priority: '0.8', changefreq: 'monthly' },
  { path: '/yazilimlar/bilirkisi-hesap', priority: '0.8', changefreq: 'monthly' },
  { path: '/blog', priority: '0.9', changefreq: 'weekly' },
  { path: '/iletisim', priority: '0.8', changefreq: 'monthly' },
  { path: '/veri-silme-talebi', priority: '0.6', changefreq: 'yearly' },
  { path: '/gizlilik-politikasi', priority: '0.5', changefreq: 'yearly' },
  { path: '/kvkk-aydinlatma-metni', priority: '0.5', changefreq: 'yearly' },
  { path: '/cerez-politikasi', priority: '0.5', changefreq: 'yearly' },
  { path: '/acik-riza-metni', priority: '0.5', changefreq: 'yearly' },
  { path: '/kullanim-sartlari', priority: '0.5', changefreq: 'yearly' },
  { path: '/mesafeli-satis-sozlesmesi', priority: '0.4', changefreq: 'yearly' },
  { path: '/on-bilgilendirme-formu', priority: '0.4', changefreq: 'yearly' },
  { path: '/iade-iptal-kosullari', priority: '0.4', changefreq: 'yearly' },
]

/** Sitemap'e girmemesi gereken path'ler (redirect kaynakları, private, legacy) */
const BLOCKED_EXACT = new Set([
  '/admin',
  '/giris',
  '/kayit',
  '/sepet',
  '/odeme',
  '/hesabim',
  '/teklif-al',
  '/e-ticaret-altyapisi',
  '/web-tasarim',
  '/ozel-yazilim',
  '/hizmetler/e-ticaret-cozumleri',
  '/hizmetler/saas-urun-gelistirme',
  '/hizmetler/marka-patent-vekilligi',
  '/hizmetler/marka-patent',
  '/cozumler/datca-topikal',
  '/cozumler/bilirkisi-hesaplama',
  '/siparis-basarili',
  '/siparis-basarisiz',
  '/yazilimlar/muvekkil-kasa-defteri-yazilimi',
  '/yazilimlar/muvekkil-kasa-defteri-desktop',
  '/yazilimlar/muvekkil-kasa-defteri-web-tabanli',
  '/yazilimlar/muvekkil-kasa-defteri-saas',
  '/yazilimlar/muvekkil-kasa-saas',
  '/yazilimlar/koopplus',
  '/yazilimlar/bilirkisi-hesap/moduller',
])

const BLOCKED_PREFIXES = [
  '/admin',
  '/giris',
  '/kayit',
  '/sifremi-',
  '/sepet',
  '/odeme',
  '/hesabim',
  '/api',
  '/builder-preview',
  '/yasal/',
  '/yasal-belge/',
]

/** Harici marka/slug parçaları — bilirkisi artık Woontegra ürün sayfası olarak dahil */
const BLOCKED_SLUG_PARTS = ['optimoon', 'datca', 'mercan', 'sendikal']

function isBlockedPath(p) {
  const pathname = p.split('?')[0].split('#')[0]
  if (BLOCKED_EXACT.has(pathname)) return true
  if (BLOCKED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix))) return true
  const lower = pathname.toLowerCase()
  if (BLOCKED_SLUG_PARTS.some((part) => lower.includes(part))) return true
  return false
}

function toLastmodDate(value) {
  if (value == null || value === '') return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

async function fetchJson(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Published BH module detail pages — CMS bhModulePages ∩ canonical SEO slug registry.
 * Alias/short slugs and invented modules (e.g. Sendikal) are excluded.
 */
async function fetchBhModuleEntries() {
  const res = await fetchJson(`${API_BASE}/page-content/bhModulePages`)
  const pages = res?.data?.pages
  const fromCms = []

  if (pages && typeof pages === 'object') {
    for (const [slug, row] of Object.entries(pages)) {
      if (!isCanonicalBhModuleSeoSlug(slug)) continue
      if (!row || typeof row !== 'object') continue
      if (row.published === false || row.status === 'draft') continue
      fromCms.push({
        path: bhModuleDetailPath(slug),
        priority: '0.7',
        changefreq: 'monthly',
      })
    }
  }

  if (fromCms.length === BH_MODULE_SEO_SLUGS.length) return fromCms

  // Fallback / fill gaps from SEO registry (same SoT as Frontend bhModule.ts)
  const map = new Map(fromCms.map((e) => [e.path, e]))
  for (const slug of BH_MODULE_SEO_SLUGS) {
    const p = bhModuleDetailPath(slug)
    if (!map.has(p)) {
      map.set(p, { path: p, priority: '0.7', changefreq: 'monthly' })
    }
  }
  return [...map.values()]
}

async function fetchDynamicPaths() {
  const dynamic = []

  const blogRes = await fetchJson(`${API_BASE}/blog/posts`)
  const posts = blogRes?.data ?? blogRes
  if (Array.isArray(posts)) {
    for (const post of posts) {
      const slug = String(post?.slug ?? '').trim()
      const published = post?.published !== false && post?.status !== 'draft'
      if (slug && published) {
        const lastmod = toLastmodDate(post.updatedAt || post.publishedAt || post.createdAt)
        dynamic.push({
          path: `/blog/${slug}`,
          priority: '0.7',
          changefreq: 'monthly',
          ...(lastmod ? { lastmod } : {}),
        })
      }
    }
  }

  const productsRes = await fetchJson(`${API_BASE}/products`)
  const products = productsRes?.data ?? productsRes
  if (Array.isArray(products)) {
    for (const product of products) {
      const slug = String(product?.slug ?? '').trim()
      const active = product?.isActive !== false && product?.published !== false
      if (slug && active) {
        // MK satış slug'ları compare canonical'a yönlenir; sitemap'te duplicate olmasın
        if (
          /muvekkil-kasa-defteri-(yazilimi|desktop|web-tabanli|saas)/i.test(slug) ||
          slug === 'muvekkil-kasa-saas' ||
          slug === 'koopplus'
        ) {
          continue
        }
        const lastmod = toLastmodDate(product.updatedAt || product.createdAt)
        dynamic.push({
          path: `/yazilimlar/${slug}`,
          priority: '0.8',
          changefreq: 'monthly',
          ...(lastmod ? { lastmod } : {}),
        })
      }
    }
  }

  const bhModules = await fetchBhModuleEntries()
  dynamic.push(...bhModules)

  return dynamic
}

function mergeEntries(staticList, dynamicList) {
  const map = new Map()
  for (const entry of staticList) {
    if (!isBlockedPath(entry.path)) map.set(entry.path, entry)
  }
  for (const entry of dynamicList) {
    if (!isBlockedPath(entry.path) && !map.has(entry.path)) {
      map.set(entry.path, entry)
    }
  }
  return [...map.values()].sort((a, b) => a.path.localeCompare(b.path))
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildXml(entries) {
  const urls = entries
    .map((e) => {
      const lines = [
        '  <url>',
        `    <loc>${escapeXml(`${SITE}${e.path === '/' ? '/' : e.path}`)}</loc>`,
      ]
      // Only emit lastmod when we have a real content date — never stamp build/deploy day on all URLs
      if (e.lastmod) {
        lines.push(`    <lastmod>${escapeXml(e.lastmod)}</lastmod>`)
      }
      lines.push(
        `    <changefreq>${e.changefreq}</changefreq>`,
        `    <priority>${e.priority}</priority>`,
        '  </url>',
      )
      return lines.join('\n')
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

async function main() {
  let dynamic = []
  try {
    dynamic = await fetchDynamicPaths()
    if (dynamic.length) {
      console.log(`[sitemap] API/registry: ${dynamic.length} dynamic URL eklendi`)
    }
  } catch {
    console.warn('[sitemap] API atlandı — statik + BH SEO registry kullanılacak')
    dynamic = await fetchBhModuleEntries()
  }

  const entries = mergeEntries(STATIC_ENTRIES, dynamic)
  const xml = buildXml(entries)

  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, xml, 'utf8')
  const withLastmod = entries.filter((e) => e.lastmod).length
  console.log(
    `[sitemap] ${entries.length} URL (${withLastmod} lastmod) → ${path.relative(ROOT, OUT)}`,
  )
}

main().catch((err) => {
  console.error('[sitemap] Hata:', err.message)
  process.exit(1)
})
