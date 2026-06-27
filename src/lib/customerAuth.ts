export type CustomerProfile = { id: string; name: string; email: string; phone?: string | null }

const TOKEN_KEY = 'woontegra_customer_token'
const PROFILE_KEY = 'woontegra_customer_profile'
const REMEMBER_KEY = 'woontegra_customer_remember'

function storage(persistent: boolean): Storage {
  return persistent ? localStorage : sessionStorage
}

function readRemember(): boolean {
  try {
    return localStorage.getItem(REMEMBER_KEY) === '1'
  } catch {
    return true
  }
}

export function getCustomerToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
}

export function getCustomerProfile(): CustomerProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY) ?? sessionStorage.getItem(PROFILE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CustomerProfile
  } catch {
    return null
  }
}

export function saveCustomerSession(token: string, profile: CustomerProfile, remember = true) {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(PROFILE_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(PROFILE_KEY)

  const store = storage(remember)
  store.setItem(TOKEN_KEY, token)
  store.setItem(PROFILE_KEY, JSON.stringify(profile))
  try {
    localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0')
  } catch {
    /* */
  }
  window.dispatchEvent(new Event('woontegra-customer-auth'))
}

export function clearCustomerSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(PROFILE_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(PROFILE_KEY)
  window.dispatchEvent(new Event('woontegra-customer-auth'))
}

export function isJwtExpired(token: string, skewSeconds = 30): boolean {
  try {
    const part = token.split('.')[1]
    if (!part) return true
    const payload = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number }
    if (!payload.exp) return false
    return Date.now() >= payload.exp * 1000 - skewSeconds * 1000
  } catch {
    return true
  }
}

export function isCustomerToken(token: string): boolean {
  try {
    const part = token.split('.')[1]
    if (!part) return false
    const payload = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/'))) as { aud?: string }
    return payload.aud === 'customer'
  } catch {
    return false
  }
}

export function isCustomerAuthenticated(): boolean {
  const token = getCustomerToken()
  return !!(token && !isJwtExpired(token) && isCustomerToken(token))
}

export function customerRememberPreference(): boolean {
  return readRemember()
}

export function customerAuthHeaders(): Record<string, string> | undefined {
  const token = getCustomerToken()
  return token ? { Authorization: `Bearer ${token}` } : undefined
}
