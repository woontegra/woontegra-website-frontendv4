/**
 * IndexNow submission — sitemap URL listesini kullanır.
 * Lokal: varsayılan dry-run. Canlı POST yalnızca Vercel production veya --submit.
 * Build'i asla çökertmez.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  INDEXNOW_ENDPOINT,
  INDEXNOW_ORIGIN,
  buildIndexNowPayload,
  describeHttpStatus,
  describeKey,
  filterIndexableUrls,
  isSuccessStatus,
  parseSitemapLocs,
  readIndexNowKey,
  readSitemapLocs,
  redactKeyLocation,
  redactPayload,
  resolveLocalSitemapPath,
  shouldSubmitLive,
  validateIndexNowKey,
} from './lib/indexnow.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const LIVE_SITEMAP = `${INDEXNOW_ORIGIN}/sitemap.xml`
const FETCH_MS = 12_000

function log(...args) {
  console.log('[indexnow]', ...args)
}

function warn(...args) {
  console.warn('[indexnow]', ...args)
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { Accept: 'application/xml, text/plain, */*' },
    signal: AbortSignal.timeout(FETCH_MS),
    redirect: 'follow',
  })
  const text = await res.text()
  return { ok: res.ok, status: res.status, text }
}

async function liveKeyPublished(key) {
  try {
    const { ok, text } = await fetchText(`${INDEXNOW_ORIGIN}/${key}.txt`)
    return ok && text.trim() === key
  } catch {
    return false
  }
}

async function loadUrlList(live) {
  if (live) {
    try {
      const { ok, status, text } = await fetchText(LIVE_SITEMAP)
      if (!ok) {
        warn(`canlı sitemap okunamadı (HTTP ${status}) — bildirim atlandı`)
        return null
      }
      const urls = filterIndexableUrls(parseSitemapLocs(text))
      log(`URL kaynağı: canlı sitemap (${urls.length} indexlenebilir URL)`)
      return urls
    } catch (err) {
      warn(`canlı sitemap hatası (${err instanceof Error ? err.message : 'unknown'}) — bildirim atlandı`)
      return null
    }
  }

  const sitemapPath = resolveLocalSitemapPath(ROOT)
  if (!fs.existsSync(sitemapPath)) {
    warn(`sitemap bulunamadı (${path.relative(ROOT, sitemapPath)}) — dry-run atlandı`)
    return []
  }
  const urls = filterIndexableUrls(readSitemapLocs(sitemapPath))
  log(`URL kaynağı: ${path.relative(ROOT, sitemapPath)} (${urls.length} indexlenebilir URL)`)
  return urls
}

async function postIndexNow(payload) {
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(FETCH_MS),
  })
  let preview = ''
  try {
    preview = (await res.text()).replace(payload.key, '[redacted]').slice(0, 200)
  } catch {
    preview = ''
  }
  return { status: res.status, preview }
}

async function main() {
  const liveRequested = shouldSubmitLive()
  const key = readIndexNowKey()

  log(`mod: ${liveRequested ? 'live' : 'dry-run'} | key: ${describeKey(key)} | endpoint: ${INDEXNOW_ENDPOINT}`)

  if (!key) {
    log('INDEXNOW_KEY yok — submission atlandı')
    return
  }
  if (!validateIndexNowKey(key)) {
    warn('INDEXNOW_KEY format geçersiz — submission atlandı')
    return
  }

  const urls = await loadUrlList(liveRequested)
  if (!urls) return
  if (!urls.length) {
    warn('gönderilecek URL yok')
    return
  }

  const payload = buildIndexNowPayload(urls, key)
  const safe = redactPayload(payload)
  log(`host=${safe.host} keyLocation=${redactKeyLocation()} urlCount=${safe.urlCount}`)
  for (const url of safe.urlList) log(`  ${url}`)

  if (!liveRequested) {
    log('dry-run — IndexNow API çağrılmadı')
    return
  }

  const published = await liveKeyPublished(key)
  if (!published) {
    log(
      'canlı verification dosyası henüz yok (ilk production deploy veya key değişimi). Bu deploy yalnızca dosyayı yayınlar; bir sonraki production deploy bildirim gönderir.',
    )
    return
  }

  try {
    const { status, preview } = await postIndexNow(payload)
    const meaning = describeHttpStatus(status)
    if (isSuccessStatus(status)) {
      log(`submission OK (${status} ${meaning}) — ${urls.length} URL`)
    } else {
      warn(`submission başarısız (${status} ${meaning})${preview ? ` — ${preview}` : ''}`)
    }
  } catch (err) {
    warn(`submission ağ hatası: ${err instanceof Error ? err.message : 'unknown'}`)
  }
}

main().catch((err) => {
  warn(`beklenmeyen hata (build devam eder): ${err instanceof Error ? err.message : 'unknown'}`)
})
