/**
 * KoopPlus SaaS showcase screenshots (view-only).
 * Credentials: KOOPPLUS_SHOWCASE_EMAIL / KOOPPLUS_SHOWCASE_PASSWORD from env or local .env
 * — never logged, never written to output files.
 *
 * Usage: npm run koopplus:screenshots
 */
import { chromium } from 'playwright'
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FRONTEND_ROOT = path.join(__dirname, '..')
const WEBSITE_ROOT = path.join(FRONTEND_ROOT, '..')
const OUT_DIR = path.join(FRONTEND_ROOT, 'public', 'images', 'products', 'koopplus-gallery')

const BASE_URL = 'https://koopplus.woontegra.com'
const HIDE_CHROME_CSS = `
  .top-banner,
  .top-banner--support,
  [class*="top-banner"],
  .demo-usage-banner,
  .usage-expiry-banner,
  .announcement-banners { display: none !important; }
`

const DESKTOP = { width: 1440, height: 900, deviceScaleFactor: 2, maxBytes: 250 * 1024 }
const MOBILE = { width: 390, height: 844, deviceScaleFactor: 3, maxBytes: 120 * 1024 }

function loadEnvFile(filePath, into) {
  if (!fs.existsSync(filePath)) return
  const text = fs.readFileSync(filePath, 'utf8')
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq <= 0) continue
    const key = line.slice(0, eq).trim()
    let val = line.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (!(key in into) || !into[key]) into[key] = val
  }
}

function resolveCredentials() {
  const bag = { ...process.env }
  loadEnvFile(path.join(FRONTEND_ROOT, '.env'), bag)
  loadEnvFile(path.join(WEBSITE_ROOT, 'backend', '.env'), bag)
  loadEnvFile(path.join(WEBSITE_ROOT, '.env'), bag)
  const email = (bag.KOOPPLUS_SHOWCASE_EMAIL || '').trim()
  const password = (bag.KOOPPLUS_SHOWCASE_PASSWORD || '').trim()
  if (!email || !password) {
    throw new Error('KOOPPLUS_SHOWCASE_EMAIL / KOOPPLUS_SHOWCASE_PASSWORD eksik (.env)')
  }
  return { email, password }
}

async function hideChrome(page) {
  await page.addStyleTag({ content: HIDE_CHROME_CSS })
}

async function login(page, email, password) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForSelector('#login-email', { timeout: 60000 })
  await page.fill('#login-email', email)
  await page.fill('#login-password', password)
  await Promise.all([
    page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 90000 }),
    page.click('button.login-card__submit[type="submit"]'),
  ])
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {})
}

async function settle(page, ms = 900) {
  await page.waitForTimeout(ms)
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {})
}

async function selectDebtPartnerWithAllocation(page) {
  await page.goto(`${BASE_URL}/uye-borc-tablosu`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await settle(page, 1200)
  await hideChrome(page)

  const input = page.locator('input.partner-search-select__input').first()
  await input.waitFor({ state: 'visible', timeout: 30000 })

  for (let attempt = 0; attempt < 40; attempt++) {
    await input.click({ clickCount: 3 })
    await input.fill('')
    await input.focus()
    await page.waitForTimeout(200)
    await input.click()
    await page.waitForSelector('.partner-search-select__option', { timeout: 8000 }).catch(() => null)
    const options = page.locator('.partner-search-select__option')
    const count = await options.count()
    if (count === 0) break
    const index = Math.min(attempt, count - 1)
    const label = (await options.nth(index).innerText()).trim()
    if (!label || /üye seç|boş|bulunamadı/i.test(label)) {
      if (attempt >= count - 1) break
      continue
    }
    await options.nth(index).click()
    await settle(page, 1400)
    await hideChrome(page)

    const hasCols = await page.locator('th', { hasText: 'Faize giden' }).count()
    const hasBars = await page.locator('.alloc-bar').count()
    const interestCells = page.locator('td.money-interest')
    const interestCount = await interestCells.count()
    let hasInterestValue = false
    for (let i = 0; i < Math.min(interestCount, 24); i++) {
      const text = (await interestCells.nth(i).innerText()).trim()
      if (text && text !== '—' && /[1-9]/.test(text.replace(/[^\d]/g, ''))) {
        hasInterestValue = true
        break
      }
    }
    if (hasCols > 0 && (hasBars > 0 || hasInterestValue)) {
      return label
    }
  }
  throw new Error('Faiz/ana para dağılımı olan üye bulunamadı (yalnızca görüntüleme denemesi)')
}

async function compressWebp(pngBuffer, outPath, maxBytes) {
  let quality = 82
  let best = null
  while (quality >= 40) {
    const buf = await sharp(pngBuffer).webp({ quality, effort: 6 }).toBuffer()
    best = buf
    if (buf.length <= maxBytes) break
    quality -= 6
  }
  if (!best) throw new Error(`WebP üretilemedi: ${outPath}`)
  // Still over budget: shrink dimensions slightly
  if (best.length > maxBytes) {
    const meta = await sharp(pngBuffer).metadata()
    let scale = 0.92
    while (scale >= 0.7) {
      const w = Math.round((meta.width || 1) * scale)
      const buf = await sharp(pngBuffer)
        .resize({ width: w })
        .webp({ quality: Math.max(quality, 48), effort: 6 })
        .toBuffer()
      best = buf
      if (buf.length <= maxBytes) break
      scale -= 0.05
    }
  }
  fs.writeFileSync(outPath, best)
  return { bytes: best.length, quality }
}

async function shot(page, fileName, maxBytes) {
  await hideChrome(page)
  await settle(page, 600)
  const png = await page.screenshot({ type: 'png', fullPage: false })
  const outPath = path.join(OUT_DIR, fileName)
  const info = await compressWebp(png, outPath, maxBytes)
  const kb = (info.bytes / 1024).toFixed(1)
  console.log(`ok ${fileName} ${kb} KB (q≈${info.quality})`)
  return outPath
}

async function captureDesktop(context, email, password) {
  const page = await context.newPage()
  await page.setViewportSize({ width: DESKTOP.width, height: DESKTOP.height })
  // deviceScaleFactor is set on context
  await login(page, email, password)
  await hideChrome(page)

  const routes = [
    { path: '/', file: 'desktop-yonetim-paneli.webp' },
    { path: '/uyeler', file: 'desktop-uyeler.webp' },
    { path: '/faiz-isletme', file: 'desktop-faiz-karari.webp' },
    { path: '/kooperatif-kasasi', file: 'desktop-kooperatif-kasasi.webp' },
    { path: '/banka-hareketleri', file: 'desktop-banka-hareketleri.webp' },
    { path: '/raporlar', file: 'desktop-raporlar.webp' },
  ]

  for (const route of routes) {
    await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await settle(page, 1100)
    await shot(page, route.file, DESKTOP.maxBytes)
  }

  await selectDebtPartnerWithAllocation(page)
  await shot(page, 'desktop-uye-borc-tablosu.webp', DESKTOP.maxBytes)
  await page.close()
}

async function captureMobile(context, email, password) {
  const page = await context.newPage()
  await page.setViewportSize({ width: MOBILE.width, height: MOBILE.height })
  await login(page, email, password)
  await hideChrome(page)

  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await settle(page, 1100)
  await shot(page, 'mobile-yonetim-paneli.webp', MOBILE.maxBytes)

  await selectDebtPartnerWithAllocation(page)
  await shot(page, 'mobile-uye-borc-tablosu.webp', MOBILE.maxBytes)
  await page.close()
}

async function main() {
  const { email, password } = resolveCredentials()
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  try {
    const desktopCtx = await browser.newContext({
      viewport: { width: DESKTOP.width, height: DESKTOP.height },
      deviceScaleFactor: DESKTOP.deviceScaleFactor,
      locale: 'tr-TR',
    })
    await captureDesktop(desktopCtx, email, password)
    await desktopCtx.close()

    const mobileCtx = await browser.newContext({
      viewport: { width: MOBILE.width, height: MOBILE.height },
      deviceScaleFactor: MOBILE.deviceScaleFactor,
      isMobile: true,
      hasTouch: true,
      locale: 'tr-TR',
    })
    await captureMobile(mobileCtx, email, password)
    await mobileCtx.close()
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : 'screenshot failed')
  process.exit(1)
})
