export type CampaignType = 'announcement' | 'banner' | 'product_discount' | 'coupon'
export type DiscountType = 'percent' | 'fixed_amount' | 'fixed_price'
export type TargetType = 'all' | 'products' | 'categories' | 'product_types'
export type ProductTargetType = 'DOWNLOAD' | 'SAAS' | 'SERVICE' | 'FREE_DOWNLOAD'
export type CampaignScheduleStatus = 'active' | 'inactive' | 'scheduled' | 'expired'

export type Campaign = {
  id: string
  slug: string
  name: string
  type: CampaignType
  active: boolean
  priority: number
  shortTitle?: string
  description?: string
  badge?: string
  ctaText?: string
  ctaLink?: string
  discountType?: DiscountType
  discountValue?: number
  minCartTotal?: number | null
  maxDiscountAmount?: number | null
  freeProductEnabled?: boolean
  stackPriority?: 'highest' | 'lowest'
  targetType?: TargetType
  targetProductIds?: string[]
  targetCategoryIds?: string[]
  targetProductTypes?: ProductTargetType[]
  excludeProductIds?: string[]
  desktopImage?: string
  mobileImage?: string
  backgroundColor?: string
  gradient?: string
  textColor?: string
  overlay?: string
  startAt?: string | null
  endAt?: string | null
  couponCode?: string
  couponUsageLimit?: number | null
  couponUsagePerCustomer?: number | null
  couponFirstPurchaseOnly?: boolean
  couponProductScopeOnly?: boolean
  adminNote?: string
  showOnPublic?: boolean
  createdAt?: string
  updatedAt?: string
  scheduleStatus?: CampaignScheduleStatus
  isLive?: boolean
}

export type PublicCampaignBrief = {
  id: string
  slug: string
  name: string
  type: CampaignType
  shortTitle?: string
  description?: string
  badge?: string
  ctaText?: string
  ctaLink?: string
  desktopImage?: string
  mobileImage?: string
  backgroundColor?: string
  gradient?: string
  textColor?: string
  overlay?: string
  endAt?: string | null
}

export type PublicProductCampaignInfo = {
  id: string
  name: string
  badge: string | null
  endsAt: string | null
  discountAmount: number
}

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  announcement: 'Duyuru barı',
  banner: 'Banner kampanyası',
  product_discount: 'Ürün indirimi',
  coupon: 'Kupon / indirim kodu',
}

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  percent: 'Yüzde indirim',
  fixed_amount: 'Sabit tutar indirimi',
  fixed_price: 'Sabit kampanya fiyatı',
}

export const TARGET_TYPE_LABELS: Record<TargetType, string> = {
  all: 'Tüm ürünler',
  products: 'Belirli ürünler',
  categories: 'Belirli kategoriler',
  product_types: 'Belirli ürün tipleri',
}

export const PRODUCT_TARGET_LABELS: Record<ProductTargetType, string> = {
  DOWNLOAD: 'Lisanslı masaüstü',
  SAAS: 'SaaS',
  FREE_DOWNLOAD: 'Ücretsiz araç',
  SERVICE: 'Hizmet',
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const parsed = Number.parseFloat(String(value ?? '').replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : fallback
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number.parseFloat(String(value).replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

function toString(value: unknown, fallback = ''): string {
  return value == null ? fallback : String(value)
}

function toBool(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

export function normalizeCampaign(raw: unknown): Campaign | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const id = toString(row.id)
  const slug = toString(row.slug)
  const name = toString(row.name)
  const type = row.type
  if (!id || !slug || !name) return null
  if (type !== 'announcement' && type !== 'banner' && type !== 'product_discount' && type !== 'coupon') return null

  return {
    id,
    slug,
    name,
    type,
    active: toBool(row.active, true),
    priority: toNumber(row.priority),
    shortTitle: row.shortTitle != null ? toString(row.shortTitle) : undefined,
    description: row.description != null ? toString(row.description) : undefined,
    badge: row.badge != null ? toString(row.badge) : undefined,
    ctaText: row.ctaText != null ? toString(row.ctaText) : undefined,
    ctaLink: row.ctaLink != null ? toString(row.ctaLink) : undefined,
    discountType:
      row.discountType === 'percent' || row.discountType === 'fixed_amount' || row.discountType === 'fixed_price'
        ? row.discountType
        : undefined,
    discountValue: row.discountValue != null ? toNumber(row.discountValue) : undefined,
    minCartTotal: toNullableNumber(row.minCartTotal),
    maxDiscountAmount: toNullableNumber(row.maxDiscountAmount),
    freeProductEnabled: row.freeProductEnabled === true,
    stackPriority: row.stackPriority === 'lowest' ? 'lowest' : 'highest',
    targetType:
      row.targetType === 'products' ||
      row.targetType === 'categories' ||
      row.targetType === 'product_types' ||
      row.targetType === 'all'
        ? row.targetType
        : 'all',
    targetProductIds: Array.isArray(row.targetProductIds)
      ? row.targetProductIds.map((x) => toString(x)).filter(Boolean)
      : [],
    targetCategoryIds: Array.isArray(row.targetCategoryIds)
      ? row.targetCategoryIds.map((x) => toString(x)).filter(Boolean)
      : [],
    targetProductTypes: Array.isArray(row.targetProductTypes)
      ? (row.targetProductTypes.filter(
          (x) => x === 'DOWNLOAD' || x === 'SAAS' || x === 'SERVICE' || x === 'FREE_DOWNLOAD',
        ) as ProductTargetType[])
      : [],
    excludeProductIds: Array.isArray(row.excludeProductIds)
      ? row.excludeProductIds.map((x) => toString(x)).filter(Boolean)
      : [],
    desktopImage: row.desktopImage != null ? toString(row.desktopImage) : undefined,
    mobileImage: row.mobileImage != null ? toString(row.mobileImage) : undefined,
    backgroundColor: row.backgroundColor != null ? toString(row.backgroundColor) : undefined,
    gradient: row.gradient != null ? toString(row.gradient) : undefined,
    textColor: row.textColor != null ? toString(row.textColor) : undefined,
    overlay: row.overlay != null ? toString(row.overlay) : undefined,
    startAt: row.startAt != null ? toString(row.startAt) : null,
    endAt: row.endAt != null ? toString(row.endAt) : null,
    couponCode: row.couponCode != null ? toString(row.couponCode).toUpperCase() : undefined,
    couponUsageLimit: toNullableNumber(row.couponUsageLimit),
    couponUsagePerCustomer: toNullableNumber(row.couponUsagePerCustomer),
    couponFirstPurchaseOnly: row.couponFirstPurchaseOnly === true,
    couponProductScopeOnly: row.couponProductScopeOnly === true,
    adminNote: row.adminNote != null ? toString(row.adminNote) : undefined,
    showOnPublic: row.showOnPublic !== false,
    createdAt: row.createdAt != null ? toString(row.createdAt) : undefined,
    updatedAt: row.updatedAt != null ? toString(row.updatedAt) : undefined,
    scheduleStatus:
      row.scheduleStatus === 'active' ||
      row.scheduleStatus === 'inactive' ||
      row.scheduleStatus === 'scheduled' ||
      row.scheduleStatus === 'expired'
        ? row.scheduleStatus
        : undefined,
    isLive: row.isLive === true,
  }
}

export function normalizeCampaignList(raw: unknown): Campaign[] {
  if (!Array.isArray(raw)) return []
  return raw.map(normalizeCampaign).filter((x): x is Campaign => x != null)
}

export function normalizePublicCampaignBrief(raw: unknown): PublicCampaignBrief | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const id = toString(row.id)
  const slug = toString(row.slug)
  const name = toString(row.name)
  const type = row.type
  if (!id || !slug || !name) return null
  if (type !== 'announcement' && type !== 'banner' && type !== 'product_discount' && type !== 'coupon') return null
  return {
    id,
    slug,
    name,
    type,
    shortTitle: row.shortTitle != null ? toString(row.shortTitle) : undefined,
    description: row.description != null ? toString(row.description) : undefined,
    badge: row.badge != null ? toString(row.badge) : undefined,
    ctaText: row.ctaText != null ? toString(row.ctaText) : undefined,
    ctaLink: row.ctaLink != null ? toString(row.ctaLink) : undefined,
    desktopImage: row.desktopImage != null ? toString(row.desktopImage) : undefined,
    mobileImage: row.mobileImage != null ? toString(row.mobileImage) : undefined,
    backgroundColor: row.backgroundColor != null ? toString(row.backgroundColor) : undefined,
    gradient: row.gradient != null ? toString(row.gradient) : undefined,
    textColor: row.textColor != null ? toString(row.textColor) : undefined,
    overlay: row.overlay != null ? toString(row.overlay) : undefined,
    endAt: row.endAt != null ? toString(row.endAt) : null,
  }
}

export function slugifyCampaignName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9ğüşıöç\s-]/gi, '')
    .replace(/[ğ]/g, 'g')
    .replace(/[ü]/g, 'u')
    .replace(/[ş]/g, 's')
    .replace(/[ı]/g, 'i')
    .replace(/[ö]/g, 'o')
    .replace(/[ç]/g, 'c')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function formatCampaignDate(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function scheduleStatusLabel(status: CampaignScheduleStatus | undefined, active: boolean): string {
  if (status === 'scheduled') return 'Planlandı'
  if (status === 'expired') return 'Süresi doldu'
  if (!active || status === 'inactive') return 'Pasif'
  return 'Aktif'
}
