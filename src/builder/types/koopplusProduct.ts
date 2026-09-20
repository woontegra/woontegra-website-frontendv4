import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeftRight,
  Building2,
  Calculator,
  Database,
  FileSpreadsheet,
  Landmark,
  Layers,
  Percent,
  Receipt,
  ShieldCheck,
  Users,
  Wallet,
} from 'lucide-react'
import type { BlockBase, BlockStyle, BlockVisibility } from './common'
import {
  KOOPPLUS_FAQ,
  KOOPPLUS_FEATURES,
  KOOPPLUS_HERO,
  KOOPPLUS_HERO_IMAGE,
  KOOPPLUS_LICENSE_POINTS,
  KOOPPLUS_LOCAL_DATA,
  KOOPPLUS_MULTI_COOP,
  KOOPPLUS_NAME,
  KOOPPLUS_TRIAL,
  KOOPPLUS_WHY,
} from '@/data/koopplusProduct'

export const KOOPPLUS_PRODUCT_BLOCK_TYPE = 'koopplus-product' as const
export const KOOPPLUS_PRODUCT_SCHEMA_VERSION = 1 as const

export const KOOPPLUS_CTA_ACTIONS = [
  'purchaseWindows',
  'startTrial',
  'downloadTrial',
  'purchaseMac',
] as const

export type KoopPlusCtaAction = (typeof KOOPPLUS_CTA_ACTIONS)[number]

export type KoopPlusGalleryImage = {
  url: string
  alt: string
}

export type KoopPlusTextItem = {
  title: string
  description: string
}

export type KoopPlusFeatureItem = KoopPlusTextItem & {
  icon: string
}

export type KoopPlusFaqItem = {
  question: string
  answer: string
}

export type KoopPlusSectionVisibility = {
  trial: boolean
  features: boolean
  why: boolean
  info: boolean
  license: boolean
  faq: boolean
  closing: boolean
}

export type KoopPlusProductContent = {
  hero: {
    kicker: string
    identity: string
    title: string
    description: string
    primaryCtaLabel: string
    primaryCtaAction: 'purchaseWindows'
    secondaryCtaLabel: string
    secondaryCtaAction: 'startTrial'
    salesNotReadyLabel: string
    imageUrl: string | null
    imageAlt: string
  }
  platforms: {
    heading: string
    trialSuffix: string
    windows: {
      title: string
      status: string
      badge: string
      purchaseCtaLabel: string
      purchaseCtaAction: 'purchaseWindows'
      trialCtaLabel: string
    }
    mac: {
      title: string
      status: string
      badge: string
      purchaseCtaLabel: string
      purchaseCtaAction: 'purchaseMac'
      closedNote: string
    }
  }
  trial: {
    eyebrow: string
    title: string
    intro: string
    highlights: KoopPlusTextItem[]
    downloadCtaLabel: string
    downloadCtaAction: 'downloadTrial'
    trustLine: string
    downloadHint: string
  }
  features: {
    heading: string
    description: string
    items: KoopPlusFeatureItem[]
  }
  why: {
    heading: string
    items: KoopPlusTextItem[]
  }
  info: {
    multiCoop: KoopPlusTextItem
    localData: KoopPlusTextItem
  }
  license: {
    heading: string
    points: string[]
  }
  faq: {
    heading: string
    items: KoopPlusFaqItem[]
  }
  closing: {
    heading: string
    description: string
    primaryCtaLabel: string
    primaryCtaAction: 'purchaseWindows'
    secondaryCtaLabel: string
    secondaryCtaAction: 'startTrial'
  }
  gallery: {
    images: KoopPlusGalleryImage[]
  }
  sectionVisibility: KoopPlusSectionVisibility
}

export type KoopPlusProductSettings = {
  schemaVersion: typeof KOOPPLUS_PRODUCT_SCHEMA_VERSION
  content: KoopPlusProductContent
}

export type KoopPlusProductBlock = BlockBase & {
  type: typeof KOOPPLUS_PRODUCT_BLOCK_TYPE
  settings: KoopPlusProductSettings
}

export type ParseKoopPlusProductResult =
  | { ok: true; block: KoopPlusProductBlock; content: KoopPlusProductContent }
  | { ok: false; reason: 'missing' | 'unsupported-version' | 'invalid-structure' }

const FEATURE_ICONS: Record<string, LucideIcon> = {
  Users,
  Calculator,
  Receipt,
  Percent,
  Wallet,
  Landmark,
  FileSpreadsheet,
  ArrowLeftRight,
  Layers,
  Database,
  Building2,
  ShieldCheck,
}

const FEATURE_ICON_BY_COMPONENT = new Map<LucideIcon, string>(
  Object.entries(FEATURE_ICONS).map(([key, icon]) => [icon, key]),
)

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 7)}`
}

function baseStyle(): BlockStyle {
  return {
    containerWidth: 'full',
    contentAlign: 'left',
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

function str(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function nullableUrl(value: unknown, fallback: string | null): string | null {
  if (value === null) return null
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export function isKoopPlusCtaAction(value: unknown): value is KoopPlusCtaAction {
  return typeof value === 'string' && (KOOPPLUS_CTA_ACTIONS as readonly string[]).includes(value)
}

export function sanitizeKoopPlusCtaAction(value: unknown, fallback: KoopPlusCtaAction): KoopPlusCtaAction {
  return isKoopPlusCtaAction(value) ? value : fallback
}

export function isUnsafeKoopPlusActionInput(value: unknown): boolean {
  if (typeof value !== 'string') return true
  if (/javascript:|data:text|on\w+\s*=|<\s*script/i.test(value)) return true
  return !isKoopPlusCtaAction(value)
}

export function resolveKoopPlusFeatureIcon(name?: string | null): LucideIcon {
  if (!name) return ShieldCheck
  return FEATURE_ICONS[name] ?? ShieldCheck
}

export function getDefaultKoopPlusProductContent(): KoopPlusProductContent {
  return {
    hero: {
      kicker: KOOPPLUS_HERO.kicker,
      identity: KOOPPLUS_HERO.identity,
      title: KOOPPLUS_HERO.title,
      description: KOOPPLUS_HERO.description,
      primaryCtaLabel: KOOPPLUS_HERO.primaryCta,
      primaryCtaAction: 'purchaseWindows',
      secondaryCtaLabel: KOOPPLUS_HERO.secondaryCta,
      secondaryCtaAction: 'startTrial',
      salesNotReadyLabel: 'Satışa hazırlanıyor',
      imageUrl: KOOPPLUS_HERO_IMAGE,
      imageAlt: 'KoopPlus masaüstü uygulaması',
    },
    platforms: {
      heading: 'KoopPlus’ı kullanmaya başlayın',
      trialSuffix: '7 gün ücretsiz deneme',
      windows: {
        title: 'KoopPlus for Windows',
        status: 'Kullanıma hazır',
        badge: 'Windows',
        purchaseCtaLabel: 'Windows için Satın Al',
        purchaseCtaAction: 'purchaseWindows',
        trialCtaLabel: '7 Gün Ücretsiz Dene',
      },
      mac: {
        title: 'KoopPlus for Mac',
        status: 'macOS sürümü yakında kullanıma sunulacak.',
        badge: 'Yakında',
        purchaseCtaLabel: 'Mac için Satın Al',
        purchaseCtaAction: 'purchaseMac',
        closedNote: 'macOS satın alma şu anda kapalıdır.',
      },
    },
    trial: {
      eyebrow: KOOPPLUS_TRIAL.eyebrow,
      title: KOOPPLUS_TRIAL.title,
      intro: KOOPPLUS_TRIAL.intro,
      highlights: KOOPPLUS_TRIAL.highlights.map((item) => ({
        title: item.title,
        description: item.description,
      })),
      downloadCtaLabel: KOOPPLUS_TRIAL.downloadCta,
      downloadCtaAction: 'downloadTrial',
      trustLine: KOOPPLUS_TRIAL.trustLine,
      downloadHint: KOOPPLUS_TRIAL.downloadHint,
    },
    features: {
      heading: 'KoopPlus ile neler yönetirsiniz?',
      description: 'Masaüstü uygulamada bugün kullanılan temel kooperatif süreçleri.',
      items: KOOPPLUS_FEATURES.map((feature) => ({
        title: feature.title,
        description: feature.description,
        icon: FEATURE_ICON_BY_COMPONENT.get(feature.icon) ?? 'ShieldCheck',
      })),
    },
    why: {
      heading: 'Neden KoopPlus?',
      items: KOOPPLUS_WHY.map((item) => ({ title: item.title, description: item.description })),
    },
    info: {
      multiCoop: {
        title: KOOPPLUS_MULTI_COOP.title,
        description: KOOPPLUS_MULTI_COOP.description,
      },
      localData: {
        title: KOOPPLUS_LOCAL_DATA.title,
        description: KOOPPLUS_LOCAL_DATA.description,
      },
    },
    license: {
      heading: 'Lisans modeli',
      points: [...KOOPPLUS_LICENSE_POINTS],
    },
    faq: {
      heading: 'Sıkça sorulan sorular',
      items: KOOPPLUS_FAQ.map((item) => ({ question: item.question, answer: item.answer })),
    },
    closing: {
      heading: 'Kooperatif yönetimini KoopPlus ile sadeleştirin',
      description: 'Windows sürümünü inceleyin veya 7 günlük denemeyi masaüstü uygulamada başlatın.',
      primaryCtaLabel: 'Windows için Satın Al',
      primaryCtaAction: 'purchaseWindows',
      secondaryCtaLabel: '7 Gün Ücretsiz Dene',
      secondaryCtaAction: 'startTrial',
    },
    gallery: {
      images: [],
    },
    sectionVisibility: {
      trial: true,
      features: true,
      why: true,
      info: true,
      license: true,
      faq: true,
      closing: true,
    },
  }
}

function mergeTextItems(value: unknown, fallback: KoopPlusTextItem[]): KoopPlusTextItem[] {
  if (!Array.isArray(value)) return fallback.map((item) => ({ ...item }))
  return value.map((row, index) => {
    const current = row && typeof row === 'object' ? (row as Record<string, unknown>) : {}
    const base = fallback[index] ?? { title: '', description: '' }
    return {
      title: str(current.title, base.title),
      description: str(current.description, base.description),
    }
  })
}

function mergeFeatures(value: unknown, fallback: KoopPlusFeatureItem[]): KoopPlusFeatureItem[] {
  if (!Array.isArray(value)) return fallback.map((item) => ({ ...item }))
  return value.map((row, index) => {
    const current = row && typeof row === 'object' ? (row as Record<string, unknown>) : {}
    const base = fallback[index] ?? { title: '', description: '', icon: 'ShieldCheck' }
    return {
      title: str(current.title, base.title),
      description: str(current.description, base.description),
      icon: str(current.icon, base.icon),
    }
  })
}

function mergeFaq(value: unknown, fallback: KoopPlusFaqItem[]): KoopPlusFaqItem[] {
  if (!Array.isArray(value)) return fallback.map((item) => ({ ...item }))
  return value.map((row, index) => {
    const current = row && typeof row === 'object' ? (row as Record<string, unknown>) : {}
    const base = fallback[index] ?? { question: '', answer: '' }
    return {
      question: str(current.question, base.question),
      answer: str(current.answer, base.answer),
    }
  })
}

function mergeGallery(value: unknown): KoopPlusGalleryImage[] {
  if (!Array.isArray(value)) return []
  return value
    .map((row) => {
      const current = row && typeof row === 'object' ? (row as Record<string, unknown>) : {}
      return {
        url: str(current.url, '').trim(),
        alt: str(current.alt, ''),
      }
    })
    .filter((item) => item.url)
}

function mergeContent(raw: unknown): KoopPlusProductContent | null {
  if (!raw || typeof raw !== 'object') return null
  const input = raw as Record<string, unknown>
  const defaults = getDefaultKoopPlusProductContent()

  const hero = input.hero && typeof input.hero === 'object' ? (input.hero as Record<string, unknown>) : null
  if (!hero) return null

  const platforms =
    input.platforms && typeof input.platforms === 'object'
      ? (input.platforms as Record<string, unknown>)
      : {}
  const windows =
    platforms.windows && typeof platforms.windows === 'object'
      ? (platforms.windows as Record<string, unknown>)
      : {}
  const mac =
    platforms.mac && typeof platforms.mac === 'object' ? (platforms.mac as Record<string, unknown>) : {}
  const trial = input.trial && typeof input.trial === 'object' ? (input.trial as Record<string, unknown>) : {}
  const features =
    input.features && typeof input.features === 'object' ? (input.features as Record<string, unknown>) : {}
  const why = input.why && typeof input.why === 'object' ? (input.why as Record<string, unknown>) : {}
  const info = input.info && typeof input.info === 'object' ? (input.info as Record<string, unknown>) : {}
  const multiCoop =
    info.multiCoop && typeof info.multiCoop === 'object' ? (info.multiCoop as Record<string, unknown>) : {}
  const localData =
    info.localData && typeof info.localData === 'object' ? (info.localData as Record<string, unknown>) : {}
  const license =
    input.license && typeof input.license === 'object' ? (input.license as Record<string, unknown>) : {}
  const faq = input.faq && typeof input.faq === 'object' ? (input.faq as Record<string, unknown>) : {}
  const closing =
    input.closing && typeof input.closing === 'object' ? (input.closing as Record<string, unknown>) : {}
  const gallery =
    input.gallery && typeof input.gallery === 'object' ? (input.gallery as Record<string, unknown>) : {}
  const visibility =
    input.sectionVisibility && typeof input.sectionVisibility === 'object'
      ? (input.sectionVisibility as Record<string, unknown>)
      : {}

  return {
    hero: {
      kicker: str(hero.kicker, defaults.hero.kicker),
      identity: str(hero.identity, defaults.hero.identity),
      title: str(hero.title, defaults.hero.title),
      description: str(hero.description, defaults.hero.description),
      primaryCtaLabel: str(hero.primaryCtaLabel, defaults.hero.primaryCtaLabel),
      primaryCtaAction: 'purchaseWindows',
      secondaryCtaLabel: str(hero.secondaryCtaLabel, defaults.hero.secondaryCtaLabel),
      secondaryCtaAction: 'startTrial',
      salesNotReadyLabel: str(hero.salesNotReadyLabel, defaults.hero.salesNotReadyLabel),
      imageUrl: nullableUrl(hero.imageUrl, defaults.hero.imageUrl),
      imageAlt: str(hero.imageAlt, defaults.hero.imageAlt),
    },
    platforms: {
      heading: str(platforms.heading, defaults.platforms.heading),
      trialSuffix: str(platforms.trialSuffix, defaults.platforms.trialSuffix),
      windows: {
        title: str(windows.title, defaults.platforms.windows.title),
        status: str(windows.status, defaults.platforms.windows.status),
        badge: str(windows.badge, defaults.platforms.windows.badge),
        purchaseCtaLabel: str(windows.purchaseCtaLabel, defaults.platforms.windows.purchaseCtaLabel),
        purchaseCtaAction: 'purchaseWindows',
        trialCtaLabel: str(windows.trialCtaLabel, defaults.platforms.windows.trialCtaLabel),
      },
      mac: {
        title: str(mac.title, defaults.platforms.mac.title),
        status: str(mac.status, defaults.platforms.mac.status),
        badge: str(mac.badge, defaults.platforms.mac.badge),
        purchaseCtaLabel: str(mac.purchaseCtaLabel, defaults.platforms.mac.purchaseCtaLabel),
        purchaseCtaAction: 'purchaseMac',
        closedNote: str(mac.closedNote, defaults.platforms.mac.closedNote),
      },
    },
    trial: {
      eyebrow: str(trial.eyebrow, defaults.trial.eyebrow),
      title: str(trial.title, defaults.trial.title),
      intro: str(trial.intro, defaults.trial.intro),
      highlights: mergeTextItems(trial.highlights, defaults.trial.highlights),
      downloadCtaLabel: str(trial.downloadCtaLabel, defaults.trial.downloadCtaLabel),
      downloadCtaAction: 'downloadTrial',
      trustLine: str(trial.trustLine, defaults.trial.trustLine),
      downloadHint: str(trial.downloadHint, defaults.trial.downloadHint),
    },
    features: {
      heading: str(features.heading, defaults.features.heading),
      description: str(features.description, defaults.features.description),
      items: mergeFeatures(features.items, defaults.features.items),
    },
    why: {
      heading: str(why.heading, defaults.why.heading),
      items: mergeTextItems(why.items, defaults.why.items),
    },
    info: {
      multiCoop: {
        title: str(multiCoop.title, defaults.info.multiCoop.title),
        description: str(multiCoop.description, defaults.info.multiCoop.description),
      },
      localData: {
        title: str(localData.title, defaults.info.localData.title),
        description: str(localData.description, defaults.info.localData.description),
      },
    },
    license: {
      heading: str(license.heading, defaults.license.heading),
      points: Array.isArray(license.points)
        ? license.points.map((point, index) => str(point, defaults.license.points[index] ?? ''))
        : [...defaults.license.points],
    },
    faq: {
      heading: str(faq.heading, defaults.faq.heading),
      items: mergeFaq(faq.items, defaults.faq.items),
    },
    closing: {
      heading: str(closing.heading, defaults.closing.heading),
      description: str(closing.description, defaults.closing.description),
      primaryCtaLabel: str(closing.primaryCtaLabel, defaults.closing.primaryCtaLabel),
      primaryCtaAction: 'purchaseWindows',
      secondaryCtaLabel: str(closing.secondaryCtaLabel, defaults.closing.secondaryCtaLabel),
      secondaryCtaAction: 'startTrial',
    },
    gallery: {
      images: mergeGallery(gallery.images),
    },
    sectionVisibility: {
      trial: bool(visibility.trial, defaults.sectionVisibility.trial),
      features: bool(visibility.features, defaults.sectionVisibility.features),
      why: bool(visibility.why, defaults.sectionVisibility.why),
      info: bool(visibility.info, defaults.sectionVisibility.info),
      license: bool(visibility.license, defaults.sectionVisibility.license),
      faq: bool(visibility.faq, defaults.sectionVisibility.faq),
      closing: bool(visibility.closing, defaults.sectionVisibility.closing),
    },
  }
}

export function createDefaultKoopPlusProductBlock(sortOrder = 0): KoopPlusProductBlock {
  return {
    id: uid(KOOPPLUS_PRODUCT_BLOCK_TYPE),
    type: KOOPPLUS_PRODUCT_BLOCK_TYPE,
    sortOrder,
    title: KOOPPLUS_NAME,
    description: KOOPPLUS_HERO.title,
    visibility: baseVisibility(),
    style: baseStyle(),
    settings: {
      schemaVersion: KOOPPLUS_PRODUCT_SCHEMA_VERSION,
      content: getDefaultKoopPlusProductContent(),
    },
  }
}

export function parseKoopPlusProductBlock(value: unknown): ParseKoopPlusProductResult {
  if (!value || typeof value !== 'object') return { ok: false, reason: 'missing' }
  const row = value as Record<string, unknown>
  if (row.type !== KOOPPLUS_PRODUCT_BLOCK_TYPE) return { ok: false, reason: 'invalid-structure' }

  const settings = row.settings && typeof row.settings === 'object' ? (row.settings as Record<string, unknown>) : null
  if (!settings) return { ok: false, reason: 'invalid-structure' }

  const version = settings.schemaVersion
  if (version != null && version !== KOOPPLUS_PRODUCT_SCHEMA_VERSION) {
    return { ok: false, reason: 'unsupported-version' }
  }

  const content = mergeContent(settings.content)
  if (!content) return { ok: false, reason: 'invalid-structure' }

  const visibility =
    row.visibility && typeof row.visibility === 'object'
      ? ({ ...baseVisibility(), ...(row.visibility as BlockVisibility) } as BlockVisibility)
      : baseVisibility()

  const style =
    row.style && typeof row.style === 'object'
      ? ({ ...baseStyle(), ...(row.style as BlockStyle) } as BlockStyle)
      : baseStyle()

  const block: KoopPlusProductBlock = {
    id: str(row.id, uid(KOOPPLUS_PRODUCT_BLOCK_TYPE)),
    type: KOOPPLUS_PRODUCT_BLOCK_TYPE,
    sortOrder: typeof row.sortOrder === 'number' ? row.sortOrder : 0,
    title: str(row.title, KOOPPLUS_NAME),
    description: typeof row.description === 'string' ? row.description : KOOPPLUS_HERO.title,
    visibility,
    style,
    settings: {
      schemaVersion: KOOPPLUS_PRODUCT_SCHEMA_VERSION,
      content,
    },
  }

  return { ok: true, block, content }
}

export function resolvePublishedKoopPlusProductContent(blocks: unknown[] | null | undefined): {
  content: KoopPlusProductContent | null
  fallbackReason: 'missing' | 'disabled' | 'unsupported-version' | 'invalid-structure' | null
} {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return { content: null, fallbackReason: 'missing' }
  }

  const candidates = blocks.filter((row) => {
    if (!row || typeof row !== 'object') return false
    return (row as { type?: unknown }).type === KOOPPLUS_PRODUCT_BLOCK_TYPE
  })
  if (candidates.length === 0) return { content: null, fallbackReason: 'missing' }

  const enabled = candidates.find((row) => {
    const visibility = (row as { visibility?: { enabled?: unknown } }).visibility
    return visibility?.enabled !== false
  })
  if (!enabled) return { content: null, fallbackReason: 'disabled' }

  const parsed = parseKoopPlusProductBlock(enabled)
  if (!parsed.ok) {
    if (typeof console !== 'undefined' && typeof console.warn === 'function') {
      console.warn('[KoopPlus] published koopplus-product block fallback', parsed.reason)
    }
    return { content: null, fallbackReason: parsed.reason }
  }
  return { content: parsed.content, fallbackReason: null }
}

export function patchKoopPlusProductContent(
  block: KoopPlusProductBlock,
  patch: (content: KoopPlusProductContent) => KoopPlusProductContent,
): KoopPlusProductBlock {
  return {
    ...block,
    settings: {
      ...block.settings,
      schemaVersion: KOOPPLUS_PRODUCT_SCHEMA_VERSION,
      content: patch(block.settings.content),
    },
  }
}
