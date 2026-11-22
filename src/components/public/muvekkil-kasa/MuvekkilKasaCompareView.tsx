import { MuvekkilKasaCompareDetailTabs } from '@/components/public/muvekkil-kasa/MuvekkilKasaCompareDetailTabs'
import { MuvekkilKasaProductHero } from '@/components/public/muvekkil-kasa/MuvekkilKasaProductHero'
import {
  MkComparePageProvider,
  useMkComparePageContext,
  useMkComparePageContextOptional,
} from '@/components/public/muvekkil-kasa/MkComparePageProvider'
import { MK_COMPARE_DETAILS_ID, MK_COMPARE_SHELL } from '@/components/public/muvekkil-kasa/comparePageUtils'
import { MuvekkilKasaMobileAppBadges } from '@/components/public/muvekkil-kasa/MuvekkilKasaMobileAppBadges'

/**
 * Yedek görünüm: Page Builder içeriği gelene kadar (ve API'ye ulaşılamazsa) gösterilir.
 * Page Builder'daki canlı Müvekkil Kasa sayfasının üst kısmıyla birebir aynı tutulmalıdır;
 * aksi halde sayfa açılırken bir an farklı bir tasarım görünür.
 */
function ComparePageBody() {
  const { desktopQuery, saasQuery, detailTab, setDetailTab } = useMkComparePageContext()

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
              SaaS / Web Tabanlı
            </span>
            <h1 className="mt-5 max-w-4xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.04]">
              Müvekkil Kasa Defteri: Web Tabanlı Büro Kasası
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Kurulum gerektirmeden tarayıcıdan erişilen, çok kullanıcılı ve WhatsApp destekli müvekkil kasa takibi. 7
              gün ücretsiz deneyin.
            </p>
            <MuvekkilKasaMobileAppBadges />
          </>
        }
      />

      <section
        id={MK_COMPARE_DETAILS_ID}
        className="scroll-mt-24 bg-[linear-gradient(180deg,#ffffff_0%,#f0fdfa_48%,#f8fafc_100%)] py-16 sm:py-20 lg:py-24"
      >
        <div className={MK_COMPARE_SHELL}>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Ürün detayları</h2>
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
