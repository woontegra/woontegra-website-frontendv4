import { chromium } from 'playwright'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'public', 'images', 'products')
fs.mkdirSync(outDir, { recursive: true })
const outPng = path.join(outDir, 'koopplus-login-saas.png')

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
})
await page.goto('https://koopplus.woontegra.com', { waitUntil: 'networkidle', timeout: 120000 })
await page.waitForTimeout(1500)
await page.screenshot({ path: outPng, fullPage: false, type: 'png' })
await browser.close()
console.log('saved', outPng, fs.statSync(outPng).size)
