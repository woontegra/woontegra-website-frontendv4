import type { UseQueryResult } from '@tanstack/react-query'
import { DesktopLicenseRenewalPanel } from '@/components/public/product/DesktopLicenseRenewalPanel'
import { SoftwarePlatformPicker } from '@/components/public/product/SoftwarePlatformPicker'
import type { DesktopLicenseRenewalView } from '@/lib/desktopLicenseRenewal'
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

function DesktopRenewalNotice({
  query,
  platform,
  licenseDays,
}: {
  query: UseQueryResult<DesktopLicenseRenewalView, Error>
  platform: Exclude<MkComparePlatform, 'web'>
  licenseDays?: number
}) {
  if (query.isPending) {
    return <p className="mb-4 text-sm text-slate-500">Lisans bilgileri doğrulanıyor…</p>
  }
  if (query.isError) {
    return (
      <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" data-mk-renewal="invalid">
        Yenileme bağlantısı geçersiz veya süresi dolmuş. Masaüstü uygulamasından &quot;Lisansı Yenile&quot; ile yeni
        bağlantı oluşturun.
      </div>
    )
  }
  const licensePlatform = query.data.platform === 'MACOS' ? 'macos' : query.data.platform === 'WINDOWS' ? 'windows' : null
  if (licensePlatform && licensePlatform !== platform) {
    return (
      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" data-mk-renewal="other-platform">
        Yenilediğiniz lisans {licensePlatform === 'macos' ? 'macOS' : 'WINDOWS'} sürümüne aittir. Yenileme için{' '}
        {licensePlatform === 'macos' ? 'macOS' : 'WINDOWS'} sekmesindeki ürünü sepete ekleyin.
      </div>
    )
  }
  return (
    <div data-mk-renewal="active">
      <DesktopLicenseRenewalPanel data={query.data} renewalDays={licenseDays} renewalLabel={licenseDays ? `${licenseDays} gün` : null} />
    </div>
  )
}

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
        {ctx.desktopRenewalQuery && platform !== 'web' ? (
          <DesktopRenewalNotice
            query={ctx.desktopRenewalQuery}
            platform={platform}
            licenseDays={(platform === 'macos' ? ctx.macosQuery : ctx.desktopQuery).data?.licenseDays ?? undefined}
          />
        ) : null}
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
