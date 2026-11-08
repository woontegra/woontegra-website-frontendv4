import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeftRight,
  Building2,
  Calculator,
  Cloud,
  Database,
  FileSpreadsheet,
  Landmark,
  Layers,
  Percent,
  Receipt,
  ShieldCheck,
  Smartphone,
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
  KOOPPLUS_PRICE_LABEL,
  KOOPPLUS_TRIAL,
  KOOPPLUS_WHY,
} from '@/data/koopplusProduct'

export const KOOPPLUS_PRODUCT_BLOCK_TYPE = 'koopplus-product' as const
export const KOOPPLUS_PRODUCT_SCHEMA_VERSION = 1 as const

export const KOOPPLUS_CTA_ACTIONS = ['purchase', 'startDemo'] as const

export type KoopPlusCtaAction = (typeof KOOPPLUS_CTA_ACTIONS)[number]

/** Eski (masaüstü) builder JSON eylemleri → SaaS eylemleri. */
export const KOOPPLUS_LEGACY_CTA_ACTION_ALIASES: Record<string, KoopPlusCtaAction> = {
  purchaseWindows: 'purchase',
  startTrial: 'startDemo',
}

/** Eski JSON’da bulunabilen, SaaS’ta karşılığı olmayan eylemler (yok sayılır). */
export const KOOPPLUS_IGNORED_LEGACY_CTA_ACTIONS = ['purchaseMac', 'downloadTrial'] as const

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
    primaryCtaAction: 'purchase'
    secondaryCtaLabel: string
    secondaryCtaAction: 'startDemo'
    salesNotReadyLabel: string
    imageUrl: string | null
    imageAlt: string
  }
  /**
   * SaaS: tek plan kartı. `windows` anahtarı eski kayıtlı JSON ile uyum için korunur;
   * kart etiketleri olarak kullanılır (Windows/Mac ayrımı yoktur).
   */
  platforms: {
    heading: string
    trialSuffix: string
    windows: {
      title: string
      status: string
      badge: string
      purchaseCtaLabel: string
      purchaseCtaAction: 'purchase'
      trialCtaLabel: string
    }
  }
  trial: {
    eyebrow: string
    title: string
    intro: string
    highlights: KoopPlusTextItem[]
    /** Demo başlat CTA etiketi (eski adıyla downloadCtaLabel). */
    downloadCtaLabel: string
    downloadCtaAction: 'startDemo'
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
    primaryCtaAction: 'purchase'
    secondaryCtaLabel: string
    secondaryCtaAction: 'startDemo'
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
  Smartphone,
  Cloud,
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

/**
 * Eski masaüstü (Windows/Mac/indirme) kopyası — yayınlanmış builder JSON’unda kalabiliyor.
 * SaaS sayfasında bu ifadeler gösterilmez; alan varsayılana düşer.
 */
const LEGACY_DESKTOP_COPY_RE =
  /windows|macos|mac\s*os|\bmac\b|masaüstü|masaustu|\bindir|\bdownload\b|tek uygulama|tek merkezde|yakında sunulacak|kurulum dosyas|setup\.exe|bilgisayarınıza/i

export function isLegacyKoopPlusDesktopCopy(value: string | null | undefined): boolean {
  return typeof value === 'string' && LEGACY_DESKTOP_COPY_RE.test(value)
}

function saasSafeText(value: string, fallback: string): string {
  return isLegacyKoopPlusDesktopCopy(value) ? fallback : value
}

/** Yayınlanmış içerikteki masaüstü kalıntılarını SaaS varsayılanlarıyla değiştirir. */
export function sanitizeKoopPlusProductContentForSaas(content: KoopPlusProductContent): KoopPlusProductContent {
  const d = getDefaultKoopPlusProductContent()
  return {
    ...content,
    hero: {
      ...content.hero,
      title: saasSafeText(content.hero.title, d.hero.title),
      description: saasSafeText(content.hero.description, d.hero.description),
      primaryCtaLabel: saasSafeText(content.hero.primaryCtaLabel, d.hero.primaryCtaLabel),
      secondaryCtaLabel: saasSafeText(content.hero.secondaryCtaLabel, d.hero.secondaryCtaLabel),
      imageUrl: d.hero.imageUrl,
      imageAlt: saasSafeText(content.hero.imageAlt, d.hero.imageAlt),
    },
    platforms: {
      heading: saasSafeText(content.platforms.heading, d.platforms.heading),
      trialSuffix: saasSafeText(content.platforms.trialSuffix, d.platforms.trialSuffix),
      windows: {
        ...content.platforms.windows,
        title: saasSafeText(content.platforms.windows.title, d.platforms.windows.title),
        status: saasSafeText(content.platforms.windows.status, d.platforms.windows.status),
        badge: saasSafeText(content.platforms.windows.badge, d.platforms.windows.badge),
        purchaseCtaLabel: saasSafeText(
          content.platforms.windows.purchaseCtaLabel,
          d.platforms.windows.purchaseCtaLabel,
        ),
        trialCtaLabel: saasSafeText(content.platforms.windows.trialCtaLabel, d.platforms.windows.trialCtaLabel),
      },
    },
    trial: {
      ...content.trial,
      title: saasSafeText(content.trial.title, d.trial.title),
      intro: saasSafeText(content.trial.intro, d.trial.intro),
      downloadCtaLabel: saasSafeText(content.trial.downloadCtaLabel, d.trial.downloadCtaLabel),
      downloadHint: saasSafeText(content.trial.downloadHint, d.trial.downloadHint),
      trustLine: saasSafeText(content.trial.trustLine, d.trial.trustLine),
      highlights: content.trial.highlights.map((item, index) => {
        const base = d.trial.highlights[index] ?? item
        return {
          title: saasSafeText(item.title, base.title),
          description: saasSafeText(item.description, base.description),
        }
      }),
    },
    closing: {
      ...content.closing,
      heading: saasSafeText(content.closing.heading, d.closing.heading),
      description: saasSafeText(content.closing.description, d.closing.description),
      primaryCtaLabel: saasSafeText(content.closing.primaryCtaLabel, d.closing.primaryCtaLabel),
      secondaryCtaLabel: saasSafeText(content.closing.secondaryCtaLabel, d.closing.secondaryCtaLabel),
    },
  }
}

export function isKoopPlusCtaAction(value: unknown): value is KoopPlusCtaAction {
  return typeof value === 'string' && (KOOPPLUS_CTA_ACTIONS as readonly string[]).includes(value)
}

/** Yeni eylem veya bilinen eski takma ad (purchaseWindows / startTrial) → SaaS eylemi; aksi halde null. */
export function normalizeKoopPlusCtaAction(value: unknown): KoopPlusCtaAction | null {
  if (typeof value !== 'string') return null
  if (isKoopPlusCtaAction(value)) return value
  return KOOPPLUS_LEGACY_CTA_ACTION_ALIASES[value] ?? null
}

export function sanitizeKoopPlusCtaAction(value: unknown, fallback: KoopPlusCtaAction): KoopPlusCtaAction {
  return normalizeKoopPlusCtaAction(value) ?? fallback
}

export function isUnsafeKoopPlusActionInput(value: unknown): boolean {
  if (typeof value !== 'string') return true
  if (/javascript:|data:text|on\w+\s*=|<\s*script/i.test(value)) return true
  if ((KOOPPLUS_IGNORED_LEGACY_CTA_ACTIONS as readonly string[]).includes(value)) return false
  return normalizeKoopPlusCtaAction(value) == null
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
      primaryCtaAction: 'purchase',
      secondaryCtaLabel: KOOPPLUS_HERO.secondaryCta,
      secondaryCtaAction: 'startDemo',
      salesNotReadyLabel: 'Satışa hazırlanıyor',
      imageUrl: KOOPPLUS_HERO_IMAGE,
      imageAlt: 'KoopPlus web tabanlı kooperatif yönetim paneli',
    },
    platforms: {
      heading: 'KoopPlus’ı kullanmaya başlayın',
      trialSuffix: '7 gün ücretsiz demo',
      windows: {
        title: KOOPPLUS_PRICE_LABEL,
        status: 'Web tabanlı · kurulum yok',
        badge: 'SaaS',
        purchaseCtaLabel: 'Hemen Satın Al',
        purchaseCtaAction: 'purchase',
        trialCtaLabel: '7 Gün Ücretsiz Dene',
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
      downloadCtaAction: 'startDemo',
      trustLine: KOOPPLUS_TRIAL.trustLine,
      downloadHint: KOOPPLUS_TRIAL.downloadHint,
    },
    features: {
      heading: 'KoopPlus ile neler yönetirsiniz?',
      description: 'Kooperatifinizin tüm süreçleri, tarayıcıdan tek panelde.',
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
      description: 'KoopPlus’ı hemen satın alın veya 7 günlük ücretsiz demoyu tarayıcıdan başlatın.',
      primaryCtaLabel: 'Hemen Satın Al',
      primaryCtaAction: 'purchase',
      secondaryCtaLabel: '7 Gün Ücretsiz Dene',
      secondaryCtaAction: 'startDemo',
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

  const merged: KoopPlusProductContent = {
    hero: {
      kicker: str(hero.kicker, defaults.hero.kicker),
      identity: str(hero.identity, defaults.hero.identity),
      title: str(hero.title, defaults.hero.title),
      description: str(hero.description, defaults.hero.description),
      primaryCtaLabel: str(hero.primaryCtaLabel, defaults.hero.primaryCtaLabel),
      primaryCtaAction: 'purchase',
      secondaryCtaLabel: str(hero.secondaryCtaLabel, defaults.hero.secondaryCtaLabel),
      secondaryCtaAction: 'startDemo',
      salesNotReadyLabel: str(hero.salesNotReadyLabel, defaults.hero.salesNotReadyLabel),
      imageUrl: defaults.hero.imageUrl,
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
        purchaseCtaAction: 'purchase',
        trialCtaLabel: str(windows.trialCtaLabel, defaults.platforms.windows.trialCtaLabel),
      },
    },
    trial: {
      eyebrow: str(trial.eyebrow, defaults.trial.eyebrow),
      title: str(trial.title, defaults.trial.title),
      intro: str(trial.intro, defaults.trial.intro),
      highlights: mergeTextItems(trial.highlights, defaults.trial.highlights),
      downloadCtaLabel: str(trial.downloadCtaLabel, defaults.trial.downloadCtaLabel),
      downloadCtaAction: 'startDemo',
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
      primaryCtaAction: 'purchase',
      secondaryCtaLabel: str(closing.secondaryCtaLabel, defaults.closing.secondaryCtaLabel),
      secondaryCtaAction: 'startDemo',
    },
    gallery: {
      images:
        mergeGallery(gallery.images).length > 0
          ? mergeGallery(gallery.images)
          : defaults.hero.imageUrl
            ? [{ url: defaults.hero.imageUrl, alt: defaults.hero.imageAlt }]
            : [],
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

  return sanitizeKoopPlusProductContentForSaas(merged)
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
