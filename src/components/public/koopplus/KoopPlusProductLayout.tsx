import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, ChevronDown, Cloud } from 'lucide-react'
import { Breadcrumbs } from '@/components/public/Breadcrumbs'
import { DesktopLicenseRenewalPanel } from '@/components/public/product/DesktopLicenseRenewalPanel'
import { KoopPlusDemoModal } from '@/components/public/koopplus/KoopPlusDemoModal'
import { KoopPlusShowcaseGallery } from '@/components/public/koopplus/KoopPlusShowcaseGallery'
import { KoopPlusDuesAnimation } from '@/components/public/koopplus/KoopPlusDuesAnimation'
import {
  getDefaultKoopPlusProductContent,
  resolveKoopPlusFeatureIcon,
  sanitizeKoopPlusProductContentForSaas,
  type KoopPlusProductContent,
} from '@/builder/types/koopplusProduct'
import { KOOPPLUS_HERO_IMAGE, KOOPPLUS_NAME, KOOPPLUS_TAGLINE } from '@/data/koopplusProduct'
import { trackKoopplusEvent } from '@/integrations/trackingEvents'
import { addToCart } from '@/lib/cartStorage'
import { koopPlusScreenshotEntries, productScreenshotAlt } from '@/lib/productScreenshots'
import { cn } from '@/lib/cn'
import { mapKoopPlusCatalogOffer, resolveKoopPlusBuyAction } from '@/lib/koopplusCatalog'
import { isDesktopLicenseRenewalContext, type DesktopLicenseRenewalView } from '@/lib/desktopLicenseRenewal'
import { resolveMediaUrl } from '@/media/resolveMediaUrl'
import type { PublicProductDetail } from '@/types/product'
import { buildCartSnapshot } from '@/utils/productPurchase'
import { formatMoney } from '@/utils/formatMoney'
import {
  KOOPPLUS_DEFAULT_MAX_QUANTITY,
  estimateKoopPlusTotal,
  fillKoopPlusPriceTokens,
  koopplusPricingService,
  type KoopPlusPricing,
} from '@/services/koopplusPricingService'


const SHELL = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'
const SALES_PREP_NOTICE = 'Satışa hazırlanıyor. Satın alma henüz açılmamıştır.'
const PLAN_SECTION_ID = 'koopplus-satin-al'
const TRIAL_SECTION_ID = 'koopplus-deneme'

/** KoopPlus ürün rengi (koyu turuncu-kahve); ana sayfadaki seçiciyle aynı. */
const KOOP_HERO_COLOR = '#7C2D12'

type ScreenshotEntry = { url: string; alt?: string }

function resolveScreenshots(product: PublicProductDetail | null, content: KoopPlusProductContent): ScreenshotEntry[] {
  // SaaS giriş ekranı — eski masaüstü/login galeri görsellerinin üstüne yazılır.
  const saasLogin: ScreenshotEntry = {
    url: resolveMediaUrl(KOOPPLUS_HERO_IMAGE) || KOOPPLUS_HERO_IMAGE,
    alt: content.hero.imageAlt || 'KoopPlus web tabanlı kooperatif yönetim paneli giriş ekranı',
  }
  const builderGallery = content.gallery.images
    .map((image, index, list) => {
      const url = resolveMediaUrl(image.url) || image.url.trim()
      if (!url) return null
      if (url.includes('koopplus-login-saas')) return null
      return {
        url,
        alt:
          image.alt.trim() ||
          productScreenshotAlt({
            productName: KOOPPLUS_NAME,
            topic: KOOPPLUS_TAGLINE,
            index,
            total: list.length,
          }),
      }
    })
    .filter((image): image is { url: string; alt: string } => Boolean(image))
  const productGallery = koopPlusScreenshotEntries(product?.galleryImages).filter(
    (img) => !img.url.includes('koopplus-login-saas'),
  )
  const rest = builderGallery.length > 0 ? builderGallery : productGallery
  return [saasLogin, ...rest.filter((img) => img.url !== saasLogin.url)]
}

export type KoopPlusProductLayoutProps = {
  content?: KoopPlusProductContent
  product?: PublicProductDetail | null
  productLoading?: boolean
  desktopLicenseRenewal?: DesktopLicenseRenewalView | null
  desktopLicenseRenewalLoading?: boolean
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function KoopPlusProductLayout({
  content: contentProp,
  product = null,
  productLoading = false,
  desktopLicenseRenewal = null,
  desktopLicenseRenewalLoading = false,
}: KoopPlusProductLayoutProps) {
  const content = useMemo(
    () => sanitizeKoopPlusProductContentForSaas(contentProp ?? getDefaultKoopPlusProductContent()),
    [contentProp],
  )
  const navigate = useNavigate()
  const [buyNotice, setBuyNotice] = useState<string | null>(null)
  const [demoOpen, setDemoOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<string | null>(null)
  const [coopQuantity, setCoopQuantity] = useState(1)
  const [pricing, setPricing] = useState<KoopPlusPricing | null>(null)
  useEffect(() => {
    let alive = true
    koopplusPricingService
      .getPricing()
      .then((p) => {
        if (alive) setPricing(p)
      })
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [])
  useEffect(() => {
    setOpenFaq((prev) => prev ?? content.faq.items[0]?.question ?? null)
  }, [content])
  const offer = useMemo(() => mapKoopPlusCatalogOffer(product), [product])
  const buyAction = useMemo(() => resolveKoopPlusBuyAction(product), [product])
  const buyReady = buyAction.type === 'addToCart'
  const renewalDays = product?.licenseDays && product.licenseDays > 0 ? product.licenseDays : undefined
  const salesNotReadyLabel = content.hero.salesNotReadyLabel
  const visibility = content.sectionVisibility
  const modalScreenshot = useMemo(() => resolveScreenshots(product, content)[0] ?? null, [product, content])
  // SaaS: tek plan — Windows/Mac rozeti veya “Windows için Satın Al” asla gösterilmez.
  const planTitle = content.platforms.windows.title
  const planBadge = content.platforms.windows.badge
  const planPurchaseCta = content.platforms.windows.purchaseCtaLabel
  const planTrialCta = content.platforms.windows.trialCtaLabel

  const startCheckout = () => {
    trackKoopplusEvent('koopplus_buy_click')
    const action = resolveKoopPlusBuyAction(product)
    if (action.type !== 'addToCart' || !product) {
      setBuyNotice(SALES_PREP_NOTICE)
      return
    }
    addToCart(action.productId, coopQuantity, { snapshot: buildCartSnapshot(product), replaceLine: true })
    setBuyNotice(null)
    navigate(action.nextPath)
  }

  const handleHeroBuy = () => {
    if (buyReady) {
      startCheckout()
      return
    }
    scrollToId(PLAN_SECTION_ID)
  }

  const handleBuy = () => {
    if (!buyReady) {
      setBuyNotice(SALES_PREP_NOTICE)
      return
    }
    startCheckout()
  }

  const openDemo = () => {
    trackKoopplusEvent('koopplus_trial_click')
    setDemoOpen(true)
  }

  const highlights = [
    { big: 'Kurulumsuz', title: 'Web tabanlı', desc: 'Bilgisayar, tablet veya telefondan tarayıcıyla girin.' },
    { big: 'Her cihaz', title: 'Cihaz sınırı yok', desc: 'İstediğiniz cihazdan, istediğiniz yerden kullanın.' },
    {
      big: 'Çoklu',
      title: 'Birden fazla kooperatif',
      desc: pricing
        ? `Hepsini tek hesaptan yönetin; her ek kooperatif ${formatMoney(pricing.additionalPrice, pricing.currency)} / yıl.`
        : 'Hepsini tek hesaptan yönetin; ek kooperatifler daha uygun fiyatlıdır.',
    },
    { big: '7 gün', title: 'Ücretsiz deneme', desc: 'Kredi kartı gerekmez; demoda girdiğiniz kayıtlar silinmez.' },
  ]

  return (
    <div className="overflow-x-hidden bg-white">
      {/* Üst bölüm: solda tanıtım ve aidat çizelgesi, sağda satın alma kutusu */}
      <section className="relative overflow-hidden text-white" style={{ backgroundColor: KOOP_HERO_COLOR }}>
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full border-[72px] border-[#F97316] opacity-20"
        />
        <div className={`relative ${SHELL} pb-12 pt-6 lg:pb-16 lg:pt-8`}>
          <Breadcrumbs
            dark
            items={[
              { label: 'Ana Sayfa', href: '/' },
              { label: 'Yazılımlar', href: '/yazilimlar' },
              { label: KOOPPLUS_NAME },
            ]}
          />
          <div className="mt-4 grid gap-6 sm:mt-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-center xl:gap-8">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-orange-300 sm:text-xs">
                {content.hero.identity}
              </p>
              <h1 className="mt-2 max-w-4xl text-[28px] font-extrabold leading-tight tracking-tight sm:mt-4 sm:text-5xl lg:leading-[1.04]">
                {content.hero.title}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/75 sm:mt-4 sm:text-lg">
                {content.hero.description}
              </p>
              <KoopPlusDuesAnimation />
            </div>

            <aside id={PLAN_SECTION_ID} className="scroll-mt-24 xl:sticky xl:top-24 xl:self-start">
              <article
                className="rounded-xl bg-white p-6 text-slate-950 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)] sm:p-7"
                data-testid="koopplus-plan-card"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-50 text-[#C2410C]">
                      <Cloud className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-950">{planTitle}</h2>
                      <p className="text-sm text-slate-500">{content.platforms.windows.status}</p>
                    </div>
                  </div>
                  <span className="rounded-md bg-orange-50 px-2 py-1 text-xs font-bold text-[#C2410C]">{planBadge}</span>
                </div>
                <div className="mt-5">
                  {offer.priceLabel ? (
                    <p className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-4xl font-extrabold tracking-tight text-slate-950">{offer.priceLabel}</span>
                      <span className="text-sm text-slate-500">/ yıl · KDV dahil</span>
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500">{productLoading ? 'Fiyat yükleniyor…' : 'Fiyat bilgisi yakında'}</p>
                  )}
                  {pricing ? (
                    <p className="mt-1 text-sm text-slate-600" data-testid="koopplus-additional-price">
                      Her ek kooperatif: <strong>{formatMoney(pricing.additionalPrice, pricing.currency)}</strong> / yıl
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-slate-500">
                    {content.platforms.trialSuffix}
                    {offer.licenseDaysLabel ? ` · Lisans süresi ${offer.licenseDaysLabel}` : ''}
                  </p>
                </div>
                {buyReady ? (
                  <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4" data-testid="koopplus-quantity">
                    <label htmlFor="koopplus-coop-qty" className="block text-sm font-semibold text-slate-900">
                      Kaç kooperatif?
                    </label>
                    <select
                      id="koopplus-coop-qty"
                      value={coopQuantity}
                      onChange={(e) => setCoopQuantity(Math.max(1, Number(e.target.value) || 1))}
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      {Array.from({ length: pricing?.maxQuantity ?? KOOPPLUS_DEFAULT_MAX_QUANTITY }, (_, i) => i + 1).map(
                        (n) => (
                          <option key={n} value={n}>
                            {n} kooperatif
                          </option>
                        ),
                      )}
                    </select>
                    {pricing && pricing.firstPrice != null ? (
                      <p className="mt-3 text-sm text-slate-700">
                        {coopQuantity > 1
                          ? `1 × ${formatMoney(pricing.firstPrice, pricing.currency)} + ${coopQuantity - 1} × ${formatMoney(pricing.additionalPrice, pricing.currency)} = `
                          : 'Toplam: '}
                        <strong className="text-slate-950">
                          {formatMoney(estimateKoopPlusTotal(pricing, coopQuantity) ?? 0, pricing.currency)}
                        </strong>
                        <span className="text-slate-500"> / yıl</span>
                      </p>
                    ) : null}
                    {coopQuantity > 1 ? (
                      <p className="mt-2 text-xs leading-relaxed text-slate-500">
                        İlk kooperatifiniz ödeme sonrası otomatik açılır; diğerlerini KoopPlus içinden (Kooperatifler →
                        + Yeni Kooperatif) kendiniz açarsınız.
                      </p>
                    ) : null}
                  </div>
                ) : null}
                {desktopLicenseRenewalLoading ? (
                  <p className="mt-4 text-sm text-slate-500">Lisans bilgileri doğrulanıyor…</p>
                ) : desktopLicenseRenewal && isDesktopLicenseRenewalContext(desktopLicenseRenewal) ? (
                  <div className="mt-4">
                    <DesktopLicenseRenewalPanel
                      data={desktopLicenseRenewal}
                      renewalDays={renewalDays}
                      renewalLabel={offer.licenseDaysLabel}
                    />
                  </div>
                ) : null}
                <div className="mt-6 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={handleBuy}
                    disabled={!buyReady}
                    aria-disabled={!buyReady}
                    className={cn(
                      'inline-flex min-h-12 items-center justify-center rounded-lg px-5 text-[15px] font-bold',
                      buyReady ? 'bg-[#16A34A] text-white transition hover:bg-[#15803D]' : 'cursor-not-allowed bg-slate-100 text-slate-400',
                    )}
                  >
                    {buyReady ? planPurchaseCta : salesNotReadyLabel}
                    {buyReady ? <ArrowRight className="ml-2 h-4 w-4" aria-hidden /> : null}
                  </button>
                  <button
                    type="button"
                    onClick={openDemo}
                    className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-[15px] font-bold text-slate-900 transition hover:bg-slate-50"
                  >
                    {planTrialCta}
                  </button>
                </div>
                {buyNotice ? (
                  <p className="mt-3 text-sm text-amber-800" role="status">
                    {buyNotice}
                  </p>
                ) : null}
              </article>
            </aside>
          </div>
        </div>
      </section>

      {/* Öne çıkanlar */}
      <section className={`${SHELL} pt-16 sm:pt-24`}>
        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {highlights.map((h) => (
            <li key={h.title} className="flex flex-col gap-2 rounded-xl border border-[#FCE3C4] bg-[#FFF7ED] p-6 sm:p-7">
              <span className="whitespace-nowrap text-3xl font-extrabold tracking-tight text-[#7C2D12] sm:text-4xl">{h.big}</span>
              <span className="text-[17px] font-extrabold text-slate-950">{h.title}</span>
              <span className="text-[15px] leading-relaxed text-slate-600">{h.desc}</span>
            </li>
          ))}
        </ul>
      </section>

      <KoopPlusShowcaseGallery />

      {visibility.features ? (
        <section className="scroll-mt-24 pb-4 pt-4">
          <div className={SHELL}>
            <div className="mb-8 flex flex-col gap-3 sm:mb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">{content.features.heading}</h2>
              <p className="max-w-md text-base leading-relaxed text-slate-600 sm:text-lg lg:text-right">{content.features.description}</p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
              {content.features.items.map((feature) => {
                const Icon = resolveKoopPlusFeatureIcon(feature.icon)
                return (
                  <li key={feature.title} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-6">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#C2410C]">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="flex flex-col gap-1.5">
                      <span className="text-[17px] font-extrabold text-slate-950">{feature.title}</span>
                      <span className="text-[15px] leading-relaxed text-slate-600">{feature.description}</span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      ) : null}

      {visibility.why ? (
        <section className="pt-20 sm:pt-28">
          <div className={SHELL}>
            <h2 className="mb-8 text-3xl font-extrabold tracking-tight text-slate-950 sm:mb-10 sm:text-4xl lg:text-5xl">{content.why.heading}</h2>
            <ol className="grid gap-3 sm:gap-4 md:grid-cols-2">
              {content.why.items.map((item, index) => (
                <li key={item.title} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
                  <span aria-hidden className="text-3xl font-extrabold tracking-tight text-slate-300">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xl font-extrabold text-slate-950">{item.title}</span>
                  <span className="text-[15px] leading-relaxed text-slate-600">{item.description}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {visibility.info || visibility.license ? (
        <section className="pt-20 sm:pt-28">
          <div className={SHELL}>
            <div className="grid gap-8 rounded-xl border border-slate-200 bg-white p-6 sm:p-10 lg:grid-cols-2 lg:gap-12">
              {visibility.license ? (
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{content.license.heading}</h2>
                  <ul className="mt-6 flex flex-col gap-3">
                    {content.license.points.map((point) => (
                      <li key={point} className="flex gap-2.5 text-[15px] leading-relaxed text-slate-700">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-[#16A34A]" strokeWidth={3} aria-hidden />
                        {fillKoopPlusPriceTokens(point, pricing)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {visibility.info ? (
                <div className="flex flex-col gap-6">
                  <div className="rounded-lg bg-[#FFF7ED] p-5 sm:p-6">
                    <h3 className="text-xl font-extrabold text-slate-950">{content.info.multiCoop.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
                      {fillKoopPlusPriceTokens(content.info.multiCoop.description, pricing)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-5 sm:p-6">
                    <h3 className="text-xl font-extrabold text-slate-950">{content.info.localData.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-slate-700">{content.info.localData.description}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {visibility.faq ? (
        <section className="pt-20 sm:pt-28">
          <div className={`${SHELL} flex flex-col gap-8 lg:flex-row lg:gap-14`}>
            <div className="lg:w-1/3 lg:shrink-0">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">{content.faq.heading}</h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                Başka bir sorunuz varsa WhatsApp'tan yazabilir ya da bizi arayabilirsiniz.
              </p>
            </div>
            <div className="flex-1 border-t border-slate-200">
              {content.faq.items.map((item) => {
                const open = openFaq === item.question
                return (
                  <div key={item.question} className="border-b border-slate-200 py-5">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 text-left text-[17px] font-bold text-slate-950"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? null : item.question)}
                    >
                      <span>{item.question}</span>
                      <ChevronDown
                        className={cn('h-5 w-5 shrink-0 text-slate-400 transition', open && 'rotate-180')}
                        aria-hidden
                      />
                    </button>
                    {open ? (
                      <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{fillKoopPlusPriceTokens(item.answer, pricing)}</p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      ) : null}

      {visibility.trial || visibility.closing ? (
        <section id={TRIAL_SECTION_ID} className={`${SHELL} scroll-mt-24 py-20 sm:py-28`}>
          <div className="flex flex-col gap-6 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#1D6FD8] px-6 py-10 text-white sm:px-12 sm:py-14 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">7 gün boyunca ücretsiz deneyin</h2>
              <ul className="mt-4 flex flex-col gap-2">
                {content.trial.highlights.map((item) => (
                  <li key={item.title} className="flex gap-2.5 text-[15px] leading-relaxed text-white/90 sm:text-base">
                    <Check className="mt-1 h-4 w-4 shrink-0" strokeWidth={3} aria-hidden />
                    {item.description}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
              <button
                type="button"
                onClick={openDemo}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-white px-6 py-3 text-[15px] font-bold text-slate-950 transition hover:bg-slate-100 sm:w-auto"
              >
                {content.closing.secondaryCtaLabel}
              </button>
              <button
                type="button"
                onClick={handleHeroBuy}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-white/50 px-6 py-3 text-[15px] font-bold text-white transition hover:bg-white/10 sm:w-auto"
              >
                {buyReady ? content.closing.primaryCtaLabel : salesNotReadyLabel}
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <KoopPlusDemoModal
        open={demoOpen}
        onClose={() => setDemoOpen(false)}
        screenshotUrl={modalScreenshot?.url ?? null}
        screenshotAlt={modalScreenshot?.alt ?? ''}
      />
    </div>
  )
}
