import { BILIRKISI_HESAP_CHECKOUT_PATH } from '@/data/canonicalSoftwareProducts'
import { safeInternalReturnPath } from '@/lib/safeInternalReturnPath'

/**
 * Login/register dönüş adresi. Yalnız kampanya kodu ve paket seçimi taşınır.
 * İndirim oranı, fiyat ve toplam güvenilir veri değildir; backend kampanya kodunu yeniden doğrular.
 */
export function bilirkisiCheckoutAuthReturnPath(search: string): string {
  const raw = search.startsWith('?') ? search.slice(1) : search
  const params = new URLSearchParams(raw)
  const kept = new URLSearchParams()
  const code = (params.get('c') || params.get('campaign') || '').trim()
  if (code) kept.set('c', code)
  const plan = normalizeCheckoutPlan(params.get('plan') || params.get('productType') || params.get('product_type') || '')
  if (plan) kept.set('plan', plan)
  const renew = (params.get('renew') || '').trim()
  if (renew) kept.set('renew', renew)
  const qs = kept.toString()
  return safeInternalReturnPath(
    `${BILIRKISI_HESAP_CHECKOUT_PATH}${qs ? `?${qs}` : ''}`,
    BILIRKISI_HESAP_CHECKOUT_PATH,
  )
}

export function customerAuthHref(page: 'giris' | 'kayit', returnPath: string): string {
  const safe = safeInternalReturnPath(returnPath, BILIRKISI_HESAP_CHECKOUT_PATH)
  return `/${page}?return=${encodeURIComponent(safe)}`
}

function normalizeCheckoutPlan(raw: string): 'monthly' | 'annual' | '' {
  const value = raw.trim().toLowerCase()
  if (value === 'monthly' || value === 'aylik' || value === 'aylık') return 'monthly'
  if (value === 'annual' || value === 'yillik' || value === 'yıllık') return 'annual'
  return ''
}
