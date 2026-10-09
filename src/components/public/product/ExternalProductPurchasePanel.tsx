import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Loader2, ShieldCheck, Sparkles } from 'lucide-react'
import type { PublicProductDetail } from '@/types/product'
import { getPromotionalSoftwareMeta } from '@/lib/publicSoftwareCatalog'
import {
  readCachedBhProduct,
  productToKeepOnPriceError,
  writeCachedBhProduct,
} from '@/lib/bhPublicProductPriceCache'
import {
  bilirkisiHesapService,
  desktopYearlyPriceKurus,
  formatBhPriceTl,
  type BhDesktopTrialStart,
} from '@/services/bilirkisiHesapService'
import { BILIRKISI_HESAP_CHECKOUT_PATH, BILIRKISI_HESAP_SLUG } from '@/data/canonicalSoftwareProducts'
import { BilirkisiDemoRequestModal } from '@/components/public/product/BilirkisiDemoRequestModal'
import { SoftwarePlatformPicker } from '@/components/public/product/SoftwarePlatformPicker'
import {
  desktopLicenseLabel,
  findPlatform,
  type ProductPlatformFamily,
  type SoftwarePlatformId,
} from '@/components/public/product/softwarePlatforms'
import { bhDesktopInstallerForPlatform } from '@/lib/bhDesktopInstaller'

type Props = {
  product: PublicProductDetail
  platformFamily?: ProductPlatformFamily | null
  platformId?: SoftwarePlatformId
  onPlatformChange?: (platformId: SoftwarePlatformId) => void
}

type Plan = 'monthly' | 'annual'

export function ExternalProductPurchasePanel({
  product,
  platformFamily = null,
  platformId = 'web',
  onPlatformChange,
}: Props) {
  const meta = getPromotionalSoftwareMeta(product.slug)
  const [cachedProduct, setCachedProduct] = useState(() => readCachedBhProduct())
  const [demoOpen, setDemoOpen] = useState(false)
  const [plan, setPlan] = useState<Plan>('annual')
  const [trialResult, setTrialResult] = useState<BhDesktopTrialStart | null>(null)
  const priceQuery = useQuery({
    queryKey: ['bh-public-product'],
    queryFn: () => bilirkisiHesapService.getProduct(),
    staleTime: 60_000,
    gcTime: 30 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (!priceQuery.data) return
    writeCachedBhProduct(priceQuery.data)
    setCachedProduct(priceQuery.data)
  }, [priceQuery.data])

  useEffect(() => {
    setTrialResult(null)
  }, [platformId])

  const errorStatus = axios.isAxiosError(priceQuery.error) ? priceQuery.error.response?.status : undefined
  const bhProduct = priceQuery.data ?? productToKeepOnPriceError(errorStatus, cachedProduct)
  const priceError =
    !bhProduct && priceQuery.isError
      ? bilirkisiHesapService.getErrorMessage(priceQuery.error, 'Fiyat bilgisi alınamadı.')
      : null
  const loadingPrice = priceQuery.isPending && !bhProduct

  const annualTl = bhProduct ? bilirkisiHesapService.annualPriceTl(bhProduct) : null
  const monthlyTl = bhProduct ? bilirkisiHesapService.monthlyPriceTl(bhProduct) : null

  const selectedPriceTl = plan === 'monthly' ? monthlyTl : annualTl
  const selectedReady = selectedPriceTl != null && !priceError && !loadingPrice

  const checkoutHref = useMemo(() => {
    const base = meta?.checkoutPath || BILIRKISI_HESAP_CHECKOUT_PATH
    const params = new URLSearchParams()
    params.set('plan', plan)
    return `${base}?${params.toString()}`
  }, [meta?.checkoutPath, plan])

  if (!meta) return null

  const selectedPlatform = findPlatform(platformFamily, platformId)
  const desktopOffer =
    selectedPlatform?.checkout === 'not-connected' ? selectedPlatform.presentation ?? null : null
  const desktopKurus = (() => {
    if (!desktopOffer || loadingPrice) return null
    if (platformId !== 'windows' && platformId !== 'macos') return null
    return desktopYearlyPriceKurus(bhProduct, platformId)
  })()
  const desktopDeviceLimit = (() => {
    if (!bhProduct || (platformId !== 'windows' && platformId !== 'macos')) return desktopOffer ? 1 : null
    const value = platformId === 'windows' ? bhProduct.windowsDeviceLimit : bhProduct.macosDeviceLimit
    return value != null && Number.isInteger(Number(value)) && Number(value) >= 1 ? Number(value) : 1
  })()
  const desktopPriceTl = desktopKurus == null ? null : desktopKurus / 100
  const desktopTrialDays = (() => {
    if (!bhProduct) return null
    const value = platformId === 'windows' ? bhProduct.windowsTrialDays : bhProduct.macosTrialDays
    return value != null && Number.isInteger(Number(value)) && Number(value) >= 1 ? Number(value) : null
  })()
  const desktopTrialLabel = `${desktopTrialDays ?? 7} Gün Ücretsiz Dene`
  const desktopInstaller =
    platformId === 'windows' || platformId === 'macos'
      ? bhDesktopInstallerForPlatform(bhProduct, platformId)
      : null
  const desktopCheckoutPlatform = platformId === 'macos' ? 'MACOS' : 'WINDOWS'

  return (
    <>
      <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/92 p-5 shadow-[0_28px_80px_-38px_rgba(15,23,42,0.5)] ring-1 ring-slate-900/5 backdrop-blur-xl sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_32%)]" />
        {platformFamily && onPlatformChange ? (
          <div className="relative">
            <SoftwarePlatformPicker family={platformFamily} value={platformId} onChange={onPlatformChange} />
          </div>
        ) : null}
        <div
          className={`relative flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700 ${
            platformFamily && onPlatformChange ? 'mt-5' : ''
          }`}
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          Woontegra yazılımı
        </div>

        {desktopOffer ? (
          <div className="relative">
            <div className="mt-5 min-h-[5.5rem]">
              {loadingPrice ? (
                <p className="flex items-center gap-2 text-lg font-semibold text-slate-600">
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  Fiyat yükleniyor…
                </p>
              ) : desktopPriceTl == null ? (
                <p className="text-base font-semibold text-rose-700">Seçilen paket için fiyat bulunamadı</p>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-600">Yıllık Lisans</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                    {formatBhPriceTl(desktopPriceTl)}
                    <span className="ml-1 text-base font-semibold text-slate-500">/ yıl</span>
                  </p>
                </div>
              )}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Ürün tipi</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{desktopOffer.productTypeLabel}</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Platform</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{desktopOffer.platformLabel}</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Teslimat</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{desktopOffer.deliveryLabel}</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Lisans</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {desktopLicenseLabel('yearly', desktopDeviceLimit)}
                </p>
              </div>
            </div>
            <p className="mt-5 rounded-2xl border border-sky-100/80 bg-sky-50/80 px-4 py-3 text-sm leading-relaxed text-slate-700">
              <ShieldCheck className="mb-0.5 mr-1 inline h-4 w-4 text-sky-600" aria-hidden />
              {desktopOffer.licenseNote}
            </p>
            <div className="mt-6 space-y-3">
              {platformId !== 'windows' && platformId !== 'macos' ? null : trialResult ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
                  <p className="font-semibold">{trialResult.message}</p>
                  <p className="mt-1">Platform: {trialResult.platformLabel}</p>
                  <p className="mt-1">7 günlük süre, program içinde demo hesabını oluşturup etkinleştirdiğinizde başlar. Başvuru bu süreyi başlatmaz.</p>
                  {trialResult.downloadUrl || desktopInstaller?.url ? (
                    <a
                      className="mt-3 flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                      href={trialResult.downloadUrl || desktopInstaller?.url}
                    >
                      Kurulumu indir
                    </a>
                  ) : (
                    <p className="mt-2">Kurulum dosyası henüz tanımlı değil.</p>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  className="flex w-full items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3.5 text-sm font-semibold text-sky-900"
                  onClick={() => setDemoOpen(true)}
                >
                  {desktopTrialLabel}
                </button>
              )}
              <Link
                className={`flex w-full items-center justify-center rounded-2xl px-4 py-3.5 text-sm font-semibold text-white ${
                  desktopPriceTl == null ? 'pointer-events-none bg-slate-300' : 'bg-slate-950'
                }`}
                to={`${BILIRKISI_HESAP_CHECKOUT_PATH}?platform=${desktopCheckoutPlatform}`}
                aria-disabled={desktopPriceTl == null}
              >
                {desktopOffer.ctaLabel}
              </Link>
              {platformId === 'macos' && desktopInstaller?.url ? (
                <a
                  className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800"
                  href={desktopInstaller.url}
                >
                  {desktopInstaller.buttonLabel}
                </a>
              ) : null}
            </div>
          </div>
        ) : (
          <>

        <div className="relative mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100/90 p-1">
          <button
            type="button"
            onClick={() => setPlan('monthly')}
            className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              plan === 'monthly' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Aylık
          </button>
          <button
            type="button"
            onClick={() => setPlan('annual')}
            className={`relative rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              plan === 'annual' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Yıllık
            <span className="ml-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
              Avantajlı
            </span>
          </button>
        </div>

        <div className="relative mt-5 min-h-[5.5rem]">
          {loadingPrice ? (
            <p className="flex items-center gap-2 text-lg font-semibold text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              Fiyat yükleniyor…
            </p>
          ) : priceError ? (
            <div>
              <p className="text-base font-semibold text-rose-700">Fiyat şu an gösterilemiyor</p>
              <p className="mt-1 text-sm text-slate-500">{priceError}</p>
            </div>
          ) : selectedPriceTl == null ? (
            <p className="text-base font-semibold text-rose-700">Seçilen paket için fiyat bulunamadı</p>
          ) : plan === 'monthly' ? (
            <div>
              <p className="text-sm font-semibold text-slate-600">Profesyonel Aylık</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                {formatBhPriceTl(selectedPriceTl)}
                <span className="ml-1 text-base font-semibold text-slate-500">/ ay</span>
              </p>
              <p className="mt-2 text-xs text-slate-500">Ayrı abonelik paketi · yıllık paketten bağımsız</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-slate-600">Profesyonel Yıllık</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                {formatBhPriceTl(selectedPriceTl)}
                <span className="ml-1 text-base font-semibold text-slate-500">/ yıl</span>
              </p>
              <p className="mt-2 text-xs text-slate-500">Ayrı abonelik paketi · aylık paketten bağımsız</p>
            </div>
          )}
        </div>

        {product.slug === BILIRKISI_HESAP_SLUG && plan === 'annual' ? (
          <div className="relative mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">
              Yıllık pakete özel hediye
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              Müvekkil Kasa Masaüstü Programı — 1 Yıl Ücretsiz
            </p>
          </div>
        ) : null}

        <div className="relative mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Teslimat</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">Panel erişimi</p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Lisans</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {plan === 'monthly' ? 'Aylık abonelik' : 'Yıllık abonelik'}
            </p>
          </div>
        </div>

        <p className="relative mt-5 rounded-2xl border border-sky-100/80 bg-sky-50/80 px-4 py-3 text-sm leading-relaxed text-slate-700">
          <ShieldCheck className="mb-0.5 mr-1 inline h-4 w-4 text-sky-600" aria-hidden />
          {meta.disclaimer}
        </p>

        <div className="relative mt-6 grid gap-2">
          <Link
            to={checkoutHref}
            className={`flex w-full items-center justify-center rounded-2xl px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition ${
              !selectedReady
                ? 'pointer-events-none bg-slate-300'
                : 'bg-gradient-to-r from-sky-600 via-sky-500 to-emerald-500 hover:brightness-105'
            }`}
            aria-disabled={!selectedReady}
          >
            {meta.ctaLabel}
            {plan === 'monthly' ? ' — Aylık' : ' — Yıllık'}
          </Link>
          <button
            type="button"
            onClick={() => setDemoOpen(true)}
            className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            {meta.demoCtaLabel || 'Demo Talep Et'}
          </button>
        </div>
          </>
        )}
      </div>

      <BilirkisiDemoRequestModal
        open={demoOpen}
        onClose={() => setDemoOpen(false)}
        desktopPlatform={platformId === 'windows' ? 'WINDOWS' : platformId === 'macos' ? 'MACOS' : null}
        onDesktopTrialStarted={(result) => {
          setTrialResult(result)
          setDemoOpen(false)
        }}
      />
    </>
  )
}
