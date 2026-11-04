export const AVUKAT_SITELERI_NAME = 'Avukat Siteleri'
export const AVUKAT_SITELERI_SLUG = 'avukat-siteleri'
export const AVUKAT_SITELERI_PATH = `/yazilimlar/${AVUKAT_SITELERI_SLUG}`

export const AVUKAT_SITELERI_SEO = {
  title: 'Avukat Siteleri | KVKK Uyumlu Hukuk Bürosu Web Sitesi | Woontegra',
  description:
    'Avukatlara ve hukuk bürolarına özel: 10 hazır tema, KVKK uyumlu formlar, makale sistemi, kurumsal e-posta ve kolay yönetim paneli. Online satış yoktur; bizi arayın.',
} as const

export const AVUKAT_PHONE_DISPLAY = '0252 606 06 50'
export const AVUKAT_PHONE_HREF = 'tel:+902526060650'
export const AVUKAT_WHATSAPP_HREF = 'https://wa.me/905323171755'
export const AVUKAT_DEMO_URL = 'https://tasgibisin.com'
export const AVUKAT_QUOTE_HREF = '/teklif-al'

export type AvukatTema = {
  kisaAd: string
  panelAdi: string
  tarz: string
  masaustu: string
  telefon: string
}

/** public/avukat-siteleri/temalar.json ile aynı liste. */
export const AVUKAT_TEMALAR: AvukatTema[] = [
  {
    kisaAd: 'prestige',
    panelAdi: 'Prestige',
    tarz: 'Lacivert ve altın tonlarında klasik kurumsal görünüm',
    masaustu: '/avukat-siteleri/prestige-masaustu.webp',
    telefon: '/avukat-siteleri/prestige-telefon.webp',
  },
  {
    kisaAd: 'minimal',
    panelAdi: 'Minimal',
    tarz: 'Beyaz, sade ve modern ofis görünümü',
    masaustu: '/avukat-siteleri/minimal-masaustu.webp',
    telefon: '/avukat-siteleri/minimal-telefon.webp',
  },
  {
    kisaAd: 'executive',
    panelAdi: 'Executive',
    tarz: 'Siyah ve antrasit tonlarında güçlü tipografi',
    masaustu: '/avukat-siteleri/executive-masaustu.webp',
    telefon: '/avukat-siteleri/executive-telefon.webp',
  },
  {
    kisaAd: 'modern',
    panelAdi: 'Modern',
    tarz: 'Canlı renkler ve kartlı, telefona uygun modern görünüm',
    masaustu: '/avukat-siteleri/modern-masaustu.webp',
    telefon: '/avukat-siteleri/modern-telefon.webp',
  },
  {
    kisaAd: 'sidebar',
    panelAdi: 'Sol Menülü',
    tarz: 'Solda dikey menülü, ferah editoryal görünüm',
    masaustu: '/avukat-siteleri/sidebar-masaustu.webp',
    telefon: '/avukat-siteleri/sidebar-telefon.webp',
  },
  {
    kisaAd: 'videohero',
    panelAdi: 'Videolu Kapak',
    tarz: 'Beyaz menü ve geniş videolu kapaklı kurumsal görünüm',
    masaustu: '/avukat-siteleri/videohero-masaustu.webp',
    telefon: '/avukat-siteleri/videohero-telefon.webp',
  },
  {
    kisaAd: 'curvedhero',
    panelAdi: 'Kavisli Kapak',
    tarz: 'Kavisli kapak ve lacivert yüzeylerle zarif görünüm',
    masaustu: '/avukat-siteleri/curvedhero-masaustu.webp',
    telefon: '/avukat-siteleri/curvedhero-telefon.webp',
  },
  {
    kisaAd: 'globalcorporate',
    panelAdi: 'Uluslararası Kurumsal',
    tarz: 'Gece Boğaz manzaralı, uluslararası kurumsal görünüm',
    masaustu: '/avukat-siteleri/globalcorporate-masaustu.webp',
    telefon: '/avukat-siteleri/globalcorporate-telefon.webp',
  },
  {
    kisaAd: 'prestigegold',
    panelAdi: 'Prestige Gold',
    tarz: 'Koyu ve altın tonlarında klasik görünüm',
    masaustu: '/avukat-siteleri/prestigegold-masaustu.webp',
    telefon: '/avukat-siteleri/prestigegold-telefon.webp',
  },
  {
    kisaAd: 'themis',
    panelAdi: 'Oblique',
    tarz: 'Lacivert dokulu, bakır vurgulu gece görünümü',
    masaustu: '/avukat-siteleri/themis-masaustu.webp',
    telefon: '/avukat-siteleri/themis-telefon.webp',
  },
]

export const AVUKAT_HERO_IMAGE = AVUKAT_TEMALAR[0]?.masaustu ?? '/avukat-siteleri/prestige-masaustu.webp'
