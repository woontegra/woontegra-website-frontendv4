import type { BlockBase, BlockStyle, BlockVisibility } from './common'

export type MkSaasPurchaseBenefit = {
  id: string
  text: string
  icon?: string
}

export type MkComparePurchaseCardCopy = {
  badge: string
  extraBadge?: string
  title: string
  description: string
  detailsButtonLabel: string
  addToCartLabel: string
  demoButtonLabel?: string
  imageUrl?: string
}

export const DEFAULT_MK_COMPARE_DESKTOP_COPY: MkComparePurchaseCardCopy = {
  badge: 'Bilgisayara Kurulan',
  title: 'Müvekkil Kasa Defteri Masaüstü',
  description: 'Programı bilgisayarına kurarak çalışan, merkezi lisanslı masaüstü sürüm.',
  detailsButtonLabel: 'Masaüstü Detaylarını Gör',
  addToCartLabel: 'Sepete Ekle',
}

export const DEFAULT_MK_COMPARE_SAAS_COPY: MkComparePurchaseCardCopy = {
  badge: 'Tarayıcıdan Erişim',
  extraBadge: 'En kapsamlı',
  title: 'Müvekkil Kasa Defteri SaaS',
  description:
    'Kurulum gerektirmeden tarayıcı üzerinden erişilen, çok kullanıcılı ve WhatsApp destekli web sürümü.',
  detailsButtonLabel: 'SaaS Detaylarını Gör',
  addToCartLabel: 'Sepete Ekle',
  demoButtonLabel: '7 Gün Ücretsiz Dene',
}

export type MkSaasPurchaseBlock = BlockBase & {
  type: 'mk-saas-purchase'
  settings: {
    anchorId: string
    backgroundStyle: 'gradient' | 'solid'
    benefits: MkSaasPurchaseBenefit[]
    /** compare = birleşik Müvekkil Kasa satış kartları */
    layout?: 'saas' | 'compare'
    compareDesktop?: MkComparePurchaseCardCopy
    compareSaas?: MkComparePurchaseCardCopy
  }
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function baseStyle(): BlockStyle {
  return {
    containerWidth: 'default',
    contentAlign: 'left',
    paddingTop: { desktop: '56px', mobile: '40px' },
    paddingBottom: { desktop: '56px', mobile: '40px' },
  }
}

function baseVisibility(): BlockVisibility {
  return {
    enabled: true,
    showTitle: true,
    showDescription: true,
    showImage: false,
    showButton: false,
  }
}

export function createDefaultMkSaasPurchaseBlock(sortOrder: number): MkSaasPurchaseBlock {
  return {
    id: uid('mk-saas-purchase'),
    type: 'mk-saas-purchase',
    sortOrder,
    title: 'Büronuzun finansal düzenini bugün kurun.',
    description:
      'Doğrudan yıllık lisans satın alabilir veya önce kendi müvekkilleriniz ve gerçek iş akışınızla ücretsiz deneyebilirsiniz. Demo hesabınızı lisansladığınızda mevcut verileriniz korunur.',
    visibility: baseVisibility(),
    style: baseStyle(),
    settings: {
      anchorId: 'satin-alma',
      backgroundStyle: 'gradient',
      benefits: [
        { id: uid('benefit'), text: 'Kurulum gerektirmeyen web erişimi', icon: 'cloud' },
        { id: uid('benefit'), text: 'Her yerden güvenli bağlantı', icon: 'globe' },
        { id: uid('benefit'), text: 'WhatsApp Business hatırlatmaları', icon: 'message-circle' },
      ],
    },
  }
}
