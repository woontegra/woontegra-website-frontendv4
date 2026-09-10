/**
 * Browserless build-time prerender (no Playwright/Chromium).
 * Uses react-dom/server + Railway public API (with static fallbacks).
 * Client still bootstraps via createRoot (replaces #root) — crawler-first HTML.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createElement as h, Fragment } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const SITEMAP = path.join(DIST, 'sitemap.xml')

const SITE = 'https://www.woontegra.com'
const API_BASE = (() => {
  const raw =
    process.env.PRERENDER_API_URL?.trim() ||
    process.env.SITEMAP_API_URL?.trim() ||
    'https://websitebackend-production-ab6e.up.railway.app/api'
  const normalized = raw.replace(/\/+$/, '')
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`
})()
const API_TIMEOUT_MS = 10_000

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

const PAGE_SEO = {
  '/': {
    title: 'Woontegra | Yazılım, E-Ticaret ve Dijital Dönüşüm Çözümleri',
    description:
      'Woontegra Teknoloji Yazılım ve Dijital Hizmetler Ltd. Şti.; işletmeler için özel yazılım, e-ticaret altyapısı, web sitesi, masaüstü yazılım ve dijital dönüşüm çözümleri geliştirir.',
    h1: 'Woontegra, fikrinizi yalnızca yayına almakla kalmaz; onu çalışan, ölçülebilir ve sürdürülebilir bir dijital sisteme dönüştürür.',
  },
  '/hakkimizda': {
    title: 'Woontegra Hakkında | Woontegra Teknoloji Yazılım',
    description:
      'Woontegra Teknoloji Yazılım ve Dijital Hizmetler Ltd. Şti.; özel yazılım, e-ticaret altyapısı, web tasarım ve dijital sistem çözümleri geliştiren yazılım şirketidir.',
    h1: "Woontegra'yı Tanıyın",
  },
  '/iletisim': {
    title: 'Woontegra İletişim | Woontegra Teknoloji',
    description:
      'Woontegra Teknoloji Yazılım ve Dijital Hizmetler Ltd. Şti. ile iletişime geçin. Yazılım, lisans ve proje sorularınız için bize ulaşın.',
    h1: 'İletişim',
  },
  '/yazilimlar': {
    title: 'Woontegra Yazılımları | İşletmelere Özel Yazılım Çözümleri',
    description:
      'Woontegra yazılımları; işletmeler için masaüstü programlar, SaaS ürünleri ve lisanslı dijital çözümler sunar.',
    h1: 'Dijital Ürünler ve Yazılımlar',
  },
  '/hizmetler': {
    title: 'Woontegra Hizmetleri | Yazılım ve Dijital Çözümler',
    description:
      'Woontegra hizmetleri: özel yazılım geliştirme, SaaS ürün altyapısı, e-ticaret, web tasarım ve marka danışmanlığı çözümleri.',
    h1: 'Hizmetler',
  },
  '/cozumler': {
    title: 'Woontegra Çözümleri | Sektörel Yazılım ve Dijital Sistemler',
    description:
      'Woontegra çözümleri; işletmelerin operasyon, satış ve dijital süreçleri için hazırlanan yazılım ve sistem yaklaşımlarını sunar.',
    h1: 'Çözümler',
  },
  '/blog': {
    title: 'Woontegra Blog | Yazılım ve Dijital Dönüşüm',
    description: 'Woontegra blog — yazılım, e-ticaret, SaaS ve dijital dönüşüm üzerine rehber içerikler.',
    h1: 'Blog',
  },
  '/veri-silme-talebi': {
    title: 'Kullanıcı Verilerinin Silinmesi | Woontegra MailCenter',
    description:
      'MailCenter ve Meta WhatsApp bağlantıları kapsamında saklanan kullanıcı verilerinin silinmesi için izlenecek adımlar.',
    h1: 'Veri Silme Talebi',
  },
  '/gizlilik-politikasi': {
    title: 'Gizlilik Politikası | Woontegra',
    description: 'Woontegra gizlilik politikası.',
    h1: 'Gizlilik Politikası',
  },
  '/kvkk-aydinlatma-metni': {
    title: 'KVKK Aydınlatma Metni | Woontegra',
    description: 'Woontegra KVKK aydınlatma metni.',
    h1: 'KVKK Aydınlatma Metni',
  },
  '/cerez-politikasi': {
    title: 'Çerez Politikası | Woontegra',
    description: 'Woontegra çerez politikası.',
    h1: 'Çerez Politikası',
  },
  '/acik-riza-metni': {
    title: 'Açık Rıza Metni | Woontegra',
    description: 'Woontegra açık rıza metni.',
    h1: 'Açık Rıza Metni',
  },
  '/kullanim-sartlari': {
    title: 'Kullanım Şartları | Woontegra',
    description: 'Woontegra kullanım şartları.',
    h1: 'Kullanım Şartları',
  },
  '/mesafeli-satis-sozlesmesi': {
    title: 'Mesafeli Satış Sözleşmesi | Woontegra',
    description: 'Woontegra mesafeli satış sözleşmesi.',
    h1: 'Mesafeli Satış Sözleşmesi',
  },
  '/on-bilgilendirme-formu': {
    title: 'Ön Bilgilendirme Formu | Woontegra',
    description: 'Woontegra ön bilgilendirme formu.',
    h1: 'Ön Bilgilendirme Formu',
  },
  '/iade-iptal-kosullari': {
    title: 'İade ve İptal Koşulları | Woontegra',
    description: 'Woontegra iade ve iptal koşulları.',
    h1: 'İade ve İptal Koşulları',
  },
}

const PRODUCT_FALLBACKS = {
  'bilirkisi-hesap': {
    name: 'Bilirkişi Hesaplama Yazılımı',
    title: 'Bilirkişi Hesaplama Yazılımı | Woontegra Yazılımları',
    description:
      'İşçilik alacakları, kıdem-ihbar tazminatı, fazla mesai ve yıllık izin hesaplamalarını web tabanlı olarak hazırlamak için geliştirilen Bilirkişi Hesaplama Yazılımı.',
    body: 'Bilirkişi Hesaplama Yazılımı; iş hukuku ve bilirkişilik süreçlerinde kullanılan hesaplama kalemlerini tek merkezde toplayan, web tabanlı bir Woontegra yazılımıdır.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
  },
  'muvekkil-kasa-defteri': {
    name: 'Müvekkil Kasa Defteri',
    title: 'Müvekkil Kasa Defteri Masaüstü ve Web Tabanlı Karşılaştırması | Woontegra',
    description:
      'Müvekkil Kasa Defteri masaüstü ve web tabanlı sürümlerini karşılaştırın; büronuza uygun kullanım ve erişim modelini seçin.',
    body: 'Müvekkil Kasa Defteri: Size Uygun Sürümü Seçin. Woontegra’nın avukat büroları için geliştirdiği masaüstü ve web tabanlı kasa defteri yazılımlarını karşılaştırın.',
    applicationCategory: 'BusinessApplication',
    h1: 'Müvekkil Kasa Defteri: Size Uygun Sürümü Seçin',
  },
  'sifre-kasasi': {
    name: 'Woontegra Şifre Kasası',
    title: 'Woontegra Şifre Kasası | Ücretsiz Windows Şifre Yönetim Aracı',
    description:
      "Giriş URL'lerinizi, kullanıcı adlarınızı, şifrelerinizi ve notlarınızı yerel ve şifreli şekilde saklayın.",
    body: 'Ücretsiz Woontegra Şifre Kasası ile şifrelerinizi yerel ve şifreli şekilde yönetin.',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Windows',
    h1: 'Ücretsiz Woontegra Şifre Kasası',
    price: 0,
    priceCurrency: 'TRY',
  },
}

const SERVICE_TITLES = {
  saas: 'SaaS',
  'web-tasarim': 'Web Tasarım',
  'yazilim-gelistirme': 'Yazılım Geliştirme',
  'e-ticaret': 'E-Ticaret',
}

const SOLUTION_TITLES = {
  'e-ticaret-altyapisi': 'E-Ticaret Altyapısı',
  'pazaryeri-entegrasyonu': 'Pazaryeri Entegrasyonu',
  'siparis-yonetimi': 'Sipariş Yönetimi',
  'stok-fiyat-yonetimi': 'Stok ve Fiyat Yönetimi',
  'dijital-operasyon': 'Dijital Operasyon',
  'ozel-yazilim-surecleri': 'Özel Yazılım Süreçleri',
}

function normalizePath(p) {
  const clean = String(p || '/').split('?')[0].split('#')[0]
  if (!clean || clean === '/') return '/'
  return clean.endsWith('/') && clean.length > 1 ? clean.slice(0, -1) : clean
}

function isBlocked(route) {
  const p = normalizePath(route)
  return BLOCKED_PREFIXES.some((prefix) => p === prefix || p.startsWith(prefix))
}

function siteUrl(route) {
  const p = normalizePath(route)
  return p === '/' ? `${SITE}/` : `${SITE}${p}`
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function fetchJson(pathname) {
  const url = `${API_BASE}${pathname.startsWith('/') ? pathname : `/${pathname}`}`
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), API_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

function unwrapData(payload) {
  if (!payload || typeof payload !== 'object') return null
  if ('data' in payload) return payload.data
  return payload
}

function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Woontegra',
    legalName: 'Woontegra Teknoloji Yazılım ve Dijital Hizmetler Ltd. Şti.',
    url: SITE,
    logo: `${SITE}/images/woontegra-logo.svg`,
    description:
      'Woontegra, işletmeler için özel yazılım, e-ticaret altyapısı, web sitesi ve dijital dönüşüm çözümleri geliştirir.',
    email: 'info@woontegra.com',
    telephone: '+90 532 317 17 55',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'İskele Mahallesi Bademli Caddesi Hanlılar 2 Sitesi 43/6 Datça / Muğla 48900',
      addressLocality: 'Datça',
      addressRegion: 'Muğla',
      addressCountry: 'TR',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'info@woontegra.com',
      telephone: '+90 532 317 17 55',
      availableLanguage: ['Turkish'],
    },
  }
}

function webSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Woontegra',
    url: `${SITE}/`,
  }
}

function softwareApplicationSchema(input) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: input.name,
    description: input.description,
    url: input.url,
    applicationCategory: input.applicationCategory || 'BusinessApplication',
    publisher: { '@type': 'Organization', name: 'Woontegra', url: SITE },
    provider: { '@type': 'Organization', name: 'Woontegra', url: SITE },
  }
  if (input.operatingSystem) schema.operatingSystem = input.operatingSystem
  if (input.price != null && Number.isFinite(input.price)) {
    schema.offers = {
      '@type': 'Offer',
      price: String(input.price),
      priceCurrency: input.priceCurrency || 'TRY',
      url: input.url,
      availability: 'https://schema.org/InStock',
    }
  }
  return schema
}

function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: siteUrl(item.path),
    })),
  }
}

function routesFromSitemap() {
  if (!fs.existsSync(SITEMAP)) return []
  const xml = fs.readFileSync(SITEMAP, 'utf8')
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => {
      try {
        return normalizePath(new URL(m[1].trim()).pathname)
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

function scrubAdminPreloads(html) {
  return html.replace(/<link[^>]+rel="modulepreload"[^>]+href="[^"]*admin-[^"]+\.js"[^>]*>\s*/gi, '')
}

function outputPathForRoute(route) {
  if (route === '/') return path.join(DIST, 'index.html')
  return path.join(DIST, route.replace(/^\//, ''), 'index.html')
}

function stripTags(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function loadProduct(slug) {
  const raw = unwrapData(await fetchJson(`/products/${encodeURIComponent(slug)}`))
  if (!raw || typeof raw !== 'object') return null
  return raw
}

async function resolvePageModel(route, cache) {
  const seoBase = PAGE_SEO[route]
  const jsonLd = [organizationSchema()]
  let title = seoBase?.title || 'Woontegra'
  let description = seoBase?.description || PAGE_SEO['/'].description
  let h1 = seoBase?.h1 || 'Woontegra'
  let bodyText = description
  let crumbs = [{ name: 'Ana Sayfa', path: '/' }]

  if (route === '/') {
    jsonLd.push(webSiteSchema())
    const home = unwrapData(await fetchJson('/page-content/home'))
    if (home && typeof home === 'object') {
      const seoTitle = String(home.seoTitle || '').trim()
      const seoDescription = String(home.seoDescription || '').trim()
      if (seoTitle) title = seoTitle
      if (seoDescription) description = seoDescription
      const introTitle = home.intro?.title || home.hero?.title
      if (introTitle) {
        h1 = String(introTitle)
        bodyText = `${h1} ${description}`
      }
    }
    bodyText = `${bodyText} Woontegra yazılım, e-ticaret ve dijital dönüşüm çözümleri sunar.`
    return { title, description, h1, bodyText, jsonLd, crumbs }
  }

  if (route === '/hakkimizda') {
    crumbs.push({ name: 'Hakkımızda', path: route })
    jsonLd.push(breadcrumbSchema(crumbs))
    const about = unwrapData(await fetchJson('/page-content/about'))
    if (about?.heroTitle) h1 = String(about.heroTitle)
    if (about?.seoTitle) title = String(about.seoTitle)
    if (about?.seoDescription) description = String(about.seoDescription)
    bodyText = `${h1}. ${description} Woontegra kendi ürünlerini geliştiren bir teknoloji şirketidir.`
    return { title, description, h1, bodyText, jsonLd, crumbs }
  }

  if (route === '/iletisim') {
    crumbs.push({ name: 'İletişim', path: route })
    jsonLd.push(breadcrumbSchema(crumbs))
    bodyText = `${h1}. ${description} E-posta: info@woontegra.com. Telefon: +90 532 317 17 55.`
    return { title, description, h1, bodyText, jsonLd, crumbs }
  }

  if (route === '/yazilimlar') {
    crumbs.push({ name: 'Yazılımlar', path: route })
    jsonLd.push(breadcrumbSchema(crumbs))
    bodyText = `${h1}. Woontegra yazılımları: Bilirkişi Hesaplama Yazılımı, Müvekkil Kasa Defteri ve Şifre Kasası.`
    return { title, description, h1, bodyText, jsonLd, crumbs }
  }

  if (route === '/yazilimlar/bilirkisi-hesap') {
    const fb = PRODUCT_FALLBACKS['bilirkisi-hesap']
    const product = (await loadProduct('bilirkisi-hesap')) || fb
    title = product.seoTitle || fb.title
    description = product.seoDescription || product.shortDescription || fb.description
    h1 = product.name || fb.name
    bodyText = `${h1}. ${stripTags(product.description || fb.body)} Woontegra ürünüdür.`
    crumbs.push({ name: 'Yazılımlar', path: '/yazilimlar' }, { name: h1, path: route })
    jsonLd.push(
      softwareApplicationSchema({
        name: h1,
        description,
        url: siteUrl(route),
        applicationCategory: fb.applicationCategory,
        operatingSystem: fb.operatingSystem,
      }),
      breadcrumbSchema(crumbs),
    )
    return { title, description, h1, bodyText, jsonLd, crumbs }
  }

  if (route === '/yazilimlar/muvekkil-kasa-defteri') {
    const fb = PRODUCT_FALLBACKS['muvekkil-kasa-defteri']
    const desktop = await loadProduct('muvekkil-kasa-defteri-yazilimi')
    const saas = await loadProduct('muvekkil-kasa-defteri-web-tabanli')
    title = fb.title
    description = fb.description
    h1 = fb.h1
    const bits = [fb.body]
    if (desktop?.name) bits.push(`Masaüstü: ${desktop.name}.`)
    if (saas?.name) bits.push(`Web tabanlı: ${saas.name}.`)
    bodyText = bits.join(' ')
    crumbs.push({ name: 'Yazılımlar', path: '/yazilimlar' }, { name: 'Müvekkil Kasa Defteri', path: route })
    jsonLd.push(
      softwareApplicationSchema({
        name: fb.name,
        description,
        url: siteUrl(route),
        applicationCategory: fb.applicationCategory,
      }),
      breadcrumbSchema(crumbs),
    )
    return { title, description, h1, bodyText, jsonLd, crumbs }
  }

  if (route === '/yazilimlar/sifre-kasasi') {
    const fb = PRODUCT_FALLBACKS['sifre-kasasi']
    const product = (await loadProduct('sifre-kasasi')) || fb
    title = product.seoTitle || fb.title
    description = product.seoDescription || product.shortDescription || fb.description
    h1 = product.name?.includes('Şifre') ? product.name : fb.h1
    bodyText = `${h1}. ${stripTags(product.description || fb.body)}`
    crumbs.push({ name: 'Yazılımlar', path: '/yazilimlar' }, { name: h1, path: route })
    jsonLd.push(
      softwareApplicationSchema({
        name: product.name || fb.name,
        description,
        url: siteUrl(route),
        applicationCategory: fb.applicationCategory,
        operatingSystem: fb.operatingSystem,
        price: typeof product.price === 'number' ? product.price : fb.price,
        priceCurrency: product.currency || fb.priceCurrency,
      }),
      breadcrumbSchema(crumbs),
    )
    return { title, description, h1, bodyText, jsonLd, crumbs }
  }

  if (route.startsWith('/yazilimlar/') && route !== '/yazilimlar') {
    const slug = route.slice('/yazilimlar/'.length)
    const product = await loadProduct(slug)
    if (product?.name) {
      title = product.seoTitle || `${product.name} | Woontegra Yazılımları`
      description = product.seoDescription || product.shortDescription || description
      h1 = product.name
      bodyText = `${h1}. ${stripTags(product.description || description)}`
      crumbs.push({ name: 'Yazılımlar', path: '/yazilimlar' }, { name: h1, path: route })
      jsonLd.push(
        softwareApplicationSchema({
          name: h1,
          description,
          url: siteUrl(route),
          price: typeof product.price === 'number' ? product.price : null,
          priceCurrency: product.currency || 'TRY',
        }),
        breadcrumbSchema(crumbs),
      )
      return { title, description, h1, bodyText, jsonLd, crumbs }
    }
  }

  if (route.startsWith('/hizmetler/') && route !== '/hizmetler') {
    const slug = route.slice('/hizmetler/'.length)
    const label = SERVICE_TITLES[slug] || slug
    h1 = label
    title = PAGE_SEO[route]?.title || `${label} | Woontegra Hizmetleri`
    description = PAGE_SEO[route]?.description || `${label} hizmeti — Woontegra.`
    bodyText = `${h1}. ${description}`
    crumbs.push({ name: 'Hizmetler', path: '/hizmetler' }, { name: h1, path: route })
    jsonLd.push(breadcrumbSchema(crumbs))
    return { title, description, h1, bodyText, jsonLd, crumbs }
  }

  if (route.startsWith('/cozumler/') && route !== '/cozumler') {
    const slug = route.slice('/cozumler/'.length)
    const label = SOLUTION_TITLES[slug] || slug
    h1 = label
    title = `${label} | Woontegra Çözümleri`
    description = `${label} çözümü — Woontegra yazılım ve dijital sistem yaklaşımları.`
    bodyText = `${h1}. ${description}`
    crumbs.push({ name: 'Çözümler', path: '/cozumler' }, { name: h1, path: route })
    jsonLd.push(breadcrumbSchema(crumbs))
    return { title, description, h1, bodyText, jsonLd, crumbs }
  }

  if (route.startsWith('/blog/') && route !== '/blog') {
    const slug = route.slice('/blog/'.length)
    if (!cache.blogBySlug) {
      const list = unwrapData(await fetchJson('/blog/posts'))
      cache.blogBySlug = new Map()
      if (Array.isArray(list)) {
        for (const post of list) {
          if (post?.slug) cache.blogBySlug.set(String(post.slug), post)
        }
      }
    }
    let post = cache.blogBySlug.get(slug)
    if (!post) post = unwrapData(await fetchJson(`/blog/posts/${encodeURIComponent(slug)}`))
    if (post?.title) {
      title = post.title
      description = post.excerpt || post.seoDescription || description
      h1 = post.title
      bodyText = `${h1}. ${stripTags(post.content || post.excerpt || description)}`
      crumbs.push({ name: 'Blog', path: '/blog' }, { name: h1, path: route })
      jsonLd.push(breadcrumbSchema(crumbs))
      return { title, description, h1, bodyText, jsonLd, crumbs }
    }
    // Blog detay API yoksa build'i düşürmemek için minimal ama geçerli SEO sayfası
    h1 = slug.replace(/-/g, ' ')
    title = `${h1} | Woontegra Blog`
    bodyText = `${h1}. Woontegra blog yazısı.`
    crumbs.push({ name: 'Blog', path: '/blog' }, { name: h1, path: route })
    jsonLd.push(breadcrumbSchema(crumbs))
    return { title, description, h1, bodyText, jsonLd, crumbs }
  }

  if (seoBase) {
    crumbs.push({ name: h1, path: route })
    if (route !== '/') jsonLd.push(breadcrumbSchema(crumbs))
    bodyText = `${h1}. ${description} Woontegra.`
    return { title, description, h1, bodyText, jsonLd, crumbs }
  }

  // Bilinmeyen public route — sitemap'ten geldiyse minimal içerik
  h1 = route.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Woontegra'
  title = `${h1} | Woontegra`
  bodyText = `${h1}. Woontegra.`
  crumbs.push({ name: h1, path: route })
  jsonLd.push(breadcrumbSchema(crumbs))
  return { title, description, h1, bodyText, jsonLd, crumbs }
}

function renderBody(model) {
  return renderToStaticMarkup(
    h(
      Fragment,
      null,
      h(
        'header',
        { className: 'prerender-header' },
        h('a', { href: '/' }, 'Woontegra'),
        h('nav', { 'aria-label': 'Ana menü' }, [
          h('a', { key: 'a', href: '/hakkimizda' }, 'Hakkımızda'),
          ' ',
          h('a', { key: 'b', href: '/yazilimlar' }, 'Yazılımlar'),
          ' ',
          h('a', { key: 'c', href: '/hizmetler' }, 'Hizmetler'),
          ' ',
          h('a', { key: 'd', href: '/iletisim' }, 'İletişim'),
        ]),
      ),
      h(
        'main',
        null,
        h('h1', null, model.h1),
        h('p', null, model.bodyText),
        h(
          'p',
          null,
          'Woontegra Teknoloji Yazılım ve Dijital Hizmetler Ltd. Şti. — yazılım, e-ticaret ve dijital dönüşüm.',
        ),
      ),
      h(
        'footer',
        null,
        h('p', null, '© Woontegra — www.woontegra.com'),
      ),
    ),
  )
}

function buildHeadExtras(model, route) {
  const canonical = siteUrl(route)
  const ogImage = `${SITE}/images/woontegra-logo.svg`
  const jsonLdTags = model.jsonLd
    .map(
      (data) =>
        `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`,
    )
    .join('\n')

  return [
    `<title>${escapeHtml(model.title)}</title>`,
    `<meta name="description" content="${escapeHtml(model.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Woontegra" />`,
    `<meta property="og:title" content="${escapeHtml(model.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(model.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(ogImage)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(model.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(model.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`,
    jsonLdTags,
  ].join('\n')
}

function injectIntoShell(shellHtml, model, route, bodyHtml) {
  let html = scrubAdminPreloads(shellHtml)

  // Replace default title/description/canonical if present
  html = html.replace(/<title>[^<]*<\/title>/i, '')
  html = html.replace(/<meta\s+name="description"[^>]*>\s*/i, '')
  html = html.replace(/<link\s+rel="canonical"[^>]*>\s*/i, '')

  const headExtras = buildHeadExtras(model, route)
  if (!html.includes('</head>')) throw new Error('Shell HTML missing </head>')
  html = html.replace('</head>', `${headExtras}\n</head>`)

  if (!html.includes('<div id="root"></div>')) {
    throw new Error('Shell HTML missing empty #root')
  }
  html = html.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`)

  return html
}

async function main() {
  if (!fs.existsSync(DIST)) {
    throw new Error('dist/ bulunamadı — önce vite build çalıştırın')
  }

  const shellPath = path.join(DIST, 'index.html')
  const spaShell = fs.readFileSync(shellPath, 'utf8')
  const routes = collectRoutes()
  // Write `/` last so index.html is the home snapshot
  const ordered = [...routes.filter((r) => r !== '/'), ...routes.filter((r) => r === '/')]
  console.log(`[prerender] browserless — ${ordered.length} route (API: ${API_BASE})`)

  const cache = {}
  let ok = 0
  const critical = new Set([
    '/',
    '/hakkimizda',
    '/iletisim',
    '/yazilimlar',
    '/yazilimlar/bilirkisi-hesap',
    '/yazilimlar/muvekkil-kasa-defteri',
    '/yazilimlar/sifre-kasasi',
  ])

  for (const route of ordered) {
    try {
      const model = await resolvePageModel(route, cache)
      if (!model.h1?.trim() || !model.title?.trim()) {
        throw new Error('eksik title/h1')
      }
      if (critical.has(route) && !/woontegra/i.test(`${model.title} ${model.bodyText} ${model.h1}`)) {
        throw new Error('kritik sayfada Woontegra metni yok')
      }
      const bodyHtml = renderBody(model)
      // Always start from pristine SPA shell for asset tags
      const html = injectIntoShell(spaShell, model, route, bodyHtml)
      if (!/<h1[\s>]/i.test(html)) throw new Error('H1 yazılamadı')
      const out = outputPathForRoute(route)
      fs.mkdirSync(path.dirname(out), { recursive: true })
      fs.writeFileSync(out, html, 'utf8')
      ok += 1
      console.log(`[prerender] OK ${route}`)
    } catch (err) {
      console.error(`[prerender] FAIL ${route}:`, err instanceof Error ? err.message : err)
      if (critical.has(route)) throw err
      // Non-critical: still fail build to avoid empty crawler pages
      throw err
    }
  }

  console.log(`[prerender] tamamlandı — ${ok}/${ordered.length} (browserless)`)
}

main().catch((err) => {
  console.error('[prerender]', err)
  process.exit(1)
})
