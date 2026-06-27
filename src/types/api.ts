export type ApiSuccess<T> = {
  success: boolean
  data: T
  message?: string
}

export function unwrapApiData<T>(payload: unknown, label: string): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiSuccess<T>).data
  }
  if (payload !== undefined && payload !== null) return payload as T
  throw new Error(`${label}: geçersiz API yanıtı`)
}
