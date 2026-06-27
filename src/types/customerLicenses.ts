export type CustomerLicenseListItem = {
  id: string | null
  licenseKeyMasked: string | null
  productName: string
  programName: string | null
  appCode: string | null
  orderNo: string
  status: string
  expiresAt: string | null
  maxDevices: number | null
  createdAt: string
  source: 'central' | 'local'
}
