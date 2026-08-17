import type { BuilderBlock } from '@/builder/types/blocks'
import { assignSortOrder } from '@/builder/load/parseBuilderBlocks'
import { createDefaultHeroBlock } from '@/builder/types/hero'
import { createDefaultCtaBlock, createDefaultCardGridBlock, createDefaultFaqBlock, createDefaultImageTextBlock } from '@/builder/types/blockModels'
import { createDefaultMkSaasPurchaseBlock } from '@/builder/types/mkSaasPurchase'
import { createDefaultWhatsAppGuideBlock } from '@/builder/types/whatsappGuide'
import { MK_SAAS_PROBLEM_PILLS } from '@/builder/render/mkSaasBuilderVisuals'

function uid(part: string): string {
  return `mk-saas-${part}-${Date.now()}`
}

export function createMkSaasSalesBuilderTemplate(): BuilderBlock[] {
  const hero = createDefaultHeroBlock(uid('hero'), 0)
  hero.title = 'Müvekkil paranızı, dosyalarınızı ve tahsilatlarınızı tek yerde yönetin.'
  hero.description =
    'Avansları, masrafları, vekalet taksitlerini ve kasa hareketlerini Excel dosyaları arasında kaybetmeyin. Müvekkil Kasası büronuzun finansal düzenini kurar; yaklaşan ödemeleri WhatsApp Business üzerinden zamanında hatırlatır.'
  hero.style.backgroundColor = '#0f172a'
  hero.style.containerWidth = 'wide'
  hero.style.customClass = 'mk-saas-hero'
  hero.settings = {
    ...hero.settings,
    mode: 'carousel',
    layout: 'split',
    badge: 'Hukuk büroları için web tabanlı kasa ve tahsilat yönetimi',
    showProductPrice: true,
    priceSuffix: '/ 1 yıl',
    highlights: [
      { id: uid('hl'), icon: 'check', title: 'Kurulum gerektirmez' },
      { id: uid('hl'), icon: 'check', title: 'Çoklu kullanıcı' },
      { id: uid('hl'), icon: 'check', title: 'Her yerden güvenli erişim' },
    ],
    height: { desktop: '520px', tablet: '480px', mobile: '400px' },
    imageFit: { desktop: 'contain', tablet: 'contain', mobile: 'contain' },
    carousel: { autoplay: true, intervalMs: 5000, showArrows: true, showDots: true, pauseOnHover: true, loop: true },
    slides: [
      {
        id: uid('slide'),
        sortOrder: 0,
        enabled: true,
        buttons: [],
      },
    ],
    buttons: [
      {
        id: uid('btn-buy'),
        label: 'Hemen Satın Al',
        href: '#satin-alma',
        visible: true,
        variant: 'primary',
      },
      {
        id: uid('btn-demo'),
        label: '7 Gün Ücretsiz Dene',
        visible: true,
        variant: 'outline',
        actionKey: 'openDemo',
      },
    ],
  }

  const problemCta = createDefaultCtaBlock(1)
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
  problemCta.style.customClass = 'mk-saas-problem-band'

  const benefits = createDefaultCardGridBlock(2)
  benefits.title = 'Büronuzda ne değişecek?'
  benefits.description = ''
  benefits.style.customClass = 'mk-saas-benefits'
  benefits.settings = {
    ...benefits.settings,
    variant: 'mk-benefit',
    columns: 4,
    cards: [
      { id: uid('card'), title: 'Her müvekkilin parasını ayrı izleyin', description: 'Avans, masraf, tahsilat ve bakiye hareketleri dosya bazında karışmadan ilerler.', icon: 'wallet', color: '#0ea5e9' },
      { id: uid('card'), title: 'Vadesi yaklaşan taksitleri kaçırmayın', description: 'Yaklaşan ve geciken vekalet taksitlerini tek ekranda görün; hatırlatma düzeninizi kurun.', icon: 'calendar-days', color: '#0ea5e9' },
      { id: uid('card'), title: 'WhatsApp hatırlatmalarını otomatikleştirin', description: 'Ödeme hatırlatmalarını belirlediğiniz zamanda büronuzun WhatsApp Business numarasından iletin.', icon: 'message-circle', color: '#0ea5e9' },
      { id: uid('card'), title: 'Büro ekibi aynı güncel veriyi kullansın', description: 'Yetkili kullanıcılar tarayıcıdan erişsin; kimin hangi işlemi yaptığı kayıt altında kalsın.', icon: 'users', color: '#0ea5e9' },
    ],
  }

  const purchase = createDefaultMkSaasPurchaseBlock(3)

  const fileVault = createDefaultImageTextBlock(4)
  fileVault.title = 'Bu dosyada ne kadar para kaldı? sorusunun cevabı saniyeler içinde.'
  fileVault.description =
    'Her müvekkilin birden fazla dosyasını ayrı yönetin. Alınan avansları, yapılan masrafları ve tahsilatları belge numarasıyla kaydedin. Kalan bakiyeyi hesap makinesi açmadan görün.'
  fileVault.settings.imagePosition = 'right'
  fileVault.settings.button = { id: uid('btn'), label: '', href: '', visible: false, variant: 'primary' }

  const installments = createDefaultImageTextBlock(5)
  installments.title = 'Taksit tarihlerini takip etmek için ajandaya bağımlı kalmayın.'
  installments.description =
    'Vekalet ücretini taksitlendirin; vadesi yaklaşan, bugün ödenecek ve geciken tahsilatları tek ekranda görün. Kurallarınızı belirleyin, uygun hatırlatmalar büronuzun WhatsApp Business numarasından gönderilsin.'
  installments.settings.imagePosition = 'left'
  installments.settings.button = {
    id: uid('btn'),
    label: 'WhatsApp bağlantısı nasıl yapılır?',
    href: '#whatsapp-gecis-rehberi',
    visible: true,
    variant: 'primary',
  }

  const compactFeatures = createDefaultCardGridBlock(6)
  compactFeatures.title = ''
  compactFeatures.description = ''
  compactFeatures.visibility.showTitle = false
  compactFeatures.settings = {
    ...compactFeatures.settings,
    columns: 4,
    variant: 'icon-dark',
    cards: [
      { id: uid('card'), title: 'Profesyonel makbuzlar', description: 'Tahsilat makbuzlarını düzenli ve standart formatta oluşturun.', icon: 'receipt', color: '#0ea5e9' },
      { id: uid('card'), title: 'Ofis kasası ve mali kontrol', description: 'Büro genelinde kasa hareketlerini tek ekrandan izleyin.', icon: 'building-2', color: '#0ea5e9' },
      { id: uid('card'), title: 'Yetkili ekip erişimi', description: 'Kullanıcı yetkileriyle güvenli ve kontrollü erişim sağlayın.', icon: 'shield', color: '#0ea5e9' },
      { id: uid('card'), title: 'Rapor ve kayıt düzeni', description: 'İşlem geçmişi ve raporlarla denetlenebilir kayıt tutun.', icon: 'file-text', color: '#0ea5e9' },
    ],
  }

  const whatsappGuide = createDefaultWhatsAppGuideBlock(7)
  whatsappGuide.style.customClass = 'scroll-mt-20'
  whatsappGuide.id = 'whatsapp-gecis-rehberi-block'

  const whoFor = createDefaultCardGridBlock(8)
  whoFor.title = 'Kimler için uygun?'
  whoFor.description = ''
  whoFor.settings = {
    ...whoFor.settings,
    columns: 3,
    cards: [
      { id: uid('card'), title: 'Bireysel avukatlar', description: 'Tek başına çalışan ve düzeni dijitalde kurmak isteyen avukatlar.', icon: 'user', color: '#0ea5e9' },
      { id: uid('card'), title: 'Hukuk büroları', description: 'Birden fazla avukat ve personelin aynı veriyi kullandığı bürolar.', icon: 'scale', color: '#0ea5e9' },
      { id: uid('card'), title: 'Tahsilatını düzenli takip etmek isteyenler', description: 'Vadesi yaklaşan ödemeleri kaçırmak istemeyen vekalet sahipleri.', icon: 'trending-up', color: '#0ea5e9' },
    ],
  }

  const faq = createDefaultFaqBlock(9)
  faq.title = 'Sık sorulan sorular'
  faq.settings.items = [
    { id: uid('faq'), question: 'Programı bilgisayarıma kurmam gerekiyor mu?', answer: 'Hayır. Müvekkil Kasası web tabanlıdır; modern bir tarayıcı ve internet bağlantısı yeterlidir.' },
    { id: uid('faq'), question: 'Birden fazla çalışan kullanabilir mi?', answer: 'Evet. Büronuzdaki yetkili kullanıcılar aynı hesap üzerinden tarayıcıdan erişebilir.' },
    { id: uid('faq'), question: 'Normal WhatsApp numaramı kullanabilir miyim?', answer: 'Hatırlatmalar WhatsApp Business üzerinden gönderilir. Büronuzun WhatsApp Business numarasını bağlayabilirsiniz.' },
    { id: uid('faq'), question: 'Eski WhatsApp konuşmalarım silinir mi?', answer: 'Hayır. Müvekkil Kasası yalnızca belirlediğiniz ödeme hatırlatmalarını gönderir.' },
    { id: uid('faq'), question: 'Demo sonunda verilerim kaybolur mu?', answer: 'Demo hesabınızı lisansladığınızda mevcut verileriniz korunur.' },
    { id: uid('faq'), question: 'Verilerime farklı bilgisayardan erişebilir miyim?', answer: 'Evet. Verileriniz güvenli sunucularda tutulur; farklı cihazlardan tarayıcı ile erişebilirsiniz.' },
  ]

  return assignSortOrder([
    hero,
    problemCta,
    benefits,
    purchase,
    fileVault,
    installments,
    compactFeatures,
    whatsappGuide,
    whoFor,
    faq,
  ])
}

export function isMkSaasSalesBuilderDocument(blocks: BuilderBlock[]): boolean {
  return blocks.some((b) => b.type === 'mk-saas-purchase' || b.type === 'whatsapp-guide')
}
