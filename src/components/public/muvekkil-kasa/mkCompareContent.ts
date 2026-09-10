import type { MkCompareCellTone } from '@/builder/types/mkCompareTable'

export const MK_COMPARE_TABLE_TITLE = 'Masaüstü mü, Web Tabanlı mı?'

export const MK_COMPARE_TABLE_DESCRIPTION =
  'Masaüstü sürüm tek kullanıcı ve basit takip ihtiyacı için uygundur. Web tabanlı sürüm ise büro içinde ekip çalışması, gelişmiş takip, hatırlatma ve raporlama isteyen hukuk büroları için geliştirilmiştir.'

export const MK_COMPARE_TABLE_DECISION_NOTE =
  'Tek başınıza çalışıyor ve yalnızca temel kasa takibi yapmak istiyorsanız masaüstü sürüm yeterli olabilir. Büro içinde birden fazla kişiyle çalışıyor, personel/prim takibi, hatırlatma, raporlama ve merkezi erişim istiyorsanız web tabanlı sürümü tercih etmelisiniz.'

export const MK_COMPARE_DESKTOP_COLUMN = 'Masaüstü Sürüm'
export const MK_COMPARE_WEB_COLUMN = 'Web Tabanlı Sürüm'

/** Web sütununda rozet ve ikon yalnızca bu satırlarda gösterilir. */
export const MK_COMPARE_WEB_HIGHLIGHT_FEATURES = [
  'Yetkili kullanıcılar',
  'Personel ve prim takibi',
  'Otomatik hatırlatmalar',
  'Raporlama ve kontrol',
  'Her yerden erişim',
] as const

export function isMkCompareWebHighlightFeature(feature: string): boolean {
  return (MK_COMPARE_WEB_HIGHLIGHT_FEATURES as readonly string[]).includes(feature)
}

export const MK_COMPARE_HERO_BADGE = 'Masaüstü ve Web Tabanlı'
export const MK_COMPARE_HERO_DESCRIPTION =
  'Woontegra’nın avukat büroları için geliştirdiği Müvekkil Kasa Defteri’nde masaüstü sadeliğini veya internet üzerinden erişilebilen web tabanlı takibi karşılaştırın; büronuza uygun sürümü seçin.'

export const MK_COMPARE_DESKTOP_DELIVERY_NOTE = 'Kurulum ve lisans bilgileri e-posta ile iletilir.'
export const MK_COMPARE_WEB_DELIVERY_NOTE = 'Giriş bilgileri ve erişim bilgileri e-posta ile iletilir.'

/** @deprecated Use MK_COMPARE_TABLE_DECISION_NOTE */
export const MK_COMPARE_TABLE_FOOTNOTE = MK_COMPARE_TABLE_DECISION_NOTE

export type MkCompareContentCell = {
  tone: MkCompareCellTone
  text: string
  hint?: string
}

export type MkCompareContentRow = {
  id: string
  feature: string
  desktop: MkCompareContentCell
  saas: MkCompareContentCell
}

export const MK_COMPARE_TABLE_ROWS: MkCompareContentRow[] = [
  {
    id: 'row-tracking',
    feature: 'Müvekkil kasa takibi',
    desktop: { tone: 'check', text: 'Temel kasa hareketi takibi' },
    saas: {
      tone: 'saas',
      text: 'Müvekkil, dosya, avans, masraf, tahsilat ve bakiye takibi',
    },
  },
  {
    id: 'row-team',
    feature: 'Büro içi ekip kullanımı',
    desktop: { tone: 'neutral', text: 'Tek kullanıcıya daha uygundur' },
    saas: { tone: 'saas', text: 'Birden fazla kullanıcıyla birlikte kullanılabilir' },
  },
  {
    id: 'row-users',
    feature: 'Yetkili kullanıcılar',
    desktop: { tone: 'neutral', text: 'Yok' },
    saas: { tone: 'saas', text: 'Büro içindeki çalışanlara ayrı kullanıcı hesabı açılabilir' },
  },
  {
    id: 'row-staff',
    feature: 'Personel ve prim takibi',
    desktop: { tone: 'neutral', text: 'Yok' },
    saas: { tone: 'saas', text: 'Personel bazlı icra tahsilatı ve prim takibi yapılabilir' },
  },
  {
    id: 'row-reminders',
    feature: 'Otomatik hatırlatmalar',
    desktop: { tone: 'neutral', text: 'Sınırlı / manuel takip gerekir' },
    saas: {
      tone: 'saas',
      text: 'Tahsilat, ödeme ve işlem hatırlatmaları sistemden takip edilebilir',
    },
  },
  {
    id: 'row-whatsapp',
    feature: 'WhatsApp / iletişim kolaylığı',
    desktop: { tone: 'neutral', text: 'Manuel paylaşım ağırlıklı' },
    saas: { tone: 'saas', text: 'Müvekkil bilgilendirme ve paylaşım süreçleri daha kolay yönetilir' },
  },
  {
    id: 'row-reports',
    feature: 'Raporlama ve kontrol',
    desktop: { tone: 'check', text: 'Temel listeleme' },
    saas: {
      tone: 'saas',
      text: 'Büro geneli gelir, gider, tahsilat, masraf ve bakiye kontrolü',
    },
  },
  {
    id: 'row-access',
    feature: 'Her yerden erişim',
    desktop: { tone: 'neutral', text: 'Kurulu bilgisayara bağlı kullanım' },
    saas: { tone: 'saas', text: 'İnternet olan her yerden erişim' },
  },
  {
    id: 'row-backup',
    feature: 'Veri düzeni ve yedekleme',
    desktop: { tone: 'neutral', text: 'Kullanılan cihaza bağlıdır' },
    saas: { tone: 'saas', text: 'Veriler merkezi sistemde düzenli tutulur' },
  },
  {
    id: 'row-audience',
    feature: 'Kimler için uygun?',
    desktop: { tone: 'check', text: 'Tek başına çalışan ve basit takip isteyen kullanıcılar' },
    saas: { tone: 'saas', text: 'Ekip halinde çalışan, çok dosya/müvekkil yöneten hukuk büroları' },
  },
]

export const MK_COMPARE_LEGACY_TABLE_FEATURES = [
  'Kurulum',
  'Lisans modeli',
  'Kullanım süresi',
  'Cihaz hakkı',
  'Fiyatlandırma',
  'Ücretsiz demo',
  'Kullanım şekli',
  'Kullanıcı sayısı',
  'Cihaz erişimi',
  'Güncelleme',
  'Veri güvenliği / yedek',
  'Çoklu kullanıcı',
  'WhatsApp Business bağlantısı',
  'Otomatik WhatsApp hatırlatmaları',
] as const

/** Karşılaştırma sayfası “Ürün detay içeriği” — sekmeye göre yapılandırılmış metin. */
export type MkCompareDetailOverview = {
  intro: string
  canDo: string[]
  suitableFor: string[]
  advantages: string[]
}

export const MK_COMPARE_DETAIL_OVERVIEW_DESKTOP: MkCompareDetailOverview = {
  intro:
    'Müvekkil Kasa Defteri masaüstü sürümü, müvekkil hesaplarınızı bilgisayarınızda düzenli tutmanıza yardımcı olur. Tahsilat, ödeme, masraf, avans ve bakiyeyi tarihli kasa hareketleriyle izlersiniz. Satın alma sonrası lisans bilgileri e-posta ile iletilir.',
  canDo: [
    'Müvekkil bazında tahsilat, ödeme, masraf ve avans kayıtlarını girebilirsiniz.',
    'Kalan bakiyeyi anlık olarak görebilirsiniz.',
    'Kasa hareketlerini tarihe göre sıralı tutabilirsiniz.',
    'Dağınık notlar yerine tek bir kayıt düzeni kullanabilirsiniz.',
  ],
  suitableFor: [
    'Tek başına veya az müvekkille çalışan hukuk profesyonelleri',
    'Temel kasa takibini kendi bilgisayarında yürütmek isteyenler',
    'Basit ve hızlı kurulum arayan kullanıcılar',
  ],
  advantages: [
    'Masaüstünde sade ve odaklı çalışma düzeni',
    'Müvekkil mali akışının tek ekranda toplanması',
    'Tarihli hareketlerle okunabilir kayıt geçmişi',
    'Lisans bilgilerinin e-posta ile teslimi',
  ],
}

export const MK_COMPARE_DETAIL_OVERVIEW_WEB: MkCompareDetailOverview = {
  intro:
    'Web tabanlı sürüm, aynı mali takip ihtiyaçlarını tarayıcı üzerinden karşılar. Birden fazla yetkili kullanıcı farklı cihazlardan ortak kayıtlara erişebilir. Giriş ve erişim bilgileri e-posta ile iletilir.',
  canDo: [
    'Tahsilat, ödeme, masraf, avans ve bakiyeyi müvekkil bazında yönetebilirsiniz.',
    'İnternet olan her yerden tarayıcıyla giriş yapabilirsiniz.',
    'Yetkili kullanıcılarla aynı kasa verisini paylaşabilirsiniz.',
    'Büro içi ortak takibi farklı cihazlardan sürdürebilirsiniz.',
  ],
  suitableFor: [
    'Birden fazla kişinin aynı kasa kayıtlarına bakması gereken bürolar',
    'Ofis dışında da dosya ve müvekkil bakiyesini görmek isteyen ekipler',
    'Ortak takip ve yetki ayrımı arayan hukuk ofisleri',
  ],
  advantages: [
    'Kurulum yükü olmadan tarayıcıdan anında erişim',
    'Yetkili kullanıcılarla paylaşılan çalışma ortamı',
    'Telefon, tablet veya bilgisayardan devam edebilme esnekliği',
    'Büro genelinde aynı güncel bakiyeyi görme kolaylığı',
  ],
}

export function getMkCompareDetailOverview(edition: 'desktop' | 'saas'): MkCompareDetailOverview {
  return edition === 'saas' ? MK_COMPARE_DETAIL_OVERVIEW_WEB : MK_COMPARE_DETAIL_OVERVIEW_DESKTOP
}
