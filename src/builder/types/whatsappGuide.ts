import type { BlockBase, BlockStyle, BlockVisibility, MediaRef } from './common'

export type WhatsAppGuideStep = {
  id: string
  stepNumber: number
  title: string
  description: string
  officialPath: string
  image?: MediaRef
  imageAlt: string
  officialUrl?: string
  visible: boolean
  sortOrder: number
}

export type WhatsAppGuideBlock = BlockBase & {
  type: 'whatsapp-guide'
  settings: {
    eyebrow?: string
    securityWarningTitle?: string
    securityWarningBody?: string
    officialGuideUrl?: string
    androidEnabled: boolean
    iphoneEnabled: boolean
    androidSteps: WhatsAppGuideStep[]
    iphoneSteps: WhatsAppGuideStep[]
    connectionStep: WhatsAppGuideStep
  }
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function baseStyle(): BlockStyle {
  return {
    containerWidth: 'full',
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

function createEmptyStep(stepNumber: number, title: string, description: string, officialPath: string): WhatsAppGuideStep {
  return {
    id: uid(`wa-step-${stepNumber}`),
    stepNumber,
    title,
    description,
    officialPath,
    imageAlt: title,
    visible: true,
    sortOrder: stepNumber - 1,
  }
}

const ANDROID_PATHS = [
  'WhatsApp > ⋮ > Ayarlar > Sohbetler > Sohbet yedeği',
  'Google Play > WhatsApp Business (WhatsApp LLC)',
  'WhatsApp Business > Telefon numaranızı doğrulayın',
  'WhatsApp Business > Sohbet geçmişi bulundu > Devam Et / Geri Yükle',
  'WhatsApp Business > Sohbetler',
]

const IPHONE_PATHS = [
  'WhatsApp > Ayarlar > Sohbetler > Sohbet Yedeği',
  'App Store > WhatsApp Business (WhatsApp LLC)',
  'WhatsApp Business > Telefon numaranızı doğrulayın',
  'WhatsApp Business > Sohbet geçmişi bulundu > Devam Et / Geri Yükle',
  'WhatsApp Business > Sohbetler',
]

const STEP_TITLES = [
  'Mevcut WhatsApp konuşmalarınızı yedekleyin',
  'WhatsApp Business\'ı resmî mağazadan yükleyin',
  'WhatsApp Business\'ı açıp mevcut numaranızla devam edin',
  'SMS koduyla numarayı doğrulayın ve hesap/sohbet aktarımını onaylayın',
  'Sohbetlerin ve kişilerin WhatsApp Business içinde göründüğünü kontrol edin',
]

const STEP_DESCRIPTIONS = [
  'Geçişe başlamadan önce son sohbet yedeğinizin güncel olduğundan emin olun.',
  'Uygulamayı yalnızca Google Play veya App Store\'dan indirin. Geliştirici adının WhatsApp LLC olduğunu kontrol edin.',
  'Normal WhatsApp\'ta kullandığınız aynı telefon numarasını WhatsApp Business içinde doğrulayın.',
  'Sohbet geçmişini aktarma seçeneğini atlamayın; "Atla" veya "Şimdi değil" seçeneğine basmayın.',
  'WhatsApp Business içindeki sohbet listesini açın ve eski kişilerinizin göründüğünü doğrulayın.',
]

function buildPlatformSteps(paths: string[]): WhatsAppGuideStep[] {
  return STEP_TITLES.map((title, index) =>
    createEmptyStep(index + 1, title, STEP_DESCRIPTIONS[index] ?? '', paths[index] ?? ''),
  )
}

export function createDefaultWhatsAppGuideBlock(sortOrder: number): WhatsAppGuideBlock {
  return {
    id: uid('whatsapp-guide'),
    type: 'whatsapp-guide',
    sortOrder,
    title: 'Mevcut WhatsApp numaranızı ve eski sohbetlerinizi koruyarak bağlanın.',
    description:
      'Normal WhatsApp kullanıyorsanız önce aynı telefonda WhatsApp Business\'a geçmeniz gerekir. Aşağıdaki rehber, sohbet aktarımı adımını atlamadan güvenli biçimde ilerlemenizi sağlar.',
    visibility: baseVisibility(),
    style: baseStyle(),
    settings: {
      eyebrow: 'WhatsApp Business bağlantısı',
      securityWarningTitle: 'Eski konuşmalarınız WhatsApp Business içinde görünmüyorsa durun.',
      securityWarningBody:
        'Müvekkil Kasası veya Meta bağlantısına devam etmeyin. Doğru numarayı kullandığınızı ve yedeğin güncel olduğunu kontrol ederek aktarımı tamamlayın.',
      officialGuideUrl: 'https://faq.whatsapp.com/3059780464322392',
      androidEnabled: true,
      iphoneEnabled: false,
      androidSteps: buildPlatformSteps(ANDROID_PATHS),
      iphoneSteps: buildPlatformSteps(IPHONE_PATHS),
      connectionStep: {
        id: uid('wa-step-6'),
        stepNumber: 6,
        title: 'Müvekkil Kasası\'na dönerek Meta bağlantı akışını başlatın',
        description:
          'Sohbetleriniz görünüyorsa Müvekkil Kasası\'na dönün ve WhatsApp Business bağlantısını başlatın. Meta\'nın açtığı ekrandaki yetkilendirme adımlarını tamamlayın.',
        officialPath: 'Müvekkil Kasası > Ayarlar > WhatsApp Bağlantısı > Meta yetkilendirme',
        imageAlt: 'Müvekkil Kasası Meta WhatsApp Business bağlantı ekranı',
        visible: true,
        sortOrder: 5,
      },
    },
  }
}

export function whatsAppGuideStepHasImage(step: WhatsAppGuideStep): boolean {
  return Boolean(step.image?.url?.trim())
}

export function whatsAppGuidePlatformStepsComplete(steps: WhatsAppGuideStep[]): boolean {
  const visible = steps.filter((s) => s.visible)
  if (visible.length === 0) return false
  return visible.every((s) => s.title.trim() && s.imageAlt.trim() && whatsAppGuideStepHasImage(s))
}

export function whatsAppGuideIphoneStepsComplete(steps: WhatsAppGuideStep[]): boolean {
  return whatsAppGuidePlatformStepsComplete(steps)
}
