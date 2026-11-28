import type { CSSProperties, ReactNode } from 'react'
import { Breadcrumbs } from '@/components/public/Breadcrumbs'
import { MuvekkilKasaPlatformPurchasePanel } from '@/components/public/muvekkil-kasa/MuvekkilKasaPlatformPurchasePanel'
import { MkLedgerAnimation } from '@/components/public/muvekkil-kasa/MuvekkilKasaShowcase'
import { useMkComparePageContextOptional } from '@/components/public/muvekkil-kasa/MkComparePageProvider'
import { MK_COMPARE_PURCHASE_ID } from '@/components/public/muvekkil-kasa/comparePageUtils'

type BreadcrumbItem = { label: string; href?: string }

/** Müvekkil Kasa ürün rengi (koyu yeşil), Bilirkişi Hesap'taki lacivertin karşılığı. */
const MK_HERO_COLOR = '#14532D'

type Props = {
  breadcrumbs: BreadcrumbItem[]
  /** Sol sütun üst kısmı: etiket, başlık, açıklama. */
  intro: ReactNode
  /** Eski düzenden kalan alanlar; yeni düzende görsel yerine akış şeması gösterilir. */
  coverImageUrl?: string
  wrapVisual?: (visual: ReactNode) => ReactNode
  sectionStyle?: CSSProperties
  overlay?: ReactNode
}

/**
 * Müvekkil Kasa ürün sayfası üst bölümü (Bilirkişi Hesap ile aynı düzen):
 * solda başlık, açıklama ve hareketli kasa hareketleri kartı; sağda satış paneli.
 */
export function MuvekkilKasaProductHero({ breadcrumbs, intro, overlay }: Props) {
  const ctx = useMkComparePageContextOptional()

  return (
    <section className="relative overflow-hidden text-white" style={{ backgroundColor: MK_HERO_COLOR }} data-mk-product-hero>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full border-[72px] border-[#16A34A] opacity-20"
      />
      {overlay}

      <div className="relative z-[2] mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pb-16 lg:pt-8">
        {breadcrumbs.length > 0 ? <Breadcrumbs dark items={breadcrumbs} /> : null}

        <div className="mt-4 grid gap-6 sm:mt-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-center xl:gap-8">
          <div className="min-w-0">
            <div className="max-w-4xl">{intro}</div>
            <MkLedgerAnimation />
          </div>

          {ctx ? (
            <aside id={MK_COMPARE_PURCHASE_ID} className="scroll-mt-24 xl:sticky xl:top-24 xl:self-start">
              <MuvekkilKasaPlatformPurchasePanel />
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  )
}
