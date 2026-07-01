import type { ApiSuccess } from '@/types/api'
import type { CustomerAddress, CustomerAddressInput } from '@/types/customerAddress'
import type { CustomerLicenseListItem } from '@/types/customerLicenses'
import type { CustomerOrderDetail, CustomerOrderListItem } from '@/types/customerOrders'
import type {
  CustomerSaasMembershipRow,
  SaasRenewOrderResult,
  SaasRenewQuote,
} from '@/types/customerSaasMembership'
import { publicApi, getErrorMessage } from '@/api/client'
import {
  clearCustomerSession,
  customerAuthHeaders,
  customerRememberPreference,
  getCustomerToken,
  saveCustomerSession,
  type CustomerProfile,
} from '@/lib/customerAuth'

export type LoginRegisterResponse = {
  token: string
  customer: CustomerProfile
}

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiSuccess<T>).data
  }
  return payload as T
}

function customerHeaders() {
  return customerAuthHeaders()
}

export const customersService = {
  async register(
    body: { name: string; email: string; password: string; phone?: string },
    remember = true,
  ): Promise<LoginRegisterResponse> {
    const res = await publicApi.post<ApiSuccess<LoginRegisterResponse>>('/customers/register', body)
    const data = unwrap<LoginRegisterResponse>(res.data)
    saveCustomerSession(data.token, data.customer, remember)
    return data
  },

  async login(email: string, password: string, remember = true): Promise<LoginRegisterResponse> {
    const res = await publicApi.post<ApiSuccess<LoginRegisterResponse>>('/customers/login', { email, password })
    const data = unwrap<LoginRegisterResponse>(res.data)
    saveCustomerSession(data.token, data.customer, remember)
    return data
  },

  async forgotPassword(email: string): Promise<{ ok: true; message: string }> {
    const res = await publicApi.post<{ ok: true; message: string }>('/customers/forgot-password', { email })
    return res.data
  },

  async resetPassword(token: string, password: string): Promise<{ ok: true; message: string }> {
    const res = await publicApi.post<{ ok: true; message: string }>('/customers/reset-password', {
      token,
      password,
    })
    return res.data
  },

  logoutLocal() {
    clearCustomerSession()
  },

  async getMe(): Promise<CustomerProfile> {
    const res = await publicApi.get<ApiSuccess<CustomerProfile>>('/customers/me', {
      headers: customerHeaders(),
    })
    return unwrap(res.data)
  },

  async patchMe(body: Partial<{ name: string; phone: string | null; email: string; currentPassword: string }>) {
    const res = await publicApi.patch<ApiSuccess<CustomerProfile>>('/customers/me', body, {
      headers: customerHeaders(),
    })
    const profile = unwrap<CustomerProfile>(res.data)
    const token = getCustomerToken()
    if (token) saveCustomerSession(token, profile, customerRememberPreference())
    return profile
  },

  async patchPassword(currentPassword: string, newPassword: string) {
    await publicApi.patch('/customers/me/password', { currentPassword, newPassword }, {
      headers: customerHeaders(),
    })
  },

  async listAddresses(): Promise<CustomerAddress[]> {
    const res = await publicApi.get<ApiSuccess<CustomerAddress[]>>('/customers/me/addresses', {
      headers: customerHeaders(),
    })
    return unwrap(res.data)
  },

  async createAddress(body: CustomerAddressInput): Promise<{ id: string }> {
    const res = await publicApi.post<ApiSuccess<{ id: string }>>('/customers/me/addresses', body, {
      headers: customerHeaders(),
    })
    return unwrap(res.data)
  },

  async patchAddress(id: string, body: Partial<CustomerAddressInput>) {
    await publicApi.patch(`/customers/me/addresses/${encodeURIComponent(id)}`, body, {
      headers: customerHeaders(),
    })
  },

  async deleteAddress(id: string) {
    await publicApi.delete(`/customers/me/addresses/${encodeURIComponent(id)}`, {
      headers: customerHeaders(),
    })
  },

  async listOrders(): Promise<CustomerOrderListItem[]> {
    const res = await publicApi.get<ApiSuccess<CustomerOrderListItem[]>>('/customers/me/orders', {
      headers: customerHeaders(),
    })
    return unwrap(res.data)
  },

  async getOrder(orderNo: string): Promise<CustomerOrderDetail> {
    const res = await publicApi.get<ApiSuccess<CustomerOrderDetail>>(
      `/customers/me/orders/${encodeURIComponent(orderNo)}`,
      { headers: customerHeaders() },
    )
    return unwrap(res.data)
  },

  async listLicenses(): Promise<CustomerLicenseListItem[]> {
    const res = await publicApi.get<ApiSuccess<CustomerLicenseListItem[]>>('/customers/me/licenses', {
      headers: customerHeaders(),
    })
    return unwrap(res.data)
  },

  async listSaasMemberships(): Promise<CustomerSaasMembershipRow[]> {
    const res = await publicApi.get<ApiSuccess<CustomerSaasMembershipRow[]>>('/customers/me/saas-memberships', {
      headers: customerHeaders(),
    })
    return unwrap(res.data)
  },

  async getSaasRenewQuote(membershipId: string, renewalPeriod: string): Promise<SaasRenewQuote> {
    const q = new URLSearchParams({ renewalPeriod })
    const res = await publicApi.get<ApiSuccess<SaasRenewQuote>>(
      `/customers/me/saas-memberships/${encodeURIComponent(membershipId)}/renew-quote?${q}`,
      { headers: customerHeaders() },
    )
    return unwrap(res.data)
  },

  async createSaasRenewOrder(
    membershipId: string,
    body: {
      renewalPeriod: string
      paymentProvider?: 'BANK_TRANSFER' | 'PAYTR'
      paymentMethod?: 'BANK_TRANSFER' | 'PAYTR'
      acceptPreInfo: boolean
      acceptDistanceSales: boolean
      acceptKvkk: boolean
      acceptSaasSubscription: boolean
      acceptDigitalServiceWaiver: boolean
    },
  ): Promise<SaasRenewOrderResult> {
    const res = await publicApi.post<ApiSuccess<SaasRenewOrderResult>>(
      `/customers/me/saas-memberships/${encodeURIComponent(membershipId)}/renew-order`,
      {
        ...body,
        paymentProvider: body.paymentProvider ?? body.paymentMethod,
        paymentMethod: body.paymentMethod ?? body.paymentProvider,
      },
      { headers: customerHeaders() },
    )
    return unwrap(res.data)
  },
}

export { getErrorMessage }
