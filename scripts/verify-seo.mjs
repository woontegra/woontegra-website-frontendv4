/**
 * Post-build SEO verification for prerendered public HTML.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const SITEMAP = path.join(DIST, 'sitemap.xml')

const checks = []
const failures = []

function fileFor(route) {
  if (route === '/') return path.join(DIST, 'index.html')
  return path.join(DIST, route.replace(/^\//, ''), 'index.html')
}

function readHtml(route) {
  const file = fileFor(route)
  if (!fs.existsSync(file)) {
    failures.push(`Eksik HTML: ${route} (${path.relative(ROOT, file)})`)
    return null
  }
  return fs.readFileSync(file, 'utf8')
}

function assert(route, cond, message) {
  checks.push({ route, message, ok: Boolean(cond) })
  if (!cond) failures.push(`${route}: ${message}`)
}

function hasCanonical(html, route) {
  const expected =
    route === '/'
      ? 'https://www.woontegra.com/'
      : `https://www.woontegra.com${route}`
  return html.includes(`rel="canonical"`) && html.includes(expected)
}

function hasJsonLdType(html, type) {
  return (
    html.includes('application/ld+json') &&
    (html.includes(`"@type":"${type}"`) || html.includes(`"@type": "${type}"`))
  )
}

function rootHtml(html) {
  const start = html.indexOf('<div id="root">')
  if (start < 0) return ''
  const chunk = html.slice(start)
  return chunk.replace(/<script[\s\S]*?<\/script>/gi, '')
}

function hasRealH1(html) {
  return /<h1[\s>]/i.test(rootHtml(html))
}

function verifyPage(route, { mustInclude = [], titleIncludes, requireOrg, requireWebsite, requireSoftware } = {}) {
  const html = readHtml(route)
  if (!html) return

  assert(route, !/<div id="root"><\/div>/.test(html), 'root boş olmamalı')
  assert(route, hasRealH1(html), 'H1 bulunmalı (#root)')
  assert(route, hasCanonical(html, route), 'doğru canonical')
  assert(route, html.includes('og:title'), 'og:title')
  assert(route, html.includes('og:description'), 'og:description')
  assert(route, html.includes('twitter:card'), 'twitter:card')
  assert(route, !/modulepreload[^>]+admin-/i.test(html), 'admin modulepreload olmamalı')

  if (titleIncludes) {
    const m = html.match(/<title>([^<]*)<\/title>/i)
    assert(route, Boolean(m?.[1]?.includes(titleIncludes)), `title içinde "${titleIncludes}"`)
  }

  for (const needle of mustInclude) {
    assert(route, html.toLowerCase().includes(String(needle).toLowerCase()), `metin: ${needle}`)
  }

  if (requireOrg) assert(route, hasJsonLdType(html, 'Organization'), 'Organization JSON-LD')
  if (requireWebsite) assert(route, hasJsonLdType(html, 'WebSite'), 'WebSite JSON-LD')
  if (requireSoftware) assert(route, hasJsonLdType(html, 'SoftwareApplication'), 'SoftwareApplication JSON-LD')
}

function assertNoWebsiteOnInnerPages() {
  for (const route of ['/hakkimizda', '/yazilimlar/bilirkisi-hesap']) {
    const html = readHtml(route)
    if (!html) continue
    const scripts = [...html.matchAll(/id="jsonld-([^"]+)"/g)].map((m) => m[1])
    assert(route, !scripts.includes('website'), 'WebSite JSON-LD yalnızca ana sayfada olmalı')
  }
}

function verifySitemap() {
  if (!fs.existsSync(SITEMAP)) {
    failures.push('sitemap.xml eksik')
    return
  }
  const xml = fs.readFileSync(SITEMAP, 'utf8')
  const required = [
    '/yazilimlar/bilirkisi-hesap',
    '/gizlilik-politikasi',
    '/kvkk-aydinlatma-metni',
    '/cerez-politikasi',
    '/acik-riza-metni',
    '/kullanim-sartlari',
    '/mesafeli-satis-sozlesmesi',
    '/on-bilgilendirme-formu',
    '/iade-iptal-kosullari',
    '/cozumler',
  ]
  for (const pathPart of required) {
    assert('sitemap', xml.includes(`https://www.woontegra.com${pathPart}`), `sitemap: ${pathPart}`)
  }
  const forbidden = ['/admin', '/giris', '/sepet', '/odeme', '/hesabim']
  for (const pathPart of forbidden) {
    assert(
      'sitemap',
      !xml.includes(`https://www.woontegra.com${pathPart}<`) &&
        !xml.includes(`https://www.woontegra.com${pathPart}/`),
      `sitemap private olmamalı: ${pathPart}`,
    )
  }
}

function main() {
  verifyPage('/', {
    mustInclude: ['Woontegra'],
    titleIncludes: 'Woontegra',
    requireOrg: true,
    requireWebsite: true,
  })
  verifyPage('/hakkimizda', {
    mustInclude: ['Woontegra'],
    requireOrg: true,
  })
  verifyPage('/iletisim', {
    titleIncludes: 'Woontegra',
    mustInclude: ['Woontegra'],
  })
  verifyPage('/yazilimlar', {
    mustInclude: ['Yazılım'],
  })
  verifyPage('/yazilimlar/bilirkisi-hesap', {
    mustInclude: ['Bilirkişi'],
    requireSoftware: true,
  })
  verifyPage('/yazilimlar/muvekkil-kasa-defteri', {
    mustInclude: ['Müvekkil'],
    requireSoftware: true,
  })
  verifyPage('/yazilimlar/sifre-kasasi', {
    mustInclude: ['Şifre'],
    requireSoftware: true,
  })
  verifySitemap()
  assertNoWebsiteOnInnerPages()

  const ok = checks.filter((c) => c.ok).length
  console.log(`[verify:seo] ${ok}/${checks.length} kontrol geçti`)
  if (failures.length) {
    console.error('[verify:seo] HATALAR:')
    for (const f of failures) console.error(` - ${f}`)
    process.exit(1)
  }
  console.log('[verify:seo] OK')
}

main()
