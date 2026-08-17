import type { BlockBase, BlockStyle, BlockVisibility } from './common'

export type MkSaasPurchaseBenefit = {
  id: string
  text: string
  icon?: string
}

export type MkSaasPurchaseBlock = BlockBase & {
  type: 'mk-saas-purchase'
  settings: {
    anchorId: string
    backgroundStyle: 'gradient' | 'solid'
    benefits: MkSaasPurchaseBenefit[]
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
