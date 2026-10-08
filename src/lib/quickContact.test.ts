import { describe, expect, it } from 'vitest'
import {
  QUICK_CONTACT_WHATSAPP_MESSAGE,
  buildQuickContactWhatsAppHref,
  shouldShowBackToTop,
} from './quickContact'

describe('quick contact', () => {
  it('opens WhatsApp with the prepared Turkish message', () => {
    const href = buildQuickContactWhatsAppHref()
    expect(href.startsWith('https://wa.me/905323171755?text=')).toBe(true)
    expect(decodeURIComponent(href.split('text=')[1] ?? '')).toBe(QUICK_CONTACT_WHATSAPP_MESSAGE)
  })

  it('shows back to top only after the page has moved down', () => {
    expect(shouldShowBackToTop(0)).toBe(false)
    expect(shouldShowBackToTop(480)).toBe(false)
    expect(shouldShowBackToTop(481)).toBe(true)
  })
})
