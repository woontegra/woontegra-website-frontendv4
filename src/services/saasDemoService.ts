import type { ApiSuccess } from '@/types/api'
import { publicApi, getErrorMessage } from '@/api/client'
import { unwrapApiData } from '@/types/api'

export type MkSaasDemoRequestBody = {
  fullName: string
  phone: string
  email: string
  barAssociation: string
  note?: string
}

export type MkSaasDemoRequestResponse = {
  membershipId: string
  demoRef: string
  loginUrl: string | null
  licenseEndDate: string
}

export const saasDemoService = {
  async requestMuvekkilKasaDemo(body: MkSaasDemoRequestBody): Promise<MkSaasDemoRequestResponse> {
    try {
      const res = await publicApi.post<ApiSuccess<MkSaasDemoRequestResponse>>(
        '/public/saas-demo-requests/muvekkil-kasa',
        body,
      )
      return unwrapApiData(res.data, 'saasDemo.muvekkilKasa')
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Demo talebi gönderilemedi'))
    }
  },
}
