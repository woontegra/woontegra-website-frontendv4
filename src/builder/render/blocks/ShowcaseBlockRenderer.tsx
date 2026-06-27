import type { BlockRendererProps } from '@/builder/registry/renderRegistry'
import { BlockSectionHeader, SectionBlockShell } from '@/builder/render/SectionBlockShell'
import { renderIfText } from '@/builder/render/renderRules'
import { BLOCK_TYPE_LABELS } from '@/builder/types'
import type {
  BlogShowcaseBlock,
  ProductsShowcaseBlock,
  ServicesShowcaseBlock,
} from '@/builder/types'

const MOCK_ITEMS = [
  { title: 'Örnek öğe 1', desc: 'Canlı vitrin yayında API verisi ile doldurulur.', price: '₺1.990' },
  { title: 'Örnek öğe 2', desc: 'Builder önizlemede vitrin yerleşimi.', price: '₺2.490' },
  { title: 'Örnek öğe 3', desc: 'Limit ayarı vitrin sayısını belirler.', price: '₺990' },
  { title: 'Örnek öğe 4', desc: 'Kaynak tipi panelden değiştirilir.', price: '₺3.290' },
]

export function ShowcaseBlockRenderer({ block, mode = 'public' }: BlockRendererProps) {
  if (
    block.type !== 'services-showcase' &&
    block.type !== 'products-showcase' &&
    block.type !== 'blog-showcase'
  ) {
    return null
  }

  const b = block as ProductsShowcaseBlock | BlogShowcaseBlock | ServicesShowcaseBlock
  if (!b.visibility.enabled) return null

  const hasHeader =
    (b.visibility.showTitle !== false && renderIfText(b.title)) ||
    (b.visibility.showDescription !== false && renderIfText(b.description))

  if (!hasHeader && mode === 'public' && b.settings.source === 'manual') return null
  if (!hasHeader && mode === 'public' && block.type !== 'products-showcase' && block.type !== 'blog-showcase')
    return null

  const limit = Math.min(Math.max(b.settings.limit ?? 3, 1), 6)
  const items = MOCK_ITEMS.slice(0, limit)
  const label = BLOCK_TYPE_LABELS[b.type]
  const isProducts = b.type === 'products-showcase'
  const showPrice = isProducts && (b as ProductsShowcaseBlock).settings.showPrice !== false
  const showCart = isProducts && (b as ProductsShowcaseBlock).settings.showAddToCart !== false

  return (
    <SectionBlockShell style={b.style}>
      <BlockSectionHeader
        title={b.title}
        description={b.description}
        showTitle={b.visibility.showTitle}
        showDescription={b.visibility.showDescription}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-1 font-semibold text-slate-800">{item.title}</p>
            <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
            {isProducts && showPrice ? (
              <p className="mt-2 text-sm font-semibold text-emerald-700">{item.price}</p>
            ) : null}
            {isProducts && showCart ? (
              <span className="mt-2 inline-block rounded-lg bg-emerald-600 px-3 py-1 text-xs font-medium text-white">
                Sepete ekle
              </span>
            ) : null}
            <p className="mt-2 text-[10px] text-slate-400">Kaynak: {b.settings.source}</p>
          </div>
        ))}
      </div>
    </SectionBlockShell>
  )
}
