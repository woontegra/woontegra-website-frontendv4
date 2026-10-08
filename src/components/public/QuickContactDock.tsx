import { useEffect, useState } from 'react'
import { onConsentChange } from '@/lib/cookieConsent'
import {
  QUICK_CONTACT_PHONE_DISPLAY,
  QUICK_CONTACT_TEL_HREF,
  QUICK_CONTACT_WHATSAPP_DISPLAY,
  buildQuickContactWhatsAppHref,
  shouldShowBackToTop,
} from '@/lib/quickContact'
import styles from './QuickContactDock.module.css'

export function QuickContactDock() {
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [cookieOffset, setCookieOffset] = useState(0)

  useEffect(() => {
    const read = () => setShowBackToTop(shouldShowBackToTop(window.scrollY))
    read()
    window.addEventListener('scroll', read, { passive: true })
    return () => window.removeEventListener('scroll', read)
  }, [])

  useEffect(() => {
    const observed = new Set<Element>()
    const observer = new ResizeObserver(() => measure())
    const measure = () => {
      const banner = document.querySelector('[data-testid="cookie-consent-banner"]')
      const region = banner?.closest('[role="region"]')
      if (region && !observed.has(region)) {
        observed.add(region)
        observer.observe(region)
      }
      const height = region?.getBoundingClientRect().height ?? 0
      const maxOffset = Math.max(0, window.innerHeight - 180)
      const next = height > 8 ? Math.min(height + 12, maxOffset) : 0
      setCookieOffset((current) => (current === next ? current : next))
    }
    measure()
    const mutations = new MutationObserver(measure)
    mutations.observe(document.body, { childList: true, subtree: true })
    window.addEventListener('resize', measure)
    const stop = onConsentChange(measure)
    return () => {
      observer.disconnect()
      mutations.disconnect()
      window.removeEventListener('resize', measure)
      stop()
    }
  }, [])

  return (
    <div className={styles.dock} style={{ bottom: `calc(${cookieOffset}px + 1.5rem + env(safe-area-inset-bottom, 0px))` }}>
      <a className={`${styles.orb} ${styles.phone}`} href={QUICK_CONTACT_TEL_HREF}>
        <span className={styles.gloss} aria-hidden />
        <PhoneMark />
        <span className={styles.tip}>
          Bizi Arayın
          <small>{QUICK_CONTACT_PHONE_DISPLAY}</small>
        </span>
        <span className={styles.sr}>Bizi Arayın {QUICK_CONTACT_PHONE_DISPLAY}</span>
      </a>
      <a
        className={`${styles.orb} ${styles.whatsapp}`}
        href={buildQuickContactWhatsAppHref()}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className={styles.gloss} aria-hidden />
        <WhatsAppMark />
        <span className={styles.tip}>
          WhatsApp Destek
          <small>{QUICK_CONTACT_WHATSAPP_DISPLAY}</small>
        </span>
        <span className={styles.sr}>WhatsApp Destek {QUICK_CONTACT_WHATSAPP_DISPLAY}</span>
      </a>
      {showBackToTop ? (
        <button type="button" className={`${styles.orb} ${styles.top}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className={styles.gloss} aria-hidden />
          <TopMark />
          <span className={styles.tip}>Sayfa Başına Dön</span>
          <span className={styles.sr}>Sayfa Başına Dön</span>
        </button>
      ) : null}
    </div>
  )
}

function PhoneMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M7.1 3.8h2.1c.4 0 .7.2.8.6l1 2.6c.1.4 0 .8-.3 1L9.4 9.2a.8.8 0 0 0-.2.9 11.2 11.2 0 0 0 4.7 4.7.8.8 0 0 0 .9-.2l1.2-1.3c.3-.3.7-.4 1.1-.3l2.6 1c.4.1.6.5.6.8v2.1c0 .7-.5 1.3-1.2 1.4A15.2 15.2 0 0 1 3.7 6.2c.1-.7.7-1.2 1.4-1.4.3 0 .6 0 1 .0Z"
      />
    </svg>
  )
}

function WhatsAppMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12.1 3.4a8.3 8.3 0 0 0-7.2 12.4L3.6 20.4l4.7-1.2A8.3 8.3 0 1 0 12.1 3.4Zm4.8 11.8c-.2.6-1.2 1.1-1.7 1.2-.4.1-.9.1-1.5-.1-.3-.1-.8-.3-1.3-.5-2.3-1-3.8-3.3-3.9-3.5-.1-.2-.9-1.2-.9-2.3s.6-1.6.8-1.8c.2-.2.4-.3.6-.3h.4c.1 0 .3 0 .5.4.2.5.6 1.6.7 1.7.1.2 0 .3-.1.5l-.4.5c-.1.1-.2.3-.1.5.3.5.8 1 1.1 1.3.4.4.8.6 1.3.8.2.1.4 0 .5-.1l.6-.7c.2-.2.3-.2.5-.1.2.1 1.3.6 1.5.7.2.1.3.2.4.3.1.3 0 .8-.2 1.1Z"
      />
    </svg>
  )
}

function TopMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 14.2 12 8.2l6 6"
      />
    </svg>
  )
}
