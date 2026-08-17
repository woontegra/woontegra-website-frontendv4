export const MK_SAAS_CANONICAL_SLUG = 'muvekkil-kasa-defteri-web-tabanli'

const MK_SAAS_SLUGS = new Set([
  'muvekkil-kasa-saas',
  'muvekkil-kasa-defteri-saas',
  MK_SAAS_CANONICAL_SLUG,
])

export function resolveMkSaasBlocksSlug(slug?: string | null): string {
  if (!slug) return MK_SAAS_CANONICAL_SLUG
  return isMuvekkilKasaSaasProduct({ slug }) ? MK_SAAS_CANONICAL_SLUG : slug
}

export function isMkSaasBuilderPageKey(pageKey?: string | null): boolean {
  if (!pageKey) return false
  const key = pageKey.trim().toLowerCase()
  if (!key.startsWith('product-')) return false
  return isMuvekkilKasaSaasProduct({ slug: key.slice('product-'.length) })
}

export type MuvekkilKasaSaasProductRef = {
  slug?: string | null
  licenseAppCode?: string | null
  productType?: string | null
}

export function isMuvekkilKasaSaasProduct(product: MuvekkilKasaSaasProductRef | null | undefined): boolean {
  if (!product) return false
  const slug = product.slug?.trim().toLowerCase()
  if (slug && MK_SAAS_SLUGS.has(slug)) return true
  if (product.licenseAppCode?.trim() === 'MUVEKKIL_KASA_SAAS') return true
  return false
}

export const SAAS_LOGIN_REQUIRED_MESSAGE =
  'Müvekkil Kasa SaaS ürünü satın almak için müşteri hesabınızla giriş yapmanız gerekir.'
