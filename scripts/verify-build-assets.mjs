#!/usr/bin/env node
/**
 * dist/index.html içindeki /assets/* referanslarının dist'te mevcut olduğunu doğrular.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '../dist')
const indexPath = path.join(distDir, 'index.html')

if (!fs.existsSync(indexPath)) {
  console.error('[verify:assets] dist/index.html not found — run vite build first')
  process.exit(1)
}

const html = fs.readFileSync(indexPath, 'utf8')
const assetRefs = [
  ...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g),
].map((match) => match[1])

if (assetRefs.length === 0) {
  console.error('[verify:assets] no /assets/* references found in dist/index.html')
  process.exit(1)
}

const missing = []
for (const ref of assetRefs) {
  const filePath = path.join(distDir, ref.replace(/^\//, ''))
  if (!fs.existsSync(filePath)) {
    missing.push(ref)
  }
}

if (missing.length > 0) {
  console.error('[verify:assets] missing files referenced by index.html:')
  for (const ref of missing) {
    console.error(`  - ${ref}`)
  }
  process.exit(1)
}

console.log(`[verify:assets] OK — ${assetRefs.length} asset references exist in dist/`)
