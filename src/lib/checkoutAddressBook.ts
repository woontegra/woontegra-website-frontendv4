import type { CustomerAddress } from '@/types/customerAddress'
import { resolveCheckoutTaxNumber } from '@/utils/checkoutBilling'

export type CheckoutAddressFormSlice = {
  customerName: string
  customerPhone: string
  billingType: '' | 'Bireysel' | 'Kurumsal'
  companyName: string
  taxOffice: string
  taxNumber: string
  identityNumber: string
  deliveryCity: string
  deliveryDistrict: string
  deliveryLine: string
}

function norm(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase()
}

export function checkoutFormMatchesAddress(form: CheckoutAddressFormSlice, addr: CustomerAddress): boolean {
  const formTax = resolveCheckoutTaxNumber(form) ?? ''
  const addrTax = addr.taxNumber?.trim() ?? ''
  return (
    norm(form.customerName) === norm(addr.fullName) &&
    norm(form.customerPhone) === norm(addr.phone) &&
    norm(form.deliveryCity) === norm(addr.city) &&
    norm(form.deliveryDistrict) === norm(addr.district) &&
    norm(form.deliveryLine) === norm(addr.addressLine) &&
    norm(form.companyName) === norm(addr.companyName) &&
    norm(form.taxOffice) === norm(addr.taxOffice) &&
    norm(formTax) === norm(addrTax)
  )
}

export function shouldOfferSaveAddressToBook(options: {
  authed: boolean
  savedAddresses: CustomerAddress[]
  selectedAddressId: string | null
  form: CheckoutAddressFormSlice
}): boolean {
  if (!options.authed) return false
  if (options.savedAddresses.length === 0) return true
  if (!options.selectedAddressId) return true
  const selected = options.savedAddresses.find((a) => a.id === options.selectedAddressId)
  if (!selected) return true
  return !checkoutFormMatchesAddress(options.form, selected)
}

export function defaultSaveAddressChecked(options: {
  authed: boolean
  savedAddresses: CustomerAddress[]
}): boolean {
  return options.authed && options.savedAddresses.length === 0
}
