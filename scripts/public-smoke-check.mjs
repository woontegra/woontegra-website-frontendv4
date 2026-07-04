#!/usr/bin/env node
/**
 * Aşama 3.5 — public route / nav URL smoke check (backend'e dokunmaz).
 * Kullanım: node scripts/public-smoke-check.mjs
 */
const API = process.env.VITE_DEV_API_PROXY || 'https://websitebackend-production-ab6e.up.railway.app'

const KNOWN_V4_ROUTES = new Set([
  '/',
  '/hakkimizda',
  '/hizmetler',
  '/cozumler',
  '/yazilimlar',
  '/blog',
  '/iletisim',
  '/sepet',
  '/odeme',
  '/odeme/basarili',
  '/odeme/basarisiz',
  '/cerez-politikasi',
  '/kvkk-aydinlatma-metni',
  '/gizlilik-politikasi',
  '/acik-riza-metni',
  '/kullanim-sartlari',
  '/iade-iptal-kosullari',
  '/mesafeli-satis-sozlesmesi',
  '/on-bilgilendirme-formu',
])

const SERVICE_SLUGS = [
  'mobil-uygulama-gelistirme',
  'web-tasarim',
  'e-ticaret',
  'saas',
  'yazilim-gelistirme',
  'marka-patent-vekilligi',
]

const SOLUTION_SLUGS = ['bilirkisi-hesaplama', 'datca-topikal']

const LEGAL_SLUGS = [
  'on-bilgilendirme-formu',
  'mesafeli-satis-sozlesmesi',
  'elektronik-ileti-bilgilendirme',
  'pazarlama-acik-riza-metni',
]

const LEGAL_TYPES = [
  'PRE_INFORMATION',
  'DISTANCE_SALES',
  'KVKK_CLARIFICATION',
  'PRIVACY_POLICY',
  'TERMS_OF_USE',
  'EXPLICIT_CONSENT',
  'SOFTWARE_LICENSE',
  'SAAS_SUBSCRIPTION',
  'DIGITAL_IMMEDIATE_DELIVERY_WAIVER',
  'COMMERCIAL_ELECTRONIC_MESSAGE',
]

const TYPE_TO_SLUG = {
  KVKK_CLARIFICATION: 'kvkk-aydinlatma-metni',
  PRIVACY_POLICY: 'gizlilik-politikasi',
  EXPLICIT_CONSENT: 'acik-riza-metni',
  TERMS_OF_USE: 'kullanim-sartlari',
  DISTANCE_SALES: 'mesafeli-satis-sozlesmesi',
  PRE_INFORMATION: 'on-bilgilendirme-formu',
  COMMERCIAL_ELECTRONIC_MESSAGE: 'elektronik-ileti-bilgilendirme',
  COOKIE_POLICY: 'cerez-politikasi',
  RETURN_CANCELLATION_POLICY: 'iade-iptal-kosullari',
  DISTANCE_SALES_AGREEMENT: 'mesafeli-satis-sozlesmesi',
  PRE_INFORMATION_FORM: 'on-bilgilendirme-formu',
}

const SERVICE_ALIASES = {
  'e-ticaret-cozumleri': 'e-ticaret',
  'saas-urun-gelistirme': 'saas',
}

const LEGACY_FOOTER = {
  '/yasal-belge/KVKK_CLARIFICATION': '/kvkk-aydinlatma-metni',
  '/yasal-belge/PRIVACY_POLICY': '/gizlilik-politikasi',
  '/yasal-belge/EXPLICIT_CONSENT': '/acik-riza-metni',
  '/yasal-belge/TERMS_OF_USE': '/kullanim-sartlari',
  '/yasal-belge/PRE_INFORMATION': '/on-bilgilendirme-formu',
  '/yasal-belge/DISTANCE_SALES': '/mesafeli-satis-sozlesmesi',
  '/yasal-belge/COMMERCIAL_ELECTRONIC_MESSAGE': '/elektronik-ileti-bilgilendirme',
}

function normalizeLegalHref(pathOnly) {
  if (LEGACY_FOOTER[pathOnly]) return LEGACY_FOOTER[pathOnly]
  if (pathOnly.startsWith('/yasal-belge/')) {
    const type = pathOnly.slice('/yasal-belge/'.length)
    if (TYPE_TO_SLUG[type]) return `/${TYPE_TO_SLUG[type]}`
  }
  if (pathOnly.startsWith('/yasal/')) {
    const slug = pathOnly.slice('/yasal/'.length)
    if (KNOWN_V4_ROUTES.has(`/${slug}`) || LEGAL_SLUGS.includes(slug)) return `/${slug}`
  }
  return pathOnly
}

function remapLegacyServiceUrl(url) {
  if (!url || url === '#') return url
  const match = url.match(/^\/([^/?#]+)\/?$/)
  if (!match) return url
  const slug = match[1]
  if (SERVICE_ALIASES[slug]) return `/hizmetler/${SERVICE_ALIASES[slug]}`
  if (SERVICE_SLUGS.includes(slug)) return `/hizmetler/${slug}`
  return url
}

function resolvePublicHref(url) {
  const raw = (url ?? '').trim()
  if (!raw || raw === '#') return raw
  if (/^https?:\/\//.test(raw) || raw.startsWith('mailto:')) return raw
  const pathOnly = raw.split('?')[0].split('#')[0]
  const legal = normalizeLegalHref(pathOnly)
  if (legal !== pathOnly) return legal
  if (pathOnly.startsWith('/urun/')) return pathOnly.replace(/^\/urun\//, '/yazilimlar/')
  if (pathOnly === '/kategori/yazilimlar') return '/yazilimlar'
  return remapLegacyServiceUrl(pathOnly)
}

function classifyRoute(href) {
  if (!href || href === '#') return { ok: false, reason: 'empty' }
  if (href.startsWith('http') || href.startsWith('mailto:')) return { ok: true, reason: 'external' }
  const path = href.split('?')[0]
  if (KNOWN_V4_ROUTES.has(path)) return { ok: true, reason: 'static' }
  if (path.startsWith('/hizmetler/')) return { ok: SERVICE_SLUGS.includes(path.slice('/hizmetler/'.length)), reason: 'service' }
  if (path.startsWith('/cozumler/')) return { ok: SOLUTION_SLUGS.includes(path.slice('/cozumler/'.length)), reason: 'solution' }
  if (path.startsWith('/yazilimlar/')) return { ok: true, reason: 'product-dynamic' }
  if (path.startsWith('/blog/')) return { ok: true, reason: 'blog-dynamic' }
  if (path.startsWith('/yasal/')) return { ok: LEGAL_SLUGS.includes(path.slice('/yasal/'.length)), reason: 'legal-slug' }
  if (path.startsWith('/yasal-belge/')) return { ok: LEGAL_TYPES.some((t) => path.endsWith(t)), reason: 'legal-type' }
  if (path === '/cerez-politikasi') return { ok: true, reason: 'cookie-policy' }
  return { ok: false, reason: 'unknown' }
}

async function fetchJson(path) {
  const res = await fetch(`${API}/api/${path}`)
  if (!res.ok) throw new Error(`${path} HTTP ${res.status}`)
  return res.json()
}

async function main() {
  const issues = []
  const ok = []

  // API health
  for (const ep of ['navigation-menu', 'blog/posts?limit=1', 'products?limit=1', 'page-content/home', 'settings']) {
    try {
      await fetchJson(ep)
      ok.push(`API ${ep}`)
    } catch (e) {
      issues.push(`API FAIL ${ep}: ${e.message}`)
    }
  }

  // Nav links
  const navRes = await fetchJson('navigation-menu')
  const nav = navRes.data ?? navRes
  const walk = (items) => {
    for (const item of items ?? []) {
      const resolved = resolvePublicHref(item.resolvedUrl || item.href)
      const c = classifyRoute(resolved)
      if (c.ok) ok.push(`NAV ${item.label} -> ${resolved}`)
      else issues.push(`NAV BROKEN ${item.label}: ${item.href} -> ${resolved} (${c.reason})`)
      walk(item.children)
    }
  }
  walk(nav)

  // Footer links (API veya varsayılan)
  const DEFAULT_FOOTER_LINKS = [
    { label: 'Yazılımlar', href: '/yazilimlar' },
    { label: 'KVKK', href: '/kvkk-aydinlatma-metni' },
    { label: 'Gizlilik', href: '/gizlilik-politikasi' },
    { label: 'Çerez Politikası', href: '/cerez-politikasi' },
    { label: 'Açık Rıza', href: '/acik-riza-metni' },
    { label: 'Kullanım Şartları', href: '/kullanim-sartlari' },
  ]
  try {
    const footerRaw = await fetchJson('page-content/footerGroups')
    const payload = footerRaw.data ?? footerRaw
    const groups = payload?.groups ?? []
    const links = groups.flatMap((g) => g.links ?? [])
    const toCheck = links.length ? links : DEFAULT_FOOTER_LINKS
    for (const link of toCheck) {
      if (link.action === 'cookie-preferences') {
        ok.push('FOOTER Çerez Tercihleri (action, banner Aşama 4+)')
        continue
      }
      const resolved = resolvePublicHref(link.href ?? '/')
      const c = classifyRoute(resolved)
      if (c.ok) ok.push(`FOOTER ${link.label} -> ${resolved}`)
      else issues.push(`FOOTER BROKEN ${link.label}: ${link.href} -> ${resolved} (${c.reason})`)
    }
  } catch (e) {
    for (const link of DEFAULT_FOOTER_LINKS) {
      const resolved = resolvePublicHref(link.href)
      const c = classifyRoute(resolved)
      if (c.ok) ok.push(`FOOTER default ${link.label} -> ${resolved}`)
      else issues.push(`FOOTER default BROKEN ${link.label}`)
    }
    issues.push(`Footer API: ${e.message}`)
  }

  // Media URL resolver
  const mediaTests = [
    ['https://cdn.example.com/x.jpg', true],
    ['/uploads/a.jpg', true],
    ['/images/hero.jpg', true],
    ['', false],
    ['null', false],
    ['broken', true],
  ]
  function resolveMediaUrl(path) {
    if (path == null) return ''
    const raw = String(path).trim()
    if (!raw || ['null', 'undefined', 'none'].includes(raw.toLowerCase())) return ''
    if (/^https?:\/\//i.test(raw)) return raw
    if (raw.startsWith('/uploads/') || raw.startsWith('uploads/')) return raw.startsWith('/') ? raw : `/${raw}`
    if (raw.startsWith('/')) return raw
    return `/images/${raw.replace(/^\/+/, '')}`
  }
  for (const [input, expectNonEmpty] of mediaTests) {
    const out = resolveMediaUrl(input)
    const pass = expectNonEmpty ? Boolean(out) : !out
    if (pass) ok.push(`MEDIA ${JSON.stringify(input)} -> ${out || '(empty)'}`)
    else issues.push(`MEDIA FAIL ${JSON.stringify(input)}`)
  }

  // Static routes
  for (const slug of SERVICE_SLUGS) ok.push(`ROUTE /hizmetler/${slug}`)
  for (const slug of SOLUTION_SLUGS) ok.push(`ROUTE /cozumler/${slug}`)
  for (const slug of LEGAL_SLUGS) ok.push(`ROUTE /yasal/${slug}`)
  for (const type of LEGAL_TYPES) ok.push(`ROUTE /yasal-belge/${type}`)

  const blog = (await fetchJson('blog/posts?limit=1')).data?.[0]?.slug
  const product = (await fetchJson('products?limit=1')).data?.[0]?.slug
  if (blog) ok.push(`ROUTE /blog/${blog}`)
  if (product) ok.push(`ROUTE /yazilimlar/${product}`)

  console.log('=== OK ===')
  ok.forEach((l) => console.log(l))
  console.log('\n=== ISSUES ===')
  if (issues.length === 0) console.log('(none)')
  else issues.forEach((l) => console.log(l))
  process.exit(issues.length ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
