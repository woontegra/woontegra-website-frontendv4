import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { TurkeyCityDistrictFields, checkoutSelectCls } from '@/components/checkout/TurkeyCityDistrictFields'
import { CheckoutLegalModal } from '@/components/checkout/CheckoutLegalModal'
import { LegalModalLink } from '@/components/checkout/LegalConsentCheckbox'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useCustomerSession } from '@/hooks/useCustomerSession'
import {
  bilirkisiHesapService,
  formatBhPriceTl,
  type BhProduct,
  type BhQuote,
} from '@/services/bilirkisiHesapService'
import { customersService } from '@/services/customersService'
import { paymentsService } from '@/services/paymentsService'
import { getErrorMessage } from '@/api/client'
import { BILIRKISI_HESAP_SLUG } from '@/data/canonicalSoftwareProducts'
import {
  sanitizeTurkishIdentityNumberInput,
  validateTurkishIdentityNumber,
} from '@/utils/turkishIdentityNumber'
import {
  sanitizeTurkishTaxNumberInput,
  validateTurkishTaxNumber,
} from '@/utils/turkishTaxNumber'

type BhLegalKey =
  | 'PRE_INFORMATION'
  | 'DISTANCE_SALE'
  | 'SUBSCRIPTION_AGREEMENT'
  | 'KVKK'
  | 'WITHDRAWAL_EXCEPTION'

const LEGAL_DOCUMENTS: { key: BhLegalKey; title: string }[] = [
  { key: 'PRE_INFORMATION', title: 'Ön Bilgilendirme Formu' },
  { key: 'DISTANCE_SALE', title: 'Mesafeli Satış Sözleşmesi' },
  { key: 'SUBSCRIPTION_AGREEMENT', title: 'Abonelik Sözleşmesi' },
  { key: 'KVKK', title: 'KVKK Aydınlatma Metni' },
  { key: 'WITHDRAWAL_EXCEPTION', title: 'Cayma Hakkı İstisnası' },
]

const LEGAL_CONSENT_GROUPS = [
  {
    id: 'sale' as const,
    keys: ['PRE_INFORMATION', 'DISTANCE_SALE'] as const satisfies readonly BhLegalKey[],
  },
  {
    id: 'terms' as const,
    keys: ['SUBSCRIPTION_AGREEMENT', 'KVKK', 'WITHDRAWAL_EXCEPTION'] as const satisfies readonly BhLegalKey[],
  },
]

function legalTitle(key: BhLegalKey): string {
  return LEGAL_DOCUMENTS.find((d) => d.key === key)?.title || key
}

type ProductType = 'monthly' | 'annual'
type PaymentMethod = 'card' | 'bank_transfer'
type InvoiceType = 'individual' | 'corporate'

type Billing = {
  invoiceType: InvoiceType
  fullName: string
  companyName: string
  email: string
  phone: string
  identityNumber: string
  taxNumber: string
  taxOffice: string
  address: string
  city: string
  district: string
}

type RenewalContext = {
  purchaseContext: 'DEMO_CONVERSION' | 'LICENSE_RENEWAL' | null
  accountEmail: string | null
  customerName: string | null
  maskedEmail: string | null
  maskedName: string | null
  currentPackage: string | null
  subscriptionEndsAt: string | null
  barAssociationName: string | null
  monthlyPriceTl: number | null
  annualPriceTl: number | null
}

const fieldLabelCls = 'block min-h-[1.25rem] text-sm font-medium leading-5 text-slate-700'
const textareaCls =
  'min-h-[5.5rem] w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100'

function canonicalizeCampaignCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '_')
}

/** Map BH quote reason codes to user-facing Turkish; never render raw internal codes. */
function bhQuoteInvalidMessage(reason?: string | null): string {
  const normalized = String(reason || '')
    .trim()
    .toUpperCase()
  if (normalized.includes('NOT_APPLICABLE') || normalized.includes('NOT_ELIGIBLE')) {
    return 'Bu kampanya seçili paket için geçerli değil.'
  }
  if (normalized.includes('EXPIRED')) {
    return 'Bu kampanyanın süresi dolmuş.'
  }
  if (normalized.includes('LIMIT') || normalized.includes('INACTIVE')) {
    return 'Bu kampanya şu anda kullanılamıyor.'
  }
  if (normalized.includes('NOT_FOUND')) {
    return 'Kampanya bulunamadı.'
  }
  if (normalized.includes('NOT_STARTED')) {
    return 'Bu kampanya henüz başlamamış.'
  }
  if (/^[A-Z][A-Z0-9_]*$/.test(normalized)) {
    return 'Bu kampanya seçili paket için geçerli değil.'
  }
  return reason?.trim() || 'Fiyat teklifi geçersiz.'
}

function isDevUi(): boolean {
  return import.meta.env.DEV === true
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function formatRenewalPackageLabel(raw: string | null | undefined): string {
  const key = String(raw || '')
    .trim()
    .toLowerCase()
  if (!key) return '—'
  if (key.includes('month') || key.includes('aylik') || key.includes('aylık') || key === '0') {
    return 'Profesyonel Aylık'
  }
  if (
    key.includes('annual') ||
    key.includes('year') ||
    key.includes('yillik') ||
    key.includes('yıllık') ||
    key === '1'
  ) {
    return 'Profesyonel Yıllık'
  }
  return String(raw).trim()
}

function formatRenewalEndDate(raw: string | null | undefined): string {
  if (!raw) return '—'
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })
}

/** Normalize renewal resolve/quote payload into BhQuote (TL amounts). */
function extractRenewalQuote(
  data: Record<string, unknown>,
  preferredType: ProductType,
): { quote: BhQuote | null; selectedType: ProductType | null } {
  const options = Array.isArray(data.options) ? data.options : []
  const selectedOption = asRecord(data.selectedOption)
  const selectedTypeRaw = String(
    data.selectedProductType || selectedOption.productType || preferredType || '',
  ).toLowerCase()
  const selectedType: ProductType | null =
    selectedTypeRaw === 'monthly' || selectedTypeRaw === 'annual' ? selectedTypeRaw : null

  const matchType = selectedType || preferredType
  const matched =
    options.find((o) => String(asRecord(o).productType || '').toLowerCase() === matchType) ||
    (Object.keys(selectedOption).length ? selectedOption : null) ||
    options[0]

  const optionRec = asRecord(matched)
  const nestedQuote = asRecord(optionRec.quote || data.quote || data.renewalQuote)

  const finalRaw =
    nestedQuote.finalPrice ??
    nestedQuote.finalAmount ??
    (nestedQuote.finalPriceKurus != null ? Number(nestedQuote.finalPriceKurus) / 100 : null) ??
    (nestedQuote.finalAmountKurus != null ? Number(nestedQuote.finalAmountKurus) / 100 : null)
  const normalRaw =
    nestedQuote.normalPrice ??
    nestedQuote.listPrice ??
    (nestedQuote.normalPriceKurus != null ? Number(nestedQuote.normalPriceKurus) / 100 : null) ??
    (nestedQuote.normalAmountKurus != null ? Number(nestedQuote.normalAmountKurus) / 100 : null) ??
    finalRaw

  const finalTl = finalRaw != null ? Number(finalRaw) : NaN
  const normalTl = normalRaw != null ? Number(normalRaw) : NaN

  if (!Number.isFinite(finalTl)) {
    return { quote: null, selectedType }
  }

  const campaign = asRecord(nestedQuote.campaign || optionRec.campaign || data.campaign)
  return {
    selectedType,
    quote: {
      valid: nestedQuote.valid === false ? false : true,
      reason: (nestedQuote.reason as string | null | undefined) ?? null,
      normalPrice: Number.isFinite(normalTl) ? normalTl : undefined,
      finalPrice: finalTl,
      currency: String(nestedQuote.currency || 'TRY'),
      campaign:
        Object.keys(campaign).length > 0
          ? {
              publicCode: (campaign.publicCode as string | null) ?? null,
              name: (campaign.name as string | null) ?? null,
              discountRate:
                campaign.discountRate != null ? Number(campaign.discountRate) : null,
              campaignType: (campaign.campaignType as string | null) ?? null,
              barAssociationKey: (campaign.barAssociationKey as string | null) ?? null,
              barAssociationName: (campaign.barAssociationName as string | null) ?? null,
            }
          : null,
      appliedDiscountSource: (nestedQuote.appliedDiscountSource as string | null) ?? null,
    },
  }
}

/** Customer-facing campaign title — never technical publicCode (CMP_…). */
function campaignCustomerFacingTitle(campaign: NonNullable<BhQuote['campaign']>): string | null {
  const type = String(campaign.campaignType || '').toUpperCase()
  if (type === 'BAR_ASSOCIATION') {
    const barName = String(campaign.barAssociationName || '').trim()
    if (barName) return barName
  }
  const name = String(campaign.name || '').trim()
  if (!name) return null
  const code = String(campaign.publicCode || '').trim()
  if (code && name.toLowerCase() === code.toLowerCase()) return null
  if (/^CMP_[A-Z0-9]+$/i.test(name)) return null
  return name
}

function campaignCustomerBanner(
  campaign: BhQuote['campaign'] | null | undefined,
  opts?: { isRenewal?: boolean },
): { title: string; subtitle: string | null } | null {
  if (!campaign || campaign.discountRate == null || !Number.isFinite(Number(campaign.discountRate))) {
    return null
  }
  const title = campaignCustomerFacingTitle(campaign)
  if (!title) return null
  const rate = Number(campaign.discountRate)
  const type = String(campaign.campaignType || '').toUpperCase()
  if (opts?.isRenewal && type === 'BAR_ASSOCIATION') {
    return {
      title: `${title} – Yenilemede %${rate} indirim uygulanıyor`,
      subtitle: null,
    }
  }
  return {
    title,
    subtitle: `Tüm paketlerde %${rate} indirim uygulanır.`,
  }
}

function extractRenewalOptionPriceTl(
  data: Record<string, unknown>,
  productType: ProductType,
): number | null {
  const options = Array.isArray(data.options) ? data.options : []
  const matched = options.find(
    (o) => String(asRecord(o).productType || '').toLowerCase() === productType,
  )
  if (!matched) return null
  const q = asRecord(asRecord(matched).quote)
  const finalTl = Number(
    q.finalPrice ??
      q.finalAmount ??
      (q.finalPriceKurus != null ? Number(q.finalPriceKurus) / 100 : NaN),
  )
  return Number.isFinite(finalTl) ? finalTl : null
}

export function BilirkisiCheckoutPage() {
  const { authed, profile } = useCustomerSession()
  const [searchParams, setSearchParams] = useSearchParams()
  const renewalToken = useMemo(() => (searchParams.get('renew') || '').trim(), [searchParams])
  const isRenewal = Boolean(renewalToken)

  usePageMeta({
    title: isRenewal
      ? 'Bilirkişi Hesap — Abonelik | Woontegra'
      : 'Bilirkişi Hesap — Satın Al | Woontegra',
    description: isRenewal
      ? 'Bilirkişi Hesaplama Yazılımı abonelik satın alma / yenileme.'
      : 'Bilirkişi Hesaplama Yazılımı abonelik satın alma.',
    robots: 'noindex,nofollow',
    canonicalPath: `/yazilimlar/${BILIRKISI_HESAP_SLUG}/satin-al`,
  })

  const campaignCode = useMemo(() => {
    const c = searchParams.get('c') || searchParams.get('campaign') || ''
    return c ? canonicalizeCampaignCode(c) : ''
  }, [searchParams])

  const initialPlan = useMemo((): ProductType => {
    const raw = (searchParams.get('plan') || searchParams.get('productType') || searchParams.get('product_type') || '')
      .trim()
      .toLowerCase()
    if (raw === 'monthly' || raw === 'aylik' || raw === 'aylık') return 'monthly'
    return 'annual'
  }, [searchParams])

  const returnPath = useMemo(() => {
    const qs = searchParams.toString()
    return `/yazilimlar/${BILIRKISI_HESAP_SLUG}/satin-al${qs ? `?${qs}` : ''}`
  }, [searchParams])

  const loginHref = `/giris?return=${encodeURIComponent(returnPath)}`
  const registerHref = `/kayit?return=${encodeURIComponent(returnPath)}`

  const [product, setProduct] = useState<BhProduct | null>(null)
  const [productError, setProductError] = useState<string | null>(null)
  const [productType, setProductType] = useState<ProductType>(initialPlan)
  const period = 1
  const [quote, setQuote] = useState<BhQuote | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [renewalContext, setRenewalContext] = useState<RenewalContext | null>(null)
  const isDemoUpgrade = renewalContext?.purchaseContext === 'DEMO_CONVERSION'
  const isPaidRenewal = isRenewal && Boolean(renewalContext) && !isDemoUpgrade
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [bankAvailable, setBankAvailable] = useState(false)
  const [consentGroups, setConsentGroups] = useState({ sale: false, terms: false })
  const [legalModalKey, setLegalModalKey] = useState<BhLegalKey | null>(null)
  const [legalModalTitle, setLegalModalTitle] = useState('')
  const [legalModalHtml, setLegalModalHtml] = useState<string | null>(null)
  const [legalModalLoading, setLegalModalLoading] = useState(false)
  const [legalModalError, setLegalModalError] = useState<string | null>(null)
  const [billing, setBilling] = useState<Billing>({
    invoiceType: 'individual',
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    identityNumber: '',
    taxNumber: '',
    taxOffice: '',
    address: '',
    city: '',
    district: '',
  })
  const [fieldErrors, setFieldErrors] = useState<{ identityNumber?: string; taxNumber?: string }>({})
  const [saveAsDefaultAddress, setSaveAsDefaultAddress] = useState(false)
  const [prefillDone, setPrefillDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{
    kind: 'card_dry_run' | 'card' | 'bank'
    merchantOid?: string
    bankTransfer?: Record<string, string>
    amountFormatted?: string
    fulfillmentOk?: boolean
  } | null>(null)

  const campaignBanner = useMemo(
    () => campaignCustomerBanner(quote?.campaign, { isRenewal }),
    [quote?.campaign, isRenewal],
  )
  const campaignFacingTitle = useMemo(
    () => (quote?.campaign ? campaignCustomerFacingTitle(quote.campaign) : null),
    [quote?.campaign],
  )

  useEffect(() => {
    let cancelled = false
    bilirkisiHesapService
      .getProduct()
      .then((p) => {
        if (!cancelled) setProduct(p)
      })
      .catch((err) => {
        if (!cancelled) setProductError(getErrorMessage(err, 'Ürün fiyatı alınamadı.'))
      })
    bilirkisiHesapService.bankTransferAvailability().then((ok) => {
      if (!cancelled) setBankAvailable(ok)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setProductType(initialPlan)
  }, [initialPlan])

  useEffect(() => {
    if (!authed) {
      setPrefillDone(false)
      setSaveAsDefaultAddress(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const me = await customersService.getMe()
        if (cancelled) return
        let city = ''
        let district = ''
        let address = ''
        let companyName = ''
        let taxOffice = ''
        let taxNumber = ''
        let addressFullName = ''
        let addressPhone = ''
        let hasCorporateProfile = false
        try {
          const addresses = await customersService.listAddresses()
          if (!cancelled && addresses?.length) {
            const preferred = addresses.find((a) => a.isDefault) || addresses[0]
            city = preferred.city || ''
            district = preferred.district || ''
            address = preferred.addressLine || ''
            addressFullName = preferred.fullName || ''
            addressPhone = preferred.phone || ''
            if (preferred.companyName?.trim()) {
              hasCorporateProfile = true
              companyName = preferred.companyName.trim()
              taxOffice = preferred.taxOffice?.trim() || ''
              taxNumber = preferred.taxNumber?.trim() || ''
            }
          }
        } catch {
          /* adres yoksa checkout’ta girilir */
        }
        if (cancelled) return
        setBilling((b) => ({
          ...b,
          invoiceType: hasCorporateProfile ? 'corporate' : b.invoiceType,
          fullName: me.name || profile?.name || addressFullName || b.fullName,
          email: me.email || profile?.email || b.email,
          phone: me.phone || profile?.phone || addressPhone || b.phone || '',
          city: b.city || city,
          district: b.district || district,
          address: b.address || address,
          companyName: hasCorporateProfile ? companyName || b.companyName : b.companyName,
          taxOffice: hasCorporateProfile ? taxOffice || b.taxOffice : b.taxOffice,
          taxNumber: hasCorporateProfile ? taxNumber || b.taxNumber : b.taxNumber,
          // TCKN varsayılan adresten doldurulmaz
        }))
      } catch {
        if (!cancelled && profile) {
          setBilling((b) => ({
            ...b,
            fullName: profile.name || b.fullName,
            email: profile.email || b.email,
            phone: profile.phone || b.phone || '',
          }))
        }
      } finally {
        if (!cancelled) setPrefillDone(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [authed, profile])

  const selectPlan = (next: ProductType) => {
    // Same plan re-click must not clear quote without a refetch (URL/state unchanged → effect skips).
    if (next === productType && searchParams.get('plan') === next) return
    setProductType(next)
    setQuote(null)
    setError(null)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('plan', next)
    setSearchParams(nextParams, { replace: true })
  }

  useEffect(() => {
    if (!product) return
    if (isRenewal && renewalToken) {
      let cancelled = false
      setQuoteLoading(true)
      setQuote(null)
      bilirkisiHesapService
        .renewalQuote({
          renewalToken,
          campaignPublicCode: campaignCode || null,
          productType,
          subscriptionPeriod: productType === 'monthly' ? 0 : 1,
        })
        .then((raw) => {
          if (cancelled) return
          const root = asRecord(raw)
          const data = asRecord(root.data && Object.keys(asRecord(root.data)).length ? root.data : root)
          setRenewalContext({
            purchaseContext:
              String(data.purchaseContext || '').toUpperCase() === 'DEMO_CONVERSION'
                ? 'DEMO_CONVERSION'
                : String(data.currentPackage || data.licenseType || '')
                      .trim()
                      .toLowerCase() === 'demo'
                  ? 'DEMO_CONVERSION'
                  : 'LICENSE_RENEWAL',
            accountEmail: (data.accountEmail as string | null) || (data.targetEmail as string | null) || null,
            customerName: (data.customerName as string | null) || null,
            maskedEmail: (data.maskedEmail as string | null) || null,
            maskedName: (data.maskedName as string | null) || null,
            currentPackage: (data.currentPackage as string | null) || null,
            subscriptionEndsAt: (data.subscriptionEndsAt as string | null) || null,
            barAssociationName: (data.barAssociationName as string | null) || null,
            monthlyPriceTl: extractRenewalOptionPriceTl(data, 'monthly'),
            annualPriceTl: extractRenewalOptionPriceTl(data, 'annual'),
          })
          const { quote: nextQuote, selectedType } = extractRenewalQuote(data, productType)
          if (selectedType && selectedType !== productType && !searchParams.get('plan')) {
            setProductType(selectedType)
          }
          if (nextQuote) setQuote(nextQuote)
          else {
            setQuote(null)
            setError('Yenileme fiyatı alınamadı.')
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setQuote(null)
            setRenewalContext(null)
            setError(getErrorMessage(err, 'Yenileme oturumu geçersiz veya süresi dolmuş.'))
          }
        })
        .finally(() => {
          if (!cancelled) setQuoteLoading(false)
        })
      return () => {
        cancelled = true
      }
    }
    setRenewalContext(null)
    let cancelled = false
    setQuoteLoading(true)
    setQuote(null)
    bilirkisiHesapService
      .quote({
        productType,
        subscriptionPeriod: productType === 'annual' ? period : undefined,
        campaignPublicCode: campaignCode || null,
      })
      .then(({ quote: q }) => {
        if (!cancelled) setQuote(q)
      })
      .catch((err) => {
        if (!cancelled) {
          setQuote(null)
          setError(getErrorMessage(err, 'Fiyat teklifi alınamadı.'))
        }
      })
      .finally(() => {
        if (!cancelled) setQuoteLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [product, productType, period, campaignCode, isRenewal, renewalToken])

  const setInvoiceType = (invoiceType: InvoiceType) => {
    setBilling((b) => ({
      ...b,
      invoiceType,
      ...(invoiceType === 'corporate'
        ? { identityNumber: '' }
        : { companyName: '', taxNumber: '', taxOffice: '' }),
    }))
    setFieldErrors({})
    setError(null)
  }

  const openLegalModal = (key: BhLegalKey) => {
    setLegalModalKey(key)
    setLegalModalTitle(legalTitle(key))
    setLegalModalHtml(null)
    setLegalModalError(null)
    setLegalModalLoading(true)
    bilirkisiHesapService
      .getLegalPreview(key, {
        productType,
        subscriptionPeriod: productType === 'annual' ? period : 1,
      })
      .then((doc) => {
        setLegalModalTitle(doc.title || legalTitle(key))
        setLegalModalHtml(doc.contentHtml || `<pre class="whitespace-pre-wrap">${doc.content}</pre>`)
      })
      .catch((err) => {
        setLegalModalError(getErrorMessage(err, 'Sözleşme metni yüklenemedi.'))
      })
      .finally(() => setLegalModalLoading(false))
  }

  const allConsents = LEGAL_CONSENT_GROUPS.every((g) => consentGroups[g.id])

  const expandLegalConsents = (): Record<BhLegalKey, boolean> => {
    const out = {} as Record<BhLegalKey, boolean>
    for (const group of LEGAL_CONSENT_GROUPS) {
      const accepted = consentGroups[group.id]
      for (const key of group.keys) out[key] = accepted
    }
    return out
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!authed) {
      window.location.assign(loginHref)
      return
    }

    const corporate = billing.invoiceType === 'corporate'
    if (corporate) {
      if (!billing.companyName.trim()) {
        setError('Firma / unvan zorunludur.')
        return
      }
      if (!billing.fullName.trim()) {
        setError('Yetkili ad soyad zorunludur.')
        return
      }
      const taxErr = validateTurkishTaxNumber(billing.taxNumber, true)
      if (taxErr) {
        setFieldErrors((f) => ({ ...f, taxNumber: taxErr }))
        setError(taxErr)
        return
      }
      if (!billing.taxOffice.trim()) {
        setError('Vergi dairesi zorunludur.')
        return
      }
    } else {
      if (!billing.fullName.trim()) {
        setError('Ad soyad zorunludur.')
        return
      }
      const idErr = validateTurkishIdentityNumber(billing.identityNumber)
      if (idErr) {
        setFieldErrors((f) => ({ ...f, identityNumber: idErr }))
        setError(idErr)
        return
      }
    }

    if (!billing.email.includes('@') || billing.phone.replace(/\D/g, '').length < 10) {
      setError('E-posta ve telefon zorunludur.')
      return
    }
    if (!billing.city.trim() || !billing.district.trim()) {
      setError('İl ve ilçe seçimi zorunludur.')
      return
    }
    if (billing.address.trim().length < 5) {
      setError('Fatura adresi en az 5 karakter olmalıdır.')
      return
    }
    if (!allConsents) {
      setError(
        !consentGroups.sale && !consentGroups.terms
          ? 'Devam etmek için sözleşme onaylarını işaretleyin.'
          : !consentGroups.sale
            ? 'Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi onayını işaretleyin.'
            : 'Abonelik Sözleşmesi, KVKK ve Cayma Hakkı İstisnası onayını işaretleyin.',
      )
      return
    }
    if (!quote?.valid || quote.finalPrice == null) {
      setError('Geçerli bir fiyat teklifi yok. Kampanya veya paket seçimini kontrol edin.')
      return
    }

    const legalConsents = expandLegalConsents()
    const openAddress = billing.address.trim()
    const billingInfo: Record<string, unknown> = {
      invoiceType: billing.invoiceType,
      fullName: billing.fullName.trim(),
      name: billing.fullName.trim(),
      email: billing.email.trim(),
      phone: billing.phone.trim(),
      city: billing.city.trim(),
      district: billing.district.trim(),
      openAddress,
      address: openAddress,
    }
    if (corporate) {
      billingInfo.companyName = billing.companyName.trim()
      billingInfo.taxOffice = billing.taxOffice.trim()
      billingInfo.taxNumber = sanitizeTurkishTaxNumberInput(billing.taxNumber)
    } else {
      const id = sanitizeTurkishIdentityNumberInput(billing.identityNumber)
      if (id) billingInfo.identityNumber = id
    }

    const body = {
      productType,
      product_type: productType,
      subscriptionPeriod: productType === 'annual' ? period : undefined,
      campaignId: campaignCode || undefined,
      campaign_id: campaignCode || undefined,
      campaignPublicCode: campaignCode || undefined,
      renewalToken: isRenewal ? renewalToken : undefined,
      billingInfo,
      legalConsents,
      legal_consents: legalConsents,
    }

    setSubmitting(true)
    try {
      const persistDefaultAddressIfRequested = async () => {
        if (!saveAsDefaultAddress) return
        try {
          await customersService.saveDefaultAddressFromCheckout({
            fullName: billing.fullName.trim(),
            phone: billing.phone.trim() || null,
            city: billing.city.trim(),
            district: billing.district.trim() || null,
            addressLine: openAddress,
            // TCKN kaydedilmez. Kurumsal fatura alanları destekleniyorsa eklenir.
            ...(corporate
              ? {
                  companyName: billing.companyName.trim() || null,
                  taxOffice: billing.taxOffice.trim() || null,
                  taxNumber: sanitizeTurkishTaxNumberInput(billing.taxNumber) || null,
                }
              : {
                  companyName: null,
                  taxOffice: null,
                  taxNumber: null,
                }),
          })
        } catch {
          /* ödeme başarılı; adres kaydı başarısız olsa da checkout’u bozma */
        }
      }

      if (paymentMethod === 'bank_transfer') {
        const res = await bilirkisiHesapService.createBankTransferOrder(body)
        if (!res.success) throw new Error(res.message || res.error || 'Havale siparişi oluşturulamadı.')
        await persistDefaultAddressIfRequested()
        setSuccess({
          kind: 'bank',
          merchantOid: res.merchantOid,
          bankTransfer: res.bankTransfer,
          amountFormatted: res.amountFormatted,
        })
      } else {
        const created = await bilirkisiHesapService.createCheckoutOrder(body)
        if (!created.success || !created.data?.orderNo) {
          throw new Error(created.message || 'Sipariş oluşturulamadı.')
        }
        let token: string
        try {
          token = await paymentsService.startPaytr(created.data.orderNo)
        } catch (payErr) {
          throw new Error(getErrorMessage(payErr, 'Ödeme başlatılamadı.'))
        }
        await persistDefaultAddressIfRequested()
        if (token.startsWith('dryrun_')) {
          window.location.href = `/odeme/basarili/${encodeURIComponent(created.data.orderNo)}`
          return
        }
        window.location.href = `https://www.paytr.com/odeme/guvenli/${token}`
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Ödeme başlatılamadı.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    const isDevSuccess = isDevUi() && success.kind === 'card_dry_run'
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            {success.kind === 'bank'
              ? 'Havale siparişi oluşturuldu'
              : isDevSuccess
                ? 'Ödeme tamamlandı (test)'
                : 'Ödemeniz alındı'}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {success.kind === 'bank'
              ? 'Havale bilgileri aşağıdadır. Onay sonrası lisans panoda oluşur.'
              : isDevSuccess
                ? success.fulfillmentOk
                  ? 'Local dry-run: lisans aktivasyonu tetiklendi. Panel e-postanızı kontrol edin.'
                  : 'Dry-run token alındı; fulfillment tamamlanamadı. Panel loglarını kontrol edin.'
                : isRenewal
                  ? 'Mevcut Bilirkişi Hesap lisansınız uzatılıyor. Yeni hesap oluşturulmaz.'
                  : 'Aboneliğiniz hazırlanıyor. Lisans ve giriş bilgileri e-posta adresinize iletilecektir.'}
          </p>
          {success.merchantOid ? (
            <p className="mt-3 font-mono text-xs text-slate-500">Sipariş: {success.merchantOid}</p>
          ) : null}
          {success.kind === 'bank' && success.bankTransfer ? (
            <div className="mt-4 space-y-1 rounded-2xl bg-white p-4 text-left text-sm text-slate-700">
              {Object.entries(success.bankTransfer).map(([k, v]) => (
                <p key={k}>
                  <span className="font-medium capitalize">{k}: </span>
                  {v}
                </p>
              ))}
              {success.amountFormatted ? <p className="font-semibold">Tutar: {success.amountFormatted}</p> : null}
            </div>
          ) : null}
          <Link
            to={`/yazilimlar/${BILIRKISI_HESAP_SLUG}`}
            className="mt-6 inline-flex rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Ürün sayfasına dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10 lg:py-12">
      <div className="mb-6 lg:mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Bilirkişi Hesap</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {isDemoUpgrade ? 'Demo aboneliğinizi satın alın' : isPaidRenewal ? 'Aboneliğinizi Uzatın' : 'Satın al'}
        </h1>
        {isDemoUpgrade ? (
          <p className="mt-2 text-sm text-slate-600">
            Ödeme sonrası mevcut demo lisansınız ücretli aboneliğe dönüşür; kalan demo süresi satın alınan süreye eklenir.
            Yeni Bilirkişi Hesap hesabı oluşturulmaz.
          </p>
        ) : isPaidRenewal ? (
          <p className="mt-2 text-sm text-slate-600">
            Ödeme sonrası mevcut lisansınız uzatılır; yeni hesap veya bağımsız lisans oluşturulmaz.
          </p>
        ) : isDevUi() ? (
          <p className="mt-2 text-sm text-slate-500">
            Fiyat Bilirkişi Hesap satış motorundan gelir. Ödeme local ortamda dry-run ile çalışır.
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-600">Abonelik paketini seçin, fatura bilgilerinizi tamamlayın ve ödemeye geçin.</p>
        )}
      </div>

      {isRenewal && renewalContext ? (
        <div className="mb-5 rounded-2xl border border-sky-200 bg-sky-50/80 px-4 py-3.5 text-sm text-slate-800 sm:px-5">
          <p className="font-semibold text-sky-900">
            {isDemoUpgrade ? 'Demo yükseltme oturumu' : 'Yenileme oturumu'}
          </p>
          <dl className="mt-2 grid gap-1.5 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Hesap</dt>
              <dd>{renewalContext.maskedEmail || renewalContext.maskedName || '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {isDemoUpgrade ? 'Mevcut lisans' : 'Mevcut paket'}
              </dt>
              <dd>
                {isDemoUpgrade
                  ? 'Demo'
                  : formatRenewalPackageLabel(renewalContext.currentPackage)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {isDemoUpgrade ? 'Demo bitiş' : 'Mevcut bitiş'}
              </dt>
              <dd>{formatRenewalEndDate(renewalContext.subscriptionEndsAt)}</dd>
            </div>
            {renewalContext.barAssociationName ? (
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Bağlı baro</dt>
                <dd>{renewalContext.barAssociationName}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}

      {campaignBanner ? (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-amber-950 sm:px-5">
          <p className="font-bold text-amber-950">{campaignBanner.title}</p>
          {campaignBanner.subtitle ? (
            <p className="mt-1 text-sm text-amber-900/90">{campaignBanner.subtitle}</p>
          ) : null}
        </div>
      ) : null}

      {productError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{productError}</div>
      ) : (
        <form onSubmit={submit} className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8 xl:gap-10">
          {/* SOL: Auth (guest) veya fatura (authed) */}
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 lg:p-6">
            {authed ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-slate-900">Fatura / müşteri bilgileri</h2>
                  {!prefillDone ? (
                    <p className="flex items-center gap-2 text-xs text-slate-500">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Profil yükleniyor…
                    </p>
                  ) : null}
                </div>

                <div>
                  <p className={fieldLabelCls}>Fatura tipi</p>
                  <div className="mt-1.5 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                    <button
                      type="button"
                      onClick={() => setInvoiceType('individual')}
                      className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition ${
                        billing.invoiceType === 'individual'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Bireysel
                    </button>
                    <button
                      type="button"
                      onClick={() => setInvoiceType('corporate')}
                      className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition ${
                        billing.invoiceType === 'corporate'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Kurumsal
                    </button>
                  </div>
                </div>

                <div className="grid items-start gap-x-3 gap-y-3 sm:grid-cols-2">
                  {billing.invoiceType === 'individual' ? (
                    <>
                      <Input
                        label="Ad Soyad"
                        value={billing.fullName}
                        onChange={(e) => setBilling((b) => ({ ...b, fullName: e.target.value }))}
                        required
                        autoComplete="name"
                      />
                      <Input
                        label="T.C. Kimlik No (opsiyonel)"
                        inputMode="numeric"
                        autoComplete="off"
                        maxLength={11}
                        value={billing.identityNumber}
                        onChange={(e) => {
                          const identityNumber = sanitizeTurkishIdentityNumberInput(e.target.value)
                          setBilling((b) => ({ ...b, identityNumber }))
                          setFieldErrors((f) => ({
                            ...f,
                            identityNumber: validateTurkishIdentityNumber(identityNumber) ?? undefined,
                          }))
                        }}
                        error={fieldErrors.identityNumber}
                      />
                    </>
                  ) : (
                    <>
                      <Input
                        label="Firma / Unvan"
                        value={billing.companyName}
                        onChange={(e) => setBilling((b) => ({ ...b, companyName: e.target.value }))}
                        required
                        autoComplete="organization"
                      />
                      <Input
                        label="Yetkili Ad Soyad"
                        value={billing.fullName}
                        onChange={(e) => setBilling((b) => ({ ...b, fullName: e.target.value }))}
                        required
                        autoComplete="name"
                      />
                      <Input
                        label="Vergi Numarası"
                        inputMode="numeric"
                        autoComplete="off"
                        maxLength={10}
                        value={billing.taxNumber}
                        onChange={(e) => {
                          const taxNumber = sanitizeTurkishTaxNumberInput(e.target.value)
                          setBilling((b) => ({ ...b, taxNumber }))
                          setFieldErrors((f) => ({
                            ...f,
                            taxNumber: validateTurkishTaxNumber(taxNumber, true) ?? undefined,
                          }))
                        }}
                        error={fieldErrors.taxNumber}
                        required
                      />
                      <Input
                        label="Vergi Dairesi"
                        value={billing.taxOffice}
                        onChange={(e) => setBilling((b) => ({ ...b, taxOffice: e.target.value }))}
                        required
                      />
                    </>
                  )}

                  <Input
                    label="E-posta"
                    type="email"
                    value={billing.email}
                    readOnly
                    required
                    autoComplete="email"
                    title="Woontegra hesabınızdan alınır"
                  />
                  <Input
                    label="Telefon"
                    value={billing.phone}
                    onChange={(e) => setBilling((b) => ({ ...b, phone: e.target.value }))}
                    required
                    autoComplete="tel"
                  />

                  <TurkeyCityDistrictFields
                    idPrefix="bh-checkout"
                    city={billing.city}
                    district={billing.district}
                    onCityChange={(city) => setBilling((b) => ({ ...b, city }))}
                    onDistrictChange={(district) => setBilling((b) => ({ ...b, district }))}
                    selectClassName={checkoutSelectCls}
                  />

                  <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="bh-checkout-invoice-address" className={fieldLabelCls}>
                      Fatura Adresi
                    </label>
                    <textarea
                      id="bh-checkout-invoice-address"
                      value={billing.address}
                      onChange={(e) => setBilling((b) => ({ ...b, address: e.target.value }))}
                      required
                      rows={3}
                      autoComplete="street-address"
                      className={textareaCls}
                    />
                    <label className="mt-1 flex cursor-pointer items-start gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        className="mt-0.5 rounded border-slate-300"
                        checked={saveAsDefaultAddress}
                        onChange={(e) => setSaveAsDefaultAddress(e.target.checked)}
                      />
                      <span>Bu adresi varsayılan fatura adresim olarak kaydet</span>
                    </label>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-sky-100 bg-sky-50/70 px-4 py-5 sm:px-5">
                <h2 className="text-base font-semibold text-slate-900">
                  {isRenewal
                    ? 'Aboneliğinizi uzatmak için hesabınıza giriş yapın'
                    : 'Satın almaya devam etmek için hesabınıza giriş yapın'}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {isRenewal
                    ? 'Ödeme Woontegra hesabınız üzerinden alınır; Bilirkişi Hesap lisansınız aynı kullanıcıda uzatılır.'
                    : 'Siparişiniz ve lisans bilgileriniz Woontegra hesabınızla ilişkilendirilecektir.'}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to={loginHref}
                    className="inline-flex rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    to={registerHref}
                    className="inline-flex rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    Hesap Oluştur
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* SAĞ: Özet + ödeme (sticky desktop) — guest ve authed aynı görünüm */}
          <div className="mt-6 space-y-4 lg:sticky lg:top-24 lg:mt-0">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-slate-900">
                {isRenewal ? 'Uzatma paketi' : 'Abonelik paketi'}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {isRenewal
                  ? 'Seçtiğiniz süre, mevcut lisans bitiş tarihine eklenir.'
                  : 'Aylık ve yıllık birbirinden bağımsız iki pakettir.'}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => selectPlan('monthly')}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    productType === 'monthly'
                      ? 'border-sky-500 bg-sky-50 ring-1 ring-sky-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Profesyonel Aylık
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-950">
                    {isRenewal && renewalContext?.monthlyPriceTl != null
                      ? formatBhPriceTl(renewalContext.monthlyPriceTl)
                      : product?.priceMonthly != null
                        ? formatBhPriceTl(product.priceMonthly / 100)
                        : '—'}
                    <span className="ml-1 text-xs font-semibold text-slate-500">/ ay</span>
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => selectPlan('annual')}
                  className={`relative rounded-xl border px-3 py-3 text-left transition ${
                    productType === 'annual'
                      ? 'border-sky-500 bg-sky-50 ring-1 ring-sky-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="absolute right-2 top-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-700">
                    Avantajlı
                  </span>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Profesyonel Yıllık
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-950">
                    {isRenewal && renewalContext?.annualPriceTl != null
                      ? formatBhPriceTl(renewalContext.annualPriceTl)
                      : product?.price != null
                        ? formatBhPriceTl(product.price / 100)
                        : '—'}
                    <span className="ml-1 text-xs font-semibold text-slate-500">/ yıl</span>
                  </p>
                </button>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Ödenecek toplam</p>
                {quoteLoading ? (
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                    <Loader2 className="h-4 w-4 animate-spin" /> Hesaplanıyor…
                  </p>
                ) : quote?.valid && quote.finalPrice != null ? (
                  <div className="mt-1">
                    <p className="text-2xl font-bold text-slate-950">
                      {formatBhPriceTl(quote.finalPrice)}
                      <span className="ml-1 text-sm font-semibold text-slate-500">
                        {productType === 'monthly' ? '/ ay' : '/ yıl'}
                      </span>
                    </p>
                    {quote.normalPrice != null && quote.normalPrice > quote.finalPrice ? (
                      <p className="text-sm text-slate-500 line-through">
                        {formatBhPriceTl(quote.normalPrice)}
                        {productType === 'monthly' ? ' / ay' : ' / yıl'}
                      </p>
                    ) : null}
                    {quote.campaign?.discountRate != null ? (
                      <p className="mt-0.5 text-sm font-medium text-emerald-700">
                        %{quote.campaign.discountRate} indirim
                        {campaignFacingTitle ? ` · ${campaignFacingTitle}` : ''}
                      </p>
                    ) : campaignFacingTitle ? (
                      <p className="mt-0.5 text-sm text-emerald-700">{campaignFacingTitle}</p>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-rose-700">{bhQuoteInvalidMessage(quote?.reason)}</p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-slate-900">Ödeme yöntemi</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                    paymentMethod === 'card' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Kart (PayTR)
                </button>
                {bankAvailable ? (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                      paymentMethod === 'bank_transfer' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Havale / EFT
                  </button>
                ) : null}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <ShieldCheck className="h-4 w-4 text-sky-600" /> Sözleşmeler
              </h2>
              <div className="space-y-2.5">
                <label
                  className={`flex items-start gap-2.5 text-xs leading-snug text-slate-700 sm:text-sm ${
                    !authed ? 'cursor-default opacity-80' : 'cursor-pointer'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 shrink-0"
                    checked={consentGroups.sale}
                    disabled={!authed}
                    onChange={(e) => setConsentGroups((c) => ({ ...c, sale: e.target.checked }))}
                  />
                  <span>
                    <LegalModalLink onClick={() => openLegalModal('PRE_INFORMATION')}>
                      Ön Bilgilendirme Formu
                    </LegalModalLink>
                    {' ve '}
                    <LegalModalLink onClick={() => openLegalModal('DISTANCE_SALE')}>
                      Mesafeli Satış Sözleşmesi
                    </LegalModalLink>
                    {"'ni okudum ve kabul ediyorum."}
                  </span>
                </label>

                <label
                  className={`flex items-start gap-2.5 text-xs leading-snug text-slate-700 sm:text-sm ${
                    !authed ? 'cursor-default opacity-80' : 'cursor-pointer'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 shrink-0"
                    checked={consentGroups.terms}
                    disabled={!authed}
                    onChange={(e) => setConsentGroups((c) => ({ ...c, terms: e.target.checked }))}
                  />
                  <span>
                    <LegalModalLink onClick={() => openLegalModal('SUBSCRIPTION_AGREEMENT')}>
                      Abonelik Sözleşmesi
                    </LegalModalLink>
                    {', '}
                    <LegalModalLink onClick={() => openLegalModal('KVKK')}>
                      KVKK Aydınlatma Metni
                    </LegalModalLink>
                    {' ve '}
                    <LegalModalLink onClick={() => openLegalModal('WITHDRAWAL_EXCEPTION')}>
                      Cayma Hakkı İstisnası
                    </LegalModalLink>
                    {"'nı okudum ve kabul ediyorum."}
                  </span>
                </label>
              </div>
            </section>

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            {authed ? (
              <Button
                type="submit"
                className="w-full"
                disabled={submitting || !quote?.valid || Boolean(productError)}
              >
                {submitting
                  ? 'İşleniyor…'
                  : paymentMethod === 'bank_transfer'
                    ? 'Havale siparişi oluştur'
                    : 'Ödemeye Geç'}
              </Button>
            ) : (
              <Link
                to={loginHref}
                className="flex w-full items-center justify-center rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700"
              >
                Giriş Yaparak Devam Et
              </Link>
            )}
          </div>
        </form>
      )}

      <CheckoutLegalModal
        open={legalModalKey != null}
        title={legalModalTitle}
        onClose={() => setLegalModalKey(null)}
        showReadAndClose={false}
      >
        {legalModalLoading ? (
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" /> Belge yükleniyor…
          </p>
        ) : legalModalError ? (
          <p className="text-sm text-rose-600">{legalModalError}</p>
        ) : legalModalHtml ? (
          <div
            className="prose prose-sm max-w-none text-slate-800 prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: legalModalHtml }}
          />
        ) : null}
      </CheckoutLegalModal>
    </div>
  )
}

export default BilirkisiCheckoutPage
