export const QUICK_CONTACT_WHATSAPP_DISPLAY = '+90 532 317 17 55'
export const QUICK_CONTACT_PHONE_DISPLAY = '0252 606 06 50'
export const QUICK_CONTACT_WHATSAPP_MESSAGE = 'Merhaba, Woontegra yazılımları hakkında bilgi almak istiyorum.'
export const QUICK_CONTACT_TEL_HREF = 'tel:+902526060650'
export const QUICK_CONTACT_SCROLL_THRESHOLD = 480

export function buildQuickContactWhatsAppHref(
  message = QUICK_CONTACT_WHATSAPP_MESSAGE,
): string {
  return `https://wa.me/905323171755?text=${encodeURIComponent(message)}`
}

export function shouldShowBackToTop(scrollY: number): boolean {
  return scrollY > QUICK_CONTACT_SCROLL_THRESHOLD
}
