import { MuvekkilKasaCompareTable } from '@/components/public/muvekkil-kasa/MuvekkilKasaCompareTable'
import { MuvekkilKasaCompareDetailTabs } from '@/components/public/muvekkil-kasa/MuvekkilKasaCompareDetailTabs'
import { MuvekkilKasaProductHero } from '@/components/public/muvekkil-kasa/MuvekkilKasaProductHero'
import {
  MkComparePageProvider,
  useMkComparePageContext,
  useMkComparePageContextOptional,
} from '@/components/public/muvekkil-kasa/MkComparePageProvider'
import {
  MK_COMPARE_DETAILS_ID,
  MK_COMPARE_SHELL,
  MK_COMPARE_TABLE_ID,
  scrollToComparePurchase,
  scrollToCompareTable,
} from '@/components/public/muvekkil-kasa/comparePageUtils'
import {
  MK_COMPARE_HERO_BADGE,
  MK_COMPARE_HERO_DESCRIPTION,
} from '@/components/public/muvekkil-kasa/mkCompareContent'
import type { MkComparePlatform } from '@/components/public/muvekkil-kasa/mkComparePlatform'

function ComparePageBody() {
  const { desktopQuery, saasQuery, detailTab, setDetailTab, setPlatformTab } = useMkComparePageContext()
  const choosePlatform = (platform: MkComparePlatform) => {
    setPlatformTab(platform)
    scrollToComparePurchase()
  }

  return (
    <div className="overflow-x-hidden bg-white">
      <MuvekkilKasaProductHero
        breadcrumbs={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'Yazılımlar', href: '/yazilimlar' },
          { label: 'Müvekkil Kasa Defteri' },
        ]}
        intro={
          <>
            <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-100 backdrop-blur">
              {MK_COMPARE_HERO_BADGE}
            </span>
            <h1 className="mt-5 max-w-4xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.04]">
              Müvekkil Kasa Defteri: Size Uygun Sürümü Seçin
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {MK_COMPARE_HERO_DESCRIPTION}
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={scrollToCompareTable}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-105 sm:w-auto"
              >
                Sürümleri Karşılaştır
              </button>
              <button
                type="button"
                onClick={scrollToComparePurchase}
                className="inline-flex w-full items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 sm:w-auto"
              >
                Sürümünü Seç
              </button>
            </div>
          </>
        }
      />

      <section
        id={MK_COMPARE_TABLE_ID}
        className="scroll-mt-24 border-y border-slate-200/80 bg-slate-50 py-16 sm:py-20 lg:py-24"
      >
        <div className={MK_COMPARE_SHELL}>
          <MuvekkilKasaCompareTable />
        </div>
      </section>

      <section
        id={MK_COMPARE_DETAILS_ID}
        className="scroll-mt-24 bg-[linear-gradient(180deg,#ffffff_0%,#f0fdfa_48%,#f8fafc_100%)] py-16 sm:py-20 lg:py-24"
      >
        <div className={MK_COMPARE_SHELL}>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Ürün detayları</h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Mevcut satış içerikleri burada korunur. Satın alma üstteki satış panelinden yapılır.
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
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => choosePlatform('web')}
              className="rounded-2xl border border-sky-400/25 bg-sky-500/10 px-6 py-6 text-left transition hover:bg-sky-500/15"
            >
              <p className="text-lg font-bold text-white">Web Tabanlı Sürümü Seç</p>
              <p className="mt-2 text-sm text-sky-100/80">Her yerden erişim · 7 gün ücretsiz demo</p>
            </button>
            <button
              type="button"
              onClick={() => choosePlatform('windows')}
              className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-6 py-6 text-left transition hover:bg-emerald-500/15"
            >
              <p className="text-lg font-bold text-white">Windows Sürümünü Seç</p>
              <p className="mt-2 text-sm text-emerald-100/80">Bilgisayara kurulum · Tek bilgisayarda kullanım</p>
            </button>
            <button
              type="button"
              onClick={() => choosePlatform('macos')}
              className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-6 py-6 text-left transition hover:bg-emerald-500/15"
            >
              <p className="text-lg font-bold text-white">macOS Sürümünü Seç</p>
              <p className="mt-2 text-sm text-emerald-100/80">Mac’e kurulum · Tek bilgisayarda kullanım</p>
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
