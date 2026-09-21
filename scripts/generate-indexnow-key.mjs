/**
 * Writes dist/<INDEXNOW_KEY>.txt for IndexNow domain ownership.
 * Build-only. Never writes into public/ (git-tracked).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  describeKey,
  readIndexNowKey,
  redactKeyLocation,
  validateIndexNowKey,
} from './lib/indexnow.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const PUBLIC_DIR = path.join(ROOT, 'public')

function main() {
  const key = readIndexNowKey()
  if (!key) {
    console.log('[indexnow] INDEXNOW_KEY yok — verification dosyası atlandı')
    return
  }
  if (!validateIndexNowKey(key)) {
    console.error('[indexnow] INDEXNOW_KEY format geçersiz (8-128 karakter, a-z A-Z 0-9 -). Dosya yazılmadı.')
    return
  }
  if (!fs.existsSync(DIST)) {
    console.error('[indexnow] dist/ bulunamadı — önce vite build çalıştırın')
    process.exit(1)
  }

  const out = path.join(DIST, `${key}.txt`)
  if (!out.startsWith(DIST)) {
    console.error('[indexnow] geçersiz çıktı yolu')
    process.exit(1)
  }

  const leaked = fs
    .readdirSync(PUBLIC_DIR)
    .filter((name) => name.endsWith('.txt') && name !== 'robots.txt')
  if (leaked.length) {
    console.error('[indexnow] public/ içinde beklenmeyen .txt var; key dosyası Git’e girmesin')
  }

  fs.writeFileSync(out, `${key}\n`, 'utf8')
  console.log(
    `[indexnow] verification dosyası yazıldı (${describeKey(key)}) → dist/<INDEXNOW_KEY>.txt (${redactKeyLocation()})`,
  )
}

main()
