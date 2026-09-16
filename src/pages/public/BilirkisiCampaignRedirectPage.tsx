import { Navigate, useParams } from 'react-router-dom'
import { BILIRKISI_HESAP_CHECKOUT_PATH } from '@/data/canonicalSoftwareProducts'

/**
 * Baro short link: /k/:code → Bilirkişi Hesap checkout with ?c=
 * Does not touch production bilirkisihesap.com redirects.
 */
export function BilirkisiCampaignRedirectPage() {
  const { code } = useParams<{ code: string }>()
  const normalized = String(code || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')

  if (!normalized) {
    return <Navigate to={BILIRKISI_HESAP_CHECKOUT_PATH} replace />
  }

  return <Navigate to={`${BILIRKISI_HESAP_CHECKOUT_PATH}?c=${encodeURIComponent(normalized)}`} replace />
}

export default BilirkisiCampaignRedirectPage
