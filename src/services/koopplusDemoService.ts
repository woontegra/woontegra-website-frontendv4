import axios from 'axios'
import { publicApi } from '@/api/client'

/**
 * Website backend proxy. publicApi baseURL (VITE_API_URL, ör. `/api`) ile birleşir →
 * POST /api/koopplus/demo-request. Backend bu isteği KoopPlus SaaS’a iletir; form verisi
 * website tarafında saklanmaz.
 */
export const KOOPPLUS_DEMO_REQUEST_PATH = '/koopplus/demo-request'

export type KoopPlusDemoRequestInput = {
  fullName: string
  email: string
  phone: string
  cooperativeName: string
  city: string
  district: string
  kvkkConsent: boolean
  /** ISO 8601 */
  kvkkConsentAt: string
  kvkkConsentVersion: string
  turnstileToken: string
}

export type KoopPlusDemoRequestResult = {
  ok: true
  message?: string
}

export type KoopPlusDemoErrorCode =
  | 'TURNSTILE_FAILED'
  | 'DEMO_ALREADY_USED'
  | 'EMAIL_ALREADY_REGISTERED'
  | 'INVALID_INPUT'
  | 'RATE_LIMITED'
  | 'UNAVAILABLE'
  | 'UNKNOWN'

export class KoopPlusDemoError extends Error {
  readonly code: KoopPlusDemoErrorCode
  readonly status?: number

  constructor(message: string, code: KoopPlusDemoErrorCode, status?: number) {
    super(message)
    this.name = 'KoopPlusDemoError'
    this.code = code
    this.status = status
  }
}

export const KOOPPLUS_DEMO_ERROR_MESSAGES: Record<KoopPlusDemoErrorCode, string> = {
  TURNSTILE_FAILED: 'Güvenlik doğrulaması başarısız oldu. Lütfen doğrulamayı yenileyip tekrar deneyin.',
  DEMO_ALREADY_USED:
    'Bu e-posta adresi veya telefon numarası ile daha önce demo oluşturulmuş. Giriş yapmayı deneyin veya bizimle iletişime geçin.',
  EMAIL_ALREADY_REGISTERED: 'Bu e-posta adresi ile kayıtlı bir hesap zaten var. Lütfen giriş yapın.',
  INVALID_INPUT: 'Girdiğiniz bilgileri kontrol edip tekrar deneyin.',
  RATE_LIMITED: 'Çok fazla deneme yaptınız. Lütfen birkaç dakika sonra tekrar deneyin.',
  UNAVAILABLE: 'Demo servisine şu an ulaşılamıyor. Lütfen biraz sonra tekrar deneyin.',
  UNKNOWN: 'Demo talebi gönderilemedi. Lütfen tekrar deneyin.',
}

type ApiErrorPayload = { code?: unknown; error?: unknown; message?: unknown }

function resolveErrorCode(status: number | undefined, payload: ApiErrorPayload | undefined): KoopPlusDemoErrorCode {
  const rawCode = typeof payload?.code === 'string' ? payload.code.trim().toUpperCase() : ''
  switch (rawCode) {
    case 'TURNSTILE_FAILED':
    case 'TURNSTILE_INVALID':
    case 'CAPTCHA_FAILED':
      return 'TURNSTILE_FAILED'
    case 'DEMO_ALREADY_USED':
    case 'DEMO_EXISTS':
      return 'DEMO_ALREADY_USED'
    case 'EMAIL_ALREADY_REGISTERED':
    case 'EMAIL_EXISTS':
      return 'EMAIL_ALREADY_REGISTERED'
    case 'VALIDATION_ERROR':
    case 'INVALID_INPUT':
      return 'INVALID_INPUT'
    case 'RATE_LIMITED':
    case 'TOO_MANY_REQUESTS':
      return 'RATE_LIMITED'
    default:
      break
  }
  const text = [payload?.message, payload?.error].find((v): v is string => typeof v === 'string')?.toLowerCase() ?? ''
  if (text.includes('turnstile') || text.includes('captcha')) return 'TURNSTILE_FAILED'
  if (status === 429) return 'RATE_LIMITED'
  if (status === 409) return 'DEMO_ALREADY_USED'
  if (status === 400 || status === 422) return 'INVALID_INPUT'
  if (status != null && status >= 500) return 'UNAVAILABLE'
  return 'UNKNOWN'
}

/** Hataları UI’da gösterilecek Türkçe mesaja çevirir. */
export function mapKoopPlusDemoError(error: unknown): KoopPlusDemoError {
  if (error instanceof KoopPlusDemoError) return error
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    if (!error.response) {
      return new KoopPlusDemoError(KOOPPLUS_DEMO_ERROR_MESSAGES.UNAVAILABLE, 'UNAVAILABLE')
    }
    const payload = error.response.data as ApiErrorPayload | undefined
    const code = resolveErrorCode(status, payload)
    // Backend’in müşteriye dönük kısa Türkçe mesajı varsa (400 doğrulama gibi) onu koru.
    const apiMessage = typeof payload?.message === 'string' ? payload.message.trim() : ''
    const keepApiMessage = code === 'INVALID_INPUT' && apiMessage.length > 0 && apiMessage.length <= 200
    return new KoopPlusDemoError(keepApiMessage ? apiMessage : KOOPPLUS_DEMO_ERROR_MESSAGES[code], code, status)
  }
  return new KoopPlusDemoError(KOOPPLUS_DEMO_ERROR_MESSAGES.UNKNOWN, 'UNKNOWN')
}

/**
 * Demo talebini website backend proxy’ye gönderir.
 * Form verisi tarayıcıda veya veritabanında saklanmaz; yalnızca bu POST yapılır.
 */
export async function requestKoopPlusDemo(input: KoopPlusDemoRequestInput): Promise<KoopPlusDemoRequestResult> {
  try {
    const res = await publicApi.post<{ message?: string }>(KOOPPLUS_DEMO_REQUEST_PATH, input, {
      timeout: 25_000,
    })
    const message = typeof res.data?.message === 'string' ? res.data.message : undefined
    return { ok: true, message }
  } catch (error) {
    throw mapKoopPlusDemoError(error)
  }
}
