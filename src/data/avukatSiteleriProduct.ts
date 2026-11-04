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
export const AVUKAT_QUOTE_HREF = '/teklif-al'

export type AvukatTema = {
  kisaAd: string
  panelAdi: string
  tarz: string
  /** Kart / hero için üst kısım (viewport) görseli */
  masaustu: string
  telefon: string
  /** Lightbox’ta kullanılan tam sayfa görseller (yalnızca pencere açılınca yüklenir) */
  masaustuTam: string
  telefonTam: string
}

const tema = (
  kisaAd: string,
  panelAdi: string,
  tarz: string,
): AvukatTema => ({
  kisaAd,
  panelAdi,
  tarz,
  masaustu: `/avukat-siteleri/${kisaAd}-masaustu.webp`,
  telefon: `/avukat-siteleri/${kisaAd}-telefon.webp`,
  masaustuTam: `/avukat-siteleri/${kisaAd}-masaustu-tam.webp`,
  telefonTam: `/avukat-siteleri/${kisaAd}-telefon-tam.webp`,
})

/** public/avukat-siteleri/temalar.json ile aynı liste. */
export const AVUKAT_TEMALAR: AvukatTema[] = [
  tema('prestige', 'Prestige', 'Lacivert ve altın tonlarında klasik kurumsal görünüm'),
  tema('minimal', 'Minimal', 'Beyaz, sade ve modern ofis görünümü'),
  tema('executive', 'Executive', 'Siyah ve antrasit tonlarında güçlü tipografi'),
  tema('modern', 'Modern', 'Canlı renkler ve kartlı, telefona uygun modern görünüm'),
  tema('sidebar', 'Sol Menülü', 'Solda dikey menülü, ferah editoryal görünüm'),
  tema('videohero', 'Videolu Kapak', 'Beyaz menü ve geniş videolu kapaklı kurumsal görünüm'),
  tema('curvedhero', 'Kavisli Kapak', 'Kavisli kapak ve lacivert yüzeylerle zarif görünüm'),
  tema('globalcorporate', 'Uluslararası Kurumsal', 'Gece Boğaz manzaralı, uluslararası kurumsal görünüm'),
  tema('prestigegold', 'Prestige Gold', 'Koyu ve altın tonlarında klasik görünüm'),
  tema('themis', 'Oblique', 'Lacivert dokulu, bakır vurgulu gece görünümü'),
]

export const AVUKAT_HERO_IMAGE = AVUKAT_TEMALAR[0]?.masaustu ?? '/avukat-siteleri/prestige-masaustu.webp'
