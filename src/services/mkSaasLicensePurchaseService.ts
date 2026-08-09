import { publicApi } from '@/api/client'
import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import type { MkSaasLicensePurchaseView, MkSaasLicenseRenewalPreview } from '@/lib/mkSaasLicensePurchase'

export const mkSaasLicensePurchaseService = {
  async resolve(renewalToken: string): Promise<MkSaasLicensePurchaseView> {
    const res = await publicApi.post<ApiSuccess<MkSaasLicensePurchaseView>>(
      '/public/mk-saas/license-purchase/resolve',
      { renewalToken },
    )
    return unwrapApiData(res.data, 'mkSaasLicensePurchase.resolve')
  },

  async previewRenewal(input: {
    renewalToken: string
    renewalDays: number
  }): Promise<MkSaasLicenseRenewalPreview> {
    const res = await publicApi.post<ApiSuccess<MkSaasLicenseRenewalPreview>>(
      '/public/mk-saas/license-purchase/preview',
      input,
    )
    return unwrapApiData(res.data, 'mkSaasLicensePurchase.preview')
  },
}
