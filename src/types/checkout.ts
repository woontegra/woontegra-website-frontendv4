import type { ProductType } from '@/types/product'
import type { PublicProductCampaignInfo } from '@/types/campaign'

export type CreateOrderItem = {
  productId: string
  quantity: number
}

export type CreateOrderBody = {
  items: CreateOrderItem[]
  customerName: string
  customerEmail: string
  customerPhone?: string
  billingType?: string
  taxOffice?: string
  taxNumber?: string
  identityNumber?: string
  companyName?: string
  deliveryCity?: string
  deliveryDistrict?: string
  deliveryLine?: string
  acceptPreInfo: boolean
  acceptDistanceSales: boolean
  acceptKvkk: boolean
  acceptSoftwareLicense?: boolean
  acceptSaasSubscription?: boolean
  acceptDigitalProductWaiver?: boolean
  acceptDigitalServiceWaiver?: boolean
  marketingConsent?: boolean
  explicitConsent?: boolean
  paymentMethod?: 'PAYTR' | 'BANK_TRANSFER'
  saveToAddressBook?: boolean
  selectedAddressId?: string | null
}

export type CreateOrderResponse = {
  orderNo: string
  id: string
  status: string
  total: number
  currency: string
  paymentProvider: string
  addressBookWarning?: string
}

export type CartPreviewRow = {
  id: string
  name: string
  slug: string
  productType: ProductType
  price: number
  originalPrice?: number | null
  campaign?: PublicProductCampaignInfo | null
  currency: string
  coverImage: string | null
  hasDownload: boolean
  licenseRequired?: boolean
  singleQuantity?: boolean
  matchKeys?: string[]
}
