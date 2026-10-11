import { SoftwarePlatformPicker } from '@/components/public/product/SoftwarePlatformPicker'
import {
  DesktopCard,
  MACOS_CARD_VARIANT,
  SaasCard,
  type ReferralCardFocus,
} from '@/components/public/muvekkil-kasa/MuvekkilKasaCompareProductCards'
import {
  useMkComparePageContext,
  type MkComparePanelCopy,
} from '@/components/public/muvekkil-kasa/MkComparePageProvider'
import {
  isMkComparePlatform,
  MUVEKKIL_KASA_PLATFORM_FAMILY,
  type MkComparePlatform,
} from '@/components/public/muvekkil-kasa/mkComparePlatform'

type Props = {
  /** Verilmezse builder satın alma bloğundaki admin metinleri kullanılır. */
  copy?: MkComparePanelCopy
}

/** WEB / WINDOWS / macOS sekmeli tek satış paneli; her sekme ayrı ürün ve sepet satırıdır. */
export function MuvekkilKasaPlatformPurchasePanel({ copy }: Props) {
  const ctx = useMkComparePageContext()
  const platform = ctx.platformTab
  const texts = copy ?? ctx.panelCopy

  const focusFor = (target: MkComparePlatform): ReferralCardFocus =>
    ctx.referralPlatform === target ? 'target' : 'none'

  return (
    <div
      className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/92 p-5 text-slate-900 shadow-[0_28px_80px_-38px_rgba(15,23,42,0.5)] ring-1 ring-slate-900/5 backdrop-blur-xl sm:p-6"
      data-mk-platform-panel
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_32%)]" />
      <div className="relative">
        <SoftwarePlatformPicker
          family={MUVEKKIL_KASA_PLATFORM_FAMILY}
          value={platform}
          onChange={(next) => {
            if (isMkComparePlatform(next)) ctx.setPlatformTab(next)
          }}
        />
      </div>
      <div className="relative mt-5" role="tabpanel" data-mk-platform={platform}>
        {platform === 'web' ? (
          <SaasCard
            query={ctx.saasQuery}
            onShowDetails={() => ctx.showProductDetails('saas')}
            copy={texts.saas}
            focus={focusFor('web')}
          />
        ) : platform === 'macos' ? (
          <DesktopCard
            key="macos"
            query={ctx.macosQuery}
            onShowDetails={() => ctx.showProductDetails('desktop')}
            copy={texts.macos}
            focus={focusFor('macos')}
            variant={MACOS_CARD_VARIANT}
          />
        ) : (
          <DesktopCard
            key="windows"
            query={ctx.desktopQuery}
            onShowDetails={() => ctx.showProductDetails('desktop')}
            copy={texts.desktop}
            focus={focusFor('windows')}
          />
        )}
      </div>
    </div>
  )
}
