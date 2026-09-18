/**
 * Canonical BH module SEO slugs for Woontegra public URLs.
 * Keep in sync with `src/builder/types/bhModule.ts` → `BH_CODE_TO_SEO_SLUG` values.
 * Alias/short codes (e.g. fazla-mesai) must NOT appear here or in sitemap.
 */
export const BH_MODULES_INDEX_PATH = '/yazilimlar/bilirkisi-hesap/moduller'

export const BH_MODULE_SEO_SLUGS = Object.freeze([
  'kidem-tazminati-nasil-hesaplanir',
  'ihbar-tazminati-nasil-hesaplanir',
  'fazla-mesai-nasil-hesaplanir',
  'yillik-izin-ucreti-nasil-hesaplanir',
  'ubgt-ucreti-nasil-hesaplanir',
  'hafta-tatili-ucreti-nasil-hesaplanir',
  'ucret-alacagi-nasil-hesaplanir',
  'bakiye-ucret-alacagi-nasil-hesaplanir',
  'kotu-niyet-tazminati-nasil-hesaplanir',
  'ise-baslatmama-tazminati-nasil-hesaplanir',
  'bosta-gecen-sure-ucreti-nasil-hesaplanir',
  'ayrimcilik-tazminati-nasil-hesaplanir',
  'prim-alacagi-nasil-hesaplanir',
  'haksiz-fesih-tazminati-nasil-hesaplanir',
])

export function bhModuleDetailPath(slug) {
  return `${BH_MODULES_INDEX_PATH}/${slug}`
}

export function isCanonicalBhModuleSeoSlug(slug) {
  return BH_MODULE_SEO_SLUGS.includes(String(slug || '').trim())
}
