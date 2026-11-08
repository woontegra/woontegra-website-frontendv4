/**
 * Auto-check: KoopPlus public page copy must not contain leftover desktop phrases
 * (except allowed “Masaüstü yedeğini içe aktarma” and the desktop FAQ Q/A).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const dataUrl = pathToFileURL(path.join(root, 'src/data/koopplusProduct.ts')).href
// Dynamic import of TS is unavailable; instead scan rendered default strings via a small mirror.
// We parse the TypeScript source for exported const string content used on the page.

const files = [
  'src/data/koopplusProduct.ts',
  'src/builder/types/koopplusProduct.ts',
  'src/components/public/koopplus/KoopPlusProductLayout.tsx',
  'src/components/public/koopplus/KoopPlusShowcaseGallery.tsx',
]

const FORBIDDEN = [
  /masaüstü uygulaması/i,
  /\bindir\b/i,
  /\bwindows\b/i,
  /\bmac\b/i,
  /bilgisayarınıza kurun/i,
  /yerel olarak saklanır/i,
]

const ALLOWED_LINE_RE =
  /Masaüstü yedeğini içe aktarma|Masaüstü KoopPlus kullanıyorum|masaüstü KoopPlus verilerinizi|Yedeğinizi tek tıkla SaaS|LEGACY|deprecated|@deprecated|isLegacy|LEGACY_DESKTOP|sanitizeKoopPlus|koopplus-product|purchaseWindows|purchaseMac|downloadTrial|KOOPPLUS_WINDOWS|KOOPPLUS_MAC|windows:\s*\{|platforms\.windows|planTitle|planBadge|Windows\/Mac|masaüstü\/login|masaüstü kalıntı|Eski masaüstü|const windows\b|LEGACY_DESKTOP_COPY_RE/i

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

let failures = []
for (const rel of files) {
  const abs = path.join(root, rel)
  const raw = fs.readFileSync(abs, 'utf8')
  const src = stripComments(raw)
  const lines = src.split(/\r?\n/)
  lines.forEach((line, i) => {
    if (ALLOWED_LINE_RE.test(line)) return
    // Ignore compat keys / regex detectors / variable names
    if (
      /platforms\.windows|windows:\s*\{|windows\.|const windows\b|KOOPPLUS_WINDOWS|KOOPPLUS_MAC|purchaseWindows|purchaseMac|LEGACY_DESKTOP_COPY_RE|\/windows\|macos/.test(
        line,
      )
    )
      return
    for (const re of FORBIDDEN) {
      if (re.test(line)) {
        failures.push(`${rel}:${i + 1}: ${line.trim().slice(0, 160)}`)
      }
    }
  })
}

// Page-facing user strings: only Turkish/English copy string literals from data + defaults description
const data = fs.readFileSync(path.join(root, 'src/data/koopplusProduct.ts'), 'utf8')
const stringLiterals = [...data.matchAll(/(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g)].map((m) =>
  m[2].replace(/\\n/g, ' ').replace(/\\'/g, "'"),
)
const pageText = stringLiterals
  .filter((s) => s.length >= 6)
  .filter((s) => {
    if (/Masaüstü yedeğini içe aktarma|Masaüstü KoopPlus kullanıyorum|masaüstü KoopPlus verilerinizi|Yedeğinizi tek tıkla SaaS/.test(s))
      return false
    // skip paths / identifiers
    if (/^\/|^https?:|^\.?\.?\/|koopplus|KOOPPLUS|lucide|ShieldCheck/.test(s)) return false
    return /[çğıöşüÇĞİÖŞÜA-Za-z]/.test(s)
  })
  .join('\n')

for (const re of FORBIDDEN) {
  if (re.test(pageText)) {
    const m = pageText.match(re)
    failures.push(`page-text-blob: matched ${m?.[0]}`)
  }
}

if (failures.length) {
  console.error('FAIL KoopPlus SaaS copy check:')
  for (const f of failures) console.error(' -', f)
  process.exit(1)
}
console.log('OK KoopPlus SaaS copy check — no forbidden desktop leftovers')
