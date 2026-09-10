/**
 * Build-time prerender for public SEO routes.
 * Keeps Vite SPA architecture; writes static HTML snapshots under dist/.
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const SITEMAP = path.join(DIST, 'sitemap.xml')
const PREVIEW_PORT = Number(process.env.PRERENDER_PORT || 4173)
const PREVIEW_ORIGIN = `http://127.0.0.1:${PREVIEW_PORT}`

const PRIORITY_ROUTES = [
  '/',
  '/hakkimizda',
  '/iletisim',
  '/yazilimlar',
  '/yazilimlar/muvekkil-kasa-defteri',
  '/yazilimlar/sifre-kasasi',
  '/yazilimlar/bilirkisi-hesap',
  '/hizmetler',
  '/cozumler',
  '/blog',
  '/gizlilik-politikasi',
  '/kvkk-aydinlatma-metni',
  '/cerez-politikasi',
  '/acik-riza-metni',
  '/kullanim-sartlari',
  '/mesafeli-satis-sozlesmesi',
  '/on-bilgilendirme-formu',
  '/iade-iptal-kosullari',
  '/veri-silme-talebi',
]

const BLOCKED_PREFIXES = [
  '/admin',
  '/giris',
  '/kayit',
  '/sifremi-',
  '/sifre-sifirla',
  '/sepet',
  '/odeme',
  '/hesabim',
  '/builder-preview',
  '/api',
  '/is-ortagi',
  '/yasal/',
  '/yasal-belge/',
  '/teklif-al',
  '/r/',
]

function normalizePath(p) {
  const clean = String(p || '/').split('?')[0].split('#')[0]
  if (!clean || clean === '/') return '/'
  return clean.endsWith('/') && clean.length > 1 ? clean.slice(0, -1) : clean
}

function isBlocked(route) {
  const p = normalizePath(route)
  return BLOCKED_PREFIXES.some((prefix) => p === prefix || p.startsWith(prefix))
}

function routesFromSitemap() {
  if (!fs.existsSync(SITEMAP)) return []
  const xml = fs.readFileSync(SITEMAP, 'utf8')
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
  return locs
    .map((loc) => {
      try {
        const u = new URL(loc)
        return normalizePath(u.pathname)
      } catch {
        return null
      }
    })
    .filter(Boolean)
}

function collectRoutes() {
  const set = new Set()
  for (const route of [...PRIORITY_ROUTES, ...routesFromSitemap()]) {
    const p = normalizePath(route)
    if (!isBlocked(p)) set.add(p)
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}

function waitForServer(url, timeoutMs = 60_000) {
  const started = Date.now()
  return new Promise((resolve, reject) => {
    const tick = () => {
      const req = http.get(url, (res) => {
        res.resume()
        resolve(true)
      })
      req.on('error', () => {
        if (Date.now() - started > timeoutMs) reject(new Error(`Preview server timeout: ${url}`))
        else setTimeout(tick, 400)
      })
    }
    tick()
  })
}

function startPreview() {
  const child = spawn(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['vite', 'preview', '--host', '127.0.0.1', '--port', String(PREVIEW_PORT)],
    {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        BROWSER: 'none',
        VITE_PRERENDER_API_PROXY:
          process.env.VITE_PRERENDER_API_PROXY ||
          'https://websitebackend-production-ab6e.up.railway.app',
      },
      shell: process.platform === 'win32',
    },
  )
  child.stdout.on('data', (buf) => {
    const text = String(buf)
    if (text.includes('error') || text.includes('Error')) process.stdout.write(`[preview] ${text}`)
  })
  child.stderr.on('data', (buf) => {
    process.stderr.write(`[preview] ${String(buf)}`)
  })
  return child
}

function outputPathForRoute(route) {
  if (route === '/') return path.join(DIST, 'index.html')
  return path.join(DIST, route.replace(/^\//, ''), 'index.html')
}

function scrubAdminPreloads(html) {
  return html.replace(/<link[^>]+rel="modulepreload"[^>]+href="[^"]*admin-[^"]+\.js"[^>]*>\s*/gi, '')
}

async function prerenderRouteOnce(page, route, spaShell) {
  // Her route öncesi SPA shell'i geri yaz: aksi halde / prerender'ı
  // index.html'i ezer ve sonraki route'lar kirli HTML + sızan JSON-LD alır.
  fs.writeFileSync(path.join(DIST, 'index.html'), spaShell, 'utf8')

  const url = `${PREVIEW_ORIGIN}${route === '/' ? '/' : route}`
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90_000 })
  await page.waitForFunction(() => window.__woontegraAppMounted === true, null, { timeout: 60_000 })
  await page.waitForSelector('main h1, main h2, #root h1', { timeout: 60_000 })
  await new Promise((r) => setTimeout(r, 600))
  let html = await page.content()
  html = scrubAdminPreloads(html)
  if (!html.includes('<html')) throw new Error(`Invalid HTML for ${route}`)
  if (!/<h1[\s>]/i.test(html) && !/<h2[\s>]/i.test(html)) {
    throw new Error(`No heading content for ${route}`)
  }
  const out = outputPathForRoute(route)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, html, 'utf8')
}

async function prerenderRoute(page, route, spaShell) {
  try {
    await prerenderRouteOnce(page, route, spaShell)
  } catch (firstErr) {
    console.warn(
      `[prerender] retry ${route}:`,
      firstErr instanceof Error ? firstErr.message : firstErr,
    )
    await new Promise((r) => setTimeout(r, 1200))
    await prerenderRouteOnce(page, route, spaShell)
  }
}

async function main() {
  if (!fs.existsSync(DIST)) {
    throw new Error('dist/ bulunamadı — önce vite build çalıştırın')
  }

  const spaShellPath = path.join(DIST, 'index.html')
  const spaShell = fs.readFileSync(spaShellPath, 'utf8')
  if (!spaShell.includes('<div id="root"></div>') && !spaShell.includes('<div id="root">')) {
    console.warn('[prerender] uyarı: beklenen SPA root işaretçisi zayıf; yine de devam')
  }

  const routes = collectRoutes()
  // Ana sayfayı en sonda yaz ki index.html shell olarak kalsın
  const ordered = [...routes.filter((r) => r !== '/'), ...routes.filter((r) => r === '/')]
  console.log(`[prerender] ${ordered.length} route`)

  const preview = startPreview()
  let browser
  try {
    await waitForServer(PREVIEW_ORIGIN)
    try {
      browser = await chromium.launch({ headless: true })
    } catch (launchErr) {
      console.error(
        '[prerender] Chromium başlatılamadı. CI/Vercel için `playwright install --only-shell chromium` gerekir.',
      )
      throw launchErr
    }
    const page = await browser.newPage()
    let ok = 0
    for (const route of ordered) {
      try {
        await prerenderRoute(page, route, spaShell)
        ok += 1
        console.log(`[prerender] OK ${route}`)
      } catch (err) {
        console.error(`[prerender] FAIL ${route}:`, err instanceof Error ? err.message : err)
        throw err
      }
    }
    console.log(`[prerender] tamamlandı — ${ok}/${ordered.length}`)
  } finally {
    if (browser) await browser.close().catch(() => {})
    await new Promise((resolve) => {
      const done = () => resolve()
      try {
        if (process.platform === 'win32' && preview.pid) {
          const killer = spawn('taskkill', ['/pid', String(preview.pid), '/T', '/F'], {
            stdio: 'ignore',
          })
          killer.on('exit', done)
          killer.on('error', done)
          setTimeout(done, 3000)
        } else {
          preview.kill('SIGTERM')
          preview.on('exit', done)
          setTimeout(() => {
            try {
              preview.kill('SIGKILL')
            } catch {
              /* ignore */
            }
            done()
          }, 3000)
        }
      } catch {
        done()
      }
    })
  }
}

main().catch((err) => {
  console.error('[prerender]', err)
  process.exit(1)
})
