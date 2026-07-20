/**
 * Public sitemap generator — build-time, API optional with short timeout + static fallback.
 * Output: public/sitemap.xml (copied to dist root by Vite)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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

const SERVICE_SLUGS = [
  'saas',
  'web-tasarim',
  'yazilim-gelistirme',
  'e-ticaret',
  'marka-patent-vekilligi',
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
  { path: '/yazilimlar', priority: '0.9', changefreq: 'weekly' },
  { path: '/blog', priority: '0.9', changefreq: 'weekly' },
  { path: '/iletisim', priority: '0.8', changefreq: 'monthly' },
  { path: '/veri-silme-talebi', priority: '0.6', changefreq: 'yearly' },
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
  '/cozumler/datca-topikal',
  '/cozumler/bilirkisi-hesaplama',
  '/siparis-basarili',
  '/siparis-basarisiz',
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
]

const BLOCKED_SLUG_PARTS = ['optimoon', 'datca', 'mercan', 'bilirkisi']

function isBlockedPath(p) {
  const pathname = p.split('?')[0].split('#')[0]
  if (BLOCKED_EXACT.has(pathname)) return true
  if (BLOCKED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix))) return true
  const lower = pathname.toLowerCase()
  if (BLOCKED_SLUG_PARTS.some((part) => lower.includes(part))) return true
  return false
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

async function fetchDynamicPaths() {
  const dynamic = []

  const blogRes = await fetchJson(`${API_BASE}/blog/posts`)
  const posts = blogRes?.data ?? blogRes
  if (Array.isArray(posts)) {
    for (const post of posts) {
      const slug = String(post?.slug ?? '').trim()
      const published = post?.published !== false && post?.status !== 'draft'
      if (slug && published) {
        dynamic.push({ path: `/blog/${slug}`, priority: '0.7', changefreq: 'monthly' })
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
        dynamic.push({ path: `/yazilimlar/${slug}`, priority: '0.8', changefreq: 'monthly' })
      }
    }
  }

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

function buildXml(entries, lastmod) {
  const urls = entries
    .map(
      (e) => `  <url>
    <loc>${escapeXml(`${SITE}${e.path === '/' ? '/' : e.path}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

async function main() {
  const lastmod = new Date().toISOString().slice(0, 10)
  let dynamic = []
  try {
    dynamic = await fetchDynamicPaths()
    if (dynamic.length) {
      console.log(`[sitemap] API: ${dynamic.length} dynamic URL eklendi`)
    }
  } catch {
    console.warn('[sitemap] API atlandı — yalnızca statik liste kullanılıyor')
  }

  const entries = mergeEntries(STATIC_ENTRIES, dynamic)
  const xml = buildXml(entries, lastmod)

  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, xml, 'utf8')
  console.log(`[sitemap] ${entries.length} URL → ${path.relative(ROOT, OUT)}`)
}

main().catch((err) => {
  console.error('[sitemap] Hata:', err.message)
  process.exit(1)
})
