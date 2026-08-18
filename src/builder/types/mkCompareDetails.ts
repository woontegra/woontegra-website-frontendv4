import type { BlockBase, BlockStyle, BlockVisibility, MediaRef } from './common'

export type MkCompareDetailsPanel = {
  tabLabel: string
  overviewEyebrow: string
  overviewTitle: string
  descriptionHtml: string
  featuresEyebrow: string
  featuresTitle: string
  features: string[]
  useProductDescription: boolean
  useProductFeatures: boolean
  image?: MediaRef
  primaryCtaLabel: string
  secondaryCtaLabel: string
  demoCtaLabel?: string
}

export type MkCompareDetailsBlock = BlockBase & {
  type: 'mk-compare-details'
  settings: {
    anchorId: string
    desktop: MkCompareDetailsPanel
    saas: MkCompareDetailsPanel
  }
}

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 7)}`
}

function baseStyle(): BlockStyle {
  return {
    containerWidth: 'full',
    contentAlign: 'left',
    paddingTop: { desktop: '64px', mobile: '48px' },
    paddingBottom: { desktop: '64px', mobile: '48px' },
  }
}

function baseVisibility(): BlockVisibility {
  return {
    enabled: true,
    showTitle: true,
    showDescription: true,
    showImage: true,
    showButton: true,
  }
}

export function createDefaultMkCompareDetailsBlock(sortOrder: number): MkCompareDetailsBlock {
  return {
    id: uid('mk-compare-details'),
    type: 'mk-compare-details',
    sortOrder,
    title: 'Ürün detayları',
    description: 'Mevcut satış içerikleri burada korunur. Satın alma üstteki kartlardan yapılır.',
    visibility: baseVisibility(),
    style: baseStyle(),
    settings: {
      anchorId: 'urun-detaylari',
      desktop: {
        tabLabel: 'Masaüstü Detayları',
        overviewEyebrow: 'Ürün detay içeriği',
        overviewTitle: 'Genel bakış',
        descriptionHtml: '',
        featuresEyebrow: 'Avantajlar',
        featuresTitle: 'Öne çıkan özellikler',
        features: [],
        useProductDescription: true,
        useProductFeatures: true,
        primaryCtaLabel: 'Satın Alma Alanına Dön',
        secondaryCtaLabel: 'SaaS ile Karşılaştır',
      },
      saas: {
        tabLabel: 'SaaS/Web Detayları',
        overviewEyebrow: 'Ürün detay içeriği',
        overviewTitle: 'Genel bakış',
        descriptionHtml: '',
        featuresEyebrow: 'Avantajlar',
        featuresTitle: 'Öne çıkan özellikler',
        features: [],
        useProductDescription: true,
        useProductFeatures: true,
        primaryCtaLabel: 'Satın Alma Alanına Dön',
        secondaryCtaLabel: 'Masaüstü ile Karşılaştır',
        demoCtaLabel: '7 Gün Ücretsiz Dene',
      },
    },
  }
}
