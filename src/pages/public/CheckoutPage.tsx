import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CreditCard, KeyRound, Lock, ShieldCheck } from 'lucide-react'
import { PaytrIframe } from '@/components/payment/PaymentPanels'
import { BillingIdentityNumberField } from '@/components/checkout/BillingIdentityNumberField'
import { LegalConsentCheckbox, LegalExternalLink, LegalModalLink } from '@/components/checkout/LegalConsentCheckbox'
import { CheckoutLegalModal } from '@/components/checkout/CheckoutLegalModal'
import { CheckoutLegalPreviewBody } from '@/components/checkout/CheckoutLegalPreviewBody'
import { buildCheckoutLegalPreviewVariables } from '@/lib/buildCheckoutLegalPreviewVars'
import type { LegalDocType } from '@/types/legalDocuments'
import { TurkeyCityDistrictFields, checkoutSelectCls } from '@/components/checkout/TurkeyCityDistrictFields'
import { LoadingState } from '@/components/public/LoadingState'
import { Input } from '@/components/ui/Input'
import { CENTRAL_LICENSE_PUBLIC_MESSAGE } from '@/constants/centralLicenseServer'
import { useCustomerSession } from '@/hooks/useCustomerSession'
import { usePageMeta } from '@/hooks/usePageMeta'
import { trackInitiateCheckout } from '@/integrations/trackingEvents'
import { mergeCartWithPreview, mergedRowIsSingleQuantity } from '@/lib/cartMerge'
import {
  alignCartLinesToCanonicalProductIds,
  clearCart,
  readCart,
  writeCart,
  type CartLine,
} from '@/lib/cartStorage'
import { matchDistrictName, matchProvinceName } from '@/data/turkeyLocation'
import { isMuvekkilKasaSaasProduct, SAAS_LOGIN_REQUIRED_MESSAGE } from '@/lib/muvekkilKasaSaasProduct'
import { checkoutService } from '@/services/checkoutService'
import { customersService } from '@/services/customersService'
import { getErrorMessage } from '@/api/client'
import { ordersService } from '@/services/ordersService'
import { paymentsService } from '@/services/paymentsService'
import { LAST_ORDER_EMAIL_KEY, MK_SAAS_CHECKOUT_ORDER_KEY } from '@/types/orderSuccess'
import type { CustomerAddress } from '@/types/customerAddress'
import { formatMoney } from '@/utils/formatMoney'
import { resolveCheckoutTaxNumber, validateCheckoutBilling } from '@/utils/checkoutBilling'
import { checkoutLegalConsentsOk, resolveOrderLegalConsentFlags } from '@/utils/orderLegalRequirements'
import { isSaasSubscriptionProduct } from '@/utils/productPurchase'
import { legalTypeToPublicHref } from '@/lib/legalSlugs'
import {
  checkoutFormMatchesAddress,
  defaultSaveAddressChecked,
  shouldOfferSaveAddressToBook,
} from '@/lib/checkoutAddressBook'
import { useToastStore } from '@/store/toastStore'

const LEGAL = {
  pre: legalTypeToPublicHref('PRE_INFORMATION'),
  distance: legalTypeToPublicHref('DISTANCE_SALES'),
  kvkk: legalTypeToPublicHref('KVKK_CLARIFICATION'),
  privacy: legalTypeToPublicHref('PRIVACY_POLICY'),
  softwareLicense: legalTypeToPublicHref('SOFTWARE_LICENSE'),
  saasSubscription: legalTypeToPublicHref('SAAS_SUBSCRIPTION'),
  digitalWaiver: legalTypeToPublicHref('DIGITAL_IMMEDIATE_DELIVERY_WAIVER'),
  commercial: legalTypeToPublicHref('COMMERCIAL_ELECTRONIC_MESSAGE'),
  explicit: legalTypeToPublicHref('EXPLICIT_CONSENT'),
} as const

type CheckoutLegalModalId =
  | 'PRE_INFO'
  | 'DISTANCE'
  | 'KVKK'
  | 'SOFTWARE_LICENSE'
  | 'SAAS_SUBSCRIPTION'
  | 'DIGITAL_PRODUCT_WAIVER'
  | 'DIGITAL_SERVICE_WAIVER'
  | 'COMMERCIAL'
  | 'EXPLICIT'

const LEGAL_MODAL_TITLES: Record<CheckoutLegalModalId, string> = {
  PRE_INFO: 'Ön Bilgilendirme Formu',
  DISTANCE: 'Mesafeli Satış / Hizmet Sözleşmesi',
  KVKK: 'KVKK Aydınlatma Metni',
  SOFTWARE_LICENSE: 'Yazılım Lisans ve Kullanım Sözleşmesi',
  SAAS_SUBSCRIPTION: 'SaaS Abonelik ve Kullanım Koşulları',
  DIGITAL_PRODUCT_WAIVER: 'Dijital Ürün — Cayma Hakkı İstisnası Onayı',
  DIGITAL_SERVICE_WAIVER: 'Dijital Hizmetin İfasına Başlanması ve Cayma Hakkı Bilgilendirmesi',
  COMMERCIAL: 'Ticari Elektronik İleti İzni',
  EXPLICIT: 'Açık Rıza Metni',
}

const LEGAL_MODAL_PREVIEW: Record<
  CheckoutLegalModalId,
  { type: LegalDocType; variant?: 'DOWNLOAD' | 'SAAS' }
> = {
  PRE_INFO: { type: 'PRE_INFORMATION' },
  DISTANCE: { type: 'DISTANCE_SALES' },
  KVKK: { type: 'KVKK_CLARIFICATION' },
  SOFTWARE_LICENSE: { type: 'SOFTWARE_LICENSE' },
  SAAS_SUBSCRIPTION: { type: 'SAAS_SUBSCRIPTION' },
  DIGITAL_PRODUCT_WAIVER: { type: 'DIGITAL_IMMEDIATE_DELIVERY_WAIVER', variant: 'DOWNLOAD' },
  DIGITAL_SERVICE_WAIVER: { type: 'DIGITAL_IMMEDIATE_DELIVERY_WAIVER', variant: 'SAAS' },
  COMMERCIAL: { type: 'COMMERCIAL_ELECTRONIC_MESSAGE' },
  EXPLICIT: { type: 'EXPLICIT_CONSENT' },
}

type CheckoutFormState = {
  customerName: string
  customerEmail: string
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

function mergeAddressIntoCheckoutForm(base: CheckoutFormState, addr: CustomerAddress): CheckoutFormState {
  const hasCompany = Boolean(addr.companyName?.trim())
  const tax = addr.taxNumber?.trim() ?? ''
  return {
    ...base,
    customerName: addr.fullName.trim() || base.customerName,
    customerPhone: addr.phone?.trim() || base.customerPhone,
    companyName: addr.companyName?.trim() ?? '',
    taxOffice: addr.taxOffice?.trim() ?? '',
    taxNumber: hasCompany ? tax : '',
    identityNumber: hasCompany ? '' : tax,
    deliveryCity: addr.city,
    deliveryDistrict: addr.district ?? '',
    deliveryLine: addr.addressLine,
    billingType: hasCompany ? 'Kurumsal' : 'Bireysel',
  }
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const toast = useToastStore((s) => s.show)
  const { authed } = useCustomerSession()
  const [lines, setLines] = useState<CartLine[]>(() => readCart())
  const productIds = useMemo(() => lines.map((l) => l.productId), [lines])

  usePageMeta({ title: 'Ödeme', description: 'Güvenli ödeme adımı.' })

  useEffect(() => {
    const sync = () => setLines(readCart())
    sync()
    window.addEventListener('woontegra-cart', sync)
    return () => window.removeEventListener('woontegra-cart', sync)
  }, [])

  const previewQuery = useQuery({
    queryKey: ['checkout', 'cart-preview', productIds.join(',')],
    queryFn: () => checkoutService.cartPreview(productIds),
    enabled: productIds.length > 0,
  })

  useEffect(() => {
    if (!previewQuery.data?.length) return
    setLines((prev) => {
      const aligned = alignCartLinesToCanonicalProductIds(prev, previewQuery.data!)
      const changed = aligned.some((l, i) => l.productId !== prev[i]?.productId)
      if (changed) {
        writeCart(aligned)
        Promise.resolve().then(() => window.dispatchEvent(new Event('woontegra-cart')))
        return aligned
      }
      return prev
    })
  }, [previewQuery.data])

  const merged = useMemo(
    () => mergeCartWithPreview(lines, previewQuery.data ?? []),
    [lines, previewQuery.data],
  )

  const grand = merged.reduce((s, m) => s + m.lineTotal, 0)
  const currency = merged[0]?.currency || 'TRY'

  useEffect(() => {
    if (merged.length === 0) return
    trackInitiateCheckout({ value: grand, currency, itemCount: merged.length })
  }, [merged.length, grand, currency])

  const legalFlags = useMemo(
    () => resolveOrderLegalConsentFlags(merged.map((m) => m.productType)),
    [merged],
  )

  const cartHasMkSaas = useMemo(
    () => merged.some((m) => isMuvekkilKasaSaasProduct({ slug: m.slug, productType: m.productType })),
    [merged],
  )
  const saasLoginRequired = cartHasMkSaas && !authed

  const [form, setForm] = useState<CheckoutFormState>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    billingType: '' as '' | 'Bireysel' | 'Kurumsal',
    companyName: '',
    taxOffice: '',
    taxNumber: '',
    identityNumber: '',
    deliveryCity: '',
    deliveryDistrict: '',
    deliveryLine: '',
  })
  const [prefilled, setPrefilled] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [saveToAddressBook, setSaveToAddressBook] = useState(false)

  useEffect(() => {
    if (prefilled || !authed) return
    let cancelled = false
    void (async () => {
      try {
        const me = await customersService.getMe()
        const addresses = await customersService.listAddresses()
        if (cancelled) return
        setSavedAddresses(addresses)
        const profileBase: CheckoutFormState = {
          customerName: me.name || '',
          customerEmail: me.email || '',
          customerPhone: me.phone?.trim() || '',
          billingType: '',
          companyName: '',
          taxOffice: '',
          taxNumber: '',
          identityNumber: '',
          deliveryCity: '',
          deliveryDistrict: '',
          deliveryLine: '',
        }
        const preferred = addresses.find((a) => a.isDefault) ?? addresses[0]
        if (preferred) {
          setSelectedAddressId(preferred.id)
          setForm(mergeAddressIntoCheckoutForm(profileBase, preferred))
        } else {
          setForm(profileBase)
        }
        setSaveToAddressBook(defaultSaveAddressChecked({ authed: true, savedAddresses: addresses }))
        setPrefilled(true)
      } catch {
        if (!cancelled) setPrefilled(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [authed, prefilled])

  const offerSaveToBook = useMemo(
    () =>
      shouldOfferSaveAddressToBook({
        authed,
        savedAddresses,
        selectedAddressId,
        form,
      }),
    [authed, savedAddresses, selectedAddressId, form],
  )

  useEffect(() => {
    if (!authed) {
      setSaveToAddressBook(false)
      return
    }
    if (!offerSaveToBook) {
      setSaveToAddressBook(false)
    } else if (savedAddresses.length === 0) {
      setSaveToAddressBook(true)
    }
  }, [authed, offerSaveToBook, savedAddresses.length])

  useEffect(() => {
    if (!selectedAddressId) return
    const selected = savedAddresses.find((a) => a.id === selectedAddressId)
    if (selected && !checkoutFormMatchesAddress(form, selected)) {
      setSelectedAddressId(null)
      setSaveToAddressBook(true)
    }
  }, [form, selectedAddressId, savedAddresses])

  const onSavedAddressSelect = (value: string) => {
    if (!value) {
      setSelectedAddressId(null)
      setSaveToAddressBook(true)
      return
    }
    const addr = savedAddresses.find((a) => a.id === value)
    if (!addr) return
    setSelectedAddressId(addr.id)
    setForm((current) => mergeAddressIntoCheckoutForm(current, addr))
    setSaveToAddressBook(false)
  }

  const [paymentMethod, setPaymentMethod] = useState<'PAYTR' | 'BANK_TRANSFER'>('PAYTR')
  const [acceptPre, setAcceptPre] = useState(false)
  const [acceptDistance, setAcceptDistance] = useState(false)
  const [acceptKvkk, setAcceptKvkk] = useState(false)
  const [acceptSoftwareLicense, setAcceptSoftwareLicense] = useState(false)
  const [acceptSaasSubscription, setAcceptSaasSubscription] = useState(false)
  const [acceptDigitalProductWaiver, setAcceptDigitalProductWaiver] = useState(false)
  const [acceptDigitalServiceWaiver, setAcceptDigitalServiceWaiver] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [explicitConsent, setExplicitConsent] = useState(false)
  const [legalModal, setLegalModal] = useState<CheckoutLegalModalId | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [identityNumberError, setIdentityNumberError] = useState<string | null>(null)
  const [iframeToken, setIframeToken] = useState<string | null>(null)
  const [orderNo, setOrderNo] = useState<string | null>(null)
  const [checkoutSuccessOrderNo, setCheckoutSuccessOrderNo] = useState<string | null>(null)

  const bankQuery = useQuery({
    queryKey: ['payments', 'bank-transfer-display'],
    queryFn: () => paymentsService.getBankTransferDisplay(),
  })

  const havaleEnabled = bankQuery.data?.bankTransferEnabled === true

  useEffect(() => {
    if (!havaleEnabled && paymentMethod === 'BANK_TRANSFER') {
      setPaymentMethod('PAYTR')
    }
  }, [havaleEnabled, paymentMethod])

  const legalOk = checkoutLegalConsentsOk(legalFlags, {
    pre: acceptPre,
    distance: acceptDistance,
    kvkk: acceptKvkk,
    softwareLicense: acceptSoftwareLicense,
    saasSubscription: acceptSaasSubscription,
    digitalProductWaiver: acceptDigitalProductWaiver,
    digitalServiceWaiver: acceptDigitalServiceWaiver,
  })

  const legalPreviewVariables = useMemo(
    () =>
      buildCheckoutLegalPreviewVariables({
        form: {
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone,
          billingType: form.billingType,
          companyName: form.companyName,
          taxOffice: form.taxOffice,
          taxNumber: form.taxNumber,
          identityNumber: form.identityNumber,
          deliveryCity: form.deliveryCity,
          deliveryDistrict: form.deliveryDistrict,
          deliveryLine: form.deliveryLine,
        },
        merged,
        grand,
        currency,
      }),
    [form, merged, grand, currency],
  )

  const legalModalAccept: Record<CheckoutLegalModalId, () => void> = {
    PRE_INFO: () => setAcceptPre(true),
    DISTANCE: () => setAcceptDistance(true),
    KVKK: () => setAcceptKvkk(true),
    SOFTWARE_LICENSE: () => setAcceptSoftwareLicense(true),
    SAAS_SUBSCRIPTION: () => setAcceptSaasSubscription(true),
    DIGITAL_PRODUCT_WAIVER: () => setAcceptDigitalProductWaiver(true),
    DIGITAL_SERVICE_WAIVER: () => setAcceptDigitalServiceWaiver(true),
    COMMERCIAL: () => setMarketingConsent(true),
    EXPLICIT: () => setExplicitConsent(true),
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (lines.length === 0 || merged.length === 0) return
    if (saasLoginRequired) {
      setFormError(SAAS_LOGIN_REQUIRED_MESSAGE)
      return
    }
    if (!form.customerName.trim() || !form.customerEmail.trim()) {
      setFormError('Ad soyad ve e-posta zorunludur.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail.trim())) {
      setFormError('Geçerli bir e-posta adresi girin.')
      return
    }
    const billingErr = validateCheckoutBilling(form)
    if (billingErr) {
      setIdentityNumberError(billingErr)
      setFormError(billingErr)
      return
    }
    if (!legalOk) {
      setFormError('Devam etmek için zorunlu sözleşme onaylarını işaretleyin.')
      return
    }
    if (paymentMethod === 'BANK_TRANSFER' && !havaleEnabled) {
      setFormError('Havale/EFT şu anda kullanılamıyor.')
      return
    }

    setSubmitting(true)
    setFormError(null)
    try {
      const created = await ordersService.create({
        items: merged.map((m) => ({ productId: m.id, quantity: m.quantity })),
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        customerPhone: form.customerPhone.trim() || undefined,
        billingType: form.billingType || undefined,
        companyName: form.companyName.trim() || undefined,
        taxOffice: form.taxOffice.trim() || undefined,
        taxNumber: resolveCheckoutTaxNumber(form),
        identityNumber: form.billingType === 'Bireysel' ? form.identityNumber.trim() || undefined : undefined,
        deliveryCity: matchProvinceName(form.deliveryCity) || form.deliveryCity.trim() || undefined,
        deliveryDistrict:
          matchDistrictName(form.deliveryCity, form.deliveryDistrict) ||
          form.deliveryDistrict.trim() ||
          undefined,
        deliveryLine: form.deliveryLine.trim() || undefined,
        acceptPreInfo: acceptPre,
        acceptDistanceSales: acceptDistance,
        acceptKvkk: acceptKvkk,
        acceptSoftwareLicense: legalFlags.needsSoftwareLicense ? acceptSoftwareLicense : undefined,
        acceptSaasSubscription: legalFlags.needsSaasSubscription ? acceptSaasSubscription : undefined,
        acceptDigitalProductWaiver: legalFlags.needsDigitalProductWaiver ? acceptDigitalProductWaiver : undefined,
        acceptDigitalServiceWaiver: legalFlags.needsDigitalServiceWaiver ? acceptDigitalServiceWaiver : undefined,
        marketingConsent,
        explicitConsent,
        paymentMethod,
        saveToAddressBook: authed && offerSaveToBook && saveToAddressBook,
        selectedAddressId: selectedAddressId || undefined,
      })

      if (created.addressBookWarning) {
        toast(created.addressBookWarning, 'error')
      }

      sessionStorage.setItem(LAST_ORDER_EMAIL_KEY, form.customerEmail.trim().toLowerCase())
      if (cartHasMkSaas) {
        sessionStorage.setItem(MK_SAAS_CHECKOUT_ORDER_KEY, created.orderNo)
      }

      if (paymentMethod === 'BANK_TRANSFER' || created.paymentProvider === 'BANK_TRANSFER') {
        setCheckoutSuccessOrderNo(created.orderNo)
        navigate(`/odeme/basarili/${encodeURIComponent(created.orderNo)}`)
        clearCart()
        return
      }

      setOrderNo(created.orderNo)
      const token = await paymentsService.startPaytr(created.orderNo)
      setIframeToken(token)
    } catch (err) {
      setFormError(getErrorMessage(err, 'Sipariş veya ödeme başlatılamadı'))
    } finally {
      setSubmitting(false)
    }
  }

  if (checkoutSuccessOrderNo) {
    return <Navigate to={`/odeme/basarili/${encodeURIComponent(checkoutSuccessOrderNo)}`} replace />
  }

  if (lines.length === 0) {
    return <Navigate to="/sepet" replace />
  }

  if (iframeToken && orderNo) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
        <PaytrIframe orderNo={orderNo} token={iframeToken} />
      </div>
    )
  }

  const hasLicenseProduct = merged.some((m) => m.licenseRequired)

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="border-b border-slate-200/90 pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Güvenli ödeme</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Ödeme</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Bilgilerinizi kontrol edin, yasal onayları tamamlayın ve güvenli ödeme adımına geçin.
        </p>
      </header>

      <div className="mb-6 mt-6 flex items-center gap-2 text-sm text-slate-500">
        <Lock className="h-4 w-4 shrink-0" aria-hidden />
        Kart bilgileriniz PayTR altyapısında şifreli olarak işlenir.
      </div>

      {formError ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {formError}
        </div>
      ) : null}

      {saasLoginRequired ? (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="status">
          {SAAS_LOGIN_REQUIRED_MESSAGE}{' '}
          <Link to={`/giris?return=${encodeURIComponent('/odeme')}`} className="font-semibold text-emerald-700 underline">
            Giriş yapın
          </Link>{' '}
          veya{' '}
          <Link to={`/kayit?return=${encodeURIComponent('/odeme')}`} className="font-semibold text-emerald-700 underline">
            kayıt olun
          </Link>
          .
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start">
        <form className="min-w-0 space-y-6" onSubmit={(e) => void handleSubmit(e)}>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-lg font-semibold text-slate-900">Müşteri bilgileri</h2>
            {!authed ? (
              saasLoginRequired ? null : (
                <p className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  Hesabınız var mı?{' '}
                  <Link
                    to={`/giris?return=${encodeURIComponent('/odeme')}`}
                    className="font-semibold text-emerald-700 underline"
                  >
                    Giriş yapın
                  </Link>
                  . Üye olmadan da devam edebilirsiniz.
                </p>
              )
            ) : (
              <p className="mt-3 text-sm text-slate-600">Hesabınıza kayıtlı bilgiler otomatik dolduruldu.</p>
            )}
            {authed && savedAddresses.length > 0 ? (
              <div className="mt-4 space-y-1.5">
                <label htmlFor="checkout-saved-address" className="block text-sm font-medium text-slate-700">
                  Kayıtlı adres
                </label>
                <select
                  id="checkout-saved-address"
                  value={selectedAddressId ?? ''}
                  onChange={(e) => onSavedAddressSelect(e.target.value)}
                  className={checkoutSelectCls}
                >
                  <option value="">Yeni adres gir</option>
                  {savedAddresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                      {addr.title}
                      {addr.isDefault ? ' (varsayılan)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Input
                label="Ad soyad *"
                value={form.customerName}
                onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                required
              />
              <Input
                label="E-posta *"
                type="email"
                value={form.customerEmail}
                onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
                required
              />
              <Input
                label="Telefon"
                value={form.customerPhone}
                onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Fatura tipi</label>
                <select
                  value={form.billingType}
                  onChange={(e) => {
                    const billingType = e.target.value as '' | 'Bireysel' | 'Kurumsal'
                    setForm((f) => ({
                      ...f,
                      billingType,
                      ...(billingType === 'Kurumsal' ? { identityNumber: '' } : {}),
                      ...(billingType === 'Bireysel' ? { companyName: '', taxOffice: '', taxNumber: '' } : {}),
                    }))
                    setIdentityNumberError(null)
                  }}
                  className={checkoutSelectCls}
                >
                  <option value="">Seçin</option>
                  <option value="Bireysel">Bireysel</option>
                  <option value="Kurumsal">Kurumsal</option>
                </select>
              </div>
            </div>
            {form.billingType === 'Bireysel' ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <BillingIdentityNumberField
                  value={form.identityNumber}
                  onChange={(identityNumber) => setForm((f) => ({ ...f, identityNumber }))}
                  error={identityNumberError}
                  onErrorChange={setIdentityNumberError}
                />
              </div>
            ) : null}
            {form.billingType === 'Kurumsal' ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Input label="Firma adı" value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} />
                <Input label="Vergi dairesi" value={form.taxOffice} onChange={(e) => setForm((f) => ({ ...f, taxOffice: e.target.value }))} />
                <Input label="Vergi no" value={form.taxNumber} onChange={(e) => setForm((f) => ({ ...f, taxNumber: e.target.value }))} />
              </div>
            ) : null}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <TurkeyCityDistrictFields
                idPrefix="checkout"
                city={form.deliveryCity}
                district={form.deliveryDistrict}
                onCityChange={(deliveryCity) => setForm((f) => ({ ...f, deliveryCity }))}
                onDistrictChange={(deliveryDistrict) => setForm((f) => ({ ...f, deliveryDistrict }))}
              />
            </div>
            <Input
              className="mt-4"
              label="Adres"
              value={form.deliveryLine}
              onChange={(e) => setForm((f) => ({ ...f, deliveryLine: e.target.value }))}
            />
            {authed && offerSaveToBook ? (
              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3.5">
                <input
                  type="checkbox"
                  checked={saveToAddressBook}
                  onChange={(e) => setSaveToAddressBook(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-900">Bu adresi adres defterime kaydet</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-slate-600">
                    Sonraki siparişlerinizde bu adresi hızlıca seçebilirsiniz.
                  </span>
                </span>
              </label>
            ) : null}
            {!authed && !saasLoginRequired ? (
              <p className="mt-5 text-xs leading-relaxed text-slate-500">
                Adres kaydetmek için{' '}
                <Link to={`/giris?return=${encodeURIComponent('/odeme')}`} className="font-semibold text-emerald-700 underline">
                  giriş yapmalısınız
                </Link>
                .
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-lg font-semibold text-slate-900">Ödeme yöntemi</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                  paymentMethod === 'PAYTR' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'PAYTR'}
                  onChange={() => setPaymentMethod('PAYTR')}
                  className="mt-1"
                />
                <span>
                  <span className="flex items-center gap-2 font-medium text-slate-900">
                    <CreditCard className="h-4 w-4" aria-hidden />
                    Kredi / banka kartı (PayTR)
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">Anında onay</span>
                </span>
              </label>
              {havaleEnabled ? (
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                    paymentMethod === 'BANK_TRANSFER' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'BANK_TRANSFER'}
                    onChange={() => setPaymentMethod('BANK_TRANSFER')}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-medium text-slate-900">Havale / EFT</span>
                    <span className="mt-1 block text-xs text-slate-500">Manuel onay</span>
                  </span>
                </label>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-lg font-semibold text-slate-900">Yasal onaylar</h2>
            <p className="mt-1 text-xs text-slate-500">
              Belge adına tıklayarak siparişinize özel oluşturulan metnin önizlemesini görebilirsiniz. Zorunlu
              onaylar işaretlenmeden ödeme adımına geçilemez.
            </p>
            <div className="mt-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Zorunlu onaylar</p>
              <LegalConsentCheckbox checked={acceptPre} onChange={setAcceptPre}>
                <LegalModalLink onClick={() => setLegalModal('PRE_INFO')}>Ön bilgilendirme formunu</LegalModalLink> okudum, kabul ediyorum. *
              </LegalConsentCheckbox>
              <LegalConsentCheckbox checked={acceptDistance} onChange={setAcceptDistance}>
                <LegalModalLink onClick={() => setLegalModal('DISTANCE')}>Mesafeli satış / hizmet sözleşmesini</LegalModalLink> okudum, kabul ediyorum. *
              </LegalConsentCheckbox>
              {legalFlags.needsSoftwareLicense ? (
                <LegalConsentCheckbox checked={acceptSoftwareLicense} onChange={setAcceptSoftwareLicense}>
                  <LegalModalLink onClick={() => setLegalModal('SOFTWARE_LICENSE')}>Yazılım lisans sözleşmesini</LegalModalLink> okudum, kabul ediyorum. *
                </LegalConsentCheckbox>
              ) : null}
              {legalFlags.needsSaasSubscription ? (
                <LegalConsentCheckbox checked={acceptSaasSubscription} onChange={setAcceptSaasSubscription}>
                  <LegalModalLink onClick={() => setLegalModal('SAAS_SUBSCRIPTION')}>SaaS abonelik koşullarını</LegalModalLink> okudum, kabul ediyorum. *
                </LegalConsentCheckbox>
              ) : null}
              {legalFlags.needsDigitalProductWaiver ? (
                <LegalConsentCheckbox checked={acceptDigitalProductWaiver} onChange={setAcceptDigitalProductWaiver}>
                  <LegalModalLink onClick={() => setLegalModal('DIGITAL_PRODUCT_WAIVER')}>Dijital ürünün anında ifasına başlanması ve cayma hakkı bilgilendirmesini</LegalModalLink> okudum, kabul ediyorum. *
                </LegalConsentCheckbox>
              ) : null}
              {legalFlags.needsDigitalServiceWaiver ? (
                <LegalConsentCheckbox checked={acceptDigitalServiceWaiver} onChange={setAcceptDigitalServiceWaiver}>
                  <LegalModalLink onClick={() => setLegalModal('DIGITAL_SERVICE_WAIVER')}>Dijital hizmetin ifasına başlanması ve cayma hakkı bilgilendirmesini</LegalModalLink> okudum, kabul ediyorum. *
                </LegalConsentCheckbox>
              ) : null}

              <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Bilgilendirme</p>
              <LegalConsentCheckbox checked={acceptKvkk} onChange={setAcceptKvkk}>
                <LegalModalLink onClick={() => setLegalModal('KVKK')}>KVKK aydınlatma metnini</LegalModalLink> ve{' '}
                <LegalExternalLink href={LEGAL.privacy}>gizlilik politikasını</LegalExternalLink> okudum. *
              </LegalConsentCheckbox>

              <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Opsiyonel</p>
              <LegalConsentCheckbox checked={marketingConsent} onChange={setMarketingConsent}>
                Ticari elektronik ileti almak istiyorum. (
                <LegalModalLink onClick={() => setLegalModal('COMMERCIAL')}>bilgilendirme</LegalModalLink>)
              </LegalConsentCheckbox>
              <LegalConsentCheckbox checked={explicitConsent} onChange={setExplicitConsent}>
                <LegalModalLink onClick={() => setLegalModal('EXPLICIT')}>Açık rıza metnini</LegalModalLink> onaylıyorum.
              </LegalConsentCheckbox>
            </div>
          </section>

          <button
            type="submit"
            disabled={submitting || !legalOk || saasLoginRequired}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-60"
          >
            <ShieldCheck className="h-5 w-5" aria-hidden />
            {submitting ? 'İşleniyor…' : paymentMethod === 'BANK_TRANSFER' ? 'Siparişi oluştur' : 'Ödemeye geç'}
          </button>
        </form>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Sipariş özeti</h2>
            {previewQuery.isLoading ? (
              <LoadingState label="Ürünler yükleniyor…" />
            ) : previewQuery.isError ? (
              <p className="mt-4 text-sm text-amber-800">Fiyat bilgisi yüklenemedi. Sepetinizdeki kayıtlı fiyatlar kullanılıyor.</p>
            ) : null}
            <ul className="mt-4 space-y-3 text-sm">
              {merged.map((m) => (
                <li key={m.id} className="flex justify-between gap-3 border-b border-slate-100 pb-3">
                  <span className="text-slate-700">
                    {m.name}
                    {mergedRowIsSingleQuantity(m)
                      ? ' — 1 lisans'
                      : isSaasSubscriptionProduct(m.productType)
                        ? ` × ${m.quantity} yıl`
                        : ` × ${m.quantity}`}
                  </span>
                  <span className="shrink-0 font-medium text-slate-900">{formatMoney(m.lineTotal, m.currency)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-base font-bold text-slate-900">
              <span>Toplam</span>
              <span className="text-emerald-800">{formatMoney(grand, currency)}</span>
            </div>
            <Link to="/sepet" className="mt-4 block text-center text-sm font-medium text-emerald-700 hover:underline">
              Sepete dön
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden />
              Güvenli ödeme
            </div>
            <p className="mt-2 leading-relaxed">256-bit SSL ve PayTR güvenli ödeme altyapısı.</p>
            {hasLicenseProduct ? (
              <p className="mt-3 flex items-start gap-2 border-t border-slate-200 pt-3 text-xs leading-relaxed">
                <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                {CENTRAL_LICENSE_PUBLIC_MESSAGE}
              </p>
            ) : (
              <p className="mt-3 border-t border-slate-200 pt-3 text-xs leading-relaxed">
                Dijital teslimat bilgileri ödeme onayı sonrası e-posta ile iletilir.
              </p>
            )}
          </div>
        </aside>
      </div>

      <CheckoutLegalModal
        open={legalModal !== null}
        title={legalModal ? LEGAL_MODAL_TITLES[legalModal] : ''}
        onClose={() => setLegalModal(null)}
        showReadAndClose={legalModal !== null}
        onReadAndAccept={() => {
          if (legalModal) legalModalAccept[legalModal]()
        }}
      >
        {legalModal ? (
          <CheckoutLegalPreviewBody
            type={LEGAL_MODAL_PREVIEW[legalModal].type}
            variant={LEGAL_MODAL_PREVIEW[legalModal].variant}
            variables={legalPreviewVariables}
          />
        ) : null}
      </CheckoutLegalModal>
    </div>
  )
}
