import type { ApiSuccess } from '@/types/api'
import type { BankTransferDisplay, PaytrStartResponse } from '@/types/payment'
import { publicApi, getErrorMessage } from '@/api/client'
import { unwrapApiData } from '@/types/api'

export const paymentsService = {
  async getBankTransferDisplay(): Promise<BankTransferDisplay> {
    const res = await publicApi.get<ApiSuccess<BankTransferDisplay>>('/payments/bank-transfer-display')
    return unwrapApiData(res.data, 'payments.bankTransferDisplay')
  },

  async startPaytr(orderNo: string): Promise<string> {
    const res = await publicApi.post<ApiSuccess<PaytrStartResponse>>('/payments/paytr/start', { orderNo })
    const data = unwrapApiData<PaytrStartResponse>(res.data, 'payments.paytrStart')
    if (!data.iframe_token?.trim()) {
      throw new Error(getErrorMessage(new Error('PayTR token alınamadı')))
    }
    return data.iframe_token
  },
}
