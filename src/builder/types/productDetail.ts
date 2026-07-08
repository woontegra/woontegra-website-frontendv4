import type { BlockBase } from './common'
import type { ProductType } from '@/types/product'

export type ProductDetailGalleryItem = {
  id: string
  url: string
  alt?: string
  title?: string
}

export type ProductDetailFeature = {
  id: string
  text: string
}

export type ProductDetailFaqItem = {
  id: string
  question: string
  answer: string
}

export type ProductDetailSettings = {
  slug: string
  breadcrumbs: string[]
  gallery: ProductDetailGalleryItem[]
  productType: ProductType
  price: number
  compareAtPrice?: number | null
  currency: string
  licenseMonths: number
  showYearSelector: boolean
  showAddToCart: boolean
  showPrice: boolean
  purchaseEnabled: boolean
  version: string
  featureBullets: ProductDetailFeature[]
  systemRequirements: string
  deliveryInfo: string
  licenseInfo: string
  supportNote: string
  longDescriptionHtml: string
  faqItems: ProductDetailFaqItem[]
  ctaButtonLabel: string
  ctaButtonHref: string
}

export type ProductDetailBlock = BlockBase & {
  type: 'product-detail'
  settings: ProductDetailSettings
}

export function createDefaultProductDetailBlock(id: string, sortOrder = 0): ProductDetailBlock {
  return {
    id,
    type: 'product-detail',
    sortOrder,
    title: 'Ürün adı',
    description: 'Kısa ürün açıklaması',
    visibility: {
      enabled: true,
      showTitle: true,
      showDescription: true,
      showImage: true,
      showButton: true,
    },
    style: {
      containerWidth: 'default',
      contentAlign: 'left',
      paddingTop: { desktop: '32px', mobile: '24px' },
      paddingBottom: { desktop: '48px', mobile: '32px' },
    },
    settings: {
      slug: '',
      breadcrumbs: ['Ana Sayfa', 'Yazılımlar'],
      gallery: [],
      productType: 'DOWNLOAD',
      price: 0,
      compareAtPrice: null,
      currency: 'TRY',
      licenseMonths: 12,
      showYearSelector: true,
      showAddToCart: true,
      showPrice: true,
      purchaseEnabled: true,
      version: '1.0.0',
      featureBullets: [
        { id: 'feat-1', text: 'Özellik 1' },
        { id: 'feat-2', text: 'Özellik 2' },
      ],
      systemRequirements: 'Windows 10+, 4 GB RAM',
      deliveryInfo: 'Dijital teslimat — indirme linki e-posta ile gönderilir.',
      licenseInfo: 'Lisans anahtarı satın alma sonrası tanımlanır.',
      supportNote: 'Teknik destek için iletişim sayfasından bize ulaşın.',
      longDescriptionHtml: '<p>Detaylı ürün açıklaması</p>',
      faqItems: [{ id: 'faq-1', question: 'Nasıl kurulur?', answer: 'Kurulum dosyasını indirip sihirbazı takip edin.' }],
      ctaButtonLabel: 'Sepete Ekle',
      ctaButtonHref: '/sepet',
    },
  }
}
