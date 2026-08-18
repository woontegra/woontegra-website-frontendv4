/**
 * Builder kapsamı — header menüsünde görünen tüm public route'lar.
 * frontendV3 defaultHeaderNav + kullanıcı kapsam listesi ile hizalı.
 */

import {
  MK_COMPARE_PATH,
  MK_COMPARE_SLUG,
  MK_DESKTOP_CANONICAL_SLUG,
} from '@/components/public/muvekkil-kasa/comparePageUtils'
import { MK_SAAS_CANONICAL_SLUG } from '@/lib/muvekkilKasaSaasProduct'

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

/** Hizmetler alt menüsü — header ile birebir (5 hizmet) */
export const BUILDER_MENU_SERVICES: BuilderNavService[] = [
  { slug: 'saas', title: 'SaaS Ürün Geliştirme', path: '/hizmetler/saas' },
  { slug: 'web-tasarim', title: 'Web Tasarım', path: '/hizmetler/web-tasarim' },
  { slug: 'yazilim-gelistirme', title: 'Yazılım Geliştirme', path: '/hizmetler/yazilim-gelistirme' },
  { slug: 'e-ticaret', title: 'E-Ticaret Çözümleri', path: '/hizmetler/e-ticaret' },
  { slug: 'marka-patent-vekilligi', title: 'Marka Danışmanlığı', path: '/hizmetler/marka-patent-vekilligi' },
]

/**
 * Yazılım / ürün satış sayfaları (Page Builder listesi).
 * Masaüstü ve SaaS SKU’ları ürün kataloğunda ayrı kalır; builder’da tek birleşik sayfa gösterilir.
 */
export const BUILDER_MENU_PRODUCTS: BuilderNavProduct[] = [
  {
    slug: 'bilirkisi-hesap',
    title: 'Bilirkişi Hesaplama Yazılımı',
    path: '/yazilimlar/bilirkisi-hesap',
  },
  {
    slug: MK_COMPARE_SLUG,
    title: 'Müvekkil Kasa Defteri',
    path: MK_COMPARE_PATH,
  },
  {
    slug: 'sifre-kasasi',
    title: 'Ücretsiz Woontegra Şifre Kasası',
    path: '/yazilimlar/sifre-kasasi',
  },
]

/** Eski ayrı satış sayfaları — builder listesinde gizlenir; CMS JSON ve ürün kayıtları silinmez. */
export const SUPERSEDED_MK_PRODUCT_BUILDER_SLUGS = [
  MK_DESKTOP_CANONICAL_SLUG,
  MK_SAAS_CANONICAL_SLUG,
] as const

export const BUILDER_MENU_SOLUTIONS: BuilderNavSolution[] = [
  { slug: 'e-ticaret-altyapisi', title: 'E-ticaret Altyapısı', path: '/cozumler/e-ticaret-altyapisi' },
  { slug: 'pazaryeri-entegrasyonu', title: 'Pazaryeri Entegrasyonu', path: '/cozumler/pazaryeri-entegrasyonu' },
  { slug: 'siparis-yonetimi', title: 'Sipariş Yönetimi', path: '/cozumler/siparis-yonetimi' },
  { slug: 'stok-fiyat-yonetimi', title: 'Stok ve Fiyat Yönetimi', path: '/cozumler/stok-fiyat-yonetimi' },
  { slug: 'dijital-operasyon', title: 'Dijital Operasyon', path: '/cozumler/dijital-operasyon' },
  { slug: 'ozel-yazilim-surecleri', title: 'Özel Yazılım Süreçleri', path: '/cozumler/ozel-yazilim-surecleri' },
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
