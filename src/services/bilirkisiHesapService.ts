import { publicApi, getErrorMessage } from '@/api/client'
import { customerAuthHeaders } from '@/lib/customerAuth'

export type BhProduct = {
  id: number
  name: string
  price: number
  originalPrice?: number | null
  priceMonthly?: number | null
  priceStarter?: number | null
  price2Year?: number | null
  originalPrice2Year?: number | null
  price3Year?: number | null
  originalPrice3Year?: number | null
  price2YearActive?: boolean
  price3YearActive?: boolean
  shortDescription?: string | null
  features?: string | null
}

export type BhQuote = {
  valid: boolean
  reason?: string | null
  normalPrice?: number
  packageDiscount?: number
  campaignDiscount?: number
  partnerDiscount?: number
  partnerDiscountRate?: number
  appliedDiscountSource?: string | null
  finalPrice?: number
  currency?: string
  campaign?: {
    publicCode?: string | null
    name?: string | null
    discountRate?: number | null
    campaignType?: string | null
    barAssociationKey?: string | null
    barAssociationName?: string | null
  } | null
}

export type BhConfig = {
  panelLoginUrl: string
  upstreamConfigured: boolean
  paymentDryRunHint?: boolean
  renewalEnabled?: boolean
}

function kurusToTl(kurus: number | null | undefined): number | null {
  if (kurus == null || !Number.isFinite(kurus)) return null
  return kurus / 100
}

export function formatBhPriceTl(amountTl: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountTl)
}

export const bilirkisiHesapService = {
  async getConfig(): Promise<BhConfig> {
    const { data } = await publicApi.get<{ success: boolean; data: BhConfig }>('/bh/config')
    return data.data
  },

  async getProduct(): Promise<BhProduct> {
    const { data } = await publicApi.get<{ success: boolean; data: BhProduct }>('/bh/product')
    if (!data?.success || !data.data) throw new Error('Ürün bilgisi alınamadı.')
    return data.data
  },

  async quote(input: {
    productType: 'monthly' | 'annual' | 'starter'
    subscriptionPeriod?: number
    campaignPublicCode?: string | null
  }): Promise<{ quote: BhQuote; campaign?: BhQuote['campaign'] }> {
    const { data } = await publicApi.post<{
      success: boolean
      valid?: boolean
      quote?: BhQuote
      campaign?: BhQuote['campaign']
      message?: string
    }>('/bh/quote', {
      productType: input.productType,
      subscriptionPeriod: input.subscriptionPeriod,
      campaignPublicCode: input.campaignPublicCode || undefined,
    })
    const quote = data.quote ?? {
      valid: data.valid === true,
      reason: data.message,
    }
    return { quote, campaign: data.campaign ?? quote.campaign }
  },

  async requestDemo(input: {
    email: string
    phone: string
    name?: string
    company?: string
  }): Promise<{ success: boolean; message?: string }> {
    const { data } = await publicApi.post<{ success: boolean; message?: string; error?: string }>(
      '/bh/demo/request',
      input,
    )
    if (!data.success) throw new Error(data.error || data.message || 'Demo talebi başarısız.')
    return data
  },

  async getCampaign(code: string) {
    const { data } = await publicApi.get<{ success: boolean; data: unknown }>(
      `/bh/campaigns/${encodeURIComponent(code)}`,
    )
    return data
  },

  async getLegalPreview(
    type: string,
    opts?: { productType?: string; subscriptionPeriod?: number },
  ): Promise<{ type: string; title: string; version?: string; content: string; contentHtml?: string }> {
    const qs = new URLSearchParams()
    if (opts?.productType) qs.set('productType', opts.productType)
    if (opts?.subscriptionPeriod != null) qs.set('subscriptionPeriod', String(opts.subscriptionPeriod))
    const path = `/bh/legal/templates/${encodeURIComponent(type)}/preview${
      qs.toString() ? `?${qs.toString()}` : ''
    }`
    const { data } = await publicApi.get<{
      success: boolean
      data?: { type: string; title: string; version?: string; content: string; contentHtml?: string }
      message?: string
    }>(path, { timeout: 20_000 })
    if (!data?.success || !data.data?.content) {
      throw new Error(data?.message || 'Sözleşme metni yüklenemedi.')
    }
    return data.data
  },

  async bankTransferAvailability(): Promise<boolean> {
    try {
      const { data } = await publicApi.get<{ success: boolean; isActive?: boolean }>(
        '/bh/payment/bank-transfer-availability',
      )
      return Boolean(data.isActive)
    } catch {
      return false
    }
  },

  async createBankTransferOrder(body: Record<string, unknown>) {
    const { data } = await publicApi.post('/bh/payment/bank-transfer-order', body, {
      headers: customerAuthHeaders(),
      timeout: 45_000,
    })
    return data as {
      success: boolean
      merchantOid?: string
      amount?: number
      amountFormatted?: string
      bankTransfer?: Record<string, string>
      message?: string
      error?: string
    }
  },

  async getPaymentPublicStatus(merchantOid: string) {
    const { data } = await publicApi.get<{
      success?: boolean
      data?: {
        status?: string
        fulfillmentStatus?: string
        productType?: string
        email?: string
        finalPriceKurus?: number
        amount?: number
      }
      status?: string
      fulfillmentStatus?: string
      productType?: string
      email?: string
      finalPriceKurus?: number
      amount?: number
      message?: string
    }>('/bh/payment/public-status', {
      params: { merchant_oid: merchantOid },
      timeout: 20_000,
    })
    return data
  },

  async createPaytrTokenGuest(body: Record<string, unknown>) {
    const { data } = await publicApi.post('/bh/payment/paytr-token-guest', body, {
      headers: customerAuthHeaders(),
      timeout: 45_000,
    })
    return data as {
      success: boolean
      token?: string
      merchantOid?: string
      testMode?: boolean
      dryRun?: boolean
      successUrl?: string
      failUrl?: string
      returnChannel?: string
      fulfillment?: { attempted: boolean; ok?: boolean; error?: string }
      message?: string
      woontegraCustomerId?: string
    }
  },

  /** Woontegra-central BH checkout: WT Order priced from BH prepare-sale. */
  async createCheckoutOrder(body: Record<string, unknown>) {
    const { data } = await publicApi.post('/bh/checkout/create-order', body, {
      headers: customerAuthHeaders(),
      timeout: 45_000,
    })
    return data as {
      success: boolean
      data?: {
        orderNo: string
        orderId: string
        totalTl: number
        saleRef: string
        paymentProvider: string
      }
      message?: string
      code?: string
    }
  },

  async renewalOptions() {
    const { data } = await publicApi.post(
      '/bh/renewal/options',
      {},
      { headers: customerAuthHeaders(), timeout: 20_000 },
    )
    return data as {
      success: boolean
      data?: {
        currentPackage?: string
        licenseEnd?: string
        remainingDays?: number
        options?: Array<{
          productType: string
          period: number
          label?: string
          finalAmountKurus?: number
          durationDays?: number
        }>
        canRenew?: boolean
      }
      message?: string
      code?: string
    }
  },

  async renewalStart(input: { productType: 'monthly' | 'annual'; period?: number }) {
    const { data } = await publicApi.post(
      '/bh/renewal/start',
      {
        productType: input.productType,
        period: input.period ?? (input.productType === 'monthly' ? 0 : 1),
      },
      { headers: customerAuthHeaders(), timeout: 20_000 },
    )
    return data as {
      success: boolean
      data?: {
        renewalToken: string
        productType: string
        period: number
        expiresAt: string
        woontegraCheckoutPath?: string
      }
      message?: string
      code?: string
    }
  },

  async renewalResolve(renewalToken: string) {
    const { data } = await publicApi.post('/bh/renewal/resolve', { renewalToken }, { timeout: 20_000 })
    return data
  },

  async renewalQuote(input: {
    renewalToken: string
    campaignPublicCode?: string | null
    productType?: 'monthly' | 'annual'
    subscriptionPeriod?: number
  }) {
    const { data } = await publicApi.post(
      '/bh/renewal/quote',
      {
        renewalToken: input.renewalToken,
        campaignPublicCode: input.campaignPublicCode || undefined,
        campaignId: input.campaignPublicCode || undefined,
        productType: input.productType,
        subscriptionPeriod: input.subscriptionPeriod,
      },
      { timeout: 20_000 },
    )
    return data
  },

  annualPriceTl(product: BhProduct): number | null {
    return kurusToTl(product.price)
  },

  monthlyPriceTl(product: BhProduct): number | null {
    return kurusToTl(product.priceMonthly ?? null)
  },

  getErrorMessage,
}
