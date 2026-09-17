import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { BILIRKISI_HESAP_CHECKOUT_PATH } from '@/data/canonicalSoftwareProducts'
import { bilirkisiHesapService } from '@/services/bilirkisiHesapService'

type CheckoutPlan = 'monthly' | 'annual'

function normalizeCode(raw: string | undefined): string {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
}

/**
 * When a campaign is eligible for exactly one package type, carry that plan into checkout.
 * Multi-package (or unknown) campaigns keep legacy ?c= only → checkout default annual.
 */
function soleEligiblePlan(eligible: unknown): CheckoutPlan | null {
  if (!Array.isArray(eligible)) return null
  const plans = [
    ...new Set(
      eligible
        .map((v) => String(v || '').trim().toLowerCase())
        .filter((v): v is CheckoutPlan => v === 'monthly' || v === 'annual'),
    ),
  ]
  return plans.length === 1 ? plans[0] : null
}

function checkoutHref(code: string, plan: CheckoutPlan | null): string {
  const qs = new URLSearchParams()
  qs.set('c', code)
  if (plan) qs.set('plan', plan)
  return `${BILIRKISI_HESAP_CHECKOUT_PATH}?${qs.toString()}`
}

/**
 * Baro / campaign short link: /k/:code → Bilirkişi Hesap checkout with ?c=
 * Single-eligible campaigns also get ?plan=monthly|annual.
 */
export function BilirkisiCampaignRedirectPage() {
  const { code: rawCode } = useParams<{ code: string }>()
  const normalized = normalizeCode(rawCode)
  const [target, setTarget] = useState<string | null>(null)

  useEffect(() => {
    if (!normalized) {
      setTarget(BILIRKISI_HESAP_CHECKOUT_PATH)
      return
    }

    let cancelled = false
    ;(async () => {
      let plan: CheckoutPlan | null = null
      try {
        const res = await bilirkisiHesapService.getCampaign(normalized)
        const payload = (res as { data?: { eligibleProductTypes?: unknown } })?.data
        const eligible =
          payload?.eligibleProductTypes ??
          (res as { eligibleProductTypes?: unknown })?.eligibleProductTypes
        plan = soleEligiblePlan(eligible)
      } catch {
        // Capacity/404/network: keep legacy ?c= only (do not invent a plan).
        plan = null
      }
      if (!cancelled) setTarget(checkoutHref(normalized, plan))
    })()

    return () => {
      cancelled = true
    }
  }, [normalized])

  if (!normalized) {
    return <Navigate to={BILIRKISI_HESAP_CHECKOUT_PATH} replace />
  }

  if (!target) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-600">
        Yönlendiriliyor…
      </div>
    )
  }

  return <Navigate to={target} replace />
}

export default BilirkisiCampaignRedirectPage
