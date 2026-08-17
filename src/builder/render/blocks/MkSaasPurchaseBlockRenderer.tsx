import { Cloud, Globe, MessageCircle } from 'lucide-react'
import { BuilderField } from '@/builder/edit/BuilderField'
import type { BlockRendererProps } from '@/builder/registry/renderRegistry'
import { renderIfText } from '@/builder/render/renderRules'
import { ProductPurchasePanel } from '@/components/public/product/ProductPurchasePanel'
import { useMkSaasProductPageContextOptional } from '@/components/public/product/MkSaasProductPageProvider'
import type { MkSaasPurchaseBlock } from '@/builder/types'
import { cn } from '@/lib/cn'

const ICON_MAP = {
  cloud: Cloud,
  globe: Globe,
  'message-circle': MessageCircle,
} as const

function BenefitIcon({ icon }: { icon?: string }) {
  const Icon = icon ? ICON_MAP[icon as keyof typeof ICON_MAP] : null
  if (!Icon) return <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
      <Icon className="h-5 w-5" aria-hidden />
    </span>
  )
}

export function MkSaasPurchaseBlockRenderer({ block }: BlockRendererProps) {
  const ctx = useMkSaasProductPageContextOptional()
  if (block.type !== 'mk-saas-purchase') return null
  const purchase = block as MkSaasPurchaseBlock
  if (!purchase.visibility.enabled) return null

  const product = ctx?.product
  if (!ctx || !product) {
    return (
      <section className="bg-slate-100 py-14">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500">Ürün yükleniyor…</div>
      </section>
    )
  }

  const anchorId = purchase.settings.anchorId?.trim() || 'satin-alma'
  const bgClass =
    purchase.settings.backgroundStyle === 'solid'
      ? 'bg-white'
      : 'bg-gradient-to-b from-slate-100 to-white'

  return (
    <section id={anchorId} className={cn('scroll-mt-20 py-14 sm:py-20', bgClass)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_420px]">
          <div className="min-w-0">
            {purchase.visibility.showTitle !== false && renderIfText(purchase.title) ? (
              <BuilderField path="title" label="Başlık" type="text">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{purchase.title}</h2>
              </BuilderField>
            ) : null}
            {purchase.visibility.showDescription !== false && renderIfText(purchase.description) ? (
              <BuilderField path="description" label="Açıklama" type="text" className="mt-4 block">
                <p className="max-w-xl text-base leading-relaxed text-slate-600">{purchase.description}</p>
              </BuilderField>
            ) : null}
            <ul className="mt-8 hidden space-y-4 lg:block">
              {purchase.settings.benefits.map((item) => (
                <li key={item.id} className="flex items-center gap-3 text-sm text-slate-700">
                  <BenefitIcon icon={item.icon} />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full min-w-0 lg:sticky lg:top-24">
            <ProductPurchasePanel
              variant="mkSaasSales"
              product={product}
              webUsageYears={ctx.webUsageYears}
              onWebUsageYearsChange={ctx.onWebUsageYearsChange}
              feedback={ctx.previewSafe ? null : ctx.feedback}
              onFeedbackDismiss={ctx.onFeedbackDismiss}
              onAddToCart={ctx.onAddToCart}
              onOpenDemo={ctx.onOpenDemo}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
