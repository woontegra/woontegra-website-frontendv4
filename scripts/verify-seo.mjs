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

const ORGANIZATION_ID = 'https://www.woontegra.com/#organization'
const SOCIAL_URLS = [
  'https://www.linkedin.com/company/woontegra',
  'https://www.instagram.com/woontegra_teknoloji/',
  'https://www.facebook.com/woontegra',
  'https://www.youtube.com/@woontegra_teknoloji',
]

const PRODUCT_HUB_PATHS = [
  '/yazilimlar/bilirkisi-hesap',
  '/yazilimlar/muvekkil-kasa-defteri',
  '/yazilimlar/sifre-kasasi',
]

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

function extractJsonLdBlocks(html) {
  const blocks = []
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match
  while ((match = re.exec(html))) {
    try {
      blocks.push(JSON.parse(match[1]))
    } catch {
      // ignore malformed
    }
  }
  return blocks
}

function findSchema(blocks, type) {
  return blocks.find((b) => b && (b['@type'] === type || b['@type']?.includes?.(type)))
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

function hasCrawlableHref(html, href) {
  return (
    html.includes(`href="${href}"`) ||
    html.includes(`href='${href}'`) ||
    html.includes(`to="${href}"`)
  )
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

function verifyOrganizationAndSocial() {
  const html = readHtml('/')
  if (!html) return
  const blocks = extractJsonLdBlocks(html)
  const org = findSchema(blocks, 'Organization')
  assert('/', Boolean(org), 'Organization parse edilebilir')
  if (!org) return

  assert('/', org['@id'] === ORGANIZATION_ID, 'Organization @id')
  assert('/', org.legalName?.includes('Woontegra Teknoloji'), 'Organization legalName')
  assert('/', Boolean(org.contactPoint), 'Organization ContactPoint')
  assert('/', Array.isArray(org.sameAs) && org.sameAs.length >= 4, 'Organization sameAs var')
  for (const url of SOCIAL_URLS) {
    assert('/', org.sameAs?.includes(url), `sameAs: ${url}`)
  }

  const website = findSchema(blocks, 'WebSite')
  assert('/', Boolean(website), 'WebSite parse edilebilir')
  assert(
    '/',
    website?.publisher?.['@id'] === ORGANIZATION_ID,
    'WebSite publisher → Organization @id',
  )

  const footerChunk = html.slice(html.toLowerCase().lastIndexOf('<footer'))
  for (const url of SOCIAL_URLS) {
    assert('/', footerChunk.includes(url) || html.includes(url), `footer sosyal link: ${url}`)
  }
}

function verifySoftwareWoontegraRelation(route, productNeedle) {
  const html = readHtml(route)
  if (!html) return
  const blocks = extractJsonLdBlocks(html)
  const app = findSchema(blocks, 'SoftwareApplication')
  assert(route, Boolean(app), 'SoftwareApplication parse')
  if (!app) return

  const refOk = (node) => node && (node['@id'] === ORGANIZATION_ID || node.name === 'Woontegra')
  assert(route, refOk(app.publisher), 'SoftwareApplication publisher → Woontegra')
  assert(route, refOk(app.author) || refOk(app.creator), 'SoftwareApplication author/creator → Woontegra')
  assert(route, rootHtml(html).toLowerCase().includes('woontegra'), `görünür body Woontegra (${productNeedle})`)
  assert(route, rootHtml(html).toLowerCase().includes(productNeedle.toLowerCase()), `görünür ürün adı: ${productNeedle}`)

  const crumb = findSchema(blocks, 'BreadcrumbList')
  assert(route, Boolean(crumb), 'BreadcrumbList JSON-LD')
  const crumbNames = (crumb?.itemListElement || []).map((i) => String(i.name || '')).join(' ')
  assert(route, /yazılım/i.test(crumbNames), 'breadcrumb Yazılımlar içerir')
}

function verifyYazilimlarHub() {
  const html = readHtml('/yazilimlar')
  if (!html) return
  for (const pathPart of PRODUCT_HUB_PATHS) {
    assert('/yazilimlar', hasCrawlableHref(html, pathPart), `hub crawlable link: ${pathPart}`)
  }
  assert('/yazilimlar', /bilirkişi/i.test(html), 'hub Bilirkişi adı')
  assert('/yazilimlar', /müvekkil/i.test(html), 'hub Müvekkil adı')
  assert('/yazilimlar', /şifre/i.test(html), 'hub Şifre Kasası adı')
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

  verifyOrganizationAndSocial()
  verifyYazilimlarHub()
  verifySoftwareWoontegraRelation('/yazilimlar/bilirkisi-hesap', 'Bilirkişi')
  verifySoftwareWoontegraRelation('/yazilimlar/muvekkil-kasa-defteri', 'Müvekkil')
  verifySoftwareWoontegraRelation('/yazilimlar/sifre-kasasi', 'Şifre')

  // Internal linking smoke (prerender nav)
  const home = readHtml('/')
  if (home) {
    assert('/', hasCrawlableHref(home, '/yazilimlar'), 'ana sayfa → Yazılımlar link')
  }

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
