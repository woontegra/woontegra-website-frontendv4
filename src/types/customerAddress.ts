export type CustomerAddress = {
  id: string
  title: string
  fullName: string
  phone: string | null
  city: string
  district: string | null
  addressLine: string
  postalCode: string | null
  taxOffice: string | null
  taxNumber: string | null
  companyName: string | null
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export type CustomerAddressInput = {
  title: string
  fullName: string
  phone?: string | null
  city: string
  district?: string | null
  addressLine: string
  postalCode?: string | null
  taxOffice?: string | null
  taxNumber?: string | null
  companyName?: string | null
  isDefault?: boolean
}
