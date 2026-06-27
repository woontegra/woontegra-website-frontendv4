export const BLOCK_LIBRARY_CATEGORIES = [
  {
    id: 'basic',
    label: 'Temel',
    types: ['hero', 'rich-text', 'cta'] as const,
  },
  {
    id: 'content',
    label: 'İçerik',
    types: ['image-text', 'faq', 'card-grid'] as const,
  },
  {
    id: 'showcase',
    label: 'Vitrin',
    types: ['products-showcase', 'blog-showcase', 'services-showcase'] as const,
  },
  {
    id: 'solutions',
    label: 'Çözümler',
    types: [] as const,
    placeholder: 'Yakında — çözüm blokları eklenecek',
  },
] as const

export const PAGE_TEMPLATE_CARDS = [
  { id: 'blank', title: 'Blank', description: 'Boş sayfa ile başlayın' },
  { id: 'corporate', title: 'Kurumsal', description: 'Hero, hizmetler, referans, CTA' },
  { id: 'landing', title: 'Landing', description: 'Tek sayfa dönüşüm odaklı' },
  { id: 'service', title: 'Hizmet', description: 'Hizmet detay vitrini' },
  { id: 'software', title: 'Yazılım', description: 'Ürün vitrini + SSS' },
  { id: 'contact', title: 'İletişim', description: 'Form ve iletişim CTA' },
  { id: 'about', title: 'Hakkımızda', description: 'Ekip, süreç, değerler' },
  { id: 'blog', title: 'Blog', description: 'Blog vitrini ve liste' },
] as const

export const PLACEHOLDER_CATEGORIES = [
  { id: 'yazilim', label: 'Yazılım' },
  { id: 'e-ticaret', label: 'E-Ticaret' },
  { id: 'pazarlama', label: 'Pazarlama' },
] as const
