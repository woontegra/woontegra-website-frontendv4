/**
 * IndexNow helpers — build/deploy only. Never import from src/ (client bundle).
 */
import fs from 'node:fs'
import path from 'node:path'

export const INDEXNOW_HOST = 'www.woontegra.com'
export const INDEXNOW_ORIGIN = 'https://www.woontegra.com'
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'
export const INDEXNOW_KEY_RE = /^[A-Za-z0-9-]{8,128}$/

const BLOCKED_EXACT = new Set([
  '/admin',
  '/giris',
  '/kayit',
  '/sepet',
  '/odeme',
  '/hesabim',
  '/teklif-al',
  '/siparis-basarili',
  '/siparis-basarisiz',
  '/yazilimlar/koopplus',
  '/yazilimlar/bilirkisi-hesap/moduller',
])

const BLOCKED_PREFIXES = [
  '/admin',
  '/giris',
  '/kayit',
  '/sifremi-',
  '/sifre-sifirla',
  '/sepet',
  '/odeme',
  '/hesabim',
  '/api',
  '/builder-preview',
  '/is-ortagi',
  '/yasal/',
  '/yasal-belge/',
  '/teklif-al',
  '/r/',
]

const BLOCKED_HOST_SUFFIXES = ['.vercel.app', '.localhost']
const BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1', 'woontegra.com'])

export function readIndexNowKey(env = process.env) {
  return String(env.INDEXNOW_KEY ?? '').trim()
}

export function validateIndexNowKey(key) {
  return INDEXNOW_KEY_RE.test(String(key || ''))
}

export function indexNowKeyLocation(key) {
  return `${INDEXNOW_ORIGIN}/${key}.txt`
}

export function redactKeyLocation() {
  return `${INDEXNOW_ORIGIN}/<INDEXNOW_KEY>.txt`
}

export function describeKey(key) {
  if (!key) return 'missing'
  return `set (${key.length} chars)`
}

export function parseSitemapLocs(xml) {
  if (!xml) return []
  return [...String(xml).matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((m) => m[1].trim())
}

export function readSitemapLocs(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return []
  return parseSitemapLocs(fs.readFileSync(filePath, 'utf8'))
}

export function normalizeCanonicalUrl(raw) {
  const url = new URL(String(raw).trim())
  url.hash = ''
  url.search = ''
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.replace(/\/+$/, '')
  }
  return `${INDEXNOW_ORIGIN}${url.pathname === '/' ? '/' : url.pathname}`
}

export function isIndexablePublicUrl(raw) {
  let url
  try {
    url = new URL(String(raw).trim())
  } catch {
    return false
  }

  if (url.protocol !== 'https:') return false
  const host = url.hostname.toLowerCase()
  if (host !== INDEXNOW_HOST) return false
  if (BLOCKED_HOSTS.has(host)) return false
  if (BLOCKED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))) return false
  if (host.includes('localhost')) return false

  const pathname = url.pathname.split('?')[0].split('#')[0] || '/'
  if (BLOCKED_EXACT.has(pathname)) return false
  if (BLOCKED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix))) return false
  return true
}

export function filterIndexableUrls(urls) {
  const seen = new Set()
  const out = []
  for (const raw of urls) {
    if (!isIndexablePublicUrl(raw)) continue
    const canonical = normalizeCanonicalUrl(raw)
    if (seen.has(canonical)) continue
    seen.add(canonical)
    out.push(canonical)
  }
  return out
}

export function buildIndexNowPayload(urls, key) {
  return {
    host: INDEXNOW_HOST,
    key,
    keyLocation: indexNowKeyLocation(key),
    urlList: urls,
  }
}

export function redactPayload(payload) {
  return {
    host: payload.host,
    key: '[redacted]',
    keyLocation: redactKeyLocation(),
    urlCount: Array.isArray(payload.urlList) ? payload.urlList.length : 0,
    urlList: payload.urlList,
  }
}

export function shouldSubmitLive({ argv = process.argv, env = process.env } = {}) {
  if (argv.includes('--dry-run') || env.INDEXNOW_DRY_RUN === '1' || env.INDEXNOW_DRY_RUN === 'true') {
    return false
  }
  if (env.INDEXNOW_SUBMIT === '0' || env.INDEXNOW_SUBMIT === 'false') {
    return false
  }
  if (argv.includes('--submit')) return true
  return env.VERCEL_ENV === 'production'
}

export function resolveLocalSitemapPath(rootDir) {
  const distSitemap = path.join(rootDir, 'dist', 'sitemap.xml')
  if (fs.existsSync(distSitemap)) return distSitemap
  return path.join(rootDir, 'public', 'sitemap.xml')
}

export function describeHttpStatus(status) {
  switch (status) {
    case 200:
      return 'OK — URL submitted successfully'
    case 202:
      return 'Accepted — URL received, key validation pending'
    case 400:
      return 'Bad request — invalid format'
    case 403:
      return 'Forbidden — key not valid or key file mismatch'
    case 422:
      return 'Unprocessable — URL does not belong to host or key schema mismatch'
    case 429:
      return 'Too many requests'
    default:
      return `HTTP ${status}`
  }
}

export function isSuccessStatus(status) {
  return status === 200 || status === 202
}
