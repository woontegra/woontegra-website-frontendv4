/** Allowlisted HTML for builder rich-text — keeps plain-text bodies backward compatible. */

const ALLOWED_TAGS = new Set([
  'P',
  'BR',
  'H2',
  'H3',
  'STRONG',
  'B',
  'EM',
  'I',
  'A',
  'UL',
  'OL',
  'LI',
  'SPAN',
])

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  A: new Set(['href', 'title', 'target', 'rel']),
}

export function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

export function sanitizeRichHtml(input: string): string {
  const raw = String(input || '').trim()
  if (!raw) return ''
  if (typeof document === 'undefined') {
    // Node/test fallback: strip script/style only
    return raw
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
  }

  const template = document.createElement('template')
  template.innerHTML = raw
  const walk = (node: Node) => {
    const children = [...node.childNodes]
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement
        const tag = el.tagName.toUpperCase()
        if (!ALLOWED_TAGS.has(tag)) {
          const text = document.createTextNode(el.textContent || '')
          node.replaceChild(text, el)
          continue
        }
        ;[...el.attributes].forEach((attr) => {
          const allowed = ALLOWED_ATTRS[tag]
          if (!allowed || !allowed.has(attr.name.toLowerCase())) {
            el.removeAttribute(attr.name)
          }
        })
        if (tag === 'A') {
          const href = el.getAttribute('href') || ''
          if (!/^(https?:|mailto:|\/|#)/i.test(href)) {
            el.removeAttribute('href')
          } else {
            el.setAttribute('rel', 'noopener noreferrer')
          }
        }
        walk(el)
      } else if (child.nodeType === Node.COMMENT_NODE) {
        node.removeChild(child)
      }
    }
  }
  walk(template.content)
  return template.innerHTML.trim()
}

/** Extract YouTube video id from common URL shapes. */
export function extractYoutubeVideoId(url: string): string | null {
  const value = String(url || '').trim()
  if (!value) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{6,})/i,
    /^([A-Za-z0-9_-]{11})$/,
  ]
  for (const re of patterns) {
    const m = value.match(re)
    if (m?.[1]) return m[1]
  }
  return null
}
