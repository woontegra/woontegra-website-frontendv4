export type CustomerSaasMembershipRow = {
  id: string
  productCode: string
  productName: string
  tenantSlug: string
  licenseKey: string
  status: string
  licenseStartDate: string
  licenseEndDate: string
  kalanGun: number | null
  ownerEmail: string
}

export type SaasRenewQuote = {
  membershipId: string
  renewalPeriod: string
  renewalDays: number
  renewalLabel: string
  productName: string
  lineLabel: string
  total: number
  currency: string
}

export type SaasRenewOrderResult = {
  id: string
  orderNo: string
  total: number
  currency: string
  paymentProvider: string
  renewalPeriod: string
  renewalDays: number
  renewalLabel: string
  productName: string
  membershipId: string
}
