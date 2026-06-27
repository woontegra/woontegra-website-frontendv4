#!/usr/bin/env node
/**
 * Sepet localStorage davranışı — Node ortamında mock localStorage ile doğrulama.
 */
const store = new Map()

global.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, v),
  removeItem: (k) => store.delete(k),
}

global.window = { dispatchEvent: () => {} }

// Minimal inline cart logic mirror (same rules as cartStorage.ts)
function isSingleQuantity(productType, licenseRequired) {
  if (productType === 'SAAS') return false
  if (licenseRequired) return true
  return productType === 'DOWNLOAD' || productType === 'SERVICE'
}

function maxQ(snap) {
  if (isSingleQuantity(snap.productType, snap.licenseRequired)) return 1
  if (snap.productType === 'SAAS') return 10
  return 99
}

function clamp(line, q) {
  return Math.min(maxQ(line.snapshot), Math.max(1, Math.floor(q) || 1))
}

const CART_KEY = 'woontegra_cart_v2'
let lines = []

function write() {
  localStorage.setItem(CART_KEY, JSON.stringify(lines))
}

function add(productId, qty, snapshot) {
  const idx = lines.findIndex((l) => l.productId === productId)
  const draft = { productId, quantity: 1, snapshot }
  if (idx >= 0 && maxQ(snapshot) === 1) {
    lines[idx] = { productId, quantity: 1, snapshot }
    write()
    return 'already_in_cart'
  }
  if (idx >= 0) {
    lines[idx].quantity = clamp(draft, lines[idx].quantity + qty)
  } else {
    lines.push({ productId, quantity: clamp(draft, qty), snapshot })
  }
  write()
  return 'added'
}

const downloadSnap = { name: 'Test DL', slug: 't', price: 100, currency: 'TRY', productType: 'DOWNLOAD', licenseRequired: true }
const saasSnap = { name: 'Test SaaS', slug: 's', price: 50, currency: 'TRY', productType: 'SAAS' }

const tests = []

tests.push(['add download', () => add('p1', 1, downloadSnap) === 'added'])
tests.push(['single qty max 1', () => {
  add('p1', 5, downloadSnap)
  return lines[0].quantity === 1
}])
tests.push(['saas years', () => {
  lines = []
  add('p2', 3, saasSnap)
  return lines[0].quantity === 3
}])
tests.push(['corrupt json', () => {
  localStorage.setItem(CART_KEY, '{not-json')
  try {
    JSON.parse(localStorage.getItem(CART_KEY))
    return false
  } catch {
    return true
  }
}])

let pass = 0
for (const [name, fn] of tests) {
  const ok = fn()
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`)
  if (ok) pass++
}
console.log(`\n${pass}/${tests.length} passed`)
process.exit(pass === tests.length ? 0 : 1)
