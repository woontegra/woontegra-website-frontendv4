import type { BlockRendererProps } from '@/builder/registry/renderRegistry'

/** Henüz implement edilmemiş blok tipleri — publicte boşluk bırakmaz. */
export function PlaceholderBlockRenderer({ block }: BlockRendererProps) {
  if (!block.visibility.enabled) return null
  if (import.meta.env.DEV) {
    return (
      <div className="border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-400">
        Blok henüz render edilmiyor: {block.type}
      </div>
    )
  }
  return null
}
