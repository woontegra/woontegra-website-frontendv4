import { safeInternalReturnPath } from '@/lib/safeInternalReturnPath'

export const INVALID_CUSTOMER_SESSION_MESSAGE = 'Oturumunuz geçersiz. Lütfen yeniden giriş yapın.'
export const INVALID_CUSTOMER_SESSION_CODE = 'CUSTOMER_SESSION_INVALID'
export const GENERIC_CUSTOMER_ERROR_MESSAGE = 'İşleminiz tamamlanamadı. Lütfen tekrar deneyin.'

const TECHNICAL_MESSAGE =
  /prisma|foreign key|_fkey|constraint|invocation|P20\d{2}|syntax error|node_modules|DATABASE_URL|Invalid `prisma|\n\s+at\s+|sqlstate|postgres|violates|column "|relation "/i

export function isTechnicalCustomerMessage(message: string): boolean {
  return TECHNICAL_MESSAGE.test(message)
}

export function isInvalidCustomerSessionPayload(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false
  const body = data as { code?: unknown; message?: unknown }
  if (body.code === INVALID_CUSTOMER_SESSION_CODE) return true
  const message = typeof body.message === 'string' ? body.message : ''
  return (
    message === INVALID_CUSTOMER_SESSION_MESSAGE ||
    /customerId_fkey|Order_customerId_fkey/i.test(message)
  )
}

export function customerFacingMessage(message: string, fallback: string): string {
  if (isInvalidCustomerSessionPayload({ message })) return INVALID_CUSTOMER_SESSION_MESSAGE
  if (isTechnicalCustomerMessage(message)) {
    return fallback === 'İşlem başarısız' ? GENERIC_CUSTOMER_ERROR_MESSAGE : fallback
  }
  return message.trim() || fallback
}

export function invalidCustomerSessionLoginPath(currentPath: string): string | null {
  const pathOnly = currentPath.split('?')[0] || '/'
  if (
    pathOnly.startsWith('/giris') ||
    pathOnly.startsWith('/kayit') ||
    pathOnly.startsWith('/sifre') ||
    pathOnly.startsWith('/admin')
  ) {
    return null
  }
  const params = new URLSearchParams()
  params.set('return', safeInternalReturnPath(currentPath, '/hesabim'))
  params.set('oturum', 'gecersiz')
  return `/giris?${params.toString()}`
}
