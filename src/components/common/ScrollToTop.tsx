import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function scrollToHashTarget(hash: string) {
  const id = decodeURIComponent(hash.replace(/^#/, ''))
  if (!id) return

  const tryScroll = () => {
    const el = document.getElementById(id)
    if (!el) return false
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return true
  }

  if (tryScroll()) return

  requestAnimationFrame(() => {
    if (tryScroll()) return
    // Geç mount olan bölümler (ör. BH modül listesi) için kısa retry
    let n = 0
    const timer = window.setInterval(() => {
      n += 1
      if (tryScroll() || n >= 20) window.clearInterval(timer)
    }, 50)
  })
}

function scrollWindowToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
}

/** Route değişiminde scroll'u sıfırlar; hash varsa ilgili bölüme kaydırır. */
export function ScrollToTop() {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      scrollToHashTarget(hash)
      return
    }

    scrollWindowToTop()
  }, [pathname, search, hash])

  return null
}
