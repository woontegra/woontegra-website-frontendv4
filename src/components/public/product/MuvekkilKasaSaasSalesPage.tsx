import { ArrowRight, Check, Cloud, Globe, MessageCircle } from 'lucide-react'
import { MkSaasHeroScreenCarousel } from '@/components/public/product/MkSaasHeroScreenCarousel'
import {
  formatMkSaasTryMoney,
  ProductPurchasePanel,
} from '@/components/public/product/ProductPurchasePanel'
import {
  MuvekkilKasaSaasIntroSections,
  MuvekkilKasaSaasPostPurchaseSections,
} from '@/components/public/muvekkil-kasa/MuvekkilKasaSaasDetailSections'
import type { PublicProductDetail } from '@/types/product'

type Props = {
  product: PublicProductDetail
  webUsageYears: number
  onWebUsageYearsChange: (years: number) => void
  feedback: 'added' | 'in-cart' | null
  onFeedbackDismiss: () => void
  onAddToCart: () => void
  onOpenDemo: () => void
}

export function MuvekkilKasaSaasSalesPage({
  product,
  webUsageYears,
  onWebUsageYearsChange,
  feedback,
  onFeedbackDismiss,
  onAddToCart,
  onOpenDemo,
}: Props) {
  const scrollToPurchase = () => {
    document.getElementById('satin-alma')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const heroPriceLine = `${formatMkSaasTryMoney(product.price, product.currency)} / 1 yıl`

  return (
    <div className="overflow-x-hidden bg-slate-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-950 via-[#0f2744] to-slate-900 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.15),transparent_45%),radial-gradient(circle_at_80%_60%,rgba(34,211,238,0.1),transparent_40%)]" />
        <div className="relative mx-auto grid max-w-[1280px] items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,36%)_minmax(0,64%)] lg:gap-8 lg:py-16 xl:px-8">
          <div className="min-w-0 lg:max-w-none">
            <p className="inline-flex rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-200">
              Hukuk büroları için web tabanlı kasa ve tahsilat yönetimi
            </p>
            <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
              Müvekkil paranızı, dosyalarınızı ve tahsilatlarınızı tek yerde yönetin.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Avansları, masrafları, vekalet taksitlerini ve kasa hareketlerini Excel dosyaları arasında kaybetmeyin.
              Müvekkil Kasası büronuzun finansal düzenini kurar; yaklaşan ödemeleri WhatsApp Business üzerinden
              zamanında hatırlatır.
            </p>
            <p className="mt-6 text-lg font-semibold tabular-nums text-sky-200 sm:text-xl">{heroPriceLine}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={scrollToPurchase}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:brightness-105"
              >
                Hemen Satın Al
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={onOpenDemo}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                7 Gün Ücretsiz Dene
              </button>
            </div>
            <ul className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6">
              {['Kurulum gerektirmez', 'Çoklu kullanıcı', 'Her yerden güvenli erişim'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                  <Check className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex min-w-0 justify-center lg:justify-end lg:pl-2">
            <MkSaasHeroScreenCarousel product={product} />
          </div>
        </div>
      </section>

      <MuvekkilKasaSaasIntroSections />

      {/* Purchase */}
      <section id="satin-alma" className="scroll-mt-20 bg-gradient-to-b from-slate-100 to-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_420px]">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Büronuzun finansal düzenini bugün kurun.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
                Doğrudan yıllık lisans satın alabilir veya önce kendi müvekkilleriniz ve gerçek iş akışınızla
                ücretsiz deneyebilirsiniz. Demo hesabınızı lisansladığınızda mevcut verileriniz korunur.
              </p>
              <ul className="mt-8 hidden space-y-4 lg:block">
                {[
                  { icon: <Cloud className="h-5 w-5" aria-hidden />, text: 'Kurulum gerektirmeyen web erişimi' },
                  { icon: <Globe className="h-5 w-5" aria-hidden />, text: 'Her yerden güvenli bağlantı' },
                  { icon: <MessageCircle className="h-5 w-5" aria-hidden />, text: 'WhatsApp Business hatırlatmaları' },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-3 text-sm text-slate-700">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                      {item.icon}
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full min-w-0 lg:sticky lg:top-24">
              <ProductPurchasePanel
                variant="mkSaasSales"
                product={product}
                webUsageYears={webUsageYears}
                onWebUsageYearsChange={onWebUsageYearsChange}
                feedback={feedback}
                onFeedbackDismiss={onFeedbackDismiss}
                onAddToCart={onAddToCart}
                onOpenDemo={onOpenDemo}
              />
            </div>
          </div>
        </div>
      </section>

      <MuvekkilKasaSaasPostPurchaseSections />
    </div>
  )
}
