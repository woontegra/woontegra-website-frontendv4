/**
 * Builder kapsamı — header menüsünde görünen tüm public route'lar.
 * frontendV3 defaultHeaderNav + kullanıcı kapsam listesi ile hizalı.
 */

export type BuilderNavService = {
  slug: string
  title: string
  path: string
}

export type BuilderNavProduct = {
  slug: string
  title: string
  path: string
}

export type BuilderNavSolution = {
  slug: string
  title: string
  path: string
}

export type BuilderNavBlogPost = {
  slug: string
  title: string
  path: string
  /** Builder şablonu — gerçek yazılar API'den gelir */
  isTemplate?: boolean
}

export type BuilderNavLegal = {
  key: string
  title: string
  path: string
  contentKey: string
}

/** Hizmetler alt menüsü — 6 sayfa */
export const BUILDER_MENU_SERVICES: BuilderNavService[] = [
  { slug: 'mobil-uygulama-gelistirme', title: 'Mobil Uygulama Geliştirme', path: '/hizmetler/mobil-uygulama-gelistirme' },
  { slug: 'saas', title: 'SaaS Ürün Geliştirme', path: '/hizmetler/saas' },
  { slug: 'web-tasarim', title: 'Web Tasarım', path: '/hizmetler/web-tasarim' },
  { slug: 'yazilim-gelistirme', title: 'Yazılım Geliştirme', path: '/hizmetler/yazilim-gelistirme' },
  { slug: 'e-ticaret', title: 'E-Ticaret Çözümleri', path: '/hizmetler/e-ticaret' },
  { slug: 'marka-patent-vekilligi', title: 'Marka & Patent Vekilliği', path: '/hizmetler/marka-patent-vekilligi' },
]

/** Yazılımlar alt menüsü — menüde görünen ürün detayları */
export const BUILDER_MENU_PRODUCTS: BuilderNavProduct[] = [
  {
    slug: 'muvekkil-kasa-defteri-yazilimi',
    title: 'Müvekkil Kasa Defteri Masaüstü',
    path: '/yazilimlar/muvekkil-kasa-defteri-yazilimi',
  },
  {
    slug: 'muvekkil-kasa-defteri-web-tabanli',
    title: 'Müvekkil Kasa Defteri Çoklu Kullanıcı Web Tabanlı',
    path: '/yazilimlar/muvekkil-kasa-defteri-web-tabanli',
  },
  {
    slug: 'sifre-kasasi',
    title: 'Ücretsiz Woontegra Şifre Kasası',
    path: '/yazilimlar/sifre-kasasi',
  },
]

export const BUILDER_MENU_SOLUTIONS: BuilderNavSolution[] = [
  { slug: 'bilirkisi-hesaplama', title: 'Bilirkişi Hesap', path: '/cozumler/bilirkisi-hesaplama' },
  { slug: 'datca-topikal', title: 'Datça Tropikal', path: '/cozumler/datca-topikal' },
]

/** Blog detay şablonu — API slug'ları builder'a eklenebilir */
export const BUILDER_MENU_BLOG_POSTS: BuilderNavBlogPost[] = [
  {
    slug: 'ornek-blog-yazisi',
    title: 'Örnek Blog Yazısı (şablon)',
    path: '/blog/ornek-blog-yazisi',
    isTemplate: true,
  },
]

export const BUILDER_MENU_LEGAL: BuilderNavLegal[] = [
  { key: 'legal-cookie', title: 'Çerez Politikası', path: '/cerez-politikasi', contentKey: 'legalCookiePage' },
  { key: 'legal-kvkk', title: 'KVKK Aydınlatma Metni', path: '/kvkk-aydinlatma-metni', contentKey: 'legalKvkkPage' },
  { key: 'legal-privacy', title: 'Gizlilik Politikası', path: '/gizlilik-politikasi', contentKey: 'legalPrivacyPage' },
  { key: 'legal-consent', title: 'Açık Rıza Metni', path: '/acik-riza-metni', contentKey: 'legalConsentPage' },
  { key: 'legal-terms', title: 'Kullanım Şartları', path: '/kullanim-sartlari', contentKey: 'legalTermsPage' },
]

export const BUILDER_PAGE_GROUP_LABELS = {
  main: 'Ana Sayfalar',
  services: 'Hizmet Sayfaları',
  solutions: 'Çözüm Sayfaları',
  products: 'Yazılım / Ürün Sayfaları',
  blog: 'Blog Sayfaları',
  legal: 'Yasal Sayfalar',
} as const

export type BuilderPageGroupId = keyof typeof BUILDER_PAGE_GROUP_LABELS

export function serviceBuilderPageKey(slug: string): string {
  return `service-${slug}`
}

export function solutionBuilderPageKey(slug: string): string {
  return `solution-${slug}`
}

export function productBuilderPageKey(slug: string): string {
  return `product-${slug}`
}

export function blogPostBuilderPageKey(slug: string): string {
  return `blog-${slug}`
}
