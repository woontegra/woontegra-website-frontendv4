/**
 * Post-build SEO verification for prerendered public HTML.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readIndexNowKey, validateIndexNowKey } from './lib/indexnow.mjs'

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
  '/yazilimlar/kooperatif-yonetim-yazilimi',
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

function headerHtml(html) {
  const root = rootHtml(html)
  const match = root.match(/<header[\s\S]*?<\/header>/i)
  return match ? match[0] : ''
}

function verifyHomeBrandedFirstPaint() {
  const home = readHtml('/')
  if (!home) return

  const criticalMatch = home.match(/<style id="woontegra-critical-boot">([\s\S]*?)<\/style>/)
  const criticalCss = criticalMatch?.[1] || ''
  assert('/', Boolean(criticalCss), 'branded critical shell CSS')
  const rootRule = criticalCss.match(/#root\s*\{[^}]+\}/)?.[0] || ''
  assert('/', /background-color:\s*#0f172a/i.test(rootRule), '#root branded slate, not white lock')
  assert('/', !/#root\s*\{[^}]*background-color:\s*#ffffff/i.test(criticalCss), '#root white lock yok')
  assert('/', criticalCss.includes('.woontegra-boot-header'), 'critical header surface')
  assert('/', criticalCss.includes('.woontegra-boot-logo'), 'critical logo box')
  assert('/', criticalCss.includes('.woontegra-boot-hero'), 'critical hero surface')
  assert('/', /height:\s*64px/.test(criticalCss), 'critical 64px header')
  assert('/', home.includes('woontegra-boot-header'), 'prerender header boot class')
  assert('/', home.includes('woontegra-boot-hero'), 'prerender hero boot class')

  const header = headerHtml(home)
  const headerImg = header.match(/<img\b[^>]*>/i)?.[0] || ''
  assert('/', Boolean(headerImg), 'initial header gerçek logo img')
  assert('/', /src=["']https?:\/\//i.test(headerImg), 'logo src CMS http(s) URL')
  assert('/', !/\/logo\.png/i.test(headerImg), 'header /logo.png yok')
  assert('/', !/woontegra-logo\.svg/i.test(headerImg), 'placeholder SVG logo yok')
  assert(
    '/',
    !/text-lg font-semibold tracking-tight text-slate-900/.test(header),
    'header text brand "Woontegra" logo yerine yok',
  )
  assert('/', /width=/i.test(headerImg) && /height=/i.test(headerImg), 'logo width/height rezervasyonu')
  assert('/', home.includes('woontegra-boot-logo-slot') || /width:\s*\d+px/.test(header), 'logo container rezervasyonu')
  assert('/', home.includes('__WOONTEGRA_PUBLIC_BOOTSTRAP__'), 'public boot embed')
  const bootScript = home.match(/<script id="woontegra-public-boot">[\s\S]*?<\/script>/)?.[0] || ''
  assert('/', Boolean(bootScript), 'public boot script tag')
  assert('/', !bootScript.includes('/logo.png'), 'boot /logo.png yok')
  assert('/', !bootScript.includes('woontegra-logo.svg'), 'boot placeholder SVG yok')

  const imagePreloads = [...home.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => match[0])
    .filter((tag) => /rel=["']preload["']/.test(tag) && /as=["']image["']/.test(tag))
  assert('/', imagePreloads.length === 2, 'yalnız 2 image preload (logo preload yok)')
  assert(
    '/',
    !imagePreloads.some((tag) => /website-media\/logo/i.test(tag)),
    'logo asset preload edilmemeli',
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
  assert('/yazilimlar', /koopplus/i.test(html), 'hub KoopPlus adı')
  assert('/yazilimlar', /şifre/i.test(html), 'hub Şifre Kasası adı')
}

function verifyRobots() {
  const robots = path.join(DIST, 'robots.txt')
  if (!fs.existsSync(robots)) {
    failures.push('robots.txt eksik')
    return
  }
  const txt = fs.readFileSync(robots, 'utf8')
  assert('robots', /Sitemap:\s*https:\/\/www\.woontegra\.com\/sitemap\.xml/i.test(txt), 'Sitemap satırı')
  assert('robots', /Disallow:\s*\/admin/i.test(txt), 'Disallow /admin')
}

function verifyIndexNowArtifacts() {
  const publicDir = path.join(ROOT, 'public')
  const leaked = fs
    .readdirSync(publicDir)
    .filter((name) => name.endsWith('.txt') && name !== 'robots.txt')
  assert('indexnow', leaked.length === 0, 'public/ içinde IndexNow key dosyası olmamalı')

  const key = readIndexNowKey()
  if (!key) return
  if (!validateIndexNowKey(key)) {
    failures.push('INDEXNOW_KEY format geçersiz')
    return
  }
  const file = path.join(DIST, `${key}.txt`)
  assert('indexnow', fs.existsSync(file), 'dist/<INDEXNOW_KEY>.txt üretilmeli')
  if (fs.existsSync(file)) {
    assert('indexnow', fs.readFileSync(file, 'utf8').trim() === key, 'verification dosyası key içermeli')
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
    '/yazilimlar/kooperatif-yonetim-yazilimi',
    '/yazilimlar/bilirkisi-hesap/moduller/fazla-mesai-nasil-hesaplanir',
    '/yazilimlar/bilirkisi-hesap/moduller/kidem-tazminati-nasil-hesaplanir',
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
  assert(
    'sitemap',
    !xml.includes('/moduller/fazla-mesai<') && !xml.includes('/moduller/fazla-mesai/'),
    'sitemap alias fazla-mesai olmamalı',
  )
  assert('sitemap', !/sendikal/i.test(xml), 'sitemap Sendikal olmamalı')
  assert(
    'sitemap',
    !xml.includes('/yazilimlar/koopplus'),
    'sitemap legacy /yazilimlar/koopplus olmamalı',
  )
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
  verifyPage('/yazilimlar/kooperatif-yonetim-yazilimi', {
    mustInclude: ['KoopPlus', 'Kooperatif Yönetim Yazılımı'],
    titleIncludes: 'Kooperatif Yönetim Yazılımı',
    requireSoftware: true,
  })
  verifyPage('/yazilimlar/sifre-kasasi', {
    mustInclude: ['Şifre'],
    requireSoftware: true,
  })
  verifySitemap()
  verifyRobots()
  verifyIndexNowArtifacts()
  assertNoWebsiteOnInnerPages()

  verifyOrganizationAndSocial()
  verifyYazilimlarHub()
  verifySoftwareWoontegraRelation('/yazilimlar/bilirkisi-hesap', 'Bilirkişi')
  verifySoftwareWoontegraRelation('/yazilimlar/muvekkil-kasa-defteri', 'Müvekkil')
  verifySoftwareWoontegraRelation('/yazilimlar/kooperatif-yonetim-yazilimi', 'KoopPlus')
  verifySoftwareWoontegraRelation('/yazilimlar/sifre-kasasi', 'Şifre')

  assert(
    'prerender',
    !fs.existsSync(fileFor('/yazilimlar/koopplus')),
    'legacy /yazilimlar/koopplus HTML üretilmemeli',
  )
  const koopHtml = readHtml('/yazilimlar/kooperatif-yonetim-yazilimi')
  if (koopHtml) {
    const koopBlocks = extractJsonLdBlocks(koopHtml)
    const koopApp = findSchema(koopBlocks, 'SoftwareApplication')
    assert(
      '/yazilimlar/kooperatif-yonetim-yazilimi',
      koopApp?.url === 'https://www.woontegra.com/yazilimlar/kooperatif-yonetim-yazilimi',
      'SoftwareApplication url = canonical SEO path',
    )
    assert(
      '/yazilimlar/kooperatif-yonetim-yazilimi',
      koopApp?.name === 'KoopPlus',
      'SoftwareApplication name = KoopPlus',
    )
    assert(
      '/yazilimlar/kooperatif-yonetim-yazilimi',
      String(koopApp?.description || '').includes('Kooperatif yönetim yazılımı'),
      'SoftwareApplication description konu ifadesi',
    )
    assert(
      '/yazilimlar/kooperatif-yonetim-yazilimi',
      !koopHtml.includes('https://www.woontegra.com/yazilimlar/koopplus'),
      'eski koopplus canonical/JSON-LD URL olmamalı',
    )
  }

  // Internal linking smoke (prerender nav)
  const home = readHtml('/')
  if (home) {
    assert('/', hasCrawlableHref(home, '/yazilimlar'), 'ana sayfa → Yazılımlar link')
    const lcpLinks = [...home.matchAll(/<link\b[^>]*>/gi)]
      .map((match) => match[0])
      .filter((tag) => /rel=["']preload["']/.test(tag) && /as=["']image["']/.test(tag))
    const mobileLink = lcpLinks.find((tag) => tag.includes('(max-width: 640px)'))
    const desktopLink = lcpLinks.find((tag) => tag.includes('(min-width: 641px)'))
    assert('/', Boolean(mobileLink), 'ana sayfa mobil LCP image preload')
    assert('/', Boolean(desktopLink), 'ana sayfa desktop LCP image preload')
    for (const tag of [mobileLink, desktopLink]) {
      if (!tag) continue
      assert('/', tag.includes('fetchpriority="high"'), 'LCP fetchpriority=high')
      if (tag.includes('optavif-w')) {
        assert('/', tag.includes('type="image/avif"'), 'optavif → AVIF preload type')
        assert('/', tag.includes('imagesrcset='), 'optavif → imagesrcset')
        assert('/', tag.includes('imagesizes="100vw"'), 'optavif → imagesizes')
        assert('/', tag.includes('.avif'), 'optavif srcset AVIF')
        assert('/', !tag.includes('.webp'), 'optavif preload WebP değil')
      } else if (tag.includes('opt-w')) {
        assert('/', tag.includes('type="image/webp"'), 'opt-w → WebP preload type')
        assert('/', tag.includes('imagesrcset='), 'opt-w → imagesrcset')
        assert('/', !tag.includes('.avif'), 'opt-w AVIF tahmin etmez')
      }
    }
    assert('/', !home.includes('/_vercel/image'), 'kırık /_vercel/image preload yok')
    verifyHomeBrandedFirstPaint()
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
