import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, ShieldCheck, Sparkles } from 'lucide-react'
import type { PublicProductDetail } from '@/types/product'
import { getPromotionalSoftwareMeta } from '@/lib/publicSoftwareCatalog'
import {
  bilirkisiHesapService,
  formatBhPriceTl,
  type BhProduct,
} from '@/services/bilirkisiHesapService'
import { BilirkisiDemoRequestModal } from '@/components/public/product/BilirkisiDemoRequestModal'
import { BILIRKISI_HESAP_CHECKOUT_PATH } from '@/data/canonicalSoftwareProducts'

type Props = {
  product: PublicProductDetail
}

type Plan = 'monthly' | 'annual'

export function ExternalProductPurchasePanel({ product }: Props) {
  const meta = getPromotionalSoftwareMeta(product.slug)
  const [bhProduct, setBhProduct] = useState<BhProduct | null>(null)
  const [priceError, setPriceError] = useState<string | null>(null)
  const [loadingPrice, setLoadingPrice] = useState(true)
  const [demoOpen, setDemoOpen] = useState(false)
  const [plan, setPlan] = useState<Plan>('annual')

  useEffect(() => {
    let cancelled = false
    setLoadingPrice(true)
    setPriceError(null)
    bilirkisiHesapService
      .getProduct()
      .then((p) => {
        if (!cancelled) setBhProduct(p)
      })
      .catch((err) => {
        if (!cancelled) {
          setBhProduct(null)
          setPriceError(bilirkisiHesapService.getErrorMessage(err, 'Fiyat bilgisi alınamadı.'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingPrice(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

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

  return (
    <>
      <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/92 p-5 shadow-[0_28px_80px_-38px_rgba(15,23,42,0.5)] ring-1 ring-slate-900/5 backdrop-blur-xl sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_32%)]" />
        <div className="relative flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
          <Sparkles className="h-4 w-4" aria-hidden />
          Woontegra yazılımı
        </div>

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
            {meta.demoCtaLabel || 'Ücretsiz Dene'}
          </button>
        </div>
      </div>

      <BilirkisiDemoRequestModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  )
}
