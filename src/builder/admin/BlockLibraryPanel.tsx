import { useMemo, useState } from 'react'
import { BLOCK_TYPE_LABELS } from '@/builder/types'
import type { MvpBlockTypeId } from '@/builder/types'
import { getBlockDefinition } from '@/builder/registry/blockRegistry'
import { BLOCK_LIBRARY_CATEGORIES } from '@/builder/admin/blockLibraryConfig'
import { useBuilderStore } from '@/builder/store/builderStore'
import { cn } from '@/lib/cn'

export function BlockLibraryPanel() {
  const canvasMode = useBuilderStore((s) => s.canvasMode)
  const addBlock = useBuilderStore((s) => s.addBlock)
  const convertToBuilderDraft = useBuilderStore((s) => s.convertToBuilderDraft)
  const [query, setQuery] = useState('')

  const isEditable = canvasMode === 'builder-blocks'

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return BLOCK_LIBRARY_CATEGORIES.map((cat) => ({
      ...cat,
      blocks: cat.types.filter((type) => {
        if (!q) return true
        const label = BLOCK_TYPE_LABELS[type as MvpBlockTypeId] ?? type
        const def = getBlockDefinition(type)
        return (
          label.toLowerCase().includes(q) ||
          type.includes(q) ||
          (def?.description?.toLowerCase().includes(q) ?? false)
        )
      }),
    }))
  }, [query])

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white lg:w-72 lg:border-b-0 lg:border-r">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Bloklar</h2>
        {isEditable ? (
          <p className="mt-0.5 text-xs text-slate-400">Ekle ile yeni blok ekleyin</p>
        ) : (
          <p className="mt-0.5 text-xs text-amber-700">Legacy mod — önce Builder&apos;a dönüştürün</p>
        )}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Blok ara…"
          className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="mb-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-3 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Favoriler</p>
          <p className="mt-1 text-xs text-slate-500">Yakında — sık kullanılan bloklar burada</p>
        </div>

        {filtered.map((cat) => (
          <section key={cat.id} className="mb-5">
            <h3 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {cat.label}
            </h3>
            {'placeholder' in cat && cat.placeholder ? (
              <p className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-400">
                {cat.placeholder}
              </p>
            ) : (
              <ul className="space-y-1.5">
                {cat.blocks.map((type) => {
                  const def = getBlockDefinition(type)
                  const label = def?.label ?? BLOCK_TYPE_LABELS[type as MvpBlockTypeId]
                  return (
                    <li key={type}>
                      <div className="group flex items-start gap-2 rounded-xl border border-transparent px-2 py-2 transition hover:border-slate-200 hover:bg-slate-50">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-800">{label}</p>
                          {def?.description ? (
                            <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-slate-400">
                              {def.description}
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          disabled={!isEditable}
                          onClick={() => (isEditable ? addBlock(type as MvpBlockTypeId) : convertToBuilderDraft())}
                          className={cn(
                            'shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700',
                            isEditable
                              ? 'opacity-0 transition group-hover:opacity-100 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
                              : 'cursor-not-allowed opacity-40',
                          )}
                        >
                          {isEditable ? 'Ekle' : '—'}
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        ))}
      </div>
    </aside>
  )
}

export function blockTypeLabel(type: string): string {
  return BLOCK_TYPE_LABELS[type as keyof typeof BLOCK_TYPE_LABELS] ?? type
}
