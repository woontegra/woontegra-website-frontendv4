import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Download, Monitor, MonitorSmartphone } from 'lucide-react'
import { Breadcrumbs } from '@/components/public/Breadcrumbs'
import { DesktopLicenseRenewalPanel } from '@/components/public/product/DesktopLicenseRenewalPanel'
import {
  getKoopPlusWindowsTrialDownload,
  isKoopPlusMacCheckoutReady,
  KOOPPLUS_BRAND_ICON,
  KOOPPLUS_FAQ,
  KOOPPLUS_FEATURES,
  KOOPPLUS_HERO,
  KOOPPLUS_HERO_IMAGE,
  KOOPPLUS_LICENSE_POINTS,
  KOOPPLUS_LOCAL_DATA,
  KOOPPLUS_MACOS_AVAILABLE,
  KOOPPLUS_MACOS_CHECKOUT_PATH,
  KOOPPLUS_MULTI_COOP,
  KOOPPLUS_NAME,
  KOOPPLUS_TAGLINE,
  KOOPPLUS_TRIAL,
  KOOPPLUS_WHY,
} from '@/data/koopplusProduct'
import { trackKoopplusEvent } from '@/integrations/trackingEvents'
import { addToCart } from '@/lib/cartStorage'
import { cn } from '@/lib/cn'
import { mapKoopPlusCatalogOffer, resolveKoopPlusWindowsBuyAction } from '@/lib/koopplusCatalog'
import { isDesktopLicenseRenewalContext, type DesktopLicenseRenewalView } from '@/lib/desktopLicenseRenewal'
import type { PublicProductDetail } from '@/types/product'
import { buildCartSnapshot } from '@/utils/productPurchase'

const SHELL = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'
const SALES_PREP_NOTICE = 'Satışa hazırlanıyor. Windows satın alma henüz açılmamıştır.'
const PLATFORM_SECTION_ID = 'koopplus-satin-al'
const TRIAL_SECTION_ID = 'koopplus-deneme'
const trialDownload = getKoopPlusWindowsTrialDownload()

function KoopPlusWindowsTrialDownloadLink({
  className,
  wrapClassName,
  showHint = false,
}: {
  className: string
  wrapClassName?: string
  showHint?: boolean
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
        <Download className="mr-2 h-4 w-4" aria-hidden />
        {KOOPPLUS_TRIAL.downloadCta}
      </a>
      {showHint ? <p className="mt-3 text-sm text-slate-500">{KOOPPLUS_TRIAL.downloadHint}</p> : null}
    </div>
  )
}

type Props = {
  product?: PublicProductDetail | null
  productLoading?: boolean
  desktopLicenseRenewal?: DesktopLicenseRenewalView | null
  desktopLicenseRenewalLoading?: boolean
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function KoopPlusHeroVisual() {
  if (KOOPPLUS_HERO_IMAGE) {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-emerald-950/40">
        <img
          src={KOOPPLUS_HERO_IMAGE}
          alt="KoopPlus masaüstü uygulaması"
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
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
        Ürün ekran görüntüsü yakında eklenecek.
      </p>
    </div>
  )
}

export function KoopPlusProductView({
  product = null,
  productLoading = false,
  desktopLicenseRenewal = null,
  desktopLicenseRenewalLoading = false,
}: Props) {
  const navigate = useNavigate()
  const [windowsNotice, setWindowsNotice] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<string | null>(KOOPPLUS_FAQ[0]?.question ?? null)
  const offer = useMemo(() => mapKoopPlusCatalogOffer(product), [product])
  const buyAction = useMemo(() => resolveKoopPlusWindowsBuyAction(product), [product])
  const windowsReady = buyAction.type === 'addToCart'
  const macReady = isKoopPlusMacCheckoutReady()
  const renewalDays = product?.licenseDays && product.licenseDays > 0 ? product.licenseDays : undefined

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
                {KOOPPLUS_HERO.kicker}
              </p>
              <p className="mt-3 text-sm font-medium text-sky-200">{KOOPPLUS_HERO.identity}</p>
              <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-[2.35rem] lg:leading-[1.15]">
                {KOOPPLUS_HERO.title}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">{KOOPPLUS_HERO.description}</p>
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
                  {windowsReady ? KOOPPLUS_HERO.primaryCta : 'Satışa hazırlanıyor'}
                </button>
                <button
                  type="button"
                  onClick={handleTrial}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/15 sm:w-auto"
                >
                  {KOOPPLUS_HERO.secondaryCta}
                </button>
              </div>
              {windowsNotice ? (
                <p className="mt-3 text-sm text-amber-200" role="status">
                  {windowsNotice}
                </p>
              ) : null}
            </div>
            <KoopPlusHeroVisual />
          </div>
        </div>
      </section>

      <section id={PLATFORM_SECTION_ID} className="scroll-mt-24 border-b border-slate-200 bg-slate-50 py-12 sm:py-16">
        <div className={SHELL}>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">KoopPlus’ı kullanmaya başlayın</h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600">
            {offer.packageLabel}
            {offer.priceLabel ? ` · ${offer.priceLabel}` : productLoading ? ' · Fiyat yükleniyor…' : ''}
            {offer.licenseDaysLabel ? ` · ${offer.licenseDaysLabel}` : ''}
            {offer.devicesLabel ? ` · ${offer.devicesLabel}` : ''}
            {' · 7 gün ücretsiz deneme'}
          </p>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <article className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Monitor className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">KoopPlus for Windows</h3>
                    <p className="text-sm text-slate-500">Kullanıma hazır</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Windows</span>
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
                  {windowsReady ? 'Windows için Satın Al' : 'Satışa hazırlanıyor'}
                  {windowsReady ? <ArrowRight className="ml-2 h-4 w-4" aria-hidden /> : null}
                </button>
                {trialDownload ? (
                  <KoopPlusWindowsTrialDownloadLink
                    wrapClassName="flex-1"
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={handleTrial}
                    className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    7 Gün Ücretsiz Dene
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
                    <h3 className="text-lg font-semibold text-slate-900">KoopPlus for Mac</h3>
                    <p className="text-sm text-slate-500">macOS sürümü yakında kullanıma sunulacak.</p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  Yakında
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
                  Mac için Satın Al
                  <span className="ml-2 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Yakında
                  </span>
                </button>
              </div>
              {!KOOPPLUS_MACOS_AVAILABLE ? (
                <p className="mt-3 text-sm text-slate-500">macOS satın alma şu anda kapalıdır.</p>
              ) : null}
            </article>
          </div>
        </div>
      </section>

      <section id={TRIAL_SECTION_ID} className="scroll-mt-24 border-b border-slate-200 bg-emerald-50/60 py-16 sm:py-20">
        <div className={SHELL}>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Ücretsiz deneme</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{KOOPPLUS_TRIAL.title}</h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">{KOOPPLUS_TRIAL.intro}</p>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {KOOPPLUS_TRIAL.points.map((point) => (
              <li key={point} className="rounded-2xl border border-emerald-100 bg-white p-5 text-sm leading-relaxed text-slate-700">
                {point}
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-3xl text-sm text-slate-500">{KOOPPLUS_TRIAL.footnote}</p>
          {trialDownload ? (
            <div className="mt-8 max-w-xl">
              <KoopPlusWindowsTrialDownloadLink
                showHint
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-6 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:w-auto"
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className="scroll-mt-24 py-16 sm:py-20 lg:py-24">
        <div className={SHELL}>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">KoopPlus ile neler yönetirsiniz?</h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Masaüstü uygulamada bugün kullanılan temel kooperatif süreçleri.
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {KOOPPLUS_FEATURES.map((feature) => {
              const Icon = feature.icon
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

      <section className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
        <div className={SHELL}>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Neden KoopPlus?</h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {KOOPPLUS_WHY.map((item) => (
              <li key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-base font-semibold text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className={SHELL}>
          <div className="grid gap-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 sm:p-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">{KOOPPLUS_MULTI_COOP.title}</h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">{KOOPPLUS_MULTI_COOP.description}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">{KOOPPLUS_LOCAL_DATA.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-slate-600">{KOOPPLUS_LOCAL_DATA.description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className={SHELL}>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Lisans modeli</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {KOOPPLUS_LICENSE_POINTS.map((point) => (
              <li key={point} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-16 sm:py-20">
        <div className={`${SHELL} max-w-3xl`}>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">Sıkça sorulan sorular</h2>
          <div className="mt-8 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {KOOPPLUS_FAQ.map((item) => {
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

      <section className="border-t border-slate-800 bg-gradient-to-br from-slate-950 via-[#10263f] to-slate-900 py-16 text-white sm:py-20">
        <div className={`${SHELL} text-center`}>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Kooperatif yönetimini KoopPlus ile sadeleştirin</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300">
            Windows sürümünü inceleyin veya 7 günlük denemeyi masaüstü uygulamada başlatın.
          </p>
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
              {windowsReady ? 'Windows için Satın Al' : 'Satışa hazırlanıyor'}
            </button>
            <button
              type="button"
              onClick={handleTrial}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/20 px-6 text-sm font-semibold text-white sm:w-auto"
            >
              7 Gün Ücretsiz Dene
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
