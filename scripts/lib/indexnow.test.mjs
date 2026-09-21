import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  INDEXNOW_ENDPOINT,
  INDEXNOW_HOST,
  buildIndexNowPayload,
  filterIndexableUrls,
  isIndexablePublicUrl,
  isSuccessStatus,
  parseSitemapLocs,
  redactPayload,
  shouldSubmitLive,
  validateIndexNowKey,
} from './indexnow.mjs'

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.woontegra.com/</loc></url>
  <url><loc>https://www.woontegra.com/blog/api-tasarimi-best-practices</loc></url>
  <url><loc>https://www.woontegra.com/yazilimlar/bilirkisi-hesap</loc></url>
  <url><loc>https://localhost:5174/admin</loc></url>
  <url><loc>https://woontegra-git-preview.vercel.app/hakkimizda</loc></url>
</urlset>`

describe('IndexNow key validation', () => {
  it('accepts official charset and length', () => {
    assert.equal(validateIndexNowKey('abcd1234'), true)
    assert.equal(validateIndexNowKey('A1b2-C3d4-E5f6-7890'), true)
    assert.equal(validateIndexNowKey('a'.repeat(128)), true)
  })

  it('rejects short, long, or illegal characters', () => {
    assert.equal(validateIndexNowKey('short'), false)
    assert.equal(validateIndexNowKey('a'.repeat(129)), false)
    assert.equal(validateIndexNowKey('abc_defgh'), false)
    assert.equal(validateIndexNowKey('abc.defgh'), false)
    assert.equal(validateIndexNowKey(''), false)
  })
})

describe('IndexNow URL filter', () => {
  it('keeps only https www.woontegra.com public URLs', () => {
    const urls = filterIndexableUrls(parseSitemapLocs(sitemap))
    assert.deepEqual(urls, [
      'https://www.woontegra.com/',
      'https://www.woontegra.com/blog/api-tasarimi-best-practices',
      'https://www.woontegra.com/yazilimlar/bilirkisi-hesap',
    ])
  })

  it('rejects localhost, preview, apex, admin and private paths', () => {
    const blocked = [
      'http://www.woontegra.com/',
      'https://woontegra.com/hakkimizda',
      'https://localhost/blog',
      'https://127.0.0.1/blog',
      'https://something.vercel.app/blog',
      'https://www.woontegra.com/admin',
      'https://www.woontegra.com/admin/pages',
      'https://www.woontegra.com/giris',
      'https://www.woontegra.com/kayit',
      'https://www.woontegra.com/sepet',
      'https://www.woontegra.com/odeme',
      'https://www.woontegra.com/hesabim',
      'https://www.woontegra.com/builder-preview',
      'https://www.woontegra.com/api/blog/posts',
      'https://www.woontegra.com/yazilimlar/koopplus',
    ]
    for (const url of blocked) {
      assert.equal(isIndexablePublicUrl(url), false, url)
    }
  })

  it('deduplicates trailing slashes', () => {
    const urls = filterIndexableUrls([
      'https://www.woontegra.com/blog/',
      'https://www.woontegra.com/blog',
    ])
    assert.deepEqual(urls, ['https://www.woontegra.com/blog'])
  })
})

describe('IndexNow payload', () => {
  it('matches official POST JSON fields', () => {
    const key = 'testkey-indexnow-01'
    const urls = ['https://www.woontegra.com/', 'https://www.woontegra.com/blog']
    const payload = buildIndexNowPayload(urls, key)
    assert.equal(payload.host, INDEXNOW_HOST)
    assert.equal(payload.key, key)
    assert.equal(payload.keyLocation, `https://www.woontegra.com/${key}.txt`)
    assert.deepEqual(payload.urlList, urls)
    assert.equal(INDEXNOW_ENDPOINT, 'https://api.indexnow.org/indexnow')
  })

  it('redacts key from logged payload', () => {
    const payload = buildIndexNowPayload(['https://www.woontegra.com/'], 'super-secret-key')
    const safe = redactPayload(payload)
    assert.equal(safe.key, '[redacted]')
    assert.equal(safe.keyLocation.includes('super-secret-key'), false)
    assert.equal(safe.urlCount, 1)
  })
})

describe('IndexNow submit decision', () => {
  it('stays dry-run locally by default', () => {
    assert.equal(shouldSubmitLive({ argv: ['node', 'submit'], env: {} }), false)
  })

  it('submits on Vercel production unless disabled', () => {
    assert.equal(shouldSubmitLive({ argv: ['node', 'submit'], env: { VERCEL_ENV: 'production' } }), true)
    assert.equal(
      shouldSubmitLive({ argv: ['node', 'submit'], env: { VERCEL_ENV: 'production', INDEXNOW_SUBMIT: '0' } }),
      false,
    )
    assert.equal(shouldSubmitLive({ argv: ['node', 'submit'], env: { VERCEL_ENV: 'preview' } }), false)
  })

  it('honors explicit --dry-run and --submit', () => {
    assert.equal(
      shouldSubmitLive({ argv: ['node', 'submit', '--dry-run'], env: { VERCEL_ENV: 'production' } }),
      false,
    )
    assert.equal(shouldSubmitLive({ argv: ['node', 'submit', '--submit'], env: {} }), true)
  })

  it('treats 200 and 202 as success', () => {
    assert.equal(isSuccessStatus(200), true)
    assert.equal(isSuccessStatus(202), true)
    assert.equal(isSuccessStatus(403), false)
  })
})
