import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CalendarDays, Download, FolderSync, Monitor, MonitorSmartphone, ShieldCheck } from 'lucide-react'
import { Breadcrumbs } from '@/components/public/Breadcrumbs'
import { DesktopLicenseRenewalPanel } from '@/components/public/product/DesktopLicenseRenewalPanel'
import {
  getDefaultKoopPlusProductContent,
  resolveKoopPlusFeatureIcon,
  type KoopPlusProductContent,
} from '@/builder/types/koopplusProduct'
import {
  getKoopPlusWindowsTrialDownload,
  isKoopPlusMacCheckoutReady,
  KOOPPLUS_BRAND_ICON,
  KOOPPLUS_MACOS_AVAILABLE,
  KOOPPLUS_MACOS_CHECKOUT_PATH,
  KOOPPLUS_NAME,
  KOOPPLUS_TAGLINE,
} from '@/data/koopplusProduct'
import { trackKoopplusEvent } from '@/integrations/trackingEvents'
import { addToCart } from '@/lib/cartStorage'
import { ProductScreenshotCarousel } from '@/components/public/product/ProductScreenshotCarousel'
import { koopPlusScreenshotEntries, productScreenshotAlt } from '@/lib/productScreenshots'
import { cn } from '@/lib/cn'
import { mapKoopPlusCatalogOffer, resolveKoopPlusWindowsBuyAction } from '@/lib/koopplusCatalog'
import { isDesktopLicenseRenewalContext, type DesktopLicenseRenewalView } from '@/lib/desktopLicenseRenewal'
import { resolveMediaUrl } from '@/media/resolveMediaUrl'
import type { PublicProductDetail } from '@/types/product'
import { buildCartSnapshot } from '@/utils/productPurchase'

const SHELL = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'
const SALES_PREP_NOTICE = 'Satışa hazırlanıyor. Windows satın alma henüz açılmamıştır.'
const PLATFORM_SECTION_ID = 'koopplus-satin-al'
const TRIAL_SECTION_ID = 'koopplus-deneme'
const trialDownload = getKoopPlusWindowsTrialDownload()

const TRIAL_HIGHLIGHT_ICONS = [CalendarDays, ShieldCheck, FolderSync] as const

function KoopPlusWindowsTrialDownloadLink({
  label,
  className,
  wrapClassName,
  iconClassName = 'mr-2 h-4 w-4',
}: {
  label: string
  className: string
  wrapClassName?: string
  iconClassName?: string
}) {
  if (!trialDownload) return null
  return (
    <div className={wrapClassName}>
      <a
        href={trialDownload.href}
        download={trialDownload.filename}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackKoopplusEvent('koopplus_trial_click')}
        className={className}
      >
        <Download className={iconClassName} aria-hidden />
        {label}
      </a>
    </div>
  )
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

function KoopPlusHeroVisual({
  product,
  content,
}: {
  product: PublicProductDetail | null
  content: KoopPlusProductContent
}) {
  const builderGallery = content.gallery.images
    .map((image, index, list) => {
      const url = resolveMediaUrl(image.url) || image.url.trim()
      if (!url) return null
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

  const screenshots = builderGallery.length > 0 ? builderGallery : koopPlusScreenshotEntries(product?.galleryImages)
  if (screenshots.length > 0) {
    return <ProductScreenshotCarousel images={screenshots} productName={KOOPPLUS_NAME} />
  }

  const heroImage = content.hero.imageUrl ? resolveMediaUrl(content.hero.imageUrl) || content.hero.imageUrl : ''
  if (heroImage) {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-emerald-950/40">
        <img
          src={heroImage}
          alt={content.hero.imageAlt || 'KoopPlus masaüstü uygulaması'}
          className="aspect-[16/10] w-full object-cover object-top"
        />
      </div>
    )
  }

  return (
    <div className="flex aspect-[16/10] w-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 text-center shadow-2xl shadow-emerald-950/40">
      <span className="inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/95 p-1.5">
        <img src={KOOPPLUS_BRAND_ICON} alt="" className="h-full w-full object-contain" />
      </span>
      <p className="mt-4 text-lg font-semibold text-white">{KOOPPLUS_NAME}</p>
      <p className="mt-1 text-sm text-emerald-200">{KOOPPLUS_TAGLINE}</p>
    </div>
  )
}

export function KoopPlusProductLayout({
  content: contentProp,
  product = null,
  productLoading = false,
  desktopLicenseRenewal = null,
  desktopLicenseRenewalLoading = false,
}: KoopPlusProductLayoutProps) {
  const content = contentProp ?? getDefaultKoopPlusProductContent()
  const navigate = useNavigate()
  const [windowsNotice, setWindowsNotice] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<string | null>(content.faq.items[0]?.question ?? null)
  const offer = useMemo(() => mapKoopPlusCatalogOffer(product), [product])
  const buyAction = useMemo(() => resolveKoopPlusWindowsBuyAction(product), [product])
  const windowsReady = buyAction.type === 'addToCart'
  const macReady = isKoopPlusMacCheckoutReady()
  const renewalDays = product?.licenseDays && product.licenseDays > 0 ? product.licenseDays : undefined
  const salesNotReadyLabel = content.hero.salesNotReadyLabel
  const visibility = content.sectionVisibility

  const startWindowsCheckout = () => {
    trackKoopplusEvent('koopplus_windows_buy_click')
    const action = resolveKoopPlusWindowsBuyAction(product)
    if (action.type !== 'addToCart' || !product) {
      setWindowsNotice(SALES_PREP_NOTICE)
      return
    }
    addToCart(action.productId, 1, { snapshot: buildCartSnapshot(product), replaceLine: true })
    setWindowsNotice(null)
    navigate(action.nextPath)
  }

  const handleHeroWindowsBuy = () => {
    if (windowsReady) {
      startWindowsCheckout()
      return
    }
    scrollToId(PLATFORM_SECTION_ID)
  }

  const handleWindowsBuy = () => {
    if (!windowsReady) {
      setWindowsNotice(SALES_PREP_NOTICE)
      return
    }
    startWindowsCheckout()
  }

  const handleTrial = () => {
    trackKoopplusEvent('koopplus_trial_click')
    scrollToId(TRIAL_SECTION_ID)
  }

  const handleMacBuy = () => {
    trackKoopplusEvent('koopplus_mac_coming_soon_click')
    if (!macReady || !KOOPPLUS_MACOS_CHECKOUT_PATH) return
    navigate(KOOPPLUS_MACOS_CHECKOUT_PATH)
  }

  const trialTitleRest = content.trial.title.startsWith('7 Gün')
    ? content.trial.title.replace(/^7 Gün/, '')
    : null

  return (
    <div className="overflow-x-hidden bg-white">
      <section className="relative bg-gradient-to-br from-slate-950 via-[#0f2744] to-slate-900 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(16,185,129,0.16),transparent_42%),radial-gradient(circle_at_82%_55%,rgba(56,189,248,0.12),transparent_40%)]" />
        <div className={`relative ${SHELL} py-8 lg:py-10`}>
          <Breadcrumbs
            dark
            items={[
              { label: 'Ana Sayfa', href: '/' },
              { label: 'Yazılımlar', href: '/yazilimlar' },
              { label: KOOPPLUS_NAME },
            ]}
          />
          <div className="mt-6 grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
            <div className="min-w-0">
              <p className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                {content.hero.kicker}
              </p>
              <p className="mt-3 text-sm font-medium text-sky-200">{content.hero.identity}</p>
              <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-[2.35rem] lg:leading-[1.15]">
                {content.hero.title}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">{content.hero.description}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={handleHeroWindowsBuy}
                  aria-disabled={!windowsReady}
                  className={cn(
                    'inline-flex min-h-12 w-full items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold shadow-lg sm:w-auto',
                    windowsReady
                      ? 'bg-gradient-to-r from-emerald-500 to-sky-400 text-slate-950 shadow-emerald-500/20 transition hover:brightness-105'
                      : 'cursor-not-allowed bg-slate-200 text-slate-500 shadow-none',
                  )}
                >
                  {windowsReady ? content.hero.primaryCtaLabel : salesNotReadyLabel}
                </button>
                <button
                  type="button"
                  onClick={handleTrial}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/15 sm:w-auto"
                >
                  {content.hero.secondaryCtaLabel}
                </button>
              </div>
              {windowsNotice ? (
                <p className="mt-3 text-sm text-amber-200" role="status">
                  {windowsNotice}
                </p>
              ) : null}
            </div>
            <KoopPlusHeroVisual product={product} content={content} />
          </div>
        </div>
      </section>

      <section id={PLATFORM_SECTION_ID} className="scroll-mt-24 border-b border-slate-200 bg-slate-50 py-12 sm:py-16">
        <div className={SHELL}>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{content.platforms.heading}</h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600">
            {offer.packageLabel}
            {offer.priceLabel ? ` · ${offer.priceLabel}` : productLoading ? ' · Fiyat yükleniyor…' : ''}
            {offer.licenseDaysLabel ? ` · ${offer.licenseDaysLabel}` : ''}
            {offer.devicesLabel ? ` · ${offer.devicesLabel}` : ''}
            {` · ${content.platforms.trialSuffix}`}
          </p>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <article className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Monitor className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{content.platforms.windows.title}</h3>
                    <p className="text-sm text-slate-500">{content.platforms.windows.status}</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {content.platforms.windows.badge}
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-600">
                {offer.packageLabel}
                {offer.priceLabel ? ` · ${offer.priceLabel} / yıl` : productLoading ? ' · Fiyat yükleniyor…' : ''}
              </p>
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
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleWindowsBuy}
                  disabled={!windowsReady}
                  aria-disabled={!windowsReady}
                  className={cn(
                    'inline-flex min-h-12 flex-1 items-center justify-center rounded-xl px-5 text-sm font-semibold',
                    windowsReady
                      ? 'bg-emerald-600 text-white transition hover:bg-emerald-700'
                      : 'cursor-not-allowed bg-slate-100 text-slate-400',
                  )}
                >
                  {windowsReady ? content.platforms.windows.purchaseCtaLabel : salesNotReadyLabel}
                  {windowsReady ? <ArrowRight className="ml-2 h-4 w-4" aria-hidden /> : null}
                </button>
                {trialDownload ? (
                  <KoopPlusWindowsTrialDownloadLink
                    label={content.trial.downloadCtaLabel}
                    wrapClassName="flex-1"
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={handleTrial}
                    className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    {content.platforms.windows.trialCtaLabel}
                  </button>
                )}
              </div>
              {windowsNotice ? (
                <p className="mt-3 text-sm text-amber-800" role="status">
                  {windowsNotice}
                </p>
              ) : null}
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <MonitorSmartphone className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{content.platforms.mac.title}</h3>
                    <p className="text-sm text-slate-500">{content.platforms.mac.status}</p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  {content.platforms.mac.badge}
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-600">
                {offer.packageLabel}
                {offer.priceLabel ? ` · ${offer.priceLabel} / yıl` : ''}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  disabled={!macReady}
                  aria-disabled={!macReady}
                  onClick={handleMacBuy}
                  className={cn(
                    'inline-flex min-h-12 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold',
                    macReady
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'cursor-not-allowed bg-slate-100 text-slate-400',
                  )}
                >
                  {content.platforms.mac.purchaseCtaLabel}
                  <span className="ml-2 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {content.platforms.mac.badge}
                  </span>
                </button>
              </div>
              {!KOOPPLUS_MACOS_AVAILABLE ? (
                <p className="mt-3 text-sm text-slate-500">{content.platforms.mac.closedNote}</p>
              ) : null}
            </article>
          </div>
        </div>
      </section>

      {visibility.trial ? (
        <section
          id={TRIAL_SECTION_ID}
          className="relative scroll-mt-24 overflow-hidden border-y border-slate-800 bg-gradient-to-br from-slate-950 via-[#0f2744] to-slate-900 py-10 sm:py-12 lg:py-14"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.18),transparent_42%),radial-gradient(circle_at_88%_80%,rgba(56,189,248,0.10),transparent_36%)]" />
          <div className={`relative ${SHELL}`}>
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-5 py-8 shadow-2xl shadow-emerald-950/40 sm:px-8 sm:py-10 lg:px-10 lg:py-11">
              <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
              <div className="relative mx-auto max-w-2xl text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  {content.trial.eyebrow}
                </p>
                <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.45rem] lg:leading-[1.15]">
                  {trialTitleRest != null ? (
                    <>
                      <span className="text-emerald-300">7 Gün</span>
                      {trialTitleRest}
                    </>
                  ) : (
                    content.trial.title
                  )}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">{content.trial.intro}</p>
              </div>

              <ul className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {content.trial.highlights.map((item, index) => {
                  const Icon = TRIAL_HIGHLIGHT_ICONS[index] ?? ShieldCheck
                  return (
                    <li
                      key={item.title}
                      className="rounded-2xl border border-white/10 bg-slate-950/55 p-5 shadow-lg shadow-black/20 transition hover:border-emerald-400/35 hover:bg-slate-950/75"
                    >
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <p className="mt-4 text-base font-semibold text-white">{item.title}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{item.description}</p>
                    </li>
                  )
                })}
              </ul>

              {trialDownload ? (
                <div className="relative mt-8 flex flex-col items-center text-center">
                  <KoopPlusWindowsTrialDownloadLink
                    label={content.trial.downloadCtaLabel}
                    iconClassName="mr-2.5 h-5 w-5"
                    wrapClassName="w-full sm:w-auto"
                    className="inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-sky-400 px-8 text-base font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:brightness-95 sm:min-w-[20rem]"
                  />
                  <p className="mt-4 text-sm font-medium text-slate-200">{content.trial.trustLine}</p>
                  <p className="mt-1.5 text-sm text-slate-400">{content.trial.downloadHint}</p>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {visibility.features ? (
        <section className="scroll-mt-24 py-16 sm:py-20 lg:py-24">
          <div className={SHELL}>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{content.features.heading}</h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
              {content.features.description}
            </p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {content.features.items.map((feature) => {
                const Icon = resolveKoopPlusFeatureIcon(feature.icon)
                return (
                  <li
                    key={feature.title}
                    className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm"
                  >
                    <Icon className="h-5 w-5 text-emerald-700" aria-hidden />
                    <p className="mt-3 text-base font-semibold text-slate-900">{feature.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      ) : null}

      {visibility.why ? (
        <section className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
          <div className={SHELL}>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{content.why.heading}</h2>
            <ul className="mt-10 grid gap-4 md:grid-cols-2">
              {content.why.items.map((item) => (
                <li key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-base font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {visibility.info ? (
        <section className="py-16 sm:py-20">
          <div className={SHELL}>
            <div className="grid gap-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 sm:p-10 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-950">{content.info.multiCoop.title}</h2>
                <p className="mt-4 text-base leading-relaxed text-slate-600">{content.info.multiCoop.description}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{content.info.localData.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-slate-600">{content.info.localData.description}</p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {visibility.license ? (
        <section className="py-16 sm:py-20">
          <div className={SHELL}>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{content.license.heading}</h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {content.license.points.map((point) => (
                <li key={point} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {visibility.faq ? (
        <section className="border-t border-slate-200 bg-slate-50 py-16 sm:py-20">
          <div className={`${SHELL} max-w-3xl`}>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">{content.faq.heading}</h2>
            <div className="mt-8 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {content.faq.items.map((item) => {
                const open = openFaq === item.question
                return (
                  <div key={item.question} className="px-4 py-3">
                    <button
                      type="button"
                      className="flex min-h-11 w-full items-center justify-between gap-4 text-left text-sm font-medium text-slate-900"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? null : item.question)}
                    >
                      <span>{item.question}</span>
                      <span className="text-slate-400" aria-hidden>
                        {open ? '−' : '+'}
                      </span>
                    </button>
                    {open ? <p className="mt-2 text-sm text-slate-600">{item.answer}</p> : null}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      ) : null}

      {visibility.closing ? (
        <section className="border-t border-slate-800 bg-gradient-to-br from-slate-950 via-[#10263f] to-slate-900 py-16 text-white sm:py-20">
          <div className={`${SHELL} text-center`}>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{content.closing.heading}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300">{content.closing.description}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleWindowsBuy}
                disabled={!windowsReady}
                aria-disabled={!windowsReady}
                className={cn(
                  'inline-flex min-h-12 w-full items-center justify-center rounded-xl px-6 text-sm font-semibold sm:w-auto',
                  windowsReady ? 'bg-emerald-500 text-slate-950' : 'cursor-not-allowed bg-slate-200 text-slate-500',
                )}
              >
                {windowsReady ? content.closing.primaryCtaLabel : salesNotReadyLabel}
              </button>
              <button
                type="button"
                onClick={handleTrial}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/20 px-6 text-sm font-semibold text-white sm:w-auto"
              >
                {content.closing.secondaryCtaLabel}
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
