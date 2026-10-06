import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { TurkeyCityDistrictFields } from '@/components/checkout/TurkeyCityDistrictFields'
import { CheckoutLegalModal } from '@/components/checkout/CheckoutLegalModal'
import { LegalModalLink } from '@/components/checkout/LegalConsentCheckbox'
import { useCustomerSession } from '@/hooks/useCustomerSession'
import { usePageMeta } from '@/hooks/usePageMeta'
import { bilirkisiHesapService, formatBhPriceTl } from '@/services/bilirkisiHesapService'
import { paymentsService } from '@/services/paymentsService'
import { getErrorMessage } from '@/api/client'
import { BILIRKISI_HESAP_SLUG } from '@/data/canonicalSoftwareProducts'
import { bilirkisiCheckoutAuthReturnPath, customerAuthHref } from '@/lib/bilirkisiCheckoutAuthReturn'

type LegalKey = 'PRE_INFORMATION' | 'DISTANCE_SALE' | 'SUBSCRIPTION_AGREEMENT' | 'KVKK' | 'WITHDRAWAL_EXCEPTION'

type Quote = {
  platform: 'WINDOWS' | 'MACOS'
  priceKurus: number
  licenseDays: number
  maxDevices: number
  fromTrial: boolean
}

type Props = {
  purchaseToken: string
  platform: 'WINDOWS' | 'MACOS' | null
}

export function DesktopFirstPurchaseCheckout({ purchaseToken, platform }: Props) {
  const [searchParams] = useSearchParams()
  const { authed, profile } = useCustomerSession()
  const returnPath = useMemo(() => bilirkisiCheckoutAuthReturnPath(searchParams.toString()), [searchParams])
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [address, setAddress] = useState('')
  const [consents, setConsents] = useState({ sale: false, terms: false })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [legalKey, setLegalKey] = useState<LegalKey | null>(null)
  const [legalTitle, setLegalTitle] = useState('')
  const [legalHtml, setLegalHtml] = useState<string | null>(null)

  usePageMeta({
    title: 'Bilirkişi Hesap Masaüstü — Satın Al | Woontegra',
    description: 'Bilirkişi Hesap masaüstü yıllık lisans satın alma.',
    robots: 'noindex,nofollow',
    canonicalPath: `/yazilimlar/${BILIRKISI_HESAP_SLUG}/satin-al`,
  })

  useEffect(() => {
    if (profile?.name) setFullName((v) => v || profile.name || '')
    if (profile?.email) setEmail(profile.email)
    if (profile?.phone) setPhone((v) => v || profile.phone || '')
  }, [profile])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        if (purchaseToken) {
          const resolved = await bilirkisiHesapService.resolveDesktopPurchase(purchaseToken)
          if (!resolved.success || !resolved.data) throw new Error(resolved.message || 'Satın alma bağlantısı doğrulanamadı.')
          if (cancelled) return
          setQuote({
            platform: resolved.data.platform,
            priceKurus: resolved.data.priceKurus,
            licenseDays: resolved.data.licenseDays,
            maxDevices: resolved.data.maxDevices,
            fromTrial: true,
          })
          return
        }
        if (!platform) throw new Error('Platform seçilmedi.')
        const quoted = await bilirkisiHesapService.quoteDesktopPlatform(platform)
        if (!quoted.success || !quoted.data) throw new Error(quoted.message || 'Yıllık masaüstü fiyatı bulunamadı.')
        if (cancelled) return
        setQuote({
          platform: quoted.data.platform,
          priceKurus: quoted.data.priceKurus,
          licenseDays: quoted.data.licenseDays,
          maxDevices: quoted.data.maxDevices,
          fromTrial: false,
        })
      } catch (err) {
        if (!cancelled) setLoadError(getErrorMessage(err, 'Satın alma bilgisi yüklenemedi.'))
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [platform, purchaseToken])

  const openLegal = (key: LegalKey, title: string) => {
    setLegalKey(key)
    setLegalTitle(title)
    setLegalHtml(null)
    void bilirkisiHesapService
      .getLegalPreview(key, { productType: 'annual', subscriptionPeriod: 1 })
      .then((doc) => {
        setLegalTitle(doc.title || title)
        setLegalHtml(doc.contentHtml || `<pre class="whitespace-pre-wrap">${doc.content}</pre>`)
      })
      .catch(() => setLegalHtml('<p>Sözleşme metni yüklenemedi.</p>'))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!quote) return
    if (!consents.sale || !consents.terms) {
      setError('Devam etmek için sözleşme onaylarını işaretleyin.')
      return
    }
    const legalConsents: Record<LegalKey, boolean> = {
      PRE_INFORMATION: consents.sale,
      DISTANCE_SALE: consents.sale,
      SUBSCRIPTION_AGREEMENT: consents.terms,
      KVKK: consents.terms,
      WITHDRAWAL_EXCEPTION: consents.terms,
    }
    setSubmitting(true)
    setError(null)
    try {
      const created = await bilirkisiHesapService.createDesktopPurchaseOrder({
        purchaseToken: purchaseToken || undefined,
        platform: quote.platform,
        billingInfo: {
          invoiceType: 'individual',
          fullName,
          email,
          phone,
          city,
          district,
          address,
        },
        legalConsents,
      })
      if (!created.success || !created.data?.orderNo) {
        throw new Error(created.message || 'Sipariş oluşturulamadı.')
      }
      if (created.data.paymentProvider === 'BANK_TRANSFER') return
      const token = await paymentsService.startPaytr(created.data.orderNo)
      if (token.startsWith('dryrun_')) throw new Error('Kart ödeme ekranı açılamadı. Lütfen tekrar deneyin.')
      window.location.href = `https://www.paytr.com/odeme/guvenli/${token}`
    } catch (err) {
      setError(getErrorMessage(err, 'Ödeme başlatılamadı.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-950">Yıllık Profesyonel Lisans</h1>
      <p className="mt-2 text-sm text-slate-600">Bilirkişi Hesap masaüstü · ilk satın alma</p>
      {loadError ? <p className="mt-6 text-sm text-rose-700">{loadError}</p> : null}
      {!quote && !loadError ? (
        <p className="mt-6 flex items-center gap-2 text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Fiyat hazırlanıyor…
        </p>
      ) : null}
      {quote ? (
        <form className="mt-6 space-y-4" onSubmit={(event) => void submit(event)}>
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-500">{quote.platform === 'MACOS' ? 'macOS' : 'Windows'}</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">
              {formatBhPriceTl(quote.priceKurus / 100)}
              <span className="ml-1 text-base font-semibold text-slate-500">/ yıl</span>
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {quote.licenseDays} gün · {quote.maxDevices} cihaz
            </p>
            {quote.fromTrial ? (
              <p className="mt-3 text-sm text-slate-600">Bu satın alma, açık olan deneme cihazınız için ücretli lisansa bağlanır.</p>
            ) : null}
          </section>
          {!authed ? (
            <p className="text-sm text-slate-700">
              Ödeme için{' '}
              <Link className="font-semibold text-sky-800" to={customerAuthHref('giris', returnPath)}>
                giriş yapın
              </Link>{' '}
              veya{' '}
              <Link className="font-semibold text-sky-800" to={customerAuthHref('kayit', returnPath)}>
                hesap oluşturun
              </Link>
              .
            </p>
          ) : (
            <>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ad soyad" required />
              <Input value={email} readOnly placeholder="E-posta" />
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefon" required />
              <TurkeyCityDistrictFields city={city} district={district} onCityChange={setCity} onDistrictChange={setDistrict} />
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Açık adres" required />
              <section className="rounded-2xl border border-slate-200 bg-white p-4">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-sky-600" /> Sözleşmeler
                </h2>
                <label className="flex items-start gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={consents.sale} onChange={(e) => setConsents((c) => ({ ...c, sale: e.target.checked }))} />
                  <span>
                    <LegalModalLink onClick={() => openLegal('PRE_INFORMATION', 'Ön Bilgilendirme Formu')}>Ön Bilgilendirme Formu</LegalModalLink>
                    {' ve '}
                    <LegalModalLink onClick={() => openLegal('DISTANCE_SALE', 'Mesafeli Satış Sözleşmesi')}>Mesafeli Satış Sözleşmesi</LegalModalLink>
                    {"'ni okudum ve kabul ediyorum."}
                  </span>
                </label>
                <label className="mt-3 flex items-start gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={consents.terms} onChange={(e) => setConsents((c) => ({ ...c, terms: e.target.checked }))} />
                  <span>
                    <LegalModalLink onClick={() => openLegal('SUBSCRIPTION_AGREEMENT', 'Abonelik Sözleşmesi')}>Abonelik Sözleşmesi</LegalModalLink>
                    {', '}
                    <LegalModalLink onClick={() => openLegal('KVKK', 'KVKK Aydınlatma Metni')}>KVKK Aydınlatma Metni</LegalModalLink>
                    {' ve '}
                    <LegalModalLink onClick={() => openLegal('WITHDRAWAL_EXCEPTION', 'Cayma Hakkı İstisnası')}>Cayma Hakkı İstisnası</LegalModalLink>
                    {"'nı okudum ve kabul ediyorum."}
                  </span>
                </label>
              </section>
              {error ? <p className="text-sm text-rose-700">{error}</p> : null}
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Ödeme hazırlanıyor…' : 'Ödemeye Geç'}
              </Button>
            </>
          )}
        </form>
      ) : null}
      <CheckoutLegalModal open={Boolean(legalKey)} title={legalTitle} onClose={() => setLegalKey(null)}>
        {legalHtml ? <div dangerouslySetInnerHTML={{ __html: legalHtml }} /> : <p>Yükleniyor…</p>}
      </CheckoutLegalModal>
    </div>
  )
}
