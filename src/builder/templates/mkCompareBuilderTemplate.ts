import type { BuilderBlock } from '@/builder/types/blocks'
import type { CtaBlock, ImageTextBlock } from '@/builder/types/blockModels'
import { assignSortOrder } from '@/builder/load/parseBuilderBlocks'
import { createDefaultHeroBlock } from '@/builder/types/hero'
import {
  createDefaultCtaBlock,
  createDefaultCardGridBlock,
  createDefaultFaqBlock,
  createDefaultImageTextBlock,
} from '@/builder/types/blockModels'
import { createDefaultMkSaasPurchaseBlock, DEFAULT_MK_COMPARE_DESKTOP_COPY, DEFAULT_MK_COMPARE_SAAS_COPY } from '@/builder/types/mkSaasPurchase'
import { createDefaultWhatsAppGuideBlock } from '@/builder/types/whatsappGuide'
import { createDefaultMkCompareTableBlock } from '@/builder/types/mkCompareTable'
import { createDefaultMkCompareDetailsBlock } from '@/builder/types/mkCompareDetails'
import { MK_SAAS_PROBLEM_PILLS } from '@/builder/render/mkSaasBuilderVisuals'
import { MK_COMPARE_DETAILS_ID, MK_COMPARE_PURCHASE_ID, MK_COMPARE_TABLE_ID } from '@/components/public/muvekkil-kasa/comparePageUtils'

export const MK_COMPARE_LEGACY_SECTION_KEY = 'muvekkil-kasa.compare'

function uid(part: string): string {
  return `mk-compare-${part}`
}

export function isAutoMkCompareLegacyDocument(blocks: BuilderBlock[] | null | undefined): boolean {
  if (!blocks || blocks.length !== 1) return false
  const block = blocks[0]
  if (block.type !== 'legacy-section') return false
  const sectionKey =
    block.settings && typeof block.settings === 'object' && 'sectionKey' in block.settings
      ? String((block.settings as { sectionKey?: unknown }).sectionKey ?? '')
      : ''
  return sectionKey === MK_COMPARE_LEGACY_SECTION_KEY || block.id === 'mk-compare-page'
}

export function sanitizeMkCompareBuilderBlocks(blocks: BuilderBlock[]): BuilderBlock[] {
  const withoutAutoLegacy = blocks.filter((block) => {
    if (block.type !== 'legacy-section') return true
    const sectionKey =
      block.settings && typeof block.settings === 'object' && 'sectionKey' in block.settings
        ? String((block.settings as { sectionKey?: unknown }).sectionKey ?? '')
        : ''
    return sectionKey !== MK_COMPARE_LEGACY_SECTION_KEY && block.id !== 'mk-compare-page'
  })

  if (withoutAutoLegacy.length === 0) {
    return createMuvekkilKasaCompareBuilderTemplate()
  }

  return assignSortOrder(withoutAutoLegacy)
}

/** Public: auto-legacy JSON is treated as unpublished so React fallback stays until a real template is saved. */
export function resolveMkComparePublicBlocks(blocks: BuilderBlock[] | null | undefined): BuilderBlock[] | null {
  if (!blocks?.length || isAutoMkCompareLegacyDocument(blocks)) return null
  const sanitized = sanitizeMkCompareBuilderBlocks(blocks)
  return sanitized.length > 0 ? sanitized : null
}

export function createMuvekkilKasaCompareBuilderTemplate(): BuilderBlock[] {
  const hero = createDefaultHeroBlock(uid('hero'), 0)
  hero.title = 'Müvekkil Kasa Defteri: Size Uygun Sürümü Seçin'
  hero.description =
    'Masaüstü kullanımın sadeliğini veya internet üzerinden erişilebilen gelişmiş SaaS altyapısını karşılaştırın; büronuza uygun sürümü seçin.'
  hero.style.backgroundColor = '#0f172a'
  hero.style.backgroundGradient = 'linear-gradient(to bottom right, #020617, #0f2744, #0f172a)'
  hero.style.containerWidth = 'wide'
  hero.style.customClass = 'mk-compare-hero'
  hero.settings = {
    ...hero.settings,
    mode: 'gradient',
    layout: 'compare',
    badge: 'Masaüstü ve SaaS / Web',
    showBreadcrumbs: true,
    breadcrumbs: [
      { label: 'Ana Sayfa', href: '/' },
      { label: 'Yazılımlar', href: '/yazilimlar' },
      { label: 'Müvekkil Kasa Defteri' },
    ],
    height: { desktop: 'auto', tablet: 'auto', mobile: 'auto' },
    buttons: [
      {
        id: uid('btn-compare'),
        label: 'Sürümleri Karşılaştır',
        href: `#${MK_COMPARE_TABLE_ID}`,
        visible: true,
        variant: 'primary',
      },
      {
        id: uid('btn-choose'),
        label: 'Sürümünü Seç',
        href: `#${MK_COMPARE_PURCHASE_ID}`,
        visible: true,
        variant: 'outline',
      },
    ],
  }

  const purchase = createDefaultMkSaasPurchaseBlock(1)
  purchase.id = uid('purchase')
  purchase.title = 'Hangi sürüm size uygun?'
  purchase.description = 'İki ürün ayrı lisans ve ayrı sepet satırıdır. Fiyatlar güncel ürün kaydından gelir.'
  purchase.style.containerWidth = 'wide'
  purchase.settings = {
    ...purchase.settings,
    anchorId: MK_COMPARE_PURCHASE_ID,
    backgroundStyle: 'solid',
    layout: 'compare',
    compareDesktop: { ...DEFAULT_MK_COMPARE_DESKTOP_COPY },
    compareSaas: { ...DEFAULT_MK_COMPARE_SAAS_COPY },
  }

  const table = createDefaultMkCompareTableBlock(2)
  table.id = uid('table')
  table.settings.anchorId = MK_COMPARE_TABLE_ID

  const details = createDefaultMkCompareDetailsBlock(3)
  details.id = uid('details')
  details.settings.anchorId = MK_COMPARE_DETAILS_ID

  const problemCta = createDefaultCtaBlock(4)
  problemCta.id = uid('problem')
  problemCta.title = 'Hâlâ farklı Excel dosyaları, WhatsApp notları ve ajandalar arasında mı çalışıyorsunuz?'
  problemCta.description = ''
  problemCta.visibility.showButton = false
  problemCta.style.backgroundColor = '#ffffff'
  problemCta.style.containerWidth = 'wide'
  problemCta.settings = {
    ...problemCta.settings,
    backgroundType: 'solid',
    variant: 'mk-problem-band',
    featurePills: [...MK_SAAS_PROBLEM_PILLS],
    buttons: [],
  }

  const benefits = createDefaultCardGridBlock(5)
  benefits.id = uid('benefits')
  benefits.title = 'Büronuzda ne değişecek?'
  benefits.description = ''
  benefits.style.customClass = 'mk-saas-benefits'
  benefits.settings = {
    ...benefits.settings,
    variant: 'mk-benefit',
    columns: 4,
    cards: [
      { id: uid('card-wallet'), title: 'Her müvekkilin parasını ayrı izleyin', description: 'Avans, masraf, tahsilat ve bakiye hareketleri dosya bazında karışmadan ilerler.', icon: 'wallet', color: '#0ea5e9' },
      { id: uid('card-cal'), title: 'Vadesi yaklaşan taksitleri kaçırmayın', description: 'Yaklaşan ve geciken vekalet taksitlerini tek ekranda görün; hatırlatma düzeninizi kurun.', icon: 'calendar-days', color: '#0ea5e9' },
      { id: uid('card-wa'), title: 'WhatsApp hatırlatmalarını otomatikleştirin', description: 'Ödeme hatırlatmalarını belirlediğiniz zamanda büronuzun WhatsApp Business numarasından iletin.', icon: 'message-circle', color: '#0ea5e9' },
      { id: uid('card-users'), title: 'Büro ekibi aynı güncel veriyi kullansın', description: 'Yetkili kullanıcılar tarayıcıdan erişsin; kimin hangi işlemi yaptığı kayıt altında kalsın.', icon: 'users', color: '#0ea5e9' },
    ],
  }

  const fileVault = createDefaultImageTextBlock(6) as ImageTextBlock
  fileVault.id = uid('file-vault')
  fileVault.title = 'Bu dosyada ne kadar para kaldı? sorusunun cevabı saniyeler içinde.'
  fileVault.description =
    'Her müvekkilin birden fazla dosyasını ayrı yönetin. Alınan avansları, yapılan masrafları ve tahsilatları belge numarasıyla kaydedin. Kalan bakiyeyi hesap makinesi açmadan görün.'
  fileVault.visibility.showImage = true
  fileVault.settings.imagePosition = 'right'
  fileVault.settings.visualVariant = 'mk-file-vault'
  fileVault.settings.button = { id: uid('btn-fv'), label: '', href: '', visible: false, variant: 'primary' }

  const installments = createDefaultImageTextBlock(7) as ImageTextBlock
  installments.id = uid('installments')
  installments.title = 'Taksit tarihlerini takip etmek için ajandaya bağımlı kalmayın.'
  installments.description =
    'Vekalet ücretini taksitlendirin; vadesi yaklaşan, bugün ödenecek ve geciken tahsilatları tek ekranda görün. Kurallarınızı belirleyin, uygun hatırlatmalar büronuzun WhatsApp Business numarasından gönderilsin.'
  installments.visibility.showImage = true
  installments.settings.imagePosition = 'left'
  installments.settings.visualVariant = 'mk-installments'
  installments.settings.button = {
    id: uid('btn-wa'),
    label: 'WhatsApp bağlantısı nasıl yapılır?',
    href: '#whatsapp-gecis-rehberi',
    visible: true,
    variant: 'primary',
  }

  const compactFeatures = createDefaultCardGridBlock(8)
  compactFeatures.id = uid('features')
  compactFeatures.title = ''
  compactFeatures.description = ''
  compactFeatures.visibility.showTitle = false
  compactFeatures.settings = {
    ...compactFeatures.settings,
    columns: 4,
    variant: 'default',
    cards: [
      { id: uid('card-receipt'), title: 'Profesyonel makbuzlar', description: 'Tahsilat makbuzlarını düzenli ve standart formatta oluşturun.', icon: 'receipt', color: '#0ea5e9' },
      { id: uid('card-office'), title: 'Ofis kasası ve mali kontrol', description: 'Büro genelinde kasa hareketlerini tek ekrandan izleyin.', icon: 'building-2', color: '#0ea5e9' },
      { id: uid('card-shield'), title: 'Yetkili ekip erişimi', description: 'Kullanıcı yetkileriyle güvenli ve kontrollü erişim sağlayın.', icon: 'shield', color: '#0ea5e9' },
      { id: uid('card-report'), title: 'Rapor ve kayıt düzeni', description: 'İşlem geçmişi ve raporlarla denetlenebilir kayıt tutun.', icon: 'file-text', color: '#0ea5e9' },
    ],
  }

  const whatsappGuide = createDefaultWhatsAppGuideBlock(9)
  whatsappGuide.style.customClass = 'scroll-mt-20'
  whatsappGuide.id = 'whatsapp-gecis-rehberi-block'

  const whoFor = createDefaultCardGridBlock(10)
  whoFor.id = uid('who')
  whoFor.title = 'Kimler için uygun?'
  whoFor.description = ''
  whoFor.settings = {
    ...whoFor.settings,
    columns: 3,
    cards: [
      { id: uid('card-solo'), title: 'Bireysel avukatlar', description: 'Tek başına çalışan ve düzeni dijitalde kurmak isteyen avukatlar.', icon: 'user', color: '#0ea5e9' },
      { id: uid('card-firm'), title: 'Hukuk büroları', description: 'Birden fazla avukat ve personelin aynı veriyi kullandığı bürolar.', icon: 'scale', color: '#0ea5e9' },
      { id: uid('card-collect'), title: 'Tahsilatını düzenli takip etmek isteyenler', description: 'Vadesi yaklaşan ödemeleri kaçırmak istemeyen vekalet sahipleri.', icon: 'trending-up', color: '#0ea5e9' },
    ],
  }

  const faq = createDefaultFaqBlock(11)
  faq.id = uid('faq')
  faq.title = 'Sık sorulan sorular'
  faq.settings.items = [
    { id: uid('faq-1'), question: 'Programı bilgisayarıma kurmam gerekiyor mu?', answer: 'Hayır. Müvekkil Kasası web tabanlıdır; modern bir tarayıcı ve internet bağlantısı yeterlidir.' },
    { id: uid('faq-2'), question: 'Birden fazla çalışan kullanabilir mi?', answer: 'Evet. Büronuzdaki yetkili kullanıcılar aynı hesap üzerinden tarayıcıdan erişebilir.' },
    { id: uid('faq-3'), question: 'Normal WhatsApp numaramı kullanabilir miyim?', answer: 'Hatırlatmalar WhatsApp Business üzerinden gönderilir. Büronuzun WhatsApp Business numarasını bağlayabilirsiniz.' },
    { id: uid('faq-4'), question: 'Eski WhatsApp konuşmalarım silinir mi?', answer: 'Hayır. Müvekkil Kasası yalnızca belirlediğiniz ödeme hatırlatmalarını gönderir.' },
    { id: uid('faq-5'), question: 'Demo sonunda verilerim kaybolur mu?', answer: 'Demo hesabınızı lisansladığınızda mevcut verileriniz korunur.' },
    { id: uid('faq-6'), question: 'Verilerime farklı bilgisayardan erişebilir miyim?', answer: 'Evet. Verileriniz güvenli sunucularda tutulur; farklı cihazlardan tarayıcı ile erişebilirsiniz.' },
  ]

  const footerCta = createDefaultCtaBlock(12) as CtaBlock
  footerCta.id = uid('footer-cta')
  footerCta.title = 'Büronuza uygun Müvekkil Kasa sürümünü seçin'
  footerCta.description = ''
  footerCta.style.backgroundColor = '#020617'
  footerCta.style.containerWidth = 'wide'
  footerCta.settings = {
    ...footerCta.settings,
    backgroundType: 'gradient',
    gradient: 'linear-gradient(to bottom right, #020617, #10263f, #0f172a)',
    variant: 'mk-compare-editions',
    featurePills: ['Bilgisayara kurulum · Merkezi lisans', 'Tarayıcı erişimi · 7 gün ücretsiz demo'],
    footerLinkLabel: 'Satın alma alanına dön',
    footerLinkHref: `#${MK_COMPARE_PURCHASE_ID}`,
    buttons: [
      {
        id: uid('cta-desktop'),
        label: 'Masaüstü Sürümünü Seç',
        href: `#${MK_COMPARE_PURCHASE_ID}`,
        visible: true,
        variant: 'primary',
      },
      {
        id: uid('cta-saas'),
        label: 'SaaS/Web Sürümünü Seç',
        href: `#${MK_COMPARE_PURCHASE_ID}`,
        visible: true,
        variant: 'outline',
      },
    ],
  }

  return assignSortOrder([
    hero,
    purchase,
    table,
    details,
    problemCta,
    benefits,
    fileVault,
    installments,
    compactFeatures,
    whatsappGuide,
    whoFor,
    faq,
    footerCta,
  ])
}
