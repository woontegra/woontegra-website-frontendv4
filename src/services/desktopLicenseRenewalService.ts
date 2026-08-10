import { publicApi } from '@/api/client'
import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import type { DesktopLicenseRenewalPreview, DesktopLicenseRenewalView } from '@/lib/desktopLicenseRenewal'

export const desktopLicenseRenewalService = {
  async resolve(renewalToken: string): Promise<DesktopLicenseRenewalView> {
    const res = await publicApi.post<ApiSuccess<DesktopLicenseRenewalView>>(
      '/public/desktop-license/renewal/resolve',
      { renewalToken },
    )
    return unwrapApiData(res.data, 'desktopLicenseRenewal.resolve')
  },

  async previewRenewal(input: {
    renewalToken: string
    renewalDays: number
  }): Promise<DesktopLicenseRenewalPreview> {
    const res = await publicApi.post<ApiSuccess<DesktopLicenseRenewalPreview>>(
      '/public/desktop-license/renewal/preview',
      input,
    )
    return unwrapApiData(res.data, 'desktopLicenseRenewal.preview')
  },
}
