import type { BlockBase, BlockStyle, BlockVisibility } from './common'

export type MkCompareCellTone = 'check' | 'neutral' | 'saas' | 'info'

export type MkCompareValueKey =
  | 'desktop-license'
  | 'desktop-devices'
  | 'desktop-price'
  | 'saas-years'
  | 'saas-price'

export type MkCompareTableCell = {
  tone: MkCompareCellTone
  text: string
  hint?: string
  valueKey?: MkCompareValueKey
}

export type MkCompareTableRow = {
  id: string
  feature: string
  desktop: MkCompareTableCell
  saas: MkCompareTableCell
}

export type MkCompareTableBlock = BlockBase & {
  type: 'mk-compare-table'
  settings: {
    anchorId: string
    desktopColumnLabel: string
    saasColumnLabel: string
    rows: MkCompareTableRow[]
  }
}

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 7)}`
}

function baseStyle(): BlockStyle {
  return {
    containerWidth: 'wide',
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
    showImage: false,
    showButton: false,
  }
}

function cell(tone: MkCompareCellTone, text: string, extra?: Partial<MkCompareTableCell>): MkCompareTableCell {
  return { tone, text, ...extra }
}

export function createDefaultMkCompareTableRows(): MkCompareTableRow[] {
  return [
    {
      id: 'row-usage',
      feature: 'Kullanım şekli',
      desktop: cell('check', 'Bilgisayara kurulan masaüstü programı'),
      saas: cell('check', 'Tarayıcı üzerinden web erişimi'),
    },
    {
      id: 'row-install',
      feature: 'Kurulum',
      desktop: cell('neutral', 'Kurulum gerektirir'),
      saas: cell('check', 'Kurulum gerektirmez'),
    },
    {
      id: 'row-license',
      feature: 'Lisans modeli',
      desktop: cell('check', 'Merkezi lisans'),
      saas: cell('check', 'Yıllık SaaS üyeliği'),
    },
    {
      id: 'row-duration',
      feature: 'Kullanım süresi',
      desktop: cell('info', 'Ürün yüklenince gösterilir', { valueKey: 'desktop-license' }),
      saas: cell('check', '1–10 yıl seçilebilir', { valueKey: 'saas-years' }),
    },
    {
      id: 'row-devices',
      feature: 'Cihaz hakkı',
      desktop: cell('info', 'Ürün yüklenince gösterilir', { valueKey: 'desktop-devices' }),
      saas: cell('check', 'Tarayıcı erişimi'),
    },
    {
      id: 'row-multiuser',
      feature: 'Çoklu kullanıcı',
      desktop: cell('neutral', 'Bilgi için ürün detayını inceleyin', {
        hint: 'Bu özellik masaüstü uygulama kodunda bu siteden doğrulanmadı.',
      }),
      saas: cell('check', 'Desteklenir'),
    },
    {
      id: 'row-whatsapp',
      feature: 'WhatsApp Business bağlantısı',
      desktop: cell('saas', 'Web sürümünde sunulur'),
      saas: cell('check', 'Desteklenir'),
    },
    {
      id: 'row-reminders',
      feature: 'Otomatik WhatsApp hatırlatmaları',
      desktop: cell('saas', 'Web sürümünde sunulur'),
      saas: cell('check', 'Desteklenir'),
    },
    {
      id: 'row-demo',
      feature: 'Ücretsiz demo',
      desktop: cell('neutral', 'Bulunmuyor'),
      saas: cell('check', '7 gün'),
    },
    {
      id: 'row-price',
      feature: 'Fiyatlandırma',
      desktop: cell('info', 'API fiyatı · tek lisans', { valueKey: 'desktop-price' }),
      saas: cell('info', 'API birim fiyatı × seçilen yıl', { valueKey: 'saas-price' }),
    },
  ]
}

export function createDefaultMkCompareTableBlock(sortOrder: number): MkCompareTableBlock {
  return {
    id: uid('mk-compare-table'),
    type: 'mk-compare-table',
    sortOrder,
    title: 'Sürüm karşılaştırması',
    description:
      'Yalnızca bu sitede doğrulanan kullanım, lisans ve satış farkları. Doğrulanmayan iddialar tabloda yer almaz.',
    visibility: baseVisibility(),
    style: baseStyle(),
    settings: {
      anchorId: 'surum-karsilastirmasi',
      desktopColumnLabel: 'Masaüstü',
      saasColumnLabel: 'SaaS / Web',
      rows: createDefaultMkCompareTableRows(),
    },
  }
}
