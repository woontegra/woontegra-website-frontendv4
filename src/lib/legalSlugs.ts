import type { LegalDocType } from '@/types/legalDocuments'
import { LEGAL_TYPE_LABELS } from '@/types/legalDocuments'

/** V3 uyumlu public yasal slug'ları */
export type LegalPublicSlug =
  | 'kvkk-aydinlatma-metni'
  | 'gizlilik-politikasi'
  | 'cerez-politikasi'
  | 'acik-riza-metni'
  | 'kullanim-sartlari'
  | 'mesafeli-satis-sozlesmesi'
  | 'on-bilgilendirme-formu'
  | 'iade-iptal-kosullari'
  | 'elektronik-ileti-bilgilendirme'
  | 'pazarlama-acik-riza-metni'

export const LEGAL_PUBLIC_SLUGS: LegalPublicSlug[] = [
  'kvkk-aydinlatma-metni',
  'gizlilik-politikasi',
  'cerez-politikasi',
  'acik-riza-metni',
  'kullanim-sartlari',
  'mesafeli-satis-sozlesmesi',
  'on-bilgilendirme-formu',
  'iade-iptal-kosullari',
  'elektronik-ileti-bilgilendirme',
  'pazarlama-acik-riza-metni',
]

/** Backend enum → public slug (slug tanımlı olanlar) */
const TYPE_TO_SLUG: Partial<Record<LegalDocType, LegalPublicSlug>> = {
  KVKK_CLARIFICATION: 'kvkk-aydinlatma-metni',
  PRIVACY_POLICY: 'gizlilik-politikasi',
  EXPLICIT_CONSENT: 'acik-riza-metni',
  TERMS_OF_USE: 'kullanim-sartlari',
  DISTANCE_SALES: 'mesafeli-satis-sozlesmesi',
  PRE_INFORMATION: 'on-bilgilendirme-formu',
  COMMERCIAL_ELECTRONIC_MESSAGE: 'elektronik-ileti-bilgilendirme',
}

/** Alias type kodları (kullanıcı spec / eski referanslar) */
const ALIAS_TYPE_TO_SLUG: Record<string, LegalPublicSlug> = {
  COOKIE_POLICY: 'cerez-politikasi',
  RETURN_CANCELLATION_POLICY: 'iade-iptal-kosullari',
  DISTANCE_SALES_AGREEMENT: 'mesafeli-satis-sozlesmesi',
  PRE_INFORMATION_FORM: 'on-bilgilendirme-formu',
  ...TYPE_TO_SLUG,
}

const SLUG_TO_TYPE: Partial<Record<LegalPublicSlug, LegalDocType>> = {
  'kvkk-aydinlatma-metni': 'KVKK_CLARIFICATION',
  'gizlilik-politikasi': 'PRIVACY_POLICY',
  'acik-riza-metni': 'EXPLICIT_CONSENT',
  'kullanim-sartlari': 'TERMS_OF_USE',
  'mesafeli-satis-sozlesmesi': 'DISTANCE_SALES',
  'on-bilgilendirme-formu': 'PRE_INFORMATION',
  'elektronik-ileti-bilgilendirme': 'COMMERCIAL_ELECTRONIC_MESSAGE',
  'pazarlama-acik-riza-metni': 'EXPLICIT_CONSENT',
}

/** CMS-only slug'lar — backend LegalDocType yok */
export const LEGAL_CMS_ONLY_SLUGS = new Set<LegalPublicSlug>(['cerez-politikasi', 'iade-iptal-kosullari'])

const SLUG_TITLES: Record<LegalPublicSlug, string> = {
  'kvkk-aydinlatma-metni': 'KVKK Aydınlatma Metni',
  'gizlilik-politikasi': 'Gizlilik Politikası',
  'cerez-politikasi': 'Çerez Politikası',
  'acik-riza-metni': 'Açık Rıza Metni',
  'kullanim-sartlari': 'Kullanım Şartları',
  'mesafeli-satis-sozlesmesi': 'Mesafeli Satış Sözleşmesi',
  'on-bilgilendirme-formu': 'Ön Bilgilendirme Formu',
  'iade-iptal-kosullari': 'İade ve İptal Koşulları',
  'elektronik-ileti-bilgilendirme': 'Elektronik Ticari İleti Bilgilendirme Metni',
  'pazarlama-acik-riza-metni': 'Pazarlama Açık Rıza Metni',
}

export function isLegalPublicSlug(value: string): value is LegalPublicSlug {
  return (LEGAL_PUBLIC_SLUGS as string[]).includes(value)
}

export function legalTypeToSlug(type: string): LegalPublicSlug | null {
  const key = type.trim()
  if (!key) return null
  return ALIAS_TYPE_TO_SLUG[key] ?? null
}

export function legalSlugToType(slug: string): LegalDocType | null {
  if (!isLegalPublicSlug(slug)) return null
  if (LEGAL_CMS_ONLY_SLUGS.has(slug)) return null
  return SLUG_TO_TYPE[slug] ?? null
}

export function legalTypeToTitle(type: string): string {
  const slug = legalTypeToSlug(type)
  if (slug) return SLUG_TITLES[slug]
  if (type in LEGAL_TYPE_LABELS) return LEGAL_TYPE_LABELS[type as LegalDocType]
  return type
}

export function legalSlugToTitle(slug: string): string {
  if (isLegalPublicSlug(slug)) return SLUG_TITLES[slug]
  return slug
}

/** Public href: her zaman `/slug` formatında */
export function legalSlugToHref(slug: LegalPublicSlug | string): string {
  const normalized = slug.replace(/^\/+/, '')
  if (isLegalPublicSlug(normalized)) return `/${normalized}`
  return `/${normalized}`
}

/** Enum veya `/yasal-belge/TYPE` path → public slug href */
export function normalizeLegalPublicHref(url: string): string {
  const raw = url?.trim() ?? ''
  if (!raw || raw.startsWith('http') || raw.startsWith('mailto:') || raw.startsWith('tel:')) {
    return raw
  }

  const pathOnly = raw.split('?')[0]?.split('#')[0] ?? raw

  if (pathOnly.startsWith('/yasal-belge/')) {
    const type = decodeURIComponent(pathOnly.slice('/yasal-belge/'.length).replace(/\/+$/, ''))
    const slug = legalTypeToSlug(type)
    if (slug) return legalSlugToHref(slug)
  }

  if (pathOnly.startsWith('/yasal/')) {
    const slug = pathOnly.slice('/yasal/'.length).replace(/\/+$/, '')
    if (isLegalPublicSlug(slug)) return legalSlugToHref(slug)
  }

  const bare = pathOnly.replace(/^\/+/, '')
  if (isLegalPublicSlug(bare)) return legalSlugToHref(bare)

  if (/^[A-Z][A-Z0-9_]+$/.test(bare)) {
    const slug = legalTypeToSlug(bare)
    if (slug) return legalSlugToHref(slug)
  }

  return raw
}

/** Checkout / API için type → href */
export function legalTypeToPublicHref(type: LegalDocType | string): string {
  const slug = legalTypeToSlug(type)
  return slug ? legalSlugToHref(slug) : `/yasal-belge/${type}`
}
