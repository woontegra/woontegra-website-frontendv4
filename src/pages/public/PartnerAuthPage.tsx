import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { partnerPortalService } from '@/services/partnerPortalService'

const INVALID_LINK_MESSAGE = 'Giriş bağlantısı geçersiz veya süresi dolmuş'

/**
 * Yönetici magic link ara rotası — normal kullanıcı girişi değil.
 * ?token=... tüketilir → HttpOnly oturum çerezi → /is-ortagi
 */
export function PartnerAuthPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState('Giriş doğrulanıyor…')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const token = params.get('token')?.trim() || ''
    if (!token) {
      setFailed(true)
      setMessage(INVALID_LINK_MESSAGE)
      return
    }
    let cancelled = false
    void partnerPortalService
      .consumeOnce(token)
      .then(() => {
        if (cancelled) return
        navigate('/is-ortagi', { replace: true })
      })
      .catch(() => {
        if (cancelled) return
        setFailed(true)
        setMessage(INVALID_LINK_MESSAGE)
      })
    return () => {
      cancelled = true
    }
  }, [params, navigate])

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white px-4 py-10 text-center sm:px-6">
      <h1 className="text-[15px] font-medium text-slate-800">İş Ortağı Girişi</h1>
      <p className="mt-2 text-[12px] font-normal leading-relaxed text-slate-600">{message}</p>
      {failed ? (
        <p className="mt-3 text-[12px] font-normal text-slate-500">
          Yeni giriş bağlantısı için platform yöneticinizle iletişime geçin.
        </p>
      ) : (
        <p className="mt-3 text-[12px] font-normal text-slate-500">
          Bu sayfaya erişim için platform yöneticisinden size özel davet bağlantısı almanız gerekir.
        </p>
      )}
      <Link
        to="/"
        className="mt-5 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-normal text-slate-600 hover:bg-slate-50"
      >
        Ana sayfaya dön
      </Link>
    </div>
  )
}
