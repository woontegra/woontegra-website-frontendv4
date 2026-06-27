import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useCustomerSession } from '@/hooks/useCustomerSession'

export function CustomerGuard() {
  const { authed } = useCustomerSession()
  const location = useLocation()

  if (!authed) {
    const returnTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/giris?return=${returnTo}`} replace />
  }

  return <Outlet />
}
