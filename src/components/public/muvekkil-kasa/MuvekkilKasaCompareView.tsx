import { useMkSaasProductPageContext } from '@/components/public/product/MkSaasProductPageProvider'
import { MuvekkilKasaCompareProductCards } from '@/components/public/muvekkil-kasa/MuvekkilKasaCompareProductCards'
import { MuvekkilKasaCompareTable } from '@/components/public/muvekkil-kasa/MuvekkilKasaCompareTable'
import { MuvekkilKasaCompareDetailTabs } from '@/components/public/muvekkil-kasa/MuvekkilKasaCompareDetailTabs'
import { MuvekkilKasaCompareHeroVisual } from '@/components/public/muvekkil-kasa/MuvekkilKasaCompareHeroVisual'
import {
  MkComparePageProvider,
  useMkComparePageContext,
  useMkComparePageContextOptional,
} from '@/components/public/muvekkil-kasa/MkComparePageProvider'
import {
  MK_COMPARE_DETAILS_ID,
  MK_COMPARE_PURCHASE_ID,
  MK_COMPARE_SHELL,
  MK_COMPARE_TABLE_ID,
  scrollToComparePurchase,
  scrollToCompareTable,
} from '@/components/public/muvekkil-kasa/comparePageUtils'
import { Breadcrumbs } from '@/components/public/Breadcrumbs'

function ComparePageBody() {
  const { desktopQuery, saasQuery, detailTab, setDetailTab, showProductDetails } = useMkComparePageContext()
  const saasCtx = useMkSaasProductPageContext()

  return (
    <div className="overflow-x-hidden bg-white">
      <section className="relative bg-gradient-to-br from-slate-950 via-[#0f2744] to-slate-900 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(16,185,129,0.16),transparent_42%),radial-gradient(circle_at_82%_55%,rgba(56,189,248,0.12),transparent_40%)]" />
        <div className={`relative ${MK_COMPARE_SHELL} py-8 lg:py-10`}>
          <Breadcrumbs
            dark
            items={[
              { label: 'Ana Sayfa', href: '/' },
              { label: 'Yazılımlar', href: '/yazilimlar' },
              { label: 'Müvekkil Kasa Defteri' },
            ]}
          />
          <div className="mt-6 grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
            <div className="min-w-0">
              <p className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                Masaüstü ve SaaS / Web
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-[2.35rem] lg:leading-[1.15]">
                Müvekkil Kasa Defteri: Size Uygun Sürümü Seçin
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">
                Masaüstü kullanımın sadeliğini veya internet üzerinden erişilebilen gelişmiş SaaS altyapısını
                karşılaştırın; büronuza uygun sürümü seçin.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={scrollToCompareTable}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-sky-400 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-105 sm:w-auto"
                >
                  Sürümleri Karşılaştır
                </button>
                <button
                  type="button"
                  onClick={scrollToComparePurchase}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/15 sm:w-auto"
                >
                  Sürümünü Seç
                </button>
              </div>
            </div>
            <MuvekkilKasaCompareHeroVisual desktop={desktopQuery.data} saas={saasQuery.data} />
          </div>
        </div>
      </section>

      <section id={MK_COMPARE_PURCHASE_ID} className="scroll-mt-24 bg-white py-16 sm:py-20 lg:py-24">
        <div className={MK_COMPARE_SHELL}>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Hangi sürüm size uygun?</h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            İki ürün ayrı lisans ve ayrı sepet satırıdır. Fiyatlar güncel ürün kaydından gelir.
          </p>
          <div className="mt-10">
            <MuvekkilKasaCompareProductCards
              desktopQuery={desktopQuery}
              saasQuery={saasQuery}
              onShowProductDetails={showProductDetails}
            />
          </div>
        </div>
      </section>

      <section
        id={MK_COMPARE_TABLE_ID}
        className="scroll-mt-24 border-y border-slate-200/80 bg-slate-50 py-16 sm:py-20 lg:py-24"
      >
        <div className={MK_COMPARE_SHELL}>
          <MuvekkilKasaCompareTable
            desktop={desktopQuery.data}
            saas={saasQuery.data}
            saasYears={saasCtx.webUsageYears}
          />
        </div>
      </section>

      <section
        id={MK_COMPARE_DETAILS_ID}
        className="scroll-mt-24 bg-[linear-gradient(180deg,#ffffff_0%,#f0fdfa_48%,#f8fafc_100%)] py-16 sm:py-20 lg:py-24"
      >
        <div className={MK_COMPARE_SHELL}>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Ürün detayları</h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Mevcut satış içerikleri burada korunur. Satın alma üstteki kartlardan yapılır.
          </p>
        </div>
        <div className="mt-10">
          <MuvekkilKasaCompareDetailTabs
            desktopQuery={desktopQuery}
            saasQuery={saasQuery}
            tab={detailTab}
            onTabChange={setDetailTab}
          />
        </div>
      </section>

      <section className="border-t border-slate-800 bg-gradient-to-br from-slate-950 via-[#10263f] to-slate-900 py-16 text-white sm:py-20">
        <div className={MK_COMPARE_SHELL}>
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Büronuza uygun Müvekkil Kasa sürümünü seçin
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={scrollToComparePurchase}
              className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-6 py-6 text-left transition hover:bg-emerald-500/15"
            >
              <p className="text-lg font-bold text-white">Masaüstü Sürümünü Seç</p>
              <p className="mt-2 text-sm text-emerald-100/80">Bilgisayara kurulum · Merkezi lisans</p>
            </button>
            <button
              type="button"
              onClick={scrollToComparePurchase}
              className="rounded-2xl border border-sky-400/25 bg-sky-500/10 px-6 py-6 text-left transition hover:bg-sky-500/15"
            >
              <p className="text-lg font-bold text-white">SaaS/Web Sürümünü Seç</p>
              <p className="mt-2 text-sm text-sky-100/80">Tarayıcı erişimi · 7 gün ücretsiz demo</p>
            </button>
          </div>
          <p className="mt-8 text-center">
            <button
              type="button"
              onClick={scrollToComparePurchase}
              className="text-sm font-medium text-slate-300 underline-offset-4 hover:text-white hover:underline"
            >
              Satın alma alanına dön
            </button>
          </p>
        </div>
      </section>
    </div>
  )
}

/** Public fallback. Does not read productPages blocks (avoids renderer recursion). */
export function MuvekkilKasaCompareView() {
  const existing = useMkComparePageContextOptional()
  if (existing) return <ComparePageBody />
  return (
    <MkComparePageProvider>
      <ComparePageBody />
    </MkComparePageProvider>
  )
}
