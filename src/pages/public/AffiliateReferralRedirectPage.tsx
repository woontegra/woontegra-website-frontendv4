import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

/**
 * Kısa tanıtım yolu: /r/:code → aynı kökteki /api/r/:code (Vite proxy / canlı rewrite).
 * Çerez frontend kökeninde set edilir.
 */
export function AffiliateReferralRedirectPage() {
  const { code } = useParams()

  useEffect(() => {
    const safe = (code ?? '').trim()
    if (!safe) {
      window.location.replace('/')
      return
    }
    window.location.replace(`/api/r/${encodeURIComponent(safe)}`)
  }, [code])

  return (
    <div className="mx-auto flex min-h-[40vh] max-w-md items-center justify-center px-4 text-center text-sm text-slate-600">
      Yönlendiriliyor…
    </div>
  )
}
